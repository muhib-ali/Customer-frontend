import { getApiUrl } from '@/config/api';
import { useQuery } from '@tanstack/react-query';

export type PromoCode = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type PromoCodeValidationRequest = {
  code: string;
  order_amount: number;
};

export type PromoCodeValidationResponse = {
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  description: string;
  minimum_order_amount: string;
  usage_limit: number;
  usage_count: number;
  expires_at: string;
  discount_amount: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Validate promo code (POST request with request body)
export async function validatePromoCode(code: string, orderAmount: number, token: string): Promise<ApiResponse<PromoCodeValidationResponse>> {
  const url = getApiUrl('/promo-codes/validate');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        code: code,
        order_amount: orderAmount
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    // Re-throw with specific error type
    throw error;
  }
}

// React Query hook for promo code validation
export function useValidatePromoCode(code: string, orderAmount: number, token: string) {
  return useQuery({
    queryKey: ['validate-promo-code', code, orderAmount],
    queryFn: () => validatePromoCode(code, orderAmount, token),
    enabled: !!code && code.length > 0 && orderAmount > 0 && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Manual validation function (not using React Query)
export async function checkPromoCode(code: string, orderAmount: number, token: string): Promise<PromoCodeValidationResponse> {
  try {
    const response = await validatePromoCode(code, orderAmount, token);
    return response.data;
  } catch (error) {
    throw error;
  }
}
