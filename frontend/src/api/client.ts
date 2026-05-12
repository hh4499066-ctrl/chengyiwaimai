const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type Merchant = {
  id: number;
  name: string;
  category?: string;
  rating?: number;
  monthlySales?: number;
  distance?: string;
  deliveryTime?: string;
  minOrder?: number;
  deliveryFee?: number;
  image?: string;
  tags?: string[];
};

export type Dish = {
  id: number;
  merchantId: number;
  name: string;
  desc?: string;
  description?: string;
  price: number;
  sales?: number;
  image?: string;
  category?: string;
  categoryName?: string;
};

export type CartItem = {
  dishId: number;
  name: string;
  quantity: number;
  price: number;
};

export type CreateOrderPayload = {
  merchantId: number;
  address: string;
  items: CartItem[];
};

export type Order = {
  id: string;
  merchantId: number;
  merchantName: string;
  status: string;
  totalAmount: number;
  address: string;
  createTime?: string;
};

export type ReviewPayload = {
  orderId: string;
  rating: number;
  content: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('chengyi_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`接口请求失败：${response.status}`);
  }

  const body = (await response.json()) as ApiResponse<T>;
  if (body.code !== 0) {
    throw new Error(body.message || '业务处理失败');
  }
  return body.data;
}

export const api = {
  login: (phone: string, role: string) =>
    request<{ token: string; role: string; nickname?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, role, code: '123456' }),
    }),
  getMerchants: () => request<Merchant[]>('/merchants'),
  getDishes: (merchantId: number) => request<Dish[]>(`/merchants/${merchantId}/dishes`),
  getCart: () => request<CartItem[]>('/customer/cart'),
  addCart: (payload: CartItem) =>
    request<CartItem>('/customer/cart', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  clearCart: () => request<{ cleared: boolean }>('/customer/cart', { method: 'DELETE' }),
  createOrder: (payload: CreateOrderPayload) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  payOrder: (orderId: string) => request<Order>(`/orders/${orderId}/pay`, { method: 'POST' }),
  getOrders: () => request<Order[]>('/orders'),
  submitReview: (payload: ReviewPayload) =>
    request<unknown>('/customer/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
