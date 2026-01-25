import { getApiUrl } from '@/config/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type Review = {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  customerName: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewRequest = {
  productId: string;
  rating: number;
  comment: string;
};

export type ProductReviewSummary = {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: Record<string, number>;
};

export const productReviewsQueryKey = (productId: string) => ['reviews', 'product', productId] as const;
export const productReviewSummaryQueryKey = (productId: string) => ['reviews', 'product', productId, 'summary'] as const;
export const myReviewsQueryKey = () => ['reviews', 'my'] as const;

async function parseJson<T>(response: Response): Promise<T> {
  const json = await response.json();
  return (json?.data ?? json) as T;
}

export async function createReview(payload: CreateReviewRequest, token: string): Promise<Review> {
  const url = getApiUrl('/reviews');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return parseJson<Review>(response);
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const url = getApiUrl(`/reviews/product?productId=${encodeURIComponent(productId)}`);
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

  const json = await response.json();
  return json?.data?.reviews || [];
}

export async function getProductReviewSummary(productId: string): Promise<ProductReviewSummary> {
  const url = getApiUrl(`/reviews/product/summary?productId=${encodeURIComponent(productId)}`);
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

  return parseJson<ProductReviewSummary>(response);
}

export async function getMyReviews(token: string): Promise<Review[]> {
  const url = getApiUrl('/reviews/my');
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
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

  const json = await response.json();
  const reviews = json?.data?.reviews || [];
  console.log('getMyReviews parsed reviews:', reviews);
  return reviews;
}

export function useProductReviews(productId?: string) {
  return useQuery({
    queryKey: productId ? productReviewsQueryKey(productId) : ['reviews', 'product', 'missing'],
    queryFn: () => getProductReviews(productId as string),
    enabled: !!productId,
  });
}

export function useProductReviewSummary(productId?: string) {
  return useQuery({
    queryKey: productId ? productReviewSummaryQueryKey(productId) : ['reviews', 'product', 'missing', 'summary'],
    queryFn: () => getProductReviewSummary(productId as string),
    enabled: !!productId,
  });
}

export function useMyReviews(token?: string) {
  return useQuery({
    queryKey: myReviewsQueryKey(),
    queryFn: () => getMyReviews(token as string),
    enabled: !!token,
  });
}

export function useCreateReview(token: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewRequest) => createReview(payload, token),
    onSuccess: (review) => {
      qc.invalidateQueries({ queryKey: myReviewsQueryKey() });
      qc.invalidateQueries({ queryKey: productReviewsQueryKey(review.productId) });
      qc.invalidateQueries({ queryKey: productReviewSummaryQueryKey(review.productId) });
    },
  });
}
