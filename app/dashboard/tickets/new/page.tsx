import { TicketForm } from '@/components/tickets/ticket-form';

export default function NewTicketPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Nueva Boleta</h1>
      <TicketForm mode="create" />
    </div>
  );
}
