'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
    <Card>
      <CardHeader className="text-center pt-10">
        <CardTitle className="text-2xl font-semibold text-primary">Crear Cuenta</CardTitle>
        <p className="text-muted-foreground mt-2 text-sm">Administra tus boletas y sorteos</p>
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
            id="name"
            type="text"
            label="Nombre"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
            error={errors.name}
            placeholder="Juan Pérez"
            autoComplete="name"
          />
          
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
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="w-full">
            Registrarse
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pb-10">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
