import { TicketForm } from '@/components/tickets/ticket-form';
import { PlusIcon } from '@/components/ui/icons';

export default function NewTicketPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <PlusIcon size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Boleta</h1>
          <p className="text-muted-foreground mt-0.5">Registra un nuevo sorteo o boleta</p>
        </div>
      </div>
      <TicketForm mode="create" />
    </div>
  );
}
