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
  businessStatus?: string;
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
  merchantId?: number;
  merchantName?: string;
};

export type CreateOrderPayload = {
  merchantId: number;
  address: string;
  remark?: string;
  payMethod?: string;
  payStatus?: string;
  refundStatus?: string;
  couponId?: number;
  discountAmount?: number;
  items: CartItem[];
};

export type Order = {
  id: string;
  merchantId: number;
  merchantName: string;
  status: string;
  totalAmount: number;
  address: string;
  remark?: string;
  payMethod?: string;
  couponId?: number;
  discountAmount?: number;
  createTime?: string;
};

export type Address = {
  id?: number;
  receiver: string;
  phone: string;
  detail: string;
  isDefault?: boolean;
};

export type Coupon = {
  id: number;
  name: string;
  thresholdAmount: number;
  discountAmount: number;
  status: string;
};

export type CustomerProfile = {
  userId: number;
  nickname: string;
  phone: string;
  balance: number;
  points: number;
  balanceLabel?: string;
  pointsLabel?: string;
};

export type Review = {
  id: number;
  orderId: string;
  rating: number;
  content: string;
  reply?: string;
};

export type ReviewPayload = {
  orderId: string;
  rating: number;
  content: string;
};

export type MerchantStats = {
  todayIncome: number;
  todayOrders: number;
  availableBalance?: number;
  grossIncome?: number;
  platformServiceFee?: number;
  pendingWithdrawAmount?: number;
  withdrawnAmount?: number;
  totalIncome?: number;
  totalOrders?: number;
  conversionRate?: string;
  refundOrders?: number;
  canceledOrders?: number;
};

export type RiderStats = {
  todayIncome: number;
  todayOrders: number;
  totalIncome: number;
  totalOrders: number;
  level: string;
  score: string;
  onTimeRate?: string;
};

export type AdminDashboard = {
  todayGmv: number;
  todayOrders: number;
  totalGmv?: number;
  totalOrders?: number;
  activeUsers: number;
  todayExceptionOrders?: number;
  totalExceptionOrders?: number;
  dailyTrend?: Array<{ date: string; label: string; gmv: number; orders: number; exceptionOrders: number }>;
  merchantRanking?: Array<{ merchantId: number; name: string; orders: number; gmv: number }>;
  riderRanking?: Array<{ riderId: number; name: string; completedOrders: number; income: number }>;
};

export type WithdrawRecord = {
  id: number;
  ownerType?: string;
  ownerId?: number;
  operatorUserId?: number;
  amount: number;
  accountNo: string;
  accountNoMasked?: string;
  status: string;
  createTime?: string;
};

export type AdminUser = {
  id: number;
  name: string;
  phone: string;
  role: string;
  status: string;
};

export type AdminMerchant = {
  id: number;
  name: string;
  category: string;
  phone: string;
  address: string;
  auditStatus: string;
  businessStatus: string;
};

export type MarketingActivity = {
  id: number;
  merchantId?: number;
  name: string;
  type: string;
  status: string;
  startTime?: string;
  endTime?: string;
};

