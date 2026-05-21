'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Ticket } from '@/types';
import { ticketsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { TagIcon, CalendarIcon, DollarIcon, MapPinIcon, EditIcon, ChevronLeftIcon } from '@/components/ui/icons';

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">{ticket.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
            <span className="text-sm text-muted-foreground">{ticket.gameType}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/tickets/${ticket.id}/edit`}>
            <Button variant="secondary"><EditIcon size={16} /> Editar</Button>
          </Link>
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeftIcon size={16} /> Volver
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {ticket.gameNumber && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <TagIcon size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Número</p>
                    <p className="font-mono font-bold text-foreground text-lg">#{ticket.gameNumber}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg shrink-0">
                  <CalendarIcon size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Fecha del sorteo</p>
                  <p className="font-semibold text-foreground">
                    {new Date(ticket.gameDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {ticket.amount && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <DollarIcon size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Valor apostado</p>
                    <p className="font-bold text-foreground text-lg">${ticket.amount.toLocaleString('es-CO')}</p>
                  </div>
                </div>
              )}
              {ticket.place && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <MapPinIcon size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">Lugar de compra</p>
                    <p className="font-semibold text-foreground">{ticket.place}</p>
                  </div>
                </div>
              )}
            </div>

            {ticket.notes && (
              <div className="border-t border-border pt-6">
                <p className="text-sm font-semibold text-foreground mb-2">Notas</p>
                <p className="text-foreground">{ticket.notes}</p>
              </div>
            )}

            <div className="border-t border-border pt-4 text-sm text-muted-foreground space-y-1">
              <p>Creado: {new Date(ticket.createdAt).toLocaleString('es-ES')}</p>
              <p>Actualizado: {new Date(ticket.updatedAt).toLocaleString('es-ES')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
