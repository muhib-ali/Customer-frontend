import { getApiUrl } from '@/config/api';

export interface BulkPricing {
  id: string;
  quantity: number;
  price_per_product: number;
}

export interface ProductWithBulkPricing {
  product: {
    id: string;
    title: string;
    sku: string;
    price: number;
    stock_quantity: number;
  };
  bulkPricing: BulkPricing[];
}

export interface AddBulkToCartRequest {
  product_id: string;
  quantity: number;
  type: 'bulk';
  requested_price_per_unit: number;
  offered_price_per_unit: number;
  bulk_min_quantity: number;
}

export interface BulkCartItem {
  cart_id: string;
  product_id: string;
  quantity: number;
  type: 'bulk';
  requested_price_per_unit: number;
  offered_price_per_unit: number;
  bulk_min_quantity: number;
  is_active: boolean;
}

export interface CreateBulkOrderRequest {
  order_type: 'bulk';
  items: {
    cart_id: string;
    requested_price_per_unit: number;
    offered_price_per_unit: number;
    bulk_min_quantity: number;
  }[];
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  notes?: string;
}

// Get product with bulk pricing by SKU
export async function getProductBulkPricingBySku(sku: string, token: string): Promise<ProductWithBulkPricing> {
  const url = getApiUrl(`/products/sku/${sku}/bulk-pricing`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    if (response.status === 404) {
      throw new Error('Product not found');
    }
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  const json = await response.json();
  return json.data;
}

// Add bulk item to cart
export async function addBulkItemToCart(data: AddBulkToCartRequest, token: string): Promise<BulkCartItem> {
  const url = getApiUrl('/cart/add');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    if (response.status === 400) {
      throw new Error(errorText || 'Invalid request');
    }
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  const json = await response.json();
  return json.data;
}

// Create bulk order
export async function createBulkOrder(data: CreateBulkOrderRequest, token: string): Promise<any> {
  const url = getApiUrl('/orders/create');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    if (response.status === 400) {
      throw new Error(errorText || 'Invalid order data');
    }
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  const json = await response.json();
  return json.data;
}
