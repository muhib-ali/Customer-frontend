import { getApiUrl } from '@/config/api';

export type CartItem = {
  cart_id: string;
  cart_created_at: string;
  cart_updated_at: string;
  cart_quantity: number;
  product_id: string;
  product_title: string;
  product_description: string;
  product_price: string;
  product_cost: string;
  product_freight: string;
  product_stock_quantity: number;
  product_currency: string;
  product_product_img_url: string;
  product_sku: string;
  category_id: string;
  category_name: string;
  brand_id: string;
  brand_name: string;
  type?: string;
  cart_type?: string;
  requested_price_per_unit?: number;
  offered_price_per_unit?: number;
  bulk_min_quantity?: number;
};

export type CartSummary = {
  totalItems: number;
  totalAmount: number;
  currency: string;
  cartType?: string;
};

export type CartData = {
  items: CartItem[];
  summary: CartSummary;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Get cart
export async function getCart(token: string): Promise<ApiResponse<CartData>> {
  const url = getApiUrl('/cart');
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

// Add to cart
export async function addToCart(productId: string, quantity: number, token: string): Promise<ApiResponse<null>> {
  const url = getApiUrl('/cart/add');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId, quantity }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

// Update cart item quantity
export async function updateCartItem(cartItemId: string, quantity: number, token: string): Promise<ApiResponse<{
  cartItemId: string;
  newQuantity: number;
  previousQuantity: number;
  availableStock: number;
}>> {
  const url = getApiUrl(`/cart/update/${cartItemId}`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

// Remove from cart
export async function removeFromCart(cartItemId: string, token: string): Promise<ApiResponse<null>> {
  const url = getApiUrl(`/cart/remove/${cartItemId}`);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

// Clear cart
export async function clearCart(token: string): Promise<ApiResponse<null>> {
  const url = getApiUrl('/cart/clear');
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}
