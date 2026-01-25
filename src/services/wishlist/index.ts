import { getApiUrl } from '@/config/api';

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    product_img_url: string;
    stock_quantity: number;
    sku: string;
  };
  created_at: string;
}

export interface ApiResponse<T> {
  statusCode?: number;
  status: boolean;
  message: string;
  heading: string;
  data: T;
}

// Add to wishlist
export async function addToWishlist(productId: string, token: string): Promise<ApiResponse<{ id: string; customer_id: string; product_id: string; created_at: string }>> {
  const url = getApiUrl('/wishlist/add');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }

    // Allow backend "already in wishlist" to be treated as non-fatal by callers.
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

// Remove from wishlist
export async function removeFromWishlist(productId: string, token: string): Promise<ApiResponse<{} | null>> {
  const url = getApiUrl(`/wishlist/remove/${productId}`);
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
    
    // Handle authentication errors
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

// Get wishlist
export async function getWishlist(token: string): Promise<ApiResponse<WishlistItem[]>> {
  const url = getApiUrl('/wishlist');
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
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}
