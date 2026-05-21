# Mi Boleta Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Desarrollar un frontend completo en Next.js 16 que consuma la API REST de Mi Boleta, con autenticación JWT, CRUD de tickets, dashboard y panel de administrador.

**Architecture:** Next.js App Router con Server/Client components separados. Servicios de API en capa `lib/` para consumo de REST. Estado de autenticación via Context API + localStorage. Componentes reutilizables en `components/`. Rutas protegidas con middleware.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Context API, Fetch API

---

## File Structure Map

```
app/
├── layout.tsx                          # Modify: Add AuthProvider, update metadata
├── page.tsx                            # Modify: Redirect to login/dashboard
├── globals.css                         # Modify: Add custom styles if needed
├── (auth)/
│   ├── layout.tsx                      # Create: Auth layout (centered, no nav)
│   ├── login/
│   │   └── page.tsx                    # Create: Login page
│   └── register/
│       └── page.tsx                    # Create: Register page
├── (dashboard)/
│   ├── layout.tsx                      # Create: Protected layout with navbar
│   ├── page.tsx                        # Create: Dashboard home
│   ├── tickets/
│   │   ├── page.tsx                    # Create: Ticket list page
│   │   ├── new/
│   │   │   └── page.tsx                # Create: Create ticket page
│   │   └── [id]/
│   │       ├── page.tsx                # Create: View/edit ticket page
│   │       └── edit/
│   │           └── page.tsx            # Create: Edit ticket page
│   └── admin/
│       └── page.tsx                    # Create: Admin panel (all tickets)
└── middleware.ts                        # Create: Route protection

lib/
├── api.ts                              # Create: API client with fetch wrapper
├── auth.ts                             # Create: Auth utilities
└── constants.ts                        # Create: App constants (enums, defaults)

components/
├── ui/
│   ├── button.tsx                      # Create: Reusable button
│   ├── input.tsx                       # Create: Form input
│   ├── select.tsx                      # Create: Select dropdown
│   ├── textarea.tsx                    # Create: Text area
│   ├── card.tsx                        # Create: Card container
│   ├── badge.tsx                       # Create: Status badge
│   ├── pagination.tsx                  # Create: Pagination controls
│   └── spinner.tsx                     # Create: Loading spinner
├── layout/
│   └── navbar.tsx                      # Create: Main navigation bar
├── auth/
│   ├── login-form.tsx                  # Create: Login form component
│   └── register-form.tsx               # Create: Register form component
├── tickets/
│   ├── ticket-card.tsx                 # Create: Ticket display card
│   ├── ticket-form.tsx                 # Create: Create/edit ticket form
│   ├── ticket-filters.tsx              # Create: Filter/search controls
│   └── ticket-list.tsx                 # Create: Paginated ticket list
└── admin/
    └── admin-ticket-table.tsx          # Create: Admin ticket table

providers/
└── auth-provider.tsx                   # Create: Auth context provider

types/
└── index.ts                            # Create: TypeScript types for API
```

---

## Task 1: Types and Constants

**Files:**
- Create: `types/index.ts`
- Create: `lib/constants.ts`

- [ ] **Step 1: Create TypeScript types for API entities**

```typescript
// types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  gameType: 'Lotería' | 'Rifa' | 'Sorteo' | 'Boleta' | 'Juego ocasional';
  gameNumber?: string;
  gameDate: string;
  amount?: number;
  place?: string;
  status: 'Pendiente' | 'Ganado' | 'Perdido';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTicket extends Ticket {
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type TicketFilters = {
  status?: Ticket['status'];
  gameType?: Ticket['gameType'];
  q?: string;
  page?: number;
  pageSize?: number;
};

export type AdminTicketFilters = TicketFilters & {
  userId?: string;
};
```

- [ ] **Step 2: Create app constants**

```typescript
// lib/constants.ts

export const GAME_TYPES = [
  'Lotería',
  'Rifa',
  'Sorteo',
  'Boleta',
  'Juego ocasional',
] as const;

export const TICKET_STATUSES = ['Pendiente', 'Ganado', 'Perdido'] as const;

export const DEFAULT_PAGE_SIZE = 20;
```

- [ ] **Step 3: Commit**

```bash
git add types/index.ts lib/constants.ts
git commit -m "feat: add TypeScript types and app constants"
```

