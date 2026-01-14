export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// For development, use the Next.js API proxy to avoid CORS issues
export const getApiUrl = (endpoint: string) => {
  if (process.env.NODE_ENV === 'development') {
    // Use Next.js proxy for development
    return `/api${endpoint}`;
  }
  // Use direct API URL for production
  return `${API_URL}${endpoint}`;
};
