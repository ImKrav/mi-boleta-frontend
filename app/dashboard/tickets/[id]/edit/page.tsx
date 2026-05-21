'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Ticket } from '@/types';
import { ticketsApi } from '@/lib/api';
import { TicketForm } from '@/components/tickets/ticket-form';
import { Spinner } from '@/components/ui/spinner';
import { EditIcon } from '@/components/ui/icons';

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
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-secondary/10 rounded-xl">
          <EditIcon size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Boleta</h1>
          <p className="text-muted-foreground mt-0.5">Modifica los datos de tu boleta</p>
        </div>
      </div>
      <TicketForm ticket={ticket} mode="edit" />
    </div>
  );
}
