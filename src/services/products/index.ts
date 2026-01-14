import { getApiUrl } from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/auth";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  cost: number;
  freight: number;
  stock_quantity: number;
  category_id: string;
  brand_id: string;
  currency: string;
  product_img_url: string;
  product_video_url: string;
  sku: string;
  tax_id: string;
  supplier_id: string;
  warehouse_id: string;
  discount: number;
  start_discount_date: string;
  end_discount_date: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  total_price: number;
}

export interface ProductsResponse {
  status: boolean;
  message: string;
  data: Product[];
}

export const newArrivalsQueryKey = ["products", "new-arrivals"] as const;

export async function fetchNewArrivals(): Promise<ProductsResponse> {
  const apiUrl = getApiUrl("/products/new-arrivals");

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export function useNewArrivals() {
  return useQuery({
    queryKey: newArrivalsQueryKey,
    queryFn: fetchNewArrivals,
  });
}

export const productDetailsQueryKey = (id: string) => ["products", "details", id] as const;

export async function fetchProductDetails(id: string): Promise<{ status: boolean; message: string; data: Product }> {
  const apiUrl = getApiUrl(`/products/${id}`);

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export function useProductDetails(id: string) {
  return useQuery({
    queryKey: productDetailsQueryKey(id),
    queryFn: () => fetchProductDetails(id),
    enabled: !!id,
  });
}

// Wishlist interfaces
export interface WishlistResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    id: string;
    customer_id: string;
    product_id: string;
    created_at: string;
  } | {};
}

export interface WishlistAddRequest {
  product_id: string;
}

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

export interface GetWishlistResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: WishlistItem[];
}

export interface WishlistRemoveResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {};
}

export const wishlistAddQueryKey = ["wishlist", "add"] as const;

export async function addToWishlistApi(productId: string): Promise<WishlistResponse> {
  const apiUrl = getApiUrl("/wishlist/add");

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Add auth token if available
      ...(typeof window !== 'undefined' && localStorage.getItem('accessToken') 
        ? { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        : {}
      ),
    },
    body: JSON.stringify({
      product_id: productId,
    } as WishlistAddRequest),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addToWishlistApi,
    onSuccess: (data) => {
      // Invalidate wishlist queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export const wishlistQueryKey = ["wishlist"] as const;

export async function fetchWishlist(): Promise<GetWishlistResponse> {
  const apiUrl = getApiUrl("/wishlist");

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Add auth token if available
      ...(typeof window !== 'undefined' && localStorage.getItem('accessToken') 
        ? { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        : {}
      ),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export function useWishlist() {
  return useQuery({
    queryKey: wishlistQueryKey,
    queryFn: fetchWishlist,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('accessToken'),
  });
}

export const wishlistRemoveQueryKey = ["wishlist", "remove"] as const;

export async function removeFromWishlistApi(productId: string): Promise<WishlistRemoveResponse> {
  const apiUrl = getApiUrl(`/wishlist/remove/${productId}`);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  console.log('RemoveFromWishlist API - Token:', token ? 'Present' : 'Missing');
  console.log('RemoveFromWishlist API - ProductId:', productId);
  console.log('RemoveFromWishlist API - URL:', apiUrl);

  const response = await fetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Add auth token if available
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
  });

  console.log('RemoveFromWishlist API - Response Status:', response.status);
  console.log('RemoveFromWishlist API - Response OK:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('RemoveFromWishlist API - Error:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeFromWishlistApi,
    onSuccess: (data) => {
      // Invalidate wishlist queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}