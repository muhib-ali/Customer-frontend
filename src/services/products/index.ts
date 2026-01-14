
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/config/api';

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  file_name: string;
  sort_order: number;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  sku: string;
  product_img_url: string | null;
  images: ProductImage[];
  brand?: Brand;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  statusCode?: number;
  status: boolean;
  message: string;
  heading: string;
  data: T;
}

export const productQueryKey = (id: string) => ['product', 'id', id] as const;
export const productBySlugQueryKey = (slug: string) => ['product', 'slug', slug] as const;

export async function fetchProductById(id: string): Promise<ApiResponse<Product>> {
  const url = getApiUrl(`/products/${id}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function fetchProductBySlug(slug: string): Promise<ApiResponse<Product>> {
  const url = getApiUrl(`/products/slug/${encodeURIComponent(slug)}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}

export function useProductById(id?: string) {
  return useQuery({
    queryKey: id ? productQueryKey(id) : ['product', 'id', 'missing'],
    queryFn: () => fetchProductById(id as string),
    enabled: !!id,
  });
}

export function useProductBySlug(slug?: string) {
  return useQuery({
    queryKey: slug ? productBySlugQueryKey(slug) : ['product', 'slug', 'missing'],
    queryFn: () => fetchProductBySlug(slug as string),
    enabled: !!slug,
  });
}
