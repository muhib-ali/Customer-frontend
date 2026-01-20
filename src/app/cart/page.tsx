"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, Loader2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { bootstrapCartOnce, resetCartBootstrap } from "@/services/cart/bootstrap";
import { updateCartItem, removeFromCart, clearCart as clearCartAPI, type CartItem } from "@/services/cart";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [lastClickTime, setLastClickTime] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  const cartProductIds = useCartStore((s) => s.cartProductIds);
  const setCartData = useCartStore((s) => s.setCartData);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const syncCartFromAPI = useCartStore((s) => s.syncCartFromAPI);

  // Calculate totals from items since API returns null
  const calculatedTotalItems = cartItems.reduce((sum, item) => sum + (item.cart_quantity || 0), 0);
  const calculatedTotalAmount = cartItems.reduce((sum, item) => {
    const qty = item.cart_quantity || 0;
    const isBulkItem = item.type === 'bulk' || (item as any).cart_type === 'bulk';
    const unit = isBulkItem
      ? (typeof item.offered_price_per_unit === 'number' ? item.offered_price_per_unit : parseFloat((item as any).cart_offered_price_per_unit) || parseFloat(item.product_price) || 0)
      : (parseFloat(item.product_price) || 0);
    return sum + unit * qty;
  }, 0);

  useEffect(() => {
    const token = session?.accessToken as string | undefined;
    if (!token) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    // Use bootstrapCartOnce directly (it already dedupes and throttles)
    bootstrapCartOnce(token)
      .then((cartData) => {
        if (cancelled || !cartData) return;
        console.log('Cart page - Using cart data:', cartData);
        setCartItems(cartData.items);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  const handleUpdateQuantity = async (cartItemId: string, currentQuantity: number, change: number) => {
    const token = session?.accessToken as string | undefined;
    if (!token) return;

    // Debounce: prevent rapid clicks (500ms debounce)
    const now = Date.now();
    const lastTime = lastClickTime[cartItemId] || 0;
    if (now - lastTime < 500) {
      return;
    }
    setLastClickTime(prev => ({ ...prev, [cartItemId]: now }));

    const newQuantity = currentQuantity + change;

    // If quantity becomes 0, remove the item
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(cartItemId));

    // Optimistic update
    setCartItems((prev) =>
      prev.map((item) =>
        item.cart_id === cartItemId ? { ...item, cart_quantity: newQuantity } : item
      )
    );

    try {
      await updateCartItem(cartItemId, newQuantity, token);
      
      // Update local state and recalculate totals (no additional API call)
      const updatedItems = cartItems.map((item) =>
        item.cart_id === cartItemId ? { ...item, cart_quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      
      // Update Zustand store with new totals
      const productIds = updatedItems.map((item) => item.product_id);
      const calculatedTotalItems = updatedItems.reduce((sum, item) => sum + (item.cart_quantity || 0), 0);
      const calculatedTotalAmount = updatedItems.reduce((sum, item) => sum + (parseFloat(item.product_price) || 0) * (item.cart_quantity || 0), 0);
      setCartData(productIds, calculatedTotalItems, calculatedTotalAmount);
      
      // Reset bootstrap cache for next time
      resetCartBootstrap();
    } catch (error: any) {
      // Rollback on error
      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_id === cartItemId ? { ...item, cart_quantity: currentQuantity } : item
        )
      );
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        className: "bg-red-600 text-white border-none",
      });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    const token = session?.accessToken as string | undefined;
    if (!token) return;

    setUpdatingItems((prev) => new Set(prev).add(cartItemId));

    // Optimistic update
    const removedItem = cartItems.find((item) => item.cart_id === cartItemId);
    setCartItems((prev) => prev.filter((item) => item.cart_id !== cartItemId));

    try {
      await removeFromCart(cartItemId, token);
      
      // Update local state and recalculate totals (no additional API call)
      const updatedItems = cartItems.filter((item) => item.cart_id !== cartItemId);
      setCartItems(updatedItems);
      
      // Update Zustand store with new totals
      const productIds = updatedItems.map((item) => item.product_id);
      const calculatedTotalItems = updatedItems.reduce((sum, item) => sum + (item.cart_quantity || 0), 0);
      const calculatedTotalAmount = updatedItems.reduce((sum, item) => sum + (parseFloat(item.product_price) || 0) * (item.cart_quantity || 0), 0);
      setCartData(productIds, calculatedTotalItems, calculatedTotalAmount);
      
      // Reset bootstrap cache for next time
      resetCartBootstrap();

      toast({
        title: "Removed from Cart",
        description: "Item removed successfully.",
        className: "bg-orange-600 text-white border-none",
      });
    } catch (error: any) {
      // Rollback on error
      if (removedItem) {
        setCartItems((prev) => [...prev, removedItem]);
      }
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        className: "bg-red-600 text-white border-none",
      });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    const token = session?.accessToken as string | undefined;
    if (!token) return;

    const previousItems = [...cartItems];
    const previousTotalAmount = totalAmount;
    setCartItems([]);
    setCartData([], 0, 0);

    try {
      await clearCartAPI(token);
      resetCartBootstrap();
      
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart.",
        className: "bg-green-600 text-white border-none",
      });
    } catch (error: any) {
      // Rollback on error
      setCartItems(previousItems);
      const productIds = previousItems.map((item) => item.product_id);
      setCartData(productIds, previousItems.length, previousTotalAmount);
      
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        className: "bg-red-600 text-white border-none",
      });
    }
  };

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
            Shopping <span className="text-primary">Cart</span>
          </h1>
          <p className="text-muted-foreground mb-8">Please log in to view your cart</p>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading your cart...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
            Shopping <span className="text-primary">Cart</span>
          </h1>
          <p className="text-red-500 mb-8">Failed to load cart. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="flex flex-col items-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-4xl font-bold font-heading italic uppercase mb-4">
              Shopping <span className="text-primary">Cart</span>
            </h1>
            <p className="text-muted-foreground mb-8">Your cart is empty</p>
            <Link href="/categories">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
          Shopping <span className="text-primary">Cart</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.filter(item => item.cart_id && item.product_id).map((item, index) => {
              const isUpdating = updatingItems.has(item.cart_id);
              const fallbackKey = item.cart_id || `cart-item-${index}`;

              const isBulk = item.type === 'bulk' || (item as any).cart_type === 'bulk';
              const displayUnitPrice = isBulk
                ? (typeof item.offered_price_per_unit === 'number' ? item.offered_price_per_unit : parseFloat((item as any).cart_offered_price_per_unit) || parseFloat(item.product_price) || 0)
                : (parseFloat(item.product_price) || 0);

              return (
                <div key={fallbackKey} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                  <img 
                    src={item.product_product_img_url || '/placeholder.png'} 
                    alt={item.product_title || 'Product'} 
                    className="w-24 h-24 object-contain bg-muted/20 rounded" 
                  />
                  <div className="flex-grow">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold font-heading uppercase">
                        {item.product_title || 'Untitled Product'}
                      </h3>
                      {isBulk && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-600 text-white">
                          BULK
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.product_description || 'No description available'}
                    </p>
                    {!isBulk && (
                      <p className="text-lg font-bold text-primary mt-2">
                        ${displayUnitPrice.toFixed(2)}
                      </p>
                    )}

                    {isBulk && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div className="bg-muted/30 border border-border rounded p-2">
                          <div className="text-muted-foreground text-xs">Requested Price</div>
                          <div className="font-semibold">
                            ${Number((item as any).cart_requested_price_per_unit ?? item.requested_price_per_unit ?? 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-muted/30 border border-border rounded p-2">
                          <div className="text-muted-foreground text-xs">Offered Price</div>
                          <div className="font-semibold">
                            ${Number((item as any).cart_offered_price_per_unit ?? item.offered_price_per_unit ?? displayUnitPrice).toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-muted/30 border border-border rounded p-2">
                          <div className="text-muted-foreground text-xs">Selected Qty</div>
                          <div className="font-semibold">
                            {Number(item.cart_quantity ?? 0) || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveItem(item.cart_id)}
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleUpdateQuantity(item.cart_id, item.cart_quantity, -1)}
                        disabled={isUpdating}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold">
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : item.cart_quantity}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleUpdateQuantity(item.cart_id, item.cart_quantity, 1)}
                        disabled={isUpdating}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold font-heading uppercase mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">${calculatedTotalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold">FREE</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">${calculatedTotalAmount.toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full mb-2">Proceed to Checkout</Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={handleClearCart}>Clear Cart</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
