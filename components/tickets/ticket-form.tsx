// components/tickets/ticket-form.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Ticket } from '@/types';
import { GAME_TYPES, TICKET_STATUSES } from '@/lib/constants';
import { ticketsApi } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { validateRequired, parseApiError } from '@/lib/auth';

interface TicketFormProps {
  ticket?: Ticket;
  mode: 'create' | 'edit';
}

export function TicketForm({ ticket, mode }: TicketFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    title: ticket?.title || '',
    gameType: ticket?.gameType || '' as Ticket['gameType'],
    gameNumber: ticket?.gameNumber || '',
    gameDate: ticket?.gameDate ? ticket.gameDate.split('T')[0] : '',
    amount: ticket?.amount?.toString() || '',
    place: ticket?.place || '',
    status: ticket?.status || 'Pendiente' as Ticket['status'],
    notes: ticket?.notes || '',
  });

  const validate = () => {
    const newErrors: Record<string, string[]> = {};

    const titleError = validateRequired(formData.title, 'El nombre del sorteo');
    if (titleError) newErrors.title = [titleError];

    if (!formData.gameType) newErrors.gameType = ['El tipo de juego es requerido'];
    if (!formData.gameDate) newErrors.gameDate = ['La fecha del sorteo es requerida'];
    if (!formData.status) newErrors.status = ['El estado es requerido'];
    if (formData.amount && parseFloat(formData.amount) <= 0) {
      newErrors.amount = ['El valor debe ser mayor a 0'];
    }

    const date = new Date(formData.gameDate);
    if (isNaN(date.getTime())) newErrors.gameDate = ['La fecha no es válida'];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const data: Record<string, unknown> = {
        title: formData.title,
        gameType: formData.gameType,
        gameDate: new Date(formData.gameDate).toISOString(),
        status: formData.status,
      };

      if (formData.gameNumber) data.gameNumber = formData.gameNumber;
      if (formData.amount) data.amount = parseFloat(formData.amount);
      if (formData.place) data.place = formData.place;
      if (formData.notes) data.notes = formData.notes;

      if (mode === 'create') {
        await ticketsApi.create(data as Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>);
      } else if (ticket) {
        await ticketsApi.update(ticket.id, data);
      }

      router.push('/dashboard/tickets');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      setErrors({ general: parseApiError(message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          {mode === 'create' ? 'Nueva Boleta' : 'Editar Boleta'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {errors.general.map((err, i) => <p key={i}>{err}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="title"
            label="Nombre del sorteo *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title?.[0]}
            placeholder="Lotería de Medellín"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select
              id="gameType"
              label="Tipo de juego *"
              value={formData.gameType}
              onChange={(e) => setFormData({ ...formData, gameType: e.target.value as Ticket['gameType'] })}
              error={errors.gameType?.[0]}
              options={[
                { value: '', label: 'Seleccionar...' },
                ...GAME_TYPES.map((t) => ({ value: t, label: t })),
              ]}
            />

            <Input
              id="gameNumber"
              label="Número jugado (opcional)"
              value={formData.gameNumber}
              onChange={(e) => setFormData({ ...formData, gameNumber: e.target.value })}
              placeholder="1234"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              id="gameDate"
              type="date"
              label="Fecha del sorteo *"
              value={formData.gameDate}
              onChange={(e) => setFormData({ ...formData, gameDate: e.target.value })}
              error={errors.gameDate?.[0]}
            />

            <Input
              id="amount"
              type="number"
              label="Valor apostado (opcional)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="5000"
            />
          </div>

          <Input
            id="place"
            label="Lugar de compra (opcional)"
            value={formData.place}
            onChange={(e) => setFormData({ ...formData, place: e.target.value })}
            placeholder="Tienda La Esquina"
          />

          {mode === 'edit' || user?.role === 'admin' ? (
            <Select
              id="status"
              label="Estado *"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Ticket['status'] })}
              error={errors.status?.[0]}
              options={TICKET_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          ) : (
            <input type="hidden" name="status" value="Pendiente" />
          )}

          <Textarea
            id="notes"
            label="Notas adicionales (opcional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Soñé con el número la semana pasada..."
            rows={3}
          />

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" loading={loading}>
              {mode === 'create' ? 'Crear Boleta' : 'Guardar Cambios'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
