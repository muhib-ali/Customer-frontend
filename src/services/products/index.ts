
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/config/api';

export interface ProductImage {
  id: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  product_id: string;
  url: string;
  file_name: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  vtype_id: string;
  value: string;
  product_id: string;
}

export interface Brand {
  id: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
}

export interface Category {
  id: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
}

export interface Product {
  id: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  price: string;
  cost: string;
  freight: string;
  stock_quantity: number;
  category_id: string;
  brand_id: string;
  currency: string;
  product_img_url: string | null;
  product_video_url: string | null;
  sku: string;
  tax_id: string;
  supplier_id: string;
  warehouse_id: string;
  discount: string;
  start_discount_date: string;
  end_discount_date: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  total_price: string;
  images: ProductImage[];
  brand?: Brand;
  category?: Category;
  variants?: ProductVariant[];
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
  const url = getApiUrl(`/products/${encodeURIComponent(slug)}`);
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

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  stock?: 'all' | 'in' | 'out';
  search?: string;
  sortBy?: 'price' | 'created_at' | 'title' | 'stock_quantity';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<ApiResponse<ProductsResponse>> {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.category) params.append('category', filters.category);
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.stock) params.append('stock', filters.stock);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const url = getApiUrl(`/products?${params.toString()}`);
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

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  });
}

export async function fetchBrands(): Promise<ApiResponse<{ brands: Brand[] }>> {
  const url = getApiUrl('/brands');
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

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  });
}

export async function fetchCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
  const url = getApiUrl('/categories');
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

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}