export type RiderLocation = {
  orderId: string;
  longitude: number;
  latitude: number;
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
  login: (phone: string, role: string, password: string) =>
    request<{ token: string; role: string; nickname?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, role, password }),
    }),
  getMerchants: () => request<Merchant[]>('/merchants'),
  getDishes: (merchantId: number) => request<Dish[]>(`/merchants/${merchantId}/dishes`),
  getCustomerProfile: () => request<CustomerProfile>('/customer/profile'),
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
  getAddresses: () => request<Address[]>('/customer/addresses'),
  saveAddress: (payload: Address) =>
    request<Address>('/customer/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCoupons: () => request<Coupon[]>('/customer/coupons'),
  getCustomerReviews: () => request<Review[]>('/customer/reviews'),
  createOrder: (payload: CreateOrderPayload) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  payOrder: (orderId: string, payMethod: string) =>
    request<Order>(`/orders/${orderId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ payMethod }),
    }),
  getOrders: () => request<Order[]>('/orders'),
  getOrderLocation: (orderId: string) => request<{ orderId: string; available: boolean; longitude?: number; latitude?: number }>(`/orders/${orderId}/location`),
  createWebSocketTicket: (orderId: string) =>
    request<{ ticket: string; expiresInSeconds: number }>(`/orders/${orderId}/ws-ticket`, { method: 'POST' }),
  getMerchantOrders: () => request<Order[]>('/merchant-center/orders'),
  merchantAction: (orderId: string, action: 'accept' | 'reject' | 'ready' | 'cancel') =>
    request<Order>(`/orders/${orderId}/merchant/${action}`, { method: 'POST' }),
  getMerchantDishes: () => request<Dish[]>('/merchant-center/dishes'),
  saveMerchantDish: (payload: Partial<Dish> & { name: string; price: number }) =>
    request<Dish>('/merchant-center/dishes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMerchantDishStatus: (dishId: number, status: string) =>
    request<Dish>(`/merchant-center/dishes/${dishId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateMerchantDishStock: (dishId: number, stock: number) =>
    request<Dish>(`/merchant-center/dishes/${dishId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    }),
  getMerchantStats: () => request<MerchantStats>('/merchant-center/stats'),
  getMerchantReviews: () => request<Review[]>('/merchant-center/reviews'),
  replyMerchantReview: (reviewId: number, reply: string) =>
    request<Review>(`/merchant-center/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    }),
  getMerchantCategories: () => request<Array<{ id: number; merchantId: number; name: string; sort: number }>>('/merchant-center/categories'),
  saveMerchantCategory: (payload: { id?: number; name: string; sort?: number }) =>
    request<{ id: number; merchantId: number; name: string; sort: number }>('/merchant-center/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMerchantCategory: (id: number, payload: { name: string; sort?: number }) =>
    request<{ id: number; merchantId: number; name: string; sort: number }>(`/merchant-center/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteMerchantCategory: (id: number) => request<{ deleted: boolean }>(`/merchant-center/categories/${id}`, { method: 'DELETE' }),
  getBusinessSettings: () => request<Record<string, unknown>>('/merchant-center/business-settings'),
  saveBusinessSettings: (payload: Record<string, unknown>) =>
    request<{ saved: boolean; businessStatus?: string; settings: Record<string, unknown> }>('/merchant-center/business-settings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMerchantMarketing: () => request<MarketingActivity[]>('/merchant-center/marketing'),
  saveMerchantMarketing: (payload: Partial<MarketingActivity>) =>
    request<MarketingActivity>('/merchant-center/marketing', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMerchantMarketing: (id: number, payload: Partial<MarketingActivity>) =>
    request<MarketingActivity>(`/merchant-center/marketing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  merchantWithdraw: (amount: number, accountNo: string) =>
    request<WithdrawRecord>('/merchant-center/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, accountNo }),
    }),
  getMerchantWithdrawRecords: () => request<WithdrawRecord[]>('/merchant-center/withdraw-records'),
  getRiderLobby: () => request<RiderLobbyOrder[]>('/rider/lobby'),
  getRiderTasks: () => request<Order[]>('/rider/tasks'),
  getRiderHistory: () => request<Order[]>('/rider/history'),
  riderAction: (orderId: string, action: 'accept' | 'pickup' | 'delivered') =>
    request<Order>(`/orders/${orderId}/rider/${action}`, { method: 'POST' }),
  reportRiderLocation: (payload: RiderLocation) =>
    request<RiderLocation>(`/orders/${payload.orderId}/location`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getRiderIncome: () => request<RiderStats>('/rider/income'),
  withdraw: (amount: number, accountNo: string) =>
    request<{ status: string; amount: number; accountNo: string }>('/rider/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, accountNo }),
    }),
  getWithdrawRecords: () => request<WithdrawRecord[]>('/rider/withdraw-records'),
  cancelOrder: (orderId: string) => request<Order>(`/orders/${orderId}/cancel`, { method: 'POST' }),
  submitReview: (payload: ReviewPayload) =>
    request<unknown>('/customer/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAdminDashboard: () => request<AdminDashboard>('/admin/dashboard'),
  getAdminUsers: () => request<AdminUser[]>('/admin/users'),
  getAdminOrders: () => request<Order[]>('/admin/orders'),
  getAdminMerchants: () => request<AdminMerchant[]>('/admin/merchants'),
  getAdminRiders: () => request<AdminUser[]>('/admin/riders'),
  getAdminMarketing: () => request<MarketingActivity[]>('/admin/marketing'),
  adminAudit: (module: 'merchants' | 'riders' | 'users', id: number, status: string, rejectReason?: string) =>
    request<{ module: string; id: number; result: string }>(`/admin/${module}/${id}/audit`, {
      method: 'POST',
      body: JSON.stringify({ status, rejectReason }),
    }),
  adminCreate: (module: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/admin/${module}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  adminUpdate: (module: string, id: number, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/admin/${module}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  adminDelete: (module: string, id: number) => request<Record<string, unknown>>(`/admin/${module}/${id}`, { method: 'DELETE' }),
  updateAdminUserStatus: (id: number, status: string) =>
    request<Record<string, unknown>>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
