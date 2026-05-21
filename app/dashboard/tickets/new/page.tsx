import { TicketForm } from '@/components/tickets/ticket-form';

export default function NewTicketPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Boleta</h1>
      <TicketForm mode="create" />
    </div>
  );
}
