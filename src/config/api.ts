export const API_URL = process.env.NEXT_PUBLIC_API_URL ;

// Use direct API URL for both development and production
export const getApiUrl = (endpoint: string) => {
  return `${API_URL}${endpoint}`;
};

/**
 * Normalize product image URL for next/image: must be absolute (http/https) or start with /.
 * If API returns only a filename (e.g. "HPO.Wrap.Black.jpg"), prepend API base URL.
 */
export function normalizeProductImageUrl(src: string | undefined | null): string {
  if (src == null || typeof src !== 'string') return '';
  const s = src.trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/')) return s;
  const base = API_URL?.replace(/\/$/, '');
  return `${base}/${s.replace(/^\//, '')}`;
}
