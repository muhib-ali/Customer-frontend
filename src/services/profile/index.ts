import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Helper to get correct API URL based on environment
const getApiUrl = (endpoint: string) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Use Next.js proxy in development
    return `/backend${endpoint}`;
  }
  // Direct API URL for production
  return `${API_URL}${endpoint}`;
};

// Create axios instance for profile API
const profileAxios = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
profileAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Types
export interface ProfileData {
  id: string;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileDto {
  fullname: string;
  username: string;
  phone: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ForgotPasswordOtpDto {
  email: string;
}

export interface ResetPasswordWithOtpDto {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: T;
}

// API Functions
const profileApi = {
  async getProfile(): Promise<ApiResponse<ProfileData>> {
    const response = await profileAxios.get(getApiUrl('/auth/profile'));
    return response.data;
  },

  async updateProfile(data: UpdateProfileDto): Promise<ApiResponse<ProfileData>> {
    const response = await profileAxios.put(getApiUrl('/auth/profile'), data);
    return response.data;
  },

  async changePassword(data: ChangePasswordDto): Promise<ApiResponse<null>> {
    const response = await profileAxios.put(getApiUrl('/auth/change-password'), data);
    return response.data;
  },

  async forgotPasswordOtp(data: ForgotPasswordOtpDto): Promise<ApiResponse<any>> {
    const response = await profileAxios.post(getApiUrl('/auth/forgot-password-otp'), data);
    return response.data;
  },

  async resetPasswordWithOtp(data: ResetPasswordWithOtpDto): Promise<ApiResponse<null>> {
    const response = await profileAxios.post(getApiUrl('/auth/reset-password-with-otp'), data);
    return response.data;
  },
};

// React Query Hooks
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    retry: 1,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: profileApi.changePassword,
  });
};

export const useForgotPasswordOtp = () => {
  return useMutation({
    mutationFn: profileApi.forgotPasswordOtp,
  });
};

export const useResetPasswordWithOtp = () => {
  return useMutation({
    mutationFn: profileApi.resetPasswordWithOtp,
  });
};
