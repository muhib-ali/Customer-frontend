import { getApiUrl } from '@/config/api';

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'delivered' | 'partially_accepted';

export type OrderListItem = {
  id: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  order_number: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  subtotal_amount: string;
  discount_amount: string;
  total_amount: string;
  promo_code_id: string | null;
  status: OrderStatus;
  notes: string;
  order_type?: 'regular' | 'bulk' | string;
};

export type MyOrdersResponseData = {
  orders: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
};

export type OrderItem = {
  id: string;
  is_active?: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  requested_price_per_unit?: number;
  offered_price_per_unit?: number;
  bulk_min_quantity?: number;
  item_status?: 'pending' | 'accepted' | 'rejected' | string;
  product?: {
    id: string;
    title: string;
    price: string;
    product_img_url?: string;
  };
};

export type OrderDetail = OrderListItem & {
  order_items: OrderItem[];
};

export type CreateOrderRequest = {
  items: Array<{
    cart_id: string;
    requested_price_per_unit?: number;
    offered_price_per_unit?: number;
    bulk_min_quantity?: number;
  }>;
  promo_code?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  notes?: string;
};

export type CreateOrderResponseData = {
  order: {
    id: string;
    order_number: string;
  } & Record<string, unknown>;
  order_items: Array<Record<string, unknown>>;
};

export type ApiResponse<T> = {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: T;
};

export async function createOrder(payload: CreateOrderRequest, token: string): Promise<ApiResponse<CreateOrderResponseData>> {
  const url = getApiUrl('/orders/create');
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

  return response.json();
}

export async function getMyOrders(token: string, page: number = 1, limit: number = 10): Promise<ApiResponse<MyOrdersResponseData>> {
  const url = getApiUrl(`/orders/my-orders?page=${page}&limit=${limit}`);
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

  return response.json();
}

export async function getOrderById(orderId: string, token: string): Promise<ApiResponse<OrderDetail>> {
  const url = getApiUrl(`/orders/${encodeURIComponent(orderId)}`);
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

  return response.json();
}
