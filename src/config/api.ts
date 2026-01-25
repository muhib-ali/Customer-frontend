export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Use direct API URL for both development and production
export const getApiUrl = (endpoint: string) => {
  return `${API_URL}${endpoint}`;
};
