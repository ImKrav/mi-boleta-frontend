import { TicketList } from '@/components/tickets/ticket-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TicketIcon, PlusIcon } from '@/components/ui/icons';

export default function TicketsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <TicketIcon size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mis Boletas</h1>
            <p className="text-muted-foreground mt-0.5">Administra todas tus boletas</p>
          </div>
        </div>
        <Link href="/dashboard/tickets/new">
          <Button size="lg"><PlusIcon size={18} /> Nueva Boleta</Button>
        </Link>
      </div>
      <TicketList />
    </div>
  );
}
