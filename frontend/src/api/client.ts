const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
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
    request<{ token: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, role, code: '123456' }),
    }),
  createOrder: (payload: unknown) =>
    request<{ orderId: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  payOrder: (orderId: string) =>
    request<{ status: string }>(`/orders/${orderId}/pay`, { method: 'POST' }),
};
