// components/admin/admin-ticket-table.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { SearchIcon, FilterIcon } from '@/components/ui/icons';

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

  const fetchTickets = useCallback(async (page = 1) => {
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
  }, [filters]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchTickets(1);
  }, [fetchTickets]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
        <p className="text-destructive font-medium">{error}</p>
        <button type="button" onClick={() => fetchTickets(1)} className="text-accent hover:text-accent/80 font-semibold mt-4 inline-block cursor-pointer transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <FilterIcon size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                id="admin-search"
                type="text"
                placeholder="Buscar..."
                value={filters.q || ''}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className="pl-10"
              />
            </div>
            
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
            <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <FilterIcon size={14} /> Limpiar filtros
                </Button>
            </div>
          )}
        </div>
      </Card>

      {tickets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron boletas</p>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Boleta</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Número</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Propietario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{ticket.title}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{ticket.gameType}</td>
                      <td className="px-6 py-4 text-sm font-mono text-foreground">{ticket.gameNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {new Date(ticket.gameDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-semibold text-foreground">{ticket.owner.name}</p>
                          <p className="text-muted-foreground">{ticket.owner.email}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="pt-2">
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
