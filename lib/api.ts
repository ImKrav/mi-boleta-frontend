const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mi-boleta-api-y9dv.onrender.com/api/v1';

import type { Ticket, AdminTicket, PaginatedResponse, TicketFilters, AdminTicketFilters, AuthResponse, User } from '@/types';

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const config: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    throw new Error(errorData.error || `Error ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();
  return data.data ?? data;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiFetch<{ user: User }>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
};

export const ticketsApi = {
  list: (filters?: TicketFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.gameType) params.set('gameType', filters.gameType);
    if (filters?.q) params.set('q', filters.q);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.pageSize) params.set('pageSize', String(filters.pageSize));

    const query = params.toString();
    return apiFetch<PaginatedResponse<Ticket>>(
      `/tickets${query ? `?${query}` : ''}`
    );
  },

  getById: (id: string) =>
    apiFetch<Ticket>(`/tickets/${id}`),

  create: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiFetch<Ticket>('/tickets', {
      method: 'POST',
      body: ticket,
    }),

  update: (id: string, ticket: Partial<Ticket>) =>
    apiFetch<Ticket>(`/tickets/${id}`, {
      method: 'PUT',
      body: ticket,
    }),

  delete: (id: string) =>
    apiFetch<void>(`/tickets/${id}`, { method: 'DELETE' }),
};

export const adminApi = {
  listAllTickets: (filters?: AdminTicketFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.gameType) params.set('gameType', filters.gameType);
    if (filters?.q) params.set('q', filters.q);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.pageSize) params.set('pageSize', String(filters.pageSize));
    if (filters?.userId) params.set('userId', filters.userId);

    const query = params.toString();
    return apiFetch<PaginatedResponse<AdminTicket>>(
      `/admin/tickets${query ? `?${query}` : ''}`
    );
  },
};
