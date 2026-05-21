'use client';

import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-semibold text-primary">
              Mi Boleta
            </Link>
            
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard/tickets"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Mis Boletas
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/dashboard/admin"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
