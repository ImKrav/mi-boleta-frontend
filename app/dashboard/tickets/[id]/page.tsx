'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Ticket } from '@/types';
import { ticketsApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

const statusColors = {
  Pendiente: 'warning' as const,
  Ganado: 'success' as const,
  Perdido: 'danger' as const,
};

export default function ViewTicketPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await ticketsApi.getById(params.id as string);
        setTicket(data);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        router.push('/dashboard/tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params.id, router]);

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!ticket) {
    return <p className="text-center text-gray-500">Boleta no encontrada</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
        <div className="flex gap-2">
          <Link href={`/dashboard/tickets/${ticket.id}/edit`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Button variant="ghost" onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
            <span className="text-sm text-gray-600">{ticket.gameType}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ticket.gameNumber && (
              <div>
                <p className="text-sm text-gray-600">Número</p>
                <p className="font-medium">{ticket.gameNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Fecha del sorteo</p>
              <p className="font-medium">
                {new Date(ticket.gameDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {ticket.amount && (
              <div>
                <p className="text-sm text-gray-600">Valor apostado</p>
                <p className="font-medium">${ticket.amount.toLocaleString('es-CO')}</p>
              </div>
            )}
            {ticket.place && (
              <div>
                <p className="text-sm text-gray-600">Lugar de compra</p>
                <p className="font-medium">{ticket.place}</p>
              </div>
            )}
          </div>

          {ticket.notes && (
            <div>
              <p className="text-sm text-gray-600">Notas</p>
              <p className="mt-1 text-gray-700">{ticket.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t text-sm text-gray-500">
            <p>Creado: {new Date(ticket.createdAt).toLocaleString('es-ES')}</p>
            <p>Actualizado: {new Date(ticket.updatedAt).toLocaleString('es-ES')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
