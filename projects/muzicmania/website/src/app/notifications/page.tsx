'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/templates/MainLayout';
import { Icon, useToast } from '@ciszu/ui';
import { supabase } from '@/config/supabase';
import { usePageTitle } from '@/lib/usePageTitle';

interface NotificationRow {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  status: string;
  created_at: string;
  sender?: { username: string; display_name: string; avatar_url: string | null } | null;
}

const FILTERS = [
  ['all', 'Todas'],
  ['achievement', 'Logros'],
  ['social', 'Social'],
  ['friend', 'Amistad'],
  ['commerce', 'Compras'],
  ['security', 'Seguridad'],
  ['system', 'Sistema'],
  ['support', 'Soporte'],
] as const;

async function apiFetch(input: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(input, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function dateLabel(value: string) {
  return new Date(value).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function NotificationsPage() {
  usePageTitle('NOTIFICATIONS');
  const { toast } = useToast();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100', kind });
      if (query.trim()) params.set('search', query.trim());
      const response = await apiFetch(`/api/notifications?${params}`);
      if (!response.ok) {
        setItems([]);
        return;
      }
      const data = await response.json();
      setItems(Array.isArray(data.notifications) ? data.notifications : []);
      setRequests(Array.isArray(data.friendRequests) ? data.friendRequests : []);
    } finally {
      setLoading(false);
    }
  }, [kind, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const markAll = async () => {
    await apiFetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
    setItems((rows) => rows.map((row) => ({ ...row, read_at: row.read_at ?? new Date().toISOString() })));
    toast('Notificaciones marcadas como leídas.', 'success');
  };

  const resolveFriend = async (request: FriendRequest, action: 'accept' | 'reject') => {
    const response = await apiFetch('/api/friends', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: request.id, action }) });
    if (response.ok) {
      setRequests((list) => list.filter((row) => row.id !== request.id));
      await load();
    } else {
      toast('No se pudo actualizar la solicitud.', 'error');
    }
  };

  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl space-y-6 px-4 pb-24 pt-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-neon-cyan">ACTIVIDAD DE LA CUENTA</p>
            <h1 className="font-header text-4xl font-black uppercase tracking-tighter text-white md:text-6xl">Notificaciones</h1>
          </div>
          <button type="button" onClick={() => void markAll()} className="rounded-xl border border-white/10 px-4 py-2 text-[8px] font-black uppercase tracking-widest text-white/50 hover:text-white">Marcar todo leído</button>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en tus notificaciones…" className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20" />
          <div className="mt-3 flex gap-1 overflow-x-auto scrollbar-hide">
            {FILTERS.map(([value, label]) => (
              <button key={value} type="button" onClick={() => setKind(value)} className={`shrink-0 rounded-lg px-3 py-2 text-[8px] font-black uppercase tracking-widest ${kind === value ? 'bg-neon-cyan text-black' : 'bg-white/5 text-white/35'}`}>{label}</button>
            ))}
          </div>
        </section>

        {requests.length > 0 && (kind === 'all' || kind === 'friend') && (
          <section className="space-y-2">
            <h2 className="text-[9px] font-black uppercase tracking-widest text-white/35">Solicitudes de amistad</h2>
            {requests.map((request) => (
              <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neon-pink/25 bg-neon-pink/[0.06] p-4">
                <div>
                  <p className="text-xs font-black text-white">{request.sender?.display_name || request.sender?.username || 'Un jugador'}</p>
                  <p className="mt-1 text-[9px] text-white/35">{dateLabel(request.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => void resolveFriend(request, 'accept')} className="rounded-lg bg-emerald-300 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-black">Aceptar</button>
                  <button type="button" onClick={() => void resolveFriend(request, 'reject')} className="rounded-lg border border-white/10 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-white/50">Rechazar</button>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="space-y-2">
          {loading ? (
            <p className="py-16 text-center text-[9px] uppercase tracking-widest text-white/25">Cargando actividad…</p>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-[9px] uppercase tracking-widest text-white/25">No hay notificaciones en este filtro.</p>
          ) : items.map((item) => (
            <Link key={item.id} href={item.href || '/profile'} className={`block rounded-2xl border p-4 transition-colors ${item.read_at ? 'border-white/5 bg-white/[0.02]' : 'border-neon-cyan/25 bg-neon-cyan/[0.06]'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30">{item.kind}</p>
                  <p className="mt-1 text-sm font-black text-white">{item.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/45">{item.body}</p>
                </div>
                <span className="shrink-0 text-[8px] text-white/25">{dateLabel(item.created_at)}</span>
              </div>
            </Link>
          ))}
        </section>

        <Link href="/profile" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/35 hover:text-neon-cyan"><Icon name="arrow-left" size={13} /> Volver al perfil</Link>
      </main>
    </MainLayout>
  );
}
