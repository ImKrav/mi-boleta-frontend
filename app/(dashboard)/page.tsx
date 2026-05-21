'use client';

import { useState, useEffect } from 'react';
import { ticketsApi } from '@/lib/api';
import type { Ticket } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, upcoming: 0 });
  const [upcomingTickets, setUpcomingTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, pendingRes] = await Promise.all([
          ticketsApi.list({ pageSize: 100 }),
          ticketsApi.list({ status: 'Pendiente', pageSize: 100 }),
        ]);

        const now = new Date();
        const upcoming = allRes.data.filter((t) => new Date(t.gameDate) > now && t.status === 'Pendiente');

        setStats({
          total: allRes.meta.total,
          pending: pendingRes.meta.total,
          upcoming: upcoming.length,
        });

        setUpcomingTickets(upcoming.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/dashboard/tickets/new">
          <Button>Nueva Boleta</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-sm text-gray-600">Total Boletas</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Próximos Sorteos</p>
          <p className="text-3xl font-bold text-blue-600">{stats.upcoming}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Próximos Sorteos</h2>
        {upcomingTickets.length === 0 ? (
          <p className="text-gray-500">No hay sorteos próximos</p>
        ) : (
          <div className="space-y-3">
            {upcomingTickets.map((ticket) => (
              <Card key={ticket.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{ticket.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(ticket.gameDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <Badge variant="warning">{ticket.status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
