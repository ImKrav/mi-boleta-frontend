// app/dashboard/admin/page.tsx

'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminTicketTable } from '@/components/admin/admin-ticket-table';
import { ShieldIcon } from '@/components/ui/icons';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <ShieldIcon size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel de Administrador</h1>
          <p className="text-muted-foreground mt-1">Gestión de todas las boletas del sistema</p>
        </div>
      </div>
      <AdminTicketTable />
    </div>
  );
}
