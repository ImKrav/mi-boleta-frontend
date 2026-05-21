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
  if (error.includes('Datos inválidos:')) {
    const parts = error.replace('Datos inválidos:', '').trim();
    return parts.split(';').map(p => p.trim()).filter(Boolean);
  }
  return [error];
}
