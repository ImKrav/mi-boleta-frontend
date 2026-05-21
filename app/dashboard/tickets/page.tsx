import { TicketList } from '@/components/tickets/ticket-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TicketsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Mis Boletas</h1>
        <Link href="/dashboard/tickets/new">
          <Button>Nueva Boleta</Button>
        </Link>
      </div>
      <TicketList />
    </div>
  );
}