---

## Task 2: API Client and Auth Utilities

**Files:**
- Create: `lib/api.ts`
- Create: `lib/auth.ts`

- [ ] **Step 1: Create API client with JWT handling**

Key notes from README "Notas para el frontend":
- Token goes in `Authorization: Bearer <token>`
- Token expires in 24h, redirect to login on 401
- `gameDate` is ISO 8601 format
- `amount` is a number (not string)
- Validation errors come as `"Datos inválidos: field: message; field: message"`

```typescript
// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mi-boleta-api-y9dv.onrender.com/api/v1';

import type { Ticket, AdminTicket, PaginatedResponse, TicketFilters, AdminTicketFilters, AuthResponse, User } from '@/types';

interface ApiOptions extends RequestInit {
  body?: unknown;
}

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  
  const config: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    throw new Error(errorData.error || `Error ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();
  return data.data ?? data;
}

// Auth endpoints
export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiFetch<{ user: User }>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    }),
  
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
};

// Ticket endpoints
export const ticketsApi = {
  list: (filters?: TicketFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.gameType) params.set('gameType', filters.gameType);
    if (filters?.q) params.set('q', filters.q);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.pageSize) params.set('pageSize', String(filters.pageSize));
    
    const query = params.toString();
    return apiFetch<PaginatedResponse<Ticket>>(
      `/tickets${query ? `?${query}` : ''}`
    );
  },
  
  getById: (id: string) =>
    apiFetch<Ticket>(`/tickets/${id}`),
  
  create: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiFetch<Ticket>('/tickets', {
      method: 'POST',
      body: ticket,
    }),
  
  update: (id: string, ticket: Partial<Ticket>) =>
    apiFetch<Ticket>(`/tickets/${id}`, {
      method: 'PUT',
      body: ticket,
    }),
  
  delete: (id: string) =>
    apiFetch<void>(`/tickets/${id}`, { method: 'DELETE' }),
};

// Admin endpoints
export const adminApi = {
  listAllTickets: (filters?: AdminTicketFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.gameType) params.set('gameType', filters.gameType);
    if (filters?.q) params.set('q', filters.q);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.pageSize) params.set('pageSize', String(filters.pageSize));
    if (filters?.userId) params.set('userId', filters.userId);
    
    const query = params.toString();
    return apiFetch<PaginatedResponse<AdminTicket>>(
      `/admin/tickets${query ? `?${query}` : ''}`
    );
  },
};
```

- [ ] **Step 2: Create auth utilities**

```typescript
// lib/auth.ts

import type { User } from '@/types';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === 'admin';
}

export function validateEmail(email: string): string | null {
  if (!email) return 'El email es requerido';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return 'El email no es válido';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value?.trim()) return `${fieldName} es requerido`;
  return null;
}

export function parseApiError(error: string): string[] {
  // API returns: "Datos inválidos: email: El email no es válido; password: ..."
  if (error.includes('Datos inválidos:')) {
    const parts = error.replace('Datos inválidos:', '').trim();
    return parts.split(';').map(p => p.trim()).filter(Boolean);
  }
  return [error];
}
```

- [ ] **Step 3: Update .env to use NEXT_PUBLIC prefix**

```env
NEXT_PUBLIC_API_URL=https://mi-boleta-api-y9dv.onrender.com/api/v1
```

- [ ] **Step 4: Commit**

```bash
git add lib/api.ts lib/auth.ts .env
git commit -m "feat: add API client and auth utilities"
```

---

## Task 3: Auth Provider and Middleware

**Files:**
- Create: `providers/auth-provider.tsx`
- Create: `app/middleware.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create Auth Context Provider**

```typescript
// providers/auth-provider.tsx

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { getUser, setAuth, clearAuth } from '@/lib/auth';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setAuth(response.token, response.user);
    setUser(response.user);
    router.push('/dashboard');
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authApi.register(name, email, password);
    // Auto-login after register
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

- [ ] **Step 2: Update root layout to include AuthProvider**

```typescript
// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mi Boleta - ¿Y si sí me lo gané?",
  description: "Administra tus boletas, rifas y sorteos en un solo lugar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create route middleware for protected routes**

