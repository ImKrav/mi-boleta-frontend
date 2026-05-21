// components/tickets/ticket-filters.tsx

'use client';

import type { Ticket } from '@/types';
import { GAME_TYPES, TICKET_STATUSES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SearchIcon, FilterIcon } from '@/components/ui/icons';

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
    <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FilterIcon size={16} className="text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Filtros</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="search"
            type="text"
            placeholder="Buscar por nombre o número..."
            value={filters.q || ''}
            onChange={(e) => onFilterChange({ ...filters, q: e.target.value })}
            className="pl-10"
          />
        </div>

        <Select
          id="status-filter"
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: (e.target.value as Ticket['status']) || undefined })}
          options={[
            { value: '', label: 'Todos los estados' },
            ...TICKET_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />

        <Select
          id="type-filter"
          value={filters.gameType || ''}
          onChange={(e) => onFilterChange({ ...filters, gameType: (e.target.value as Ticket['gameType']) || undefined })}
          options={[
            { value: '', label: 'Todos los tipos' },
            ...GAME_TYPES.map((t) => ({ value: t, label: t })),
          ]}
        />
      </div>

      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={onReset}>
            <FilterIcon size={14} /> Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
