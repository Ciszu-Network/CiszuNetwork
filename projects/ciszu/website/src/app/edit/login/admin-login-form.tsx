'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm({ from }: { from: Promise<string> }) {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/edit/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Token incorrecto');
        setLoading(false);
        return;
      }
      const target = await from;
      router.push(target);
      router.refresh();
    } catch {
      setError('Error de conexión');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border-2 border-brand/50 bg-brand/5 rounded-xl p-8 space-y-4"
      >
        <h1 className="text-xl font-black uppercase tracking-tighter text-white text-center">
          Acceso administrador
        </h1>
        <p className="text-sm text-gray-400 text-center">
          Editor reservado. Introduce el token de acceso.
        </p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token de acceso"
          autoComplete="current-password"
          className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2 text-white focus:border-brand outline-none"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full rounded-lg bg-brand/20 border-2 border-brand/50 px-4 py-2 font-bold text-white hover:bg-brand/30 disabled:opacity-50"
        >
          {loading ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}