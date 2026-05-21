'use client';

import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TicketIcon, ShieldIcon, UserIcon, LogoutIcon, ListIcon } from '@/components/ui/icons';

const navLinks = [
  { href: '/dashboard/tickets', label: 'Mis Boletas', icon: ListIcon },
  { href: '/dashboard/admin', label: 'Admin', icon: ShieldIcon, adminOnly: true },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 text-xl font-bold text-primary hover:opacity-80 transition-opacity">
              <TicketIcon size={24} className="text-primary" />
              <span className="font-heading">Mi Boleta</span>
            </Link>
            
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => {
                if (link.adminOnly && user?.role !== 'admin') return null;
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
              <UserIcon size={16} />
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogoutIcon size={16} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
