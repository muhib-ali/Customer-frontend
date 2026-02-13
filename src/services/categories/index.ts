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

export interface CategoryOverview {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  productCount?: number;
}

export interface CategoriesListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    categories: CategoryOverview[];
  };
}

export const allCategoriesQueryKey = ["categories", "all"] as const;

export async function fetchAllCategories(): Promise<CategoriesListResponse> {
  const apiUrl = getApiUrl("/categories");

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

export function useAllCategories() {
  return useQuery({
    queryKey: allCategoriesQueryKey,
    queryFn: fetchAllCategories,
  });
}

export interface SubcategoryItem {
  id: string;
  name: string;
  description: string | null;
  cat_id: string;
}

export interface SubcategoriesByCategoryResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: { subcategories: SubcategoryItem[] };
}

export interface CategoryByIdResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: { id: string; name: string; description?: string | null; [key: string]: unknown };
}

export const categoryByIdQueryKey = (id: string | null) => ["categories", "byId", id] as const;

export async function fetchCategoryById(
  id: string
): Promise<CategoryByIdResponse> {
  const apiUrl = getApiUrl(`/categories/${encodeURIComponent(id)}`);
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

export function useCategoryById(categoryId: string | null) {
  return useQuery({
    queryKey: categoryByIdQueryKey(categoryId),
    queryFn: () => fetchCategoryById(categoryId!),
    enabled: !!categoryId,
  });
}

export const subcategoriesByCategoryQueryKey = (categoryId: string | null) =>
  ["categories", "subcategories", categoryId] as const;

export async function fetchSubcategoriesByCategoryId(
  categoryId: string
): Promise<SubcategoriesByCategoryResponse> {
  const apiUrl = getApiUrl(`/categories/subcategories-by-category/${encodeURIComponent(categoryId)}`);

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

export function useSubcategoriesByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: subcategoriesByCategoryQueryKey(categoryId),
    queryFn: () => fetchSubcategoriesByCategoryId(categoryId!),
    enabled: !!categoryId,
  });
}