'use client';

import { useState, useEffect } from 'react';
import { ticketsApi } from '@/lib/api';
import type { Ticket } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TicketIcon, ClockIcon, CalendarIcon, TrophyIcon, PlusIcon } from '@/components/ui/icons';

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

        const history = recentRes.data.filter((t) => t.status !== 'Pendiente');
        setRecentTickets(history);
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Resumen de tus boletas y sorteos</p>
        </div>
        <Link href="/dashboard/tickets/new">
          <Button size="lg"><PlusIcon size={18} /> Nueva Boleta</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Boletas</CardTitle>
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <TicketIcon className="text-primary" size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Pendientes</CardTitle>
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <ClockIcon className="text-amber-600" size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Próximos Sorteos</CardTitle>
            <div className="p-2.5 bg-sky-50 rounded-xl">
              <CalendarIcon className="text-sky-600" size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-sky-600">{stats.upcoming}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-sky-50 rounded-lg">
            <CalendarIcon className="text-sky-600" size={18} />
          </div>
          <h2 className="text-lg font-bold text-foreground">Próximos Sorteos</h2>
        </div>
        {upcomingTickets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay sorteos próximos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingTickets.map((ticket) => (
              <Card key={ticket.id}>
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-semibold text-foreground">{ticket.title}</p>
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
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-lg">
              <TrophyIcon className="text-amber-600" size={18} />
            </div>
            <h2 className="text-lg font-bold text-foreground">Historial</h2>
          </div>
          <Link href="/dashboard/tickets" className="text-sm text-accent hover:text-accent/80 font-semibold transition-colors">
            Ver todas →
          </Link>
        </div>
        {recentTickets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay boletas registradas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <Card key={ticket.id}>
                <Link href={`/dashboard/tickets/${ticket.id}`} className="block px-6 py-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(ticket.gameDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {ticket.gameNumber && (
                          <span className="ml-2 font-mono">· #{ticket.gameNumber}</span>
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
