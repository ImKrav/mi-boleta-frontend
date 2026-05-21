'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Ticket } from '@/types';
import { ticketsApi } from '@/lib/api';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
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
    return <p className="text-center text-muted-foreground py-12">Boleta no encontrada</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">{ticket.title}</h1>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/tickets/${ticket.id}/edit`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Button variant="ghost" onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
            <span className="text-sm text-muted-foreground">{ticket.gameType}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {ticket.gameNumber && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Número</p>
                  <p className="font-medium text-foreground">{ticket.gameNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha del sorteo</p>
                <p className="font-medium text-foreground">
                  {new Date(ticket.gameDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {ticket.amount && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valor apostado</p>
                  <p className="font-medium text-foreground">${ticket.amount.toLocaleString('es-CO')}</p>
                </div>
              )}
              {ticket.place && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lugar de compra</p>
                  <p className="font-medium text-foreground">{ticket.place}</p>
                </div>
              )}
            </div>

            {ticket.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notas</p>
                <p className="text-foreground">{ticket.notes}</p>
              </div>
            )}

            <div className="pt-6 border-t border-border text-sm text-muted-foreground space-y-1">
              <p>Creado: {new Date(ticket.createdAt).toLocaleString('es-ES')}</p>
              <p>Actualizado: {new Date(ticket.updatedAt).toLocaleString('es-ES')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
