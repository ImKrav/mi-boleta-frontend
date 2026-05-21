'use client';

import { useCallback, useRef } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/providers/notification-provider';
import { TrophyIcon, ClockIcon, AlertIcon, CloseIcon, TicketIcon, EditIcon } from '@/components/ui/icons';

const typeConfig: Record<string, { bg: string; border: string; accent: string; icon: React.ReactNode; userLabel: string; adminLabel: string }> = {
  won: {
    bg: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50',
    border: 'border-amber-300',
    accent: 'text-amber-700',
    icon: <TrophyIcon size={20} className="text-amber-600" />,
    userLabel: 'Ver boleta',
    adminLabel: 'Ver detalle',
  },
  upcoming: {
    bg: 'bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50',
    border: 'border-sky-300',
    accent: 'text-sky-700',
    icon: <ClockIcon size={20} className="text-sky-600" />,
    userLabel: 'Ver boleta',
    adminLabel: 'Ver detalle',
  },
  expired: {
    bg: 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50',
    border: 'border-orange-300',
    accent: 'text-orange-700',
    icon: <AlertIcon size={20} className="text-orange-600" />,
    userLabel: 'Ver boleta',
    adminLabel: 'Editar estado',
  },
  action_required: {
    bg: 'bg-gradient-to-r from-red-50 via-rose-50 to-red-50',
    border: 'border-red-300',
    accent: 'text-red-700',
    icon: <AlertIcon size={20} className="text-red-600" />,
    userLabel: 'Ver boleta',
    adminLabel: 'Editar estado',
  },
};

export function NotificationBanner() {
  const { currentNotification, dismissCurrent } = useNotifications();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dismissCurrent();
  }, [dismissCurrent]);

  if (!currentNotification) return null;

  const config = typeConfig[currentNotification.type];
  if (!config) return null;

  const isAdmin = currentNotification.audience === 'admin';
  const ctaLabel = isAdmin ? config.adminLabel : config.userLabel;
  const ctaHref = currentNotification.ticketId
    ? isAdmin
      ? `/dashboard/tickets/${currentNotification.ticketId}/edit`
      : `/dashboard/tickets/${currentNotification.ticketId}`
    : null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] animate-slide-down"
      role="alert"
      aria-live="polite"
    >
      <div className={`relative w-full ${config.bg} border-b-2 ${config.border} shadow-lg`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="shrink-0 mt-0.5">{config.icon}</div>
              <div className="min-w-0 flex-1">
                <p className={`font-bold text-sm ${config.accent}`}>{currentNotification.title}</p>
                <p className="text-sm text-foreground mt-0.5">{currentNotification.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {ctaHref && (
                <Link
                  href={ctaHref}
                  onClick={handleDismiss}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${config.accent} hover:bg-white/60 transition-colors cursor-pointer`}
                >
                  {isAdmin ? <EditIcon size={12} /> : <TicketIcon size={12} />}
                  {ctaLabel}
                </Link>
              )}
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer text-muted-foreground"
                aria-label="Cerrar notificación"
              >
                <CloseIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20 animate-shrink" />
      </div>
    </div>
  );
}
