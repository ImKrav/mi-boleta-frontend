// components/tickets/ticket-list.tsx

'use client';

import { useState, useEffect } from 'react';
import type { Ticket, TicketFilters } from '@/types';
import { ticketsApi } from '@/lib/api';
import { TicketCard } from './ticket-card';
import { TicketFilters as FiltersComponent } from './ticket-filters';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [filters, setFilters] = useState<TicketFilters>({});

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const response = await ticketsApi.list({ ...filters, page });
      setTickets(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta boleta?')) return;

    try {
      await ticketsApi.delete(id);
      setTickets(tickets.filter((t) => t.id !== id));
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

  return (
    <div>
      <FiltersComponent filters={filters} onFilterChange={setFilters} onReset={handleReset} />

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay boletas registradas</p>
          <a href="/dashboard/tickets/new" className="text-blue-600 hover:underline mt-2 inline-block">
            Crear tu primera boleta
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onDelete={handleDelete} />
            ))}
          </div>

          <div className="mt-6">
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
