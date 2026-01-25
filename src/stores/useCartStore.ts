import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let cartSyncInFlight: Promise<void> | null = null;
let lastCartSyncAt = 0;

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  brand: string;
  stock: number;
  description: string;
  specs: Record<string, string>;
  fitment: string[];
  discount?: number;
  rating?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}

// Store only product IDs that are in cart (for quick lookup)
interface CartStore {
  cartProductIds: string[]; // product_ids in cart
  totalItems: number;
  totalAmount: number;
  cartType: 'regular' | 'bulk' | 'empty'; // Cart type
  cartItems: any[]; // Store actual cart items for type checking
  setCartData: (...args: any[]) => void;
  addProductId: (productId: string) => void;
  removeProductId: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  setCartType: (type: 'regular' | 'bulk' | 'empty') => void;
  canAddBulkItems: () => boolean;
  canAddRegularItems: () => boolean;
  syncCartFromAPI: (token?: string) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartProductIds: [],
      totalItems: 0,
      totalAmount: 0,
      cartType: 'empty',
      cartItems: [],
      setCartData: (...args: any[]) => {
        // Backward compatible signature support:
        // - new: setCartData(cartData)
        // - old: setCartData(productIds, totalItems, totalAmount, cartType?)
        const cartData = args.length === 1
          ? args[0]
          : {
              items: (args[0] || []).map((product_id: string) => ({ product_id })),
              summary: {
                totalItems: args[1] ?? 0,
                totalAmount: args[2] ?? 0,
                currency: 'USD',
                cartType: args[3],
              },
            };

        const items = cartData?.items || [];
        const summary = cartData?.summary || {};
        const productIds = items.map((item: any) => item.product_id).filter(Boolean) as string[];
        const unique = Array.from(new Set(productIds));

        const computedTotalItems = items.reduce((sum: number, item: any) => {
          const qty = item?.cart_quantity ?? item?.quantity ?? 0;
          return sum + (typeof qty === 'number' ? qty : 0);
        }, 0);
        const computedTotalAmount = items.reduce((sum: number, item: any) => {
          const qty = item?.cart_quantity ?? item?.quantity ?? 0;
          const isBulk = item?.type === 'bulk' || item?.cart_type === 'bulk';
          const price = isBulk
            ? (item?.offered_price_per_unit ?? parseFloat(item?.cart_offered_price_per_unit) ?? item?.requested_price_per_unit ?? parseFloat(item?.cart_requested_price_per_unit) ?? item?.product_price ?? item?.price ?? 0)
            : (item?.requested_price_per_unit ?? parseFloat(item?.cart_requested_price_per_unit) ?? item?.product_price ?? item?.price ?? 0);
          const nQty = typeof qty === 'number' ? qty : 0;
          const nPrice = typeof price === 'number' ? price : parseFloat(String(price)) || 0;
          return sum + nQty * nPrice;
        }, 0);
        
        // Determine cart type from items
        let cartType: 'regular' | 'bulk' | 'empty' = 'empty';
        if (items.length > 0) {
          const hasBulkItems = items.some((item: any) => item.type === 'bulk' || item.cart_type === 'bulk');
          const hasRegularItems = items.some((item: any) => (!item.type && !item.cart_type) || item.type === 'regular' || item.cart_type === 'regular');
          
          if (hasBulkItems && !hasRegularItems) {
            cartType = 'bulk';
          } else if (hasRegularItems && !hasBulkItems) {
            cartType = 'regular';
          } else {
            cartType = summary.cartType || 'regular'; // Fallback to API cart type
          }
        }
        
        const nextTotalItems = (summary.totalItems && summary.totalItems > 0) ? summary.totalItems : computedTotalItems;
        const nextTotalAmount = (summary.totalAmount && summary.totalAmount > 0) ? summary.totalAmount : computedTotalAmount;

        set({ 
          cartProductIds: unique, 
          totalItems: nextTotalItems,
          totalAmount: nextTotalAmount,
          cartType,
          cartItems: items
        });
      },
      addProductId: (productId) => {
        const current = get().cartProductIds;
        if (current.includes(productId)) return;
        set({ cartProductIds: [...current, productId] });
      },
      removeProductId: (productId) => {
        const filtered = get().cartProductIds.filter((x) => x !== productId);
        set({ 
          cartProductIds: filtered,
          cartType: filtered.length === 0 ? 'empty' : get().cartType
        });
      },
      clearCart: () => set({ cartProductIds: [], totalItems: 0, totalAmount: 0, cartType: 'empty', cartItems: [] }),
      isInCart: (productId) => get().cartProductIds.includes(productId),
      setCartType: (type) => set({ cartType: type }),
      canAddBulkItems: () => {
        const { cartType, cartProductIds } = get();
        return cartType === 'empty' || cartType === 'bulk' || cartProductIds.length === 0;
      },
      canAddRegularItems: () => {
        const { cartType, cartProductIds } = get();
        return cartType === 'empty' || cartType === 'regular' || cartProductIds.length === 0;
      },
      syncCartFromAPI: async (token?: string) => {
        if (!token) return;

        const now = Date.now();
        // Throttle: avoid spamming /cart in quick succession
        if (now - lastCartSyncAt < 1200) return;
        // De-dupe: if a sync is already running, wait for it
        if (cartSyncInFlight) return cartSyncInFlight;

        lastCartSyncAt = now;
        cartSyncInFlight = (async () => {
          try {
            const { getCart } = await import('@/services/cart');
            const cartData = await getCart(token);
            get().setCartData(cartData.data);
          } catch (error: any) {
            // Ignore 429 (backend throttling) to avoid breaking UX
            if (typeof error?.message === 'string' && error.message.includes('HTTP 429')) {
              return;
            }
            console.error('Failed to sync cart from API:', error);
          } finally {
            cartSyncInFlight = null;
          }
        })();

        return cartSyncInFlight;
      },
    }),
    {
      name: 'ksr-cart-storage',
    }
  )
);
