import { getCart, type CartData } from './index';

let lastToken: string | null = null;
let inFlight: Promise<CartData> | null = null;

export async function bootstrapCartOnce(token: string): Promise<CartData> {
  if (!token) return { items: [], summary: { totalItems: 0, totalAmount: 0, currency: 'USD' } };

  if (lastToken !== token) {
    lastToken = token;
    inFlight = null;
  }

  if (!inFlight) {
    inFlight = getCart(token).then((res) => res.data || { items: [], summary: { totalItems: 0, totalAmount: 0, currency: 'USD' } });
  }

  return inFlight;
}

export function resetCartBootstrap() {
  lastToken = null;
  inFlight = null;
}