```typescript
// app/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute && pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If has token and trying to access auth routes, redirect to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

- [ ] **Step 4: Commit**

```bash
git add providers/auth-provider.tsx app/middleware.ts app/layout.tsx
git commit -m "feat: add auth provider and route middleware"
```

---

## Task 4: UI Components

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/select.tsx`
- Create: `components/ui/textarea.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/spinner.tsx`
- Create: `components/ui/pagination.tsx`

- [ ] **Step 1: Create Button component**

```typescript
// components/ui/button.tsx

import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, disabled, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 font-medium rounded-lg
          transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

- [ ] **Step 2: Create Input component**

```typescript
// components/ui/input.tsx

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

- [ ] **Step 3: Create Select component**

```typescript
// components/ui/select.tsx

import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
```

- [ ] **Step 4: Create Textarea component**

```typescript
// components/ui/textarea.tsx

import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm resize-y
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
```

- [ ] **Step 5: Create Card, Badge, Spinner components**

```typescript
// components/ui/card.tsx

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}

// components/ui/badge.tsx

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

// components/ui/spinner.tsx

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className="flex justify-center items-center">
      <svg className={`animate-spin text-blue-600 ${sizes[size]}`} viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 6: Create Pagination component**

```typescript
// components/ui/pagination.tsx

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Anterior
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded border ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Siguiente
      </button>
    </nav>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add components/ui/
git commit -m "feat: add reusable UI components"
```

---

## Task 5: Auth Pages (Login/Register)

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Create: `components/auth/login-form.tsx`
- Create: `components/auth/register-form.tsx`

- [ ] **Step 1: Create auth layout**

```typescript
// app/(auth)/layout.tsx

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Login form component**

```typescript
// components/auth/login-form.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { validateEmail, validatePassword, parseApiError } from '@/lib/auth';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string[] }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
      setErrors({ email: emailError || undefined, password: passwordError || undefined });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setErrors({ general: parseApiError(message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
        <p className="text-gray-600 mt-1">¿Y si sí me lo gané?</p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.general.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="tu@email.com"
          autoComplete="email"
        />
        
        <Input
          id="password"
          type="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <Button type="submit" loading={loading} className="w-full">
          Iniciar Sesión
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <a href="/register" className="text-blue-600 hover:underline">
          Regístrate aquí
        </a>
      </p>
    </Card>
  );
}
```

- [ ] **Step 3: Create Login page**

```typescript
// app/(auth)/login/page.tsx

import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return <LoginForm />;
}
```

- [ ] **Step 4: Create Register form component**

```typescript
// components/auth/register-form.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { validateEmail, validatePassword, validateRequired, parseApiError } from '@/lib/auth';

export function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string[] }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameError = validateRequired(name, 'El nombre');
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (nameError || emailError || passwordError) {
      setErrors({
        name: nameError || undefined,
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await register(name, email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar';
      const parsed = parseApiError(message);
      setErrors({ general: parsed.some(p => p.toLowerCase().includes('email')) ? ['Este email ya está registrado'] : parsed });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
        <p className="text-gray-600 mt-1">Administra tus boletas y sorteos</p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.general.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          type="text"
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="Juan Pérez"
          autoComplete="name"
        />
        
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="tu@email.com"
          autoComplete="email"
        />
        
        <Input
          id="password"
          type="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading} className="w-full">
          Registrarse
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Inicia sesión
        </a>
      </p>
    </Card>
  );
}
```

- [ ] **Step 5: Create Register page**

```typescript
// app/(auth)/register/page.tsx

import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return <RegisterForm />;
}
```

- [ ] **Step 6: Update home page to redirect**

```typescript
// app/page.tsx

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  
  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add app/\(auth\)/ components/auth/ app/page.tsx
git commit -m "feat: add login and register pages with forms"
```

---

## Task 6: Layout and Navigation

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `components/layout/navbar.tsx`

- [ ] **Step 1: Create Navbar component**

```typescript
// components/layout/navbar.tsx

'use client';

import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              Mi Boleta
            </Link>
            
            <div className="hidden sm:flex gap-4">
              <Link
                href="/dashboard/tickets"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Mis Boletas
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/dashboard/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
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
```

- [ ] **Step 2: Create dashboard layout**

