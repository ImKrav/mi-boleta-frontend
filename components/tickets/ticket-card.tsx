// components/tickets/ticket-card.tsx

import type { Ticket } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">{ticket.title}</h3>
              <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <p>
                <span className="font-medium text-foreground">Tipo:</span>{' '}
                <span className="text-muted-foreground">{ticket.gameType}</span>
              </p>
              {ticket.gameNumber && (
                <p>
                  <span className="font-medium text-foreground">Número:</span>{' '}
                  <span className="text-muted-foreground">{ticket.gameNumber}</span>
                </p>
              )}
              <p>
                <span className="font-medium text-foreground">Fecha:</span>{' '}
                <span className="text-muted-foreground">
                  {gameDate.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {isPast && ticket.status === 'Pendiente' && (
                  <span className="ml-2 text-destructive">(Vencido)</span>
                )}
              </p>
              {ticket.place && (
                <p>
                  <span className="font-medium text-foreground">Lugar:</span>{' '}
                  <span className="text-muted-foreground">{ticket.place}</span>
                </p>
              )}
              {ticket.amount && (
                <p>
                  <span className="font-medium text-foreground">Valor:</span>{' '}
                  <span className="text-muted-foreground">${ticket.amount.toLocaleString('es-CO')}</span>
                </p>
              )}
            </div>

            {ticket.notes && (
              <p className="text-sm text-muted-foreground italic line-clamp-2 pt-1">
                {ticket.notes}
              </p>
            )}
          </div>

          <div className="flex sm:flex-col gap-3 sm:gap-2 sm:items-end">
            <Link
              href={`/dashboard/tickets/${ticket.id}`}
              className="text-primary hover:text-primary/80 text-sm font-medium cursor-pointer"
            >
              Ver
            </Link>
            <Link
              href={`/dashboard/tickets/${ticket.id}/edit`}
              className="text-secondary hover:text-secondary/80 text-sm font-medium cursor-pointer"
            >
              Editar
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(ticket.id)}
                className="text-destructive hover:text-destructive/80 text-sm font-medium cursor-pointer"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
