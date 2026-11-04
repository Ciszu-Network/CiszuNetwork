'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@ciszu/ui';
import { supabase } from '@/config/supabase';

type ChatScope = 'global' | 'dm';
interface SenderProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}
interface ChatMessage {
  id: number | string;
  scope: string;
  room_id: string | null;
  sender_id: string;
  recipient_id: string | null;
  content: string;
  created_at: string;
  sender: SenderProfile | null;
}
async function apiFetch(input: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(input, { ...init, headers: { ...(init.headers ?? {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
}

interface DmThread {
  user: SenderProfile;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

function timeLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
}

export default function SocialHub({ userId }: { userId: string | null }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'chat' | 'alerts'>('chat');
  const [scope, setScope] = useState<ChatScope>('global');
  const [dmUser, setDmUser] = useState<SenderProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threads, setThreads] = useState<DmThread[]>([]);
  const [unread, setUnread] = useState(0);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const conversationKey = scope === 'dm' && dmUser ? `dm:${dmUser.id}` : 'global';

  const loadThreads = useCallback(async () => {
    if (!userId) return;
    const response = await apiFetch('/api/chat?scope=threads', { cache: 'no-store' });
    if (!response.ok) return;
    const data = (await response.json()) as { threads?: DmThread[]; unread?: number };
    setThreads(Array.isArray(data.threads) ? data.threads : []);
    setUnread(Number(data.unread ?? 0));
  }, [userId]);

  const loadMessages = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const query = scope === 'dm' && dmUser ? `/api/chat?scope=dm&with=${encodeURIComponent(dmUser.id)}` : '/api/chat?scope=global';
      const response = await apiFetch(query, { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo cargar el chat.');
      const data = (await response.json()) as { messages?: ChatMessage[] };
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      if (scope === 'dm' && dmUser) {
        await apiFetch('/api/chat', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scope: 'dm', with: dmUser.id }) });

      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error de chat.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [dmUser, scope, userId]);

  useEffect(() => {
    if (!open || !userId) return;
    void loadThreads();
  }, [open, userId, loadThreads]);

  useEffect(() => {
    if (!open || !userId) return;
    void loadMessages();
  }, [open, userId, conversationKey, loadMessages]);

  useEffect(() => {
    if (!open || !userId) return;
    const channel = supabase
      .channel(`social-hub-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'muzicmania', table: 'chat_messages' }, async (payload: { new: ChatMessage }) => {
        const row = payload.new as ChatMessage;
        if (row.scope === 'dm' && row.recipient_id === userId) {
          setUnread((value) => value + 1);
          void loadThreads();
        }
        const matches = (scope === 'global' && row.scope === 'global')
          || (scope === 'dm' && dmUser && row.scope === 'dm' && (
            (row.sender_id === userId && row.recipient_id === dmUser.id)
            || (row.sender_id === dmUser.id && row.recipient_id === userId)
          ));
        if (matches) {
          const withSender = await apiFetch(`/api/chat?scope=${row.scope === 'global' ? 'global' : `dm&with=${encodeURIComponent(dmUser?.id ?? '')}`}`, { cache: 'no-store' });
          if (withSender.ok) {
            const data = (await withSender.json()) as { messages?: ChatMessage[] };
            setMessages(Array.isArray(data.messages) ? data.messages : []);
          }
        }
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [dmUser, loadThreads, open, scope, userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  if (!userId) return null;

  const activeProfile = dmUser;

  const send = async () => {
    const content = draft.trim();
    if (!content) return;
    setDraft('');
    const response = await apiFetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: scope === 'dm' ? 'dm' : 'global', content, ...(scope === 'dm' && dmUser ? { to: dmUser.id } : {}) }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? 'No se pudo enviar.');
      setDraft(content);
      return;
    }
    await loadMessages();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-all ${
          open ? 'border-neon-cyan bg-neon-cyan text-black' : 'border-white/20 bg-white/5 text-white hover:border-neon-cyan'
        }`}
        title="Mensajes y notificaciones"
        aria-label="Mensajes y notificaciones"
      >
        <Icon name="message-square" size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-neon-pink px-1 text-[8px] font-black text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed right-3 top-[72px] z-[1400] flex h-[min(72vh,36rem)] w-[min(94vw,24rem)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#07070d]/98 shadow-2xl backdrop-blur-2xl sm:right-4">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
            <div className="flex gap-1">
              <button type="button" onClick={() => setTab('chat')} className={`rounded-lg px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest ${tab === 'chat' ? 'bg-white/10 text-white' : 'text-white/35'}`}>Chat</button>
              <button type="button" onClick={() => setTab('alerts')} className={`relative rounded-lg px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest ${tab === 'alerts' ? 'bg-white/10 text-white' : 'text-white/35'}`}>
                Notificaciones
                {unread > 0 && <span className="ml-1 text-neon-pink">{unread}</span>}
              </button>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-white/40 hover:text-white" aria-label="Cerrar">✕</button>
          </div>

          {tab === 'alerts' ? (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/45">Sistema</p>
                <p className="mt-1 text-[11px] text-white/70">Sesión iniciada como {userId.slice(0, 8)}. Los mensajes directos no leídos aparecen aquí.</p>
              </div>
              {threads.length === 0 ? (
                <p className="py-8 text-center text-[10px] uppercase tracking-widest text-white/30">Sin notificaciones pendientes</p>
              ) : threads.map((thread) => (
                <button
                  type="button"
                  key={thread.user.id}
                  onClick={() => { setTab('chat'); setScope('dm'); setDmUser(thread.user); }}
                  className={`mb-1.5 flex w-full items-center gap-2 rounded-xl border p-2.5 text-left ${thread.unread > 0 ? 'border-neon-pink/30 bg-neon-pink/10' : 'border-white/5 bg-white/[0.02]'}`}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-[10px] font-black text-white/60">{thread.user.display_name?.charAt(0) ?? '?'}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-bold text-white">{thread.user.display_name || thread.user.username}</span>
                    <span className="block truncate text-[9px] text-white/40">{thread.lastMessage}</span>
                  </span>
                  {thread.unread > 0 && <span className="text-[9px] font-black text-neon-pink">{thread.unread}</span>}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="flex gap-1 border-b border-white/5 px-3 py-2">
                <button type="button" onClick={() => { setScope('global'); setDmUser(null); }} className={`rounded-lg px-2 py-1 text-[8px] font-black uppercase tracking-widest ${scope === 'global' ? 'bg-neon-cyan/15 text-neon-cyan' : 'text-white/35'}`}>Global</button>
                <select value={scope === 'dm' ? dmUser?.id ?? '' : ''} onChange={(event) => {
                  const thread = threads.find((item) => item.user.id === event.target.value);
                  if (thread) { setScope('dm'); setDmUser(thread.user); }
                  else { setScope('global'); setDmUser(null); }
                }} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[8px] font-bold text-white/70 outline-none">
                  <option value="">Mensaje directo…</option>
                  {threads.map((thread) => <option key={thread.user.id} value={thread.user.id}>{thread.user.display_name || thread.user.username}</option>)}
                </select>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                {loading ? <p className="py-8 text-center text-[9px] uppercase tracking-widest text-white/30">Cargando…</p> : messages.length === 0 ? (
                  <p className="py-8 text-center text-[10px] uppercase tracking-widest text-white/25">Sin mensajes. Rompe el hielo.</p>
                ) : messages.map((message) => {
                  const mine = message.sender_id === userId;
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${mine ? 'bg-neon-cyan/15 text-white' : 'bg-white/[0.06] text-white/85'}`}>
                        {!mine && <button type="button" onClick={() => { if (message.sender) { setScope('dm'); setDmUser(message.sender); } }} className="mb-0.5 text-left text-[8px] font-black uppercase tracking-widest text-neon-cyan/80 hover:text-neon-cyan">{message.sender?.display_name || message.sender?.username || 'Usuario'}</button>}
                        <p className="break-words text-[11px] leading-relaxed">{message.content}</p>
                        <p className="mt-1 text-right text-[7px] text-white/30">{timeLabel(message.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              {error && <p className="px-3 text-[9px] text-red-300">{error}</p>}
              <div className="border-t border-white/10 p-2.5">
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }}
                    maxLength={1000}
                    placeholder={activeProfile ? `Mensaje para ${activeProfile.display_name || activeProfile.username}` : 'Mensaje global…'}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[11px] text-white outline-none placeholder:text-white/25 focus:border-neon-cyan/50"
                  />
                  <button type="button" onClick={() => void send()} disabled={!draft.trim()} className="rounded-xl bg-neon-cyan px-3 py-2 text-[8px] font-black uppercase tracking-widest text-black disabled:opacity-40">Enviar</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