```typescript
// app/(dashboard)/layout.tsx

import { Navbar } from '@/components/layout/navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/layout.tsx components/layout/navbar.tsx
git commit -m "feat: add dashboard layout and navigation"
```

---

## Task 7: Ticket Components

**Files:**
- Create: `components/tickets/ticket-card.tsx`
- Create: `components/tickets/ticket-form.tsx`
- Create: `components/tickets/ticket-filters.tsx`
- Create: `components/tickets/ticket-list.tsx`

- [ ] **Step 1: Create Ticket Card component**

```typescript
// components/tickets/ticket-card.tsx

import type { Ticket } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const statusColors = {
  Pendiente: 'warning' as const,
  Ganado: 'success' as const,
  Perdido: 'danger' as const,
};

interface TicketCardProps {
  ticket: Ticket;
  onDelete?: (id: string) => void;
}

export function TicketCard({ ticket, onDelete }: TicketCardProps) {
  const gameDate = new Date(ticket.gameDate);
  const isPast = gameDate < new Date();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
            <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Tipo:</span> {ticket.gameType}
            </p>
            {ticket.gameNumber && (
              <p>
                <span className="font-medium">Número:</span> {ticket.gameNumber}
              </p>
            )}
            <p>
              <span className="font-medium">Fecha:</span>{' '}
              {gameDate.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {isPast && ticket.status === 'Pendiente' && (
                <span className="ml-2 text-red-600">(Vencido)</span>
              )}
            </p>
            {ticket.place && (
              <p>
                <span className="font-medium">Lugar:</span> {ticket.place}
              </p>
            )}
            {ticket.amount && (
              <p>
                <span className="font-medium">Valor:</span> ${ticket.amount.toLocaleString('es-CO')}
              </p>
            )}
          </div>

          {ticket.notes && (
            <p className="mt-3 text-sm text-gray-500 italic line-clamp-2">
              {ticket.notes}
            </p>
          )}
        </div>

        <div className="flex sm:flex-col gap-2">
          <Link
            href={`/dashboard/tickets/${ticket.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ver
          </Link>
          <Link
            href={`/dashboard/tickets/${ticket.id}/edit`}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Editar
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(ticket.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Create Ticket Filters component**

```typescript
// components/tickets/ticket-filters.tsx

'use client';

import type { Ticket } from '@/types';
import { GAME_TYPES, TICKET_STATUSES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface TicketFiltersProps {
  filters: {
    status?: Ticket['status'];
    gameType?: Ticket['gameType'];
    q?: string;
  };
  onFilterChange: (filters: { status?: Ticket['status']; gameType?: Ticket['gameType']; q?: string }) => void;
  onReset: () => void;
}

export function TicketFilters({ filters, onFilterChange, onReset }: TicketFiltersProps) {
  const hasFilters = filters.status || filters.gameType || filters.q;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          id="search"
          type="text"
          placeholder="Buscar por nombre o número..."
          value={filters.q || ''}
          onChange={(e) => onFilterChange({ ...filters, q: e.target.value })}
        />
        
        <Select
          id="status-filter"
          label=""
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: (e.target.value as Ticket['status']) || undefined })}
          options={[
            { value: '', label: 'Todos los estados' },
            ...TICKET_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
        
        <Select
          id="type-filter"
          label=""
          value={filters.gameType || ''}
          onChange={(e) => onFilterChange({ ...filters, gameType: (e.target.value as Ticket['gameType']) || undefined })}
          options={[
            { value: '', label: 'Todos los tipos' },
            ...GAME_TYPES.map((t) => ({ value: t, label: t })),
          ]}
        />
      </div>

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create Ticket List component**

```typescript
// components/tickets/ticket-list.tsx

'use client';

import { useState, useEffect } from 'react';
import type { Ticket, TicketFilters } from '@/types';
import { ticketsApi } from '@/lib/api';
import { TicketCard } from './ticket-card';
import { TicketFilters as FiltersComponent } from './ticket-filters';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [filters, setFilters] = useState<TicketFilters>({});

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const response = await ticketsApi.list({ ...filters, page });
      setTickets(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta boleta?')) return;
    
    try {
      await ticketsApi.delete(id);
      setTickets(tickets.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error deleting ticket:', err);
      alert('Error al eliminar la boleta');
    }
  };

  const handleReset = () => {
    setFilters({});
  };

  if (loading && tickets.length === 0) {
    return <Spinner size="lg" />;
  }

  return (
    <div>
      <FiltersComponent filters={filters} onFilterChange={setFilters} onReset={handleReset} />

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay boletas registradas</p>
          <a href="/dashboard/tickets/new" className="text-blue-600 hover:underline mt-2 inline-block">
            Crear tu primera boleta
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onDelete={handleDelete} />
            ))}
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(page) => fetchTickets(page)}
            />
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create Ticket Form component**

