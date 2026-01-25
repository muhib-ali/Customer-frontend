import { getWishlist, type WishlistItem } from './index';

let lastToken: string | null = null;
let inFlight: Promise<WishlistItem[]> | null = null;

export async function bootstrapWishlistOnce(token: string): Promise<WishlistItem[]> {
  if (!token) return [];

  if (lastToken !== token) {
    lastToken = token;
    inFlight = null;
  }

  if (!inFlight) {
    inFlight = getWishlist(token).then((res) => res.data || []);
  }

  return inFlight;
}

export function resetWishlistBootstrap() {
  lastToken = null;
  inFlight = null;
}
