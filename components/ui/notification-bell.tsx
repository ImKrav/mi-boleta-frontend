'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/providers/notification-provider';
import { BellIcon, CloseIcon, TrophyIcon, ClockIcon, AlertIcon, TicketIcon, EditIcon } from '@/components/ui/icons';
import type { AppNotification } from '@/types';

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  won: {
    icon: <TrophyIcon size={16} />,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  upcoming: {
    icon: <ClockIcon size={16} />,
    color: 'text-sky-700',
    bg: 'bg-sky-50',
  },
  expired: {
    icon: <AlertIcon size={16} />,
    color: 'text-orange-700',
    bg: 'bg-orange-50',
  },
  action_required: {
    icon: <AlertIcon size={16} />,
    color: 'text-red-700',
    bg: 'bg-red-50',
  },
};

function NotificationItem({ notification, onDismiss }: { notification: AppNotification; onDismiss: (id: string) => void }) {
  const config = typeConfig[notification.type] || typeConfig.expired;
  const isAdmin = notification.audience === 'admin';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${config.bg} group`}>
      <div className={`shrink-0 mt-0.5 ${config.color}`}>{config.icon}</div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-bold ${config.color}`}>{notification.title}</p>
        <p className="text-sm text-foreground mt-0.5 line-clamp-2">{notification.message}</p>
        {notification.ticketId && (
          <Link
            href={isAdmin ? `/dashboard/tickets/${notification.ticketId}/edit` : `/dashboard/tickets/${notification.ticketId}`}
            className={`inline-flex items-center gap-1 text-xs font-semibold mt-1.5 transition-colors ${
              isAdmin ? 'text-red-600 hover:text-red-700' : 'text-accent hover:text-accent/80'
            }`}
          >
            {isAdmin ? <EditIcon size={12} /> : <TicketIcon size={12} />}
            {isAdmin ? 'Editar estado' : 'Ver boleta'}
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(notification.id)}
        className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/5 transition-all cursor-pointer text-muted-foreground"
        aria-label="Descartar"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unseenCount, dismissById, markAllSeen, audience } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && unseenCount > 0) {
      markAllSeen();
    }
  }, [open, unseenCount, markAllSeen]);

  if (notifications.length === 0) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
        aria-label={`Notificaciones${unseenCount > 0 ? `, ${unseenCount} sin leer` : ''}`}
      >
        <BellIcon size={20} />
        {unseenCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">El Avisador</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {audience === 'admin' ? 'Panel de administrador' : 'Tus boletas'}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{notifications.length} aviso{notifications.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onDismiss={dismissById} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
