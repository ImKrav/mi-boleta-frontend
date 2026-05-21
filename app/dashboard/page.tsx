'use client';

import { useState, useEffect } from 'react';
import { ticketsApi } from '@/lib/api';
import type { Ticket } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const statusColors = {
  Pendiente: 'warning' as const,
  Ganado: 'success' as const,
  Perdido: 'danger' as const,
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, upcoming: 0 });
  const [upcomingTickets, setUpcomingTickets] = useState<Ticket[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, pendingRes, recentRes] = await Promise.all([
          ticketsApi.list({ pageSize: 100 }),
          ticketsApi.list({ status: 'Pendiente', pageSize: 100 }),
          ticketsApi.list({ pageSize: 5 }),
        ]);

        const now = new Date();
        const upcoming = allRes.data.filter((t) => new Date(t.gameDate) > now && t.status === 'Pendiente');

        setStats({
          total: allRes.meta.total,
          pending: pendingRes.meta.total,
          upcoming: upcoming.length,
        });

        setUpcomingTickets(upcoming.slice(0, 5));
        setRecentTickets(recentRes.data);
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <Link href="/dashboard/tickets/new">
          <Button>Nueva Boleta</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Boletas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximos Sorteos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">{stats.upcoming}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Próximos Sorteos</h2>
        {upcomingTickets.length === 0 ? (
          <p className="text-muted-foreground">No hay sorteos próximos</p>
        ) : (
          <div className="space-y-4">
            {upcomingTickets.map((ticket) => (
              <Card key={ticket.id}>
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(ticket.gameDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge variant="warning">{ticket.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Historial</h2>
          <Link href="/dashboard/tickets" className="text-sm text-primary hover:underline font-medium">
            Ver todas →
          </Link>
        </div>
        {recentTickets.length === 0 ? (
          <p className="text-muted-foreground">No hay boletas registradas</p>
        ) : (
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <Card key={ticket.id}>
                <Link href={`/dashboard/tickets/${ticket.id}`} className="block px-6 py-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(ticket.gameDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {ticket.gameNumber && (
                          <span className="ml-2">· Número: {ticket.gameNumber}</span>
                        )}
                      </p>
                    </div>
                    <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
