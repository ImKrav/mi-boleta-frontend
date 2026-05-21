// components/admin/admin-ticket-table.tsx

'use client';

import { useState, useEffect } from 'react';
import type { AdminTicket, AdminTicketFilters } from '@/types';
import { adminApi } from '@/lib/api';
import { GAME_TYPES, TICKET_STATUSES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';

const statusColors = {
  Pendiente: 'warning' as const,
  Ganado: 'success' as const,
  Perdido: 'danger' as const,
};

export function AdminTicketTable() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [filters, setFilters] = useState<AdminTicketFilters>({});
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.listAllTickets({ ...filters, page });
      setTickets(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las boletas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
    setMeta(prev => ({ ...prev, page: 1 }));
  }, [filters]);

  const handleReset = () => {
    setFilters({});
  };

  const hasFilters = filters.status || filters.gameType || filters.q || filters.userId;

  if (loading && tickets.length === 0) {
    return <Spinner size="lg" />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button type="button" onClick={() => fetchTickets(1)} className="text-blue-600 hover:underline mt-2">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-6">
        <h3 className="text-sm font-medium mb-3">Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input
            id="admin-search"
            type="text"
            placeholder="Buscar..."
            value={filters.q || ''}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          
          <Select
            id="admin-status"
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: (e.target.value as AdminTicket['status']) || undefined })}
            options={[
              { value: '', label: 'Todos los estados' },
              ...TICKET_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
          
          <Select
            id="admin-type"
            value={filters.gameType || ''}
            onChange={(e) => setFilters({ ...filters, gameType: (e.target.value as AdminTicket['gameType']) || undefined })}
            options={[
              { value: '', label: 'Todos los tipos' },
              ...GAME_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />

          <Input
            id="admin-userId"
            type="text"
            placeholder="Filtrar por User ID..."
            value={filters.userId || ''}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          />
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </Card>

      {tickets.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No se encontraron boletas</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boleta</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propietario</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ticket.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ticket.gameType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ticket.gameNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(ticket.gameDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">{ticket.owner.name}</p>
                          <p className="text-gray-500">{ticket.owner.email}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
