'use client';

import { useState } from 'react';
import Link from 'next/link';
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

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </Card>
  );
}
