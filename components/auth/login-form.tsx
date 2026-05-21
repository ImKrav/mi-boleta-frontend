'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { validateEmail, validatePassword, parseApiError } from '@/lib/auth';
import { TicketIcon } from '@/components/ui/icons';

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
    <Card className="shadow-lg">
      <CardHeader className="text-center pt-10 pb-6">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <TicketIcon size={32} className="text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">Bienvenido</CardTitle>
        <CardDescription className="mt-2 text-base">¿Y si sí me lo gané?</CardDescription>
      </CardHeader>

      <CardContent>
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {errors.general.map((err, i) => (
              <p key={i} className="font-medium">{err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
            error={errors.email}
            placeholder="tu@email.com"
            autoComplete="email"
          />
          
          <Input
            id="password"
            type="password"
            label="Contraseña"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Iniciar Sesión
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pb-10">
        <p className="text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-accent hover:text-accent/80 font-semibold transition-colors">
            Regístrate aquí
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