```typescript
// components/tickets/ticket-form.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Ticket } from '@/types';
import { GAME_TYPES, TICKET_STATUSES } from '@/lib/constants';
import { ticketsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { validateRequired, parseApiError } from '@/lib/auth';

interface TicketFormProps {
  ticket?: Ticket;
  mode: 'create' | 'edit';
}

export function TicketForm({ ticket, mode }: TicketFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    title: ticket?.title || '',
    gameType: ticket?.gameType || '' as Ticket['gameType'],
    gameNumber: ticket?.gameNumber || '',
    gameDate: ticket?.gameDate ? ticket.gameDate.split('T')[0] : '',
    amount: ticket?.amount?.toString() || '',
    place: ticket?.place || '',
    status: ticket?.status || 'Pendiente' as Ticket['status'],
    notes: ticket?.notes || '',
  });

  const validate = () => {
    const newErrors: Record<string, string[]> = {};
    
    const titleError = validateRequired(formData.title, 'El nombre del sorteo');
    if (titleError) newErrors.title = [titleError];

    if (!formData.gameType) newErrors.gameType = ['El tipo de juego es requerido'];
    if (!formData.gameDate) newErrors.gameDate = ['La fecha del sorteo es requerida'];
    if (!formData.status) newErrors.status = ['El estado es requerido'];

    const date = new Date(formData.gameDate);
    if (isNaN(date.getTime())) newErrors.gameDate = ['La fecha no es válida'];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const data: Record<string, unknown> = {
        title: formData.title,
        gameType: formData.gameType,
        gameDate: new Date(formData.gameDate).toISOString(),
        status: formData.status,
      };

      if (formData.gameNumber) data.gameNumber = formData.gameNumber;
      if (formData.amount) data.amount = parseFloat(formData.amount);
      if (formData.place) data.place = formData.place;
      if (formData.notes) data.notes = formData.notes;

      if (mode === 'create') {
        await ticketsApi.create(data as Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>);
      } else if (ticket) {
        await ticketsApi.update(ticket.id, data);
      }

      router.push('/dashboard/tickets');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      setErrors({ general: parseApiError(message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">
        {mode === 'create' ? 'Nueva Boleta' : 'Editar Boleta'}
      </h2>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.general.map((err, i) => <p key={i}>{err}</p>)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="title"
          label="Nombre del sorteo"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title?.[0]}
          placeholder="Lotería de Medellín"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="gameType"
            label="Tipo de juego"
            value={formData.gameType}
            onChange={(e) => setFormData({ ...formData, gameType: e.target.value as Ticket['gameType'] })}
            error={errors.gameType?.[0]}
            options={[
              { value: '', label: 'Seleccionar...' },
              ...GAME_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />

          <Input
            id="gameNumber"
            label="Número jugado (opcional)"
            value={formData.gameNumber}
            onChange={(e) => setFormData({ ...formData, gameNumber: e.target.value })}
            placeholder="1234"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="gameDate"
            type="date"
            label="Fecha del sorteo"
            value={formData.gameDate}
            onChange={(e) => setFormData({ ...formData, gameDate: e.target.value })}
            error={errors.gameDate?.[0]}
          />

          <Input
            id="amount"
            type="number"
            label="Valor apostado (opcional)"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="5000"
          />
        </div>

        <Input
          id="place"
          label="Lugar de compra (opcional)"
          value={formData.place}
          onChange={(e) => setFormData({ ...formData, place: e.target.value })}
          placeholder="Tienda La Esquina"
        />

        <Select
          id="status"
          label="Estado"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Ticket['status'] })}
          error={errors.status?.[0]}
          options={TICKET_STATUSES.map((s) => ({ value: s, label: s }))}
        />

        <Textarea
          id="notes"
          label="Notas adicionales (opcional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Soñé con el número la semana pasada..."
          rows={3}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Crear Boleta' : 'Guardar Cambios'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/tickets/
git commit -m "feat: add ticket components (card, form, filters, list)"
```

