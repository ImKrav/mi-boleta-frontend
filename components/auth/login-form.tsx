'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
    <Card>
      <CardHeader className="text-center pt-10">
        <CardTitle className="text-2xl font-semibold text-primary">Mi Boleta</CardTitle>
        <p className="text-muted-foreground mt-2 text-sm">¿Y si sí me lo gané?</p>
      </CardHeader>

      <CardContent>
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {errors.general.map((err, i) => (
              <p key={i}>{err}</p>
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

          <Button type="submit" loading={loading} className="w-full">
            Iniciar Sesión
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pb-10">
        <p className="text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Regístrate aquí
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
