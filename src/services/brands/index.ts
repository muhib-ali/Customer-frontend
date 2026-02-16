
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/config/api';

export type BrandItem = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BrandsResponse = {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: BrandItem[];
};

export const brandsQueryKey = ['brands'] as const;

export async function fetchBrands(): Promise<BrandItem[]> {
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

  const json: BrandsResponse = await response.json();

  // Handle different possible response structures
  let brandsArray: any[] = [];
  
  if (Array.isArray(json.data)) {
    brandsArray = json.data;
  } else if (json.data && typeof json.data === 'object' && Array.isArray((json.data as any).brands)) {
    // Some APIs might return { data: { brands: [...] } }
    brandsArray = (json.data as any).brands;
  } else {
    console.error('Brands API: data is not an array and does not contain brands array', json.data);
    return [];
  }

  return brandsArray.map((brand) => ({
    id: brand.id,
    name: brand.name,
    description: brand.description ?? null,
    is_active: brand.is_active,
    created_at: brand.created_at,
    updated_at: brand.updated_at,
  }));
}

export function useBrands() {
  return useQuery({
    queryKey: brandsQueryKey,
    queryFn: fetchBrands,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}
