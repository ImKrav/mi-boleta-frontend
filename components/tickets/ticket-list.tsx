// components/tickets/ticket-list.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Ticket, TicketFilters } from '@/types';
import { ticketsApi } from '@/lib/api';
import { TicketCard } from './ticket-card';
import { TicketFilters as FiltersComponent } from './ticket-filters';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [filters, setFilters] = useState<TicketFilters>({});

  const fetchTickets = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketsApi.list({ ...filters, page });
      setTickets(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las boletas');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchTickets(1);
  }, [fetchTickets]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta boleta?')) return;

    try {
      await ticketsApi.delete(id);
      setTickets(tickets.filter((t) => t.id !== id));
      setMeta(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error('Error deleting ticket:', err);
      alert('Error al eliminar la boleta');
    }
  };

  const handleReset = () => {
    setFilters({});
  };

  if (loading && tickets.length === 0) {
    return <Spinner size="lg" />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <button onClick={() => fetchTickets(1)} className="text-primary hover:underline mt-4 inline-block cursor-pointer">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FiltersComponent filters={filters} onFilterChange={setFilters} onReset={handleReset} />

      {tickets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No hay boletas registradas</p>
          <Link href="/dashboard/tickets/new" className="text-primary hover:underline mt-4 inline-block">
            Crear tu primera boleta
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onDelete={handleDelete} />
            ))}
          </div>

          <div className="pt-4">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(page) => fetchTickets(page)}
            />
          </div>
        </>
      )}
    </div>
  );
}
