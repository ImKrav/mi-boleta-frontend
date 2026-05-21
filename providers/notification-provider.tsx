'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppNotification, Ticket, AdminTicket, NotificationType, NotificationAudience } from '@/types';
import { ticketsApi, adminApi } from '@/lib/api';
import { useAuth } from './auth-provider';

const DISMISSED_KEY = 'avisador_dismissed';
const SEEN_KEY = 'avisador_seen';

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
}

function getSeen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDismissed(ids: string[]) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
}

function saveSeen(ids: string[]) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
}

function generateId(type: NotificationType, ticketId: string, date: string, audience: NotificationAudience): string {
  return `${audience}-${type}-${ticketId}-${date}`;
}

function buildUserNotifications(tickets: Ticket[], dismissed: string[]): AppNotification[] {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const notifications: AppNotification[] = [];

  for (const ticket of tickets) {
    const gameDate = new Date(ticket.gameDate);

    if (ticket.status === 'Ganado') {
      const id = generateId('won', ticket.id, ticket.updatedAt, 'user');
      if (!dismissed.includes(id)) {
        notifications.push({
          id,
          type: 'won',
          audience: 'user',
          title: '¡Ganaste!',
          message: `Tu boleta "${ticket.title}" fue ganadora. ¡Felicidades!`,
          ticketId: ticket.id,
          createdAt: ticket.updatedAt,
          dismissed: false,
        });
      }
    }

    if (ticket.status === 'Pendiente' && gameDate <= tomorrow && gameDate > now) {
      const id = generateId('upcoming', ticket.id, ticket.gameDate, 'user');
      if (!dismissed.includes(id)) {
        const hoursLeft = Math.round((gameDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        notifications.push({
          id,
          type: 'upcoming',
          audience: 'user',
          title: 'Sorteo próximo',
          message: `"${ticket.title}" se juega en ${hoursLeft}h. ¡Cruza los dedos!`,
          ticketId: ticket.id,
          createdAt: now.toISOString(),
          dismissed: false,
        });
      }
    }

    if (ticket.status === 'Pendiente' && gameDate <= now) {
      const id = generateId('expired', ticket.id, ticket.gameDate, 'user');
      if (!dismissed.includes(id)) {
        notifications.push({
          id,
          type: 'expired',
          audience: 'user',
          title: 'Sorteo vencido',
          message: `El sorteo "${ticket.title}" ya pasó. Revisa si hubo resultado.`,
          ticketId: ticket.id,
          createdAt: now.toISOString(),
          dismissed: false,
        });
      }
    }
  }

  return notifications.sort((a, b) => {
    const priority: Record<NotificationType, number> = { won: 0, upcoming: 1, expired: 2, action_required: 3 };
    return priority[a.type] - priority[b.type];
  });
}

function buildAdminNotifications(tickets: AdminTicket[], dismissed: string[]): AppNotification[] {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const notifications: AppNotification[] = [];

  for (const ticket of tickets) {
    const gameDate = new Date(ticket.gameDate);

    if (ticket.status === 'Ganado') {
      const id = generateId('won', ticket.id, ticket.updatedAt, 'admin');
      if (!dismissed.includes(id)) {
        notifications.push({
          id,
          type: 'won',
          audience: 'admin',
          title: `Boleta ganada — ${ticket.owner.name}`,
          message: `"${ticket.title}" de ${ticket.owner.name} fue marcada como ganadora.`,
          ticketId: ticket.id,
          createdAt: ticket.updatedAt,
          dismissed: false,
        });
      }
    }

    if (ticket.status === 'Pendiente' && gameDate <= tomorrow && gameDate > now) {
      const id = generateId('upcoming', ticket.id, ticket.gameDate, 'admin');
      if (!dismissed.includes(id)) {
        const hoursLeft = Math.round((gameDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        notifications.push({
          id,
          type: 'upcoming',
          audience: 'admin',
          title: `Sorteo próximo — ${ticket.owner.name}`,
          message: `"${ticket.title}" de ${ticket.owner.name} se juega en ${hoursLeft}h.`,
          ticketId: ticket.id,
          createdAt: now.toISOString(),
          dismissed: false,
        });
      }
    }

    if (ticket.status === 'Pendiente' && gameDate <= now) {
      const id = generateId('action_required', ticket.id, ticket.gameDate, 'admin');
      if (!dismissed.includes(id)) {
        notifications.push({
          id,
          type: 'action_required',
          audience: 'admin',
          title: `Acción requerida — ${ticket.owner.name}`,
          message: `"${ticket.title}" de ${ticket.owner.name} ya pasó. Actualiza el estado.`,
          ticketId: ticket.id,
          createdAt: now.toISOString(),
          dismissed: false,
        });
      }
    }
  }

  return notifications.sort((a, b) => {
    const priority: Record<NotificationType, number> = { won: 0, upcoming: 1, expired: 2, action_required: 0 };
    return priority[a.type] - priority[b.type];
  });
}

interface NotificationContextType {
  notifications: AppNotification[];
  currentNotification: AppNotification | null;
  unseenCount: number;
  dismissCurrent: () => void;
  dismissById: (id: string) => void;
  markAllSeen: () => void;
  loading: boolean;
  audience: NotificationAudience | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set(getSeen()));
  const [loading, setLoading] = useState(true);

  const audience: NotificationAudience | null = user?.role === 'admin' ? 'admin' : 'user';

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const dismissed = getDismissed();
        let all: AppNotification[] = [];

        if (user.role === 'admin') {
          const response = await adminApi.listAllTickets({ pageSize: 200 });
          all = buildAdminNotifications(response.data, dismissed);
        } else {
          const response = await ticketsApi.list({ pageSize: 100 });
          all = buildUserNotifications(response.data, dismissed);
        }

        if (!cancelled) {
          setNotifications(all);

          setSeenIds((prev) => {
            const newSeen = new Set(prev);
            const unseen = all.filter((n) => !prev.has(n.id));
            if (unseen.length > 0) {
              unseen.forEach((n) => newSeen.add(n.id));
              saveSeen([...newSeen]);
            }
            return newSeen;
          });
        }
      } catch (err) {
        console.error('Error building notifications:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const currentNotification = notifications.length > 0 ? notifications[0] : null;

  const dismissCurrent = useCallback(() => {
    setNotifications((prev) => {
      if (prev.length === 0) return prev;
      const current = prev[0];
      const dismissed = getDismissed();
      dismissed.push(current.id);
      saveDismissed(dismissed);
      return prev.slice(1);
    });
  }, []);

  const dismissById = useCallback((id: string) => {
    setNotifications((prev) => {
      const dismissed = getDismissed();
      dismissed.push(id);
      saveDismissed(dismissed);
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const markAllSeen = useCallback(() => {
    setSeenIds((prev) => {
      const newSeen = new Set(prev);
      notifications.forEach((n) => newSeen.add(n.id));
      saveSeen([...newSeen]);
      return newSeen;
    });
  }, [notifications]);

  const unseenCount = notifications.filter((n) => !seenIds.has(n.id)).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        currentNotification,
        unseenCount,
        dismissCurrent,
        dismissById,
        markAllSeen,
        loading,
        audience,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
