import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/config/api';

export type ProductImage = {
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
};

export type ProductCategory = {
  id: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
};

export type ProductBrand = {
  id: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
};

export type NewArrivalProduct = {
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
  category: ProductCategory;
  brand: ProductBrand;
  images: ProductImage[];
};

export type NewArrivalsResponse = {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: NewArrivalProduct[];
};

export const newArrivalsQueryKey = ['products', 'new-arrivals'] as const;

export async function fetchNewArrivals(): Promise<NewArrivalsResponse> {
  const url = getApiUrl('/products/new-arrivals');
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

export function useNewArrivals() {
  return useQuery({
    queryKey: newArrivalsQueryKey,
    queryFn: fetchNewArrivals,
  });
}