---

## Task 8: Dashboard and Ticket Pages

**Files:**
- Create: `app/(dashboard)/page.tsx`
- Create: `app/(dashboard)/tickets/page.tsx`
- Create: `app/(dashboard)/tickets/new/page.tsx`
- Create: `app/(dashboard)/tickets/[id]/page.tsx`
- Create: `app/(dashboard)/tickets/[id]/edit/page.tsx`

- [ ] **Step 1: Create Dashboard home page**

```typescript
// app/(dashboard)/page.tsx

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
```

- [ ] **Step 2: Create Tickets list page**

```typescript
// app/(dashboard)/tickets/page.tsx

import { TicketList } from '@/components/tickets/ticket-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TicketsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Boletas</h1>
        <Link href="/dashboard/tickets/new">
          <Button>Nueva Boleta</Button>
        </Link>
      </div>
      <TicketList />
    </div>
  );
}
```

- [ ] **Step 3: Create New ticket page**

```typescript
// app/(dashboard)/tickets/new/page.tsx

import { TicketForm } from '@/components/tickets/ticket-form';

export default function NewTicketPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Boleta</h1>
      <TicketForm mode="create" />
    </div>
  );
}
```

- [ ] **Step 4: Create View ticket page**

```typescript
// app/(dashboard)/tickets/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Ticket } from '@/types';
import { ticketsApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

const statusColors = {
  Pendiente: 'warning' as const,
  Ganado: 'success' as const,
  Perdido: 'danger' as const,
};

export default function ViewTicketPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await ticketsApi.getById(params.id as string);
        setTicket(data);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        router.push('/dashboard/tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params.id, router]);

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!ticket) {
    return <p className="text-center text-gray-500">Boleta no encontrada</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
        <div className="flex gap-2">
          <Link href={`/dashboard/tickets/${ticket.id}/edit`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Button variant="ghost" onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
            <span className="text-sm text-gray-600">{ticket.gameType}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ticket.gameNumber && (
              <div>
                <p className="text-sm text-gray-600">Número</p>
                <p className="font-medium">{ticket.gameNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Fecha del sorteo</p>
              <p className="font-medium">
                {new Date(ticket.gameDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {ticket.amount && (
              <div>
                <p className="text-sm text-gray-600">Valor apostado</p>
                <p className="font-medium">${ticket.amount.toLocaleString('es-CO')}</p>
              </div>
            )}
            {ticket.place && (
              <div>
                <p className="text-sm text-gray-600">Lugar de compra</p>
                <p className="font-medium">{ticket.place}</p>
              </div>
            )}
          </div>

          {ticket.notes && (
            <div>
              <p className="text-sm text-gray-600">Notas</p>
              <p className="mt-1 text-gray-700">{ticket.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t text-sm text-gray-500">
            <p>Creado: {new Date(ticket.createdAt).toLocaleString('es-ES')}</p>
            <p>Actualizado: {new Date(ticket.updatedAt).toLocaleString('es-ES')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: Create Edit ticket page**

```typescript
// app/(dashboard)/tickets/[id]/edit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Ticket } from '@/types';
import { ticketsApi } from '@/lib/api';
import { TicketForm } from '@/components/tickets/ticket-form';
import { Spinner } from '@/components/ui/spinner';

