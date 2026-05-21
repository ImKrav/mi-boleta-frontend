'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Ticket } from '@/types';
import { ticketsApi } from '@/lib/api';
import { TicketForm } from '@/components/tickets/ticket-form';
import { Spinner } from '@/components/ui/spinner';

export default function EditTicketPage() {
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
      <h1 className="text-2xl font-semibold text-foreground">Editar Boleta</h1>
      <TicketForm ticket={ticket} mode="edit" />
    </div>
  );
}
