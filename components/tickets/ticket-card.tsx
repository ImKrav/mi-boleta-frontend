// components/tickets/ticket-card.tsx

import type { Ticket } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { TagIcon, CalendarIcon, DollarIcon, MapPinIcon, EyeIcon, EditIcon, TrashIcon } from '@/components/ui/icons';

const statusColors = {
  Pendiente: 'warning' as const,
  Ganado: 'success' as const,
  Perdido: 'danger' as const,
};

interface TicketCardProps {
  ticket: Ticket;
  onDelete?: (id: string) => void;
}

export function TicketCard({ ticket, onDelete }: TicketCardProps) {
  const gameDate = new Date(ticket.gameDate);
  const isPast = gameDate < new Date();

  return (
    <Card>
      <div className="px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-bold text-foreground">{ticket.title}</h3>
              <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <p className="flex items-center gap-2">
                <TagIcon size={14} className="text-muted-foreground shrink-0" />
                <span className="text-foreground font-medium">{ticket.gameType}</span>
              </p>
              {ticket.gameNumber && (
                <p className="flex items-center gap-2">
                  <span className="font-mono text-foreground font-semibold bg-muted px-2 py-0.5 rounded">#{ticket.gameNumber}</span>
                </p>
              )}
              <p className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-muted-foreground shrink-0" />
                <span className="text-foreground">
                  {gameDate.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {isPast && ticket.status === 'Pendiente' && (
                  <Badge variant="danger">Vencido</Badge>
                )}
              </p>
              {ticket.place && (
                <p className="flex items-center gap-2">
                  <MapPinIcon size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-foreground">{ticket.place}</span>
                </p>
              )}
              {ticket.amount && (
                <p className="flex items-center gap-2">
                  <DollarIcon size={14} className="text-muted-foreground shrink-0" />
                  <span className="font-semibold text-foreground">${ticket.amount.toLocaleString('es-CO')}</span>
                </p>
              )}
            </div>

            {ticket.notes && (
              <p className="text-sm text-muted-foreground pt-1 border-t border-border mt-3">
                {ticket.notes}
              </p>
            )}
          </div>

          <div className="flex sm:flex-col gap-2 sm:items-end">
            <Link
              href={`/dashboard/tickets/${ticket.id}`}
              className="inline-flex items-center gap-1.5 text-accent hover:text-accent/80 text-sm font-semibold transition-colors cursor-pointer"
            >
              <EyeIcon size={14} /> Ver
            </Link>
            <Link
              href={`/dashboard/tickets/${ticket.id}/edit`}
              className="inline-flex items-center gap-1.5 text-secondary hover:text-secondary/80 text-sm font-semibold transition-colors cursor-pointer"
            >
              <EditIcon size={14} /> Editar
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(ticket.id)}
                className="inline-flex items-center gap-1.5 text-destructive hover:text-destructive/80 text-sm font-semibold transition-colors cursor-pointer"
              >
                <TrashIcon size={14} /> Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
