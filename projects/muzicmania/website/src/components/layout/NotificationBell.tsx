'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@ciszu/ui';
import { supabase } from '@/config/supabase';

interface NotificationRow {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  metadata: Record<string, unknown>;
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

const KIND_LABEL: Record<string, string> = {
  all: 'Todas',
  achievement: 'Logros',
  social: 'Social',
  friend: 'Amistad',
  commerce: 'Compras',
  security: 'Seguridad',
  system: 'Sistema',
  support: 'Soporte',
};

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

function timeAgo(value: string) {
  const diff = Date.now() - Date.parse(value);
  if (!Number.isFinite(diff)) return '';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} d`;
}

function iconFor(kind: string) {
  if (kind === 'achievement') return 'trophy';
  if (kind === 'friend') return 'users';
  if (kind === 'security') return 'shield';
  if (kind === 'commerce') return 'credit-card';
  if (kind === 'support') return 'message-square';
  return 'bell';
}

export default function NotificationBell({ userId }: { userId: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [unread, setUnread] = useState(0);
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', kind });
      if (query.trim()) params.set('search', query.trim());
      const response = await apiFetch(`/api/notifications?${params}`);
      if (!response.ok) return;
      const data = await response.json();
      setItems(Array.isArray(data.notifications) ? data.notifications : []);
      setUnread(Number(data.unread ?? 0));
      setRequests(Array.isArray(data.friendRequests) ? data.friendRequests : []);
    } finally {
      setLoading(false);
    }
  }, [kind, query, userId]);

  useEffect(() => {
    if (!userId) return;
    void load();
    const timer = setInterval(() => void load(), 30_000);
    return () => clearInterval(timer);
  }, [load, userId]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!userId) return null;

  const markRead = async (ids?: string[]) => {
    await apiFetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids?.length ? { ids } : { all: true }),
    });
    setItems((rows) => rows.map((row) => ids?.includes(row.id) || !ids ? { ...row, read_at: new Date().toISOString() } : row));
    setUnread((value) => ids?.length ? Math.max(0, value - ids.length) : 0);
  };

  const openItem = async (item: NotificationRow) => {
    if (!item.read_at) await markRead([item.id]);
    if (item.href) router.push(item.href);
    setOpen(false);
  };

  const resolveFriend = async (request: FriendRequest, action: 'accept' | 'reject') => {
    const response = await apiFetch('/api/friends', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: request.id, action }),
    });
    if (response.ok) {
      setRequests((list) => list.filter((row) => row.id !== request.id));
      await load();
    }
  };

  const visibleRequests = kind === 'all' || kind === 'friend' ? requests : [];

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-all active:scale-95 ${open ? 'border-neon-cyan bg-neon-cyan text-black' : 'border-white/20 bg-white/5 text-white hover:border-neon-cyan'}`}
        title="Notificaciones"
        aria-label="Notificaciones"
      >
        <Icon name="bell" size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-neon-pink px-1 text-[8px] font-black text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed right-3 top-[72px] z-[1500] flex h-[min(76vh,42rem)] w-[min(94vw,28rem)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#07070d]/98 shadow-2xl backdrop-blur-2xl sm:right-4">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-neon-cyan">Actividad de la cuenta</p>
              <p className="mt-1 text-[10px] text-white/40">Últimas 50 notificaciones</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-white/40 hover:text-white" aria-label="Cerrar">✕</button>
          </div>

          <div className="border-b border-white/5 p-3">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en actividad…" className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[11px] text-white outline-none placeholder:text-white/20" />
            <div className="mt-2 flex gap-1 overflow-x-auto scrollbar-hide">
              {Object.entries(KIND_LABEL).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setKind(value)} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[7px] font-black uppercase tracking-widest ${kind === value ? 'bg-neon-cyan text-black' : 'bg-white/5 text-white/35'}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {visibleRequests.map((request) => (
              <div key={request.id} className="mb-2 rounded-2xl border border-neon-pink/25 bg-neon-pink/5 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Solicitud de amistad</p>
                <p className="mt-1 text-[11px] text-white/55">{request.sender?.display_name || request.sender?.username || 'Un jugador'} quiere conectar contigo.</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => void resolveFriend(request, 'accept')} className="rounded-lg bg-emerald-300 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-black">Aceptar</button>
                  <button type="button" onClick={() => void resolveFriend(request, 'reject')} className="rounded-lg border border-white/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-white/50">Rechazar</button>
                </div>
              </div>
            ))}
            {loading && items.length === 0 ? (
              <p className="py-10 text-center text-[9px] uppercase tracking-widest text-white/25">Cargando actividad…</p>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-[9px] uppercase tracking-widest text-white/25">Sin notificaciones en este filtro.</p>
            ) : items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void openItem(item)}
                className={`mb-1.5 flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${item.read_at ? 'border-white/5 bg-white/[0.02]' : 'border-neon-cyan/25 bg-neon-cyan/[0.06]'}`}
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60"><Icon name={iconFor(item.kind)} size={15} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wide text-white">{item.title}</span>
                    <span className="shrink-0 text-[8px] text-white/25">{timeAgo(item.created_at)}</span>
                  </span>
                  <span className="mt-1 block text-[10px] leading-relaxed text-white/45">{item.body}</span>
                </span>
                {!item.read_at && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-cyan" />}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/10 p-3">
            <button type="button" onClick={() => void markRead()} className="text-[8px] font-black uppercase tracking-widest text-white/35 hover:text-white">Marcar todo leído</button>
            <Link href="/notifications" onClick={() => setOpen(false)} className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-neon-cyan">Ver todas</Link>
          </div>
        </div>
      )}
    </div>
  );
}
