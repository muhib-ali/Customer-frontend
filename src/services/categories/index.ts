import { getApiUrl } from "@/config/api";
import { useQuery } from "@tanstack/react-query";

export interface Category {
  id: string;
  name: string;
  productCount: number;
}

export interface CategoriesResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: Category[];
}

export const featuredCategoriesQueryKey = ["categories", "featured"] as const;

export async function fetchFeaturedCategories(): Promise<CategoriesResponse> {
  const apiUrl = getApiUrl("/categories/featured");

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

export function useFeaturedCategories() {
  return useQuery({
    queryKey: featuredCategoriesQueryKey,
    queryFn: fetchFeaturedCategories,
  });
}