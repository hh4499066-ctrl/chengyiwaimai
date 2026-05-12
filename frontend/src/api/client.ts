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
  status?: string;
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

export type RiderLobbyOrder = {
  orderId: string;
  income: number;
  distance: string;
  merchant: string;
  address: string;
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

  let body: ApiResponse<T> | null = null;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(body?.message || `接口请求失败：${response.status}`);
  }
  if (!body) {
    throw new Error('接口响应格式错误');
  }
  if (body.code !== 0) {
    throw new Error(body.message || '业务处理失败');
  }
  return body.data;
}

export const api = {
  login: (phone: string, role: string, code = '123456') =>
    request<{ token: string; role: string; nickname?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, role, code }),
    }),
  getMerchants: () => request<Merchant[]>('/merchants'),
  getDishes: (merchantId: number) => request<Dish[]>(`/merchants/${merchantId}/dishes`),
  getCart: () => request<CartItem[]>('/customer/cart'),
  addCart: (payload: CartItem) =>
    request<CartItem>('/customer/cart', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCart: (dishId: number, quantity: number) =>
    request<CartItem>(`/customer/cart/${dishId}`, {
      method: 'PUT',
      body: JSON.stringify({ dishId, quantity }),
    }),
  deleteCartItem: (dishId: number) => request<{ deleted: boolean }>(`/customer/cart/${dishId}`, { method: 'DELETE' }),
  clearCart: () => request<{ cleared: boolean }>('/customer/cart', { method: 'DELETE' }),
  createOrder: (payload: CreateOrderPayload) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  payOrder: (orderId: string) => request<Order>(`/orders/${orderId}/pay`, { method: 'POST' }),
  getOrders: () => request<Order[]>('/orders'),
  getMerchantOrders: () => request<Order[]>('/merchant-center/orders'),
  merchantAction: (orderId: string, action: 'accept' | 'reject' | 'ready' | 'cancel') =>
    request<Order>(`/orders/${orderId}/merchant/${action}`, { method: 'POST' }),
  getRiderLobby: () => request<RiderLobbyOrder[]>('/rider/lobby'),
  getRiderTasks: () => request<Order[]>('/rider/tasks'),
  riderAction: (orderId: string, action: 'accept' | 'pickup' | 'delivered') =>
    request<Order>(`/orders/${orderId}/rider/${action}`, { method: 'POST' }),
  submitReview: (payload: ReviewPayload) =>
    request<unknown>('/customer/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
