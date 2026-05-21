export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  gameType: 'Lotería' | 'Rifa' | 'Sorteo' | 'Boleta' | 'Juego ocasional';
  gameNumber?: string;
  gameDate: string;
  amount?: number;
  place?: string;
  status: 'Pendiente' | 'Ganado' | 'Perdido';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTicket extends Ticket {
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type TicketFilters = {
  status?: Ticket['status'];
  gameType?: Ticket['gameType'];
  q?: string;
  page?: number;
  pageSize?: number;
};

export type AdminTicketFilters = TicketFilters & {
  userId?: string;
};

export type NotificationType = 'won' | 'upcoming' | 'expired' | 'action_required';
export type NotificationAudience = 'user' | 'admin';

export interface AppNotification {
  id: string;
  type: NotificationType;
  audience: NotificationAudience;
  title: string;
  message: string;
  ticketId?: string;
  createdAt: string;
  dismissed: boolean;
}
