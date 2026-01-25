import { getApiUrl } from '@/config/api';
import { useQuery } from '@tanstack/react-query';

export type Product = {
  id: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  price: string;
  cost: string;
  freight: string;
  stock_quantity: number;
  category_id: string;
  brand_id: string;
  currency: string;
  product_img_url: string;
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
  category: {
    id: string;
    is_active: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
    name: string;
    description: string | null;
  };
  brand: {
    id: string;
    is_active: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
    name: string;
    description: string | null;
  };
  images: Array<{
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
  }>;
  soldQty: number;
  avgRating: number;
  reviewCount: number;
  score: number;
  isHot: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Get best products
export async function fetchBestProducts(): Promise<ApiResponse<Product[]>> {
  const url = getApiUrl('/products/best');
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

// React Query hook for best products
export function useBestProducts() {
  return useQuery({
    queryKey: ['best-products'],
    queryFn: fetchBestProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
