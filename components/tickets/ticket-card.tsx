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
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
            <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Tipo:</span> {ticket.gameType}
            </p>
            {ticket.gameNumber && (
              <p>
                <span className="font-medium">Número:</span> {ticket.gameNumber}
              </p>
            )}
            <p>
              <span className="font-medium">Fecha:</span>{' '}
              {gameDate.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {isPast && ticket.status === 'Pendiente' && (
                <span className="ml-2 text-red-600">(Vencido)</span>
              )}
            </p>
            {ticket.place && (
              <p>
                <span className="font-medium">Lugar:</span> {ticket.place}
              </p>
            )}
            {ticket.amount && (
              <p>
                <span className="font-medium">Valor:</span> ${ticket.amount.toLocaleString('es-CO')}
              </p>
            )}
          </div>

          {ticket.notes && (
            <p className="mt-3 text-sm text-gray-500 italic line-clamp-2">
              {ticket.notes}
            </p>
          )}
        </div>

        <div className="flex sm:flex-col gap-2">
          <Link
            href={`/dashboard/tickets/${ticket.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ver
          </Link>
          <Link
            href={`/dashboard/tickets/${ticket.id}/edit`}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Editar
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(ticket.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