export default function EditTicketPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await ticketsApi.getById(params.id as string);
        setTicket(data);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        router.push('/dashboard/tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params.id, router]);

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!ticket) {
    return <p className="text-center text-gray-500">Boleta no encontrada</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Boleta</h1>
      <TicketForm ticket={ticket} mode="edit" />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add app/\(dashboard\)/page.tsx app/\(dashboard\)/tickets/
git commit -m "feat: add dashboard and ticket pages"
```

---

## Task 9: Admin Panel

**Files:**
- Create: `app/(dashboard)/admin/page.tsx`
- Create: `components/admin/admin-ticket-table.tsx`

- [ ] **Step 1: Create Admin Ticket Table component**

```typescript
// components/admin/admin-ticket-table.tsx

'use client';

import { useState, useEffect } from 'react';
import type { AdminTicket, AdminTicketFilters } from '@/types';
import { adminApi } from '@/lib/api';
import { GAME_TYPES, TICKET_STATUSES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';

const statusColors = {
  Pendiente: 'warning' as const,
  Ganado: 'success' as const,
  Perdido: 'danger' as const,
};

export function AdminTicketTable() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [filters, setFilters] = useState<AdminTicketFilters>({});

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminApi.listAllTickets({ ...filters, page });
      setTickets(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Error fetching admin tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [filters]);

  const handleReset = () => {
    setFilters({});
  };

  const hasFilters = filters.status || filters.gameType || filters.q || filters.userId;

  return (
    <div>
      <Card className="mb-6">
        <h3 className="text-sm font-medium mb-3">Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input
            id="admin-search"
            type="text"
            placeholder="Buscar..."
            value={filters.q || ''}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          
          <Select
            id="admin-status"
            label=""
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: (e.target.value as AdminTicket['status']) || undefined })}
            options={[
              { value: '', label: 'Todos los estados' },
              ...TICKET_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
          
          <Select
            id="admin-type"
            label=""
            value={filters.gameType || ''}
            onChange={(e) => setFilters({ ...filters, gameType: (e.target.value as AdminTicket['gameType']) || undefined })}
            options={[
              { value: '', label: 'Todos los tipos' },
              ...GAME_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />

          <Input
            id="admin-userId"
            type="text"
            placeholder="Filtrar por User ID..."
            value={filters.userId || ''}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          />
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </Card>

      {loading && tickets.length === 0 ? (
        <Spinner size="lg" />
      ) : tickets.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No se encontraron boletas</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boleta</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propietario</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ticket.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ticket.gameType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ticket.gameNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(ticket.gameDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">{ticket.owner.name}</p>
                          <p className="text-gray-500">{ticket.owner.email}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(page) => fetchTickets(page)}
            />
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Admin page**

```typescript
// app/(dashboard)/admin/page.tsx

'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminTicketTable } from '@/components/admin/admin-ticket-table';

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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de Administrador</h1>
      <AdminTicketTable />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/admin/ components/admin/
git commit -m "feat: add admin panel with ticket table and filters"
```

---

## Task 10: Final Polish and Testing

**Files:**
- Modify: `app/globals.css` (if needed)

- [ ] **Step 1: Update global styles**

```css
/* app/globals.css */

@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

/* Add line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- [ ] **Step 2: Run lint and build**

```bash
npm run lint
npm run build
```

- [ ] **Step 3: Fix any linting/type errors**

Address any issues reported by the linter and TypeScript compiler.

- [ ] **Step 4: Test the application manually**

```bash
npm run dev
```

Test the following flows:
1. Register a new user → should redirect to dashboard
2. Login → should redirect to dashboard
3. Create a ticket → should appear in list
4. Edit a ticket → changes should persist
5. Delete a ticket → should be removed from list
6. Filter tickets → filters should work
7. Pagination → should navigate pages
8. Logout → should redirect to login
9. Access protected route without token → should redirect to login
10. Test 401 handling → if token expires, should redirect to login

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete mi-boleta frontend implementation"
```

---

## Summary

This plan implements a complete Next.js frontend for the Mi Boleta API with:

1. **Authentication** - Login, register, JWT persistence in localStorage, protected routes via middleware, 401 auto-redirect
2. **Ticket CRUD** - Create, read, update, delete tickets with full validation
3. **Dashboard** - Stats overview (total, pending, upcoming), upcoming tickets list
4. **Admin Panel** - View all tickets from all users with filters (status, type, search, userId) and pagination
5. **Responsive Design** - Mobile-first with Tailwind CSS 4
6. **Error Handling** - 401 redirects, form validation, API error parsing (split by `;`), visual error display
7. **Clean Architecture** - Separated concerns: `lib/` (API/auth), `components/` (UI), `providers/` (context), `types/` (TypeScript types)

Key frontend notes from README addressed:
- Token stored in localStorage, sent as `Authorization: Bearer <token>`
- 24h token expiration with 401 redirect to login
- ISO 8601 dates for `gameDate`
- `amount` handled as number (parseFloat before sending)
- API validation errors parsed from `"Datos inválidos: field: msg; field: msg"` format
