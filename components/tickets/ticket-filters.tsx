// components/tickets/ticket-filters.tsx

'use client';

import type { Ticket } from '@/types';
import { GAME_TYPES, TICKET_STATUSES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface TicketFiltersProps {
  filters: {
    status?: Ticket['status'];
    gameType?: Ticket['gameType'];
    q?: string;
  };
  onFilterChange: (filters: { status?: Ticket['status']; gameType?: Ticket['gameType']; q?: string }) => void;
  onReset: () => void;
}

export function TicketFilters({ filters, onFilterChange, onReset }: TicketFiltersProps) {
  const hasFilters = filters.status || filters.gameType || filters.q;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          id="search"
          type="text"
          placeholder="Buscar por nombre o número..."
          value={filters.q || ''}
          onChange={(e) => onFilterChange({ ...filters, q: e.target.value })}
        />

        <Select
          id="status-filter"
          label=""
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: (e.target.value as Ticket['status']) || undefined })}
          options={[
            { value: '', label: 'Todos los estados' },
            ...TICKET_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />

        <Select
          id="type-filter"
          label=""
          value={filters.gameType || ''}
          onChange={(e) => onFilterChange({ ...filters, gameType: (e.target.value as Ticket['gameType']) || undefined })}
          options={[
            { value: '', label: 'Todos los tipos' },
            ...GAME_TYPES.map((t) => ({ value: t, label: t })),
          ]}
        />
      </div>

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
