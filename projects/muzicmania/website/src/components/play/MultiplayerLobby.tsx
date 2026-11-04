'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, useDebugMode } from '@ciszu/ui';
import { supabase } from '@/config/supabase';
import { TRACKS_DATA } from '@/data/tracks';
import type { CustomLevelDetail, CustomLevelSummary } from './LevelStudio';

async function apiFetch(input: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return globalThis.fetch(input, { ...init, headers: { ...(init.headers ?? {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
}

type Mode = '1v1' | 'duo' | 'trio';
type SongChoice =
  | { kind: 'static'; trackId: string; title: string; subtitle: string }
  | { kind: 'custom'; id: string; title: string; subtitle: string };

interface RoomPlayer {
  user_id: string;
  slot: number;
  team: number;
  ready: boolean;
  score: number;
  profile?: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
}

interface Room {
  id: string;
  code: string;
  host_id: string;
  mode: Mode;
  max_players: number;
  level_id: string | null;
  track_id: string | null;
  level_title: string | null;
  status: 'waiting' | 'playing' | 'finished';
  players: RoomPlayer[];
}

interface ChatMessage {
  id: number | string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: { username: string | null; display_name: string | null } | null;
  placeholder?: boolean;
}

const MODES: { id: Mode; label: string; players: number; hint: string }[] = [
  { id: '1v1', label: '1 VS 1', players: 2, hint: 'Duelo directo' },
  { id: 'duo', label: 'DUOS 2V2', players: 4, hint: 'Dos parejas' },
  { id: 'trio', label: 'TRÍOS 3V3', players: 6, hint: 'Dos equipos de tres' },
];

function songOf(room: Room): SongChoice | null {
  if (room.level_id) return { kind: 'custom', id: room.level_id, title: room.level_title ?? 'Nivel online', subtitle: 'Nivel de la comunidad' };
  if (room.track_id) {
    const track = TRACKS_DATA.find((item) => item.id === room.track_id);
    return track ? { kind: 'static', trackId: track.id, title: track.name, subtitle: track.artist } : null;
  }
  return null;
}

export default function MultiplayerLobby({
  userId,
  onPlay,
  onBack,
}: {
  userId: string | null;
  onPlay: (payload: { level?: CustomLevelDetail; trackId?: string }) => void;
  onBack: () => void;
}) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [mode, setMode] = useState<Mode>('1v1');
  const [songs, setSongs] = useState<SongChoice[]>([]);
  const [selected, setSelected] = useState<SongChoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [chatTab, setChatTab] = useState<'match' | 'global'>('match');
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([]);
  const startedRef = useRef<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const debug = useDebugMode();
  const placeholderMessages = useMemo<ChatMessage[]>(() => {
    if (!debug.features.placeholders) return [];
    const now = new Date().toISOString();
    return [
      { id: 'debug-chat-1', sender_id: 'debug-bot', content: 'Sala de prueba activa. Este mensaje solo lo ves con debug.', created_at: now, placeholder: true, sender: { username: 'ciszubot', display_name: 'CiszukoBot' } },
      { id: 'debug-chat-2', sender_id: 'debug-rival', content: '¿Listos para el duelo? GG.', created_at: now, placeholder: true, sender: { username: 'rival_bot', display_name: 'RivalBot' } },
    ];
  }, [debug.features.placeholders]);

  const loadRooms = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await apiFetch('/api/multiplayer/rooms', { cache: 'no-store' });
      if (!response.ok) return;
      const data = (await response.json()) as { rooms?: Room[] };
      setRooms(Array.isArray(data.rooms) ? data.rooms : []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadRoom = useCallback(async (id: string) => {
    const response = await apiFetch(`/api/multiplayer/rooms/${id}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = (await response.json()) as { room?: Room };
    return data.room ?? null;
  }, []);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    void loadRooms();
    const timer = window.setInterval(() => void loadRooms(), 4000);
    return () => window.clearInterval(timer);
  }, [userId, loadRooms]);

  useEffect(() => {
    if (!room) return;
    const timer = window.setInterval(async () => {
      const next = await loadRoom(room.id);
      if (next) setRoom(next);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [room?.id, loadRoom]);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    Promise.all([
      apiFetch('/api/levels?scope=public', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { levels: [] })).catch(() => ({ levels: [] })),
      apiFetch('/api/levels?scope=official', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { levels: {} })).catch(() => ({ levels: {} })),
    ]).then(([publicData, officialData]) => {
      if (!alive) return;
      const custom = ((publicData as { levels?: CustomLevelSummary[] }).levels ?? []).map((level) => ({
        kind: 'custom' as const,
        id: level.id,
        title: level.title,
        subtitle: `${level.difficulty} · ${level.bpm} BPM`,
      }));
      const official = Object.values((officialData as { levels?: Record<string, CustomLevelSummary> }).levels ?? {}).map((level) => ({
        kind: 'custom' as const,
        id: level.id,
        title: level.title,
        subtitle: `Oficial · ${level.difficulty}`,
      }));
      const staticSongs = TRACKS_DATA.map((track) => ({
        kind: 'static' as const,
        trackId: track.id,
        title: track.name,
        subtitle: `${track.artist} · ${track.difficulty}`,
      }));
      const unique = [...staticSongs, ...official, ...custom].filter((song, index, list) => list.findIndex((item) => (item.kind === 'custom' ? item.id : item.trackId) === (song.kind === 'custom' ? song.id : song.trackId)) === index);
      setSongs(unique);
      setSelected((current) => current ?? unique[0] ?? null);
    });
    return () => { alive = false; };
  }, [userId]);

  useEffect(() => {
    if (!room) { setMessages([]); return; }
    let alive = true;
    const load = () => apiFetch(`/api/chat?scope=room&room_id=${encodeURIComponent(room.id)}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : { messages: [] }))
      .then((data: { messages?: ChatMessage[] }) => { if (alive) setMessages(data.messages ?? []); })
      .catch(() => undefined);
    void load();
    const channel = supabase.channel(`room-chat-${room.id}`).on('postgres_changes', { event: 'INSERT', schema: 'muzicmania', table: 'chat_messages' }, (payload: { new: ChatMessage & { scope?: string; room_id?: string } }) => {
      if (payload.new.scope === 'room' && payload.new.room_id === room.id) void load();
    }).subscribe();
    return () => { alive = false; void supabase.removeChannel(channel); };
  }, [room?.id]);

  useEffect(() => {
    if (chatTab !== 'global') return;
    const load = () => apiFetch('/api/chat?scope=global', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : { messages: [] })).then((data: { messages?: ChatMessage[] }) => setGlobalMessages(data.messages ?? [])).catch(() => undefined);
    void load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, [chatTab]);

  useEffect(() => {
    if (!room || room.status !== 'playing' || startedRef.current === room.id) return;
    const song = songOf(room);
    if (!song) return;
    startedRef.current = room.id;
    if (song.kind === 'static') {
      onPlay({ trackId: song.trackId });
    } else {
      apiFetch(`/api/levels/${song.id}`, { cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { level?: CustomLevelDetail } | null) => { if (data?.level) onPlay({ level: data.level }); })
        .catch(() => undefined);
    }
  }, [onPlay, room?.id, room?.status]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, globalMessages.length, chatTab]);

  const createRoom = async () => {
    if (!userId) { setError('Inicia sesión para jugar online.'); return; }
    if (!selected) { setError('Selecciona una canción.'); return; }
    setBusy(true);
    setError('');
    try {
      const response = await apiFetch('/api/multiplayer/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          ...(selected.kind === 'static' ? { track_id: selected.trackId, level_title: selected.title } : { level_id: selected.id, level_title: selected.title }),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { room?: Room; error?: string; room_id?: string };
      if (!response.ok) {
        if (data.room_id) { const next = await loadRoom(data.room_id); if (next) setRoom(next); return; }
        throw new Error(data.error ?? 'No se pudo crear la sala.');
      }
      if (data.room) setRoom(data.room);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error al crear la sala.');
    } finally {
      setBusy(false);
    }
  };

  const action = async (body: Record<string, unknown>, target = room) => {
    if (!target) return;
    setBusy(true);
    setError('');
    try {
      const response = await apiFetch(`/api/multiplayer/rooms/${target.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => ({}))) as { room?: Room; error?: string; closed?: boolean };
      if (!response.ok) throw new Error(data.error ?? 'No se pudo actualizar la sala.');
      if (data.closed) { setRoom(null); await loadRooms(); return; }
      if (data.room) setRoom(data.room);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error de sala.');
    } finally {
      setBusy(false);
    }
  };

  const join = async (target: Room) => {
    await action({ action: 'join' }, target);
  };

  const sendChat = async () => {
    const content = draft.trim();
    if (!content || !room) return;
    setDraft('');
    const scope = chatTab;
    const response = await apiFetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: scope === 'global' ? 'global' : 'room', content, ...(scope === 'global' ? {} : { room_id: room.id }) }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? 'No se pudo enviar.');
      setDraft(content);
      return;
    }
    const load = scope === 'global'
      ? apiFetch('/api/chat?scope=global', { cache: 'no-store' }).then((r) => r.json()).then((data: { messages?: ChatMessage[] }) => setGlobalMessages(data.messages ?? []))
      : apiFetch(`/api/chat?scope=room&room_id=${room.id}`, { cache: 'no-store' }).then((r) => r.json()).then((data: { messages?: ChatMessage[] }) => setMessages(data.messages ?? []));
    await load;
  };

  const selectedSong = room ? songOf(room) : selected;
  const me = room?.players.find((player) => player.user_id === userId);
  const isHost = room?.host_id === userId;
  const allReady = Boolean(room && room.players.length === room.max_players && room.players.every((player) => player.ready));

  const modeLabel = useMemo(() => MODES.find((item) => item.id === room?.mode)?.label ?? '', [room?.mode]);

  if (!room) {
    return (
      <div className="w-full max-w-5xl">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white">
            <Icon name="chevronRight" size={13} className="rotate-180" /> Volver al menú
          </button>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[7px] font-black uppercase tracking-widest text-emerald-300">ONLINE</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <h2 className="font-header text-2xl font-black uppercase italic text-white">Multijugador online</h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/35">Crea una sala, elige canción y espera a que la sala se llene.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {MODES.map((item) => (
                  <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-xl border p-3 text-left transition ${mode === item.id ? 'border-neon-cyan/60 bg-neon-cyan/10' : 'border-white/10 bg-white/[0.02] hover:border-white/25'}`}>
                    <span className="block font-header text-sm font-black text-white">{item.label}</span>
                    <span className="mt-1 block text-[9px] font-bold uppercase tracking-widest text-white/35">{item.players} jugadores · {item.hint}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                <select value={selected ? (selected.kind === 'static' ? `static:${selected.trackId}` : `custom:${selected.id}`) : ''} onChange={(event) => {
                  const [kind, id] = event.target.value.split(':');
                  const choice = songs.find((song) => (kind === 'static' && song.kind === 'static' && song.trackId === id) || (kind === 'custom' && song.kind === 'custom' && song.id === id));
                  if (choice) setSelected(choice);
                }} className="min-w-0 rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white outline-none">
                  {songs.map((song) => <option key={song.kind === 'static' ? `s:${song.trackId}` : `c:${song.id}`} value={song.kind === 'static' ? `static:${song.trackId}` : `custom:${song.id}`}>{song.title} · {song.subtitle}</option>)}
                </select>
                <button type="button" disabled={busy || !userId || !selected} onClick={() => void createRoom()} className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-emerald-300 disabled:opacity-40">
                  Crear sala
                </button>
              </div>
              {error && <p className="mt-2 text-[10px] text-red-300">{error}</p>}
              {!userId && <p className="mt-2 text-[10px] text-amber-300">Inicia sesión para crear o unirte a salas.</p>}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="mb-2 flex items-center justify-between"><h3 className="text-[9px] font-black uppercase tracking-widest text-white/60">Salas abiertas</h3><button type="button" onClick={() => void loadRooms()} className="text-[8px] font-black uppercase tracking-widest text-neon-cyan">Actualizar</button></div>
              {loading ? <p className="py-6 text-center text-[9px] uppercase tracking-widest text-white/25">Cargando salas…</p> : rooms.length === 0 ? <p className="py-6 text-center text-[9px] uppercase tracking-widest text-white/25">No hay salas abiertas. Crea la primera.</p> : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {rooms.map((item) => (
                    <button key={item.id} type="button" onClick={() => void join(item)} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-neon-cyan/40">
                      <div className="flex items-center justify-between gap-2"><span className="font-header text-xs font-black text-white">{MODES.find((m) => m.id === item.mode)?.label}</span><span className="text-[8px] font-black text-neon-cyan">{item.players.length}/{item.max_players}</span></div>
                      <p className="mt-1 truncate text-[9px] text-white/40">{item.level_title ?? 'Canción pendiente'} · código {item.code}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-[10px] leading-relaxed text-white/40">
            <p className="mb-2 font-black uppercase tracking-widest text-white/60">Cómo funciona</p>
            1. Elige modo y canción.<br />2. Comparte el código de sala.<br />3. Todos marcan listo.<br />4. El host inicia cuando la sala esté completa.<br /><br />
            Los modos de equipo requieren la sala completa: 2 para 1v1, 4 para duos y 6 para tríos.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => void action({ action: 'leave' })} className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-red-300/70">
          <Icon name="chevronRight" size={13} className="rotate-180" /> Salir de la sala
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/50">Código {room.code}</span>
          <span className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-neon-cyan">{modeLabel}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Canción</p>
              <p className="font-header text-lg font-black text-white">{selectedSong?.title ?? 'Sin canción'}</p>
              <p className="text-[9px] text-white/35">{selectedSong?.subtitle ?? 'El host debe elegir una'}</p>
            </div>
            {isHost && room.status === 'waiting' && (
              <select value={selectedSong ? (selectedSong.kind === 'static' ? `static:${selectedSong.trackId}` : `custom:${selectedSong.id}`) : ''} onChange={(event) => {
                const [kind, id] = event.target.value.split(':');
                const choice = songs.find((song) => (kind === 'static' && song.kind === 'static' && song.trackId === id) || (kind === 'custom' && song.kind === 'custom' && song.id === id));
                if (!choice) return;
                void action({ action: 'level', ...(choice.kind === 'static' ? { track_id: choice.trackId } : { level_id: choice.id }), level_title: choice.title });
              }} className="max-w-[15rem] rounded-xl border border-white/10 bg-black/50 px-2 py-2 text-[9px] text-white outline-none">
                {songs.map((song) => <option key={song.kind === 'static' ? `s:${song.trackId}` : `c:${song.id}`} value={song.kind === 'static' ? `static:${song.trackId}` : `custom:${song.id}`}>{song.title}</option>)}
              </select>
            )}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {room.players.map((player) => (
              <div key={player.user_id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-[10px] font-black text-white/60">{player.profile?.display_name?.charAt(0) || player.profile?.username?.charAt(0) || '?'}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold text-white">{player.profile?.display_name || player.profile?.username || player.user_id.slice(0, 8)}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30">{room.mode === '1v1' ? (player.user_id === room.host_id ? 'HOST' : 'RIVAL') : `EQUIPO ${player.team + 1}`}{player.user_id === userId ? ' · TÚ' : ''}</p>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${player.ready ? 'text-emerald-300' : 'text-white/25'}`}>{player.ready ? 'LISTO' : 'ESPERA'}</span>
              </div>
            ))}
            {Array.from({ length: Math.max(0, room.max_players - room.players.length) }).map((_, index) => (
              <div key={`empty-${index}`} className="flex min-h-14 items-center justify-center rounded-xl border border-dashed border-white/10 text-[8px] font-black uppercase tracking-widest text-white/20">Esperando jugador</div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {me && room.status === 'waiting' && (
              <button type="button" disabled={busy} onClick={() => void action({ action: 'ready', ready: !me.ready })} className={`rounded-xl border px-4 py-2 text-[9px] font-black uppercase tracking-widest ${me.ready ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'}`}>
                {me.ready ? 'Quitar listo' : 'Estoy listo'}
              </button>
            )}
            {isHost && room.status === 'waiting' && (
              <button type="button" disabled={busy || !allReady} onClick={() => void action({ action: 'start' })} className="rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-neon-cyan disabled:opacity-35">
                Iniciar partida {allReady ? '' : `(${room.players.filter((p) => p.ready).length}/${room.max_players} listos)`}
              </button>
            )}
            {room.status === 'playing' && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300">Partida en curso…</span>}
          </div>
          {error && <p className="mt-2 text-[10px] text-red-300">{error}</p>}
        </div>

        <div className="flex min-h-[24rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <div className="flex gap-1 border-b border-white/10 p-2">
            <button type="button" onClick={() => setChatTab('match')} className={`rounded-lg px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest ${chatTab === 'match' ? 'bg-neon-cyan/15 text-neon-cyan' : 'text-white/35'}`}>Partida</button>
            <button type="button" onClick={() => setChatTab('global')} className={`rounded-lg px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest ${chatTab === 'global' ? 'bg-neon-cyan/15 text-neon-cyan' : 'text-white/35'}`}>Global</button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-2.5">
            {[...placeholderMessages, ...(chatTab === 'match' ? messages : globalMessages ?? [])].map((message) => {
              const mine = message.sender_id === userId;
              return <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[90%] rounded-xl px-2.5 py-1.5 text-[10px] ${mine ? 'bg-neon-cyan/15 text-white' : 'bg-white/[0.06] text-white/80'}`}>{!mine && <p className="text-[7px] font-black uppercase tracking-widest text-neon-cyan/70">{message.sender?.display_name || message.sender?.username || 'Jugador'}{message.placeholder && <span className="ml-1 text-[6px] text-amber-300">BOT</span>}</p>}<p className="break-words">{message.content}</p></div></div>;
            })}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-1.5 border-t border-white/10 p-2">
            <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void sendChat(); } }} maxLength={1000} placeholder="Mensaje…" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/50 px-2.5 py-2 text-[10px] text-white outline-none placeholder:text-white/25" />
            <button type="button" onClick={() => void sendChat()} disabled={!draft.trim()} className="rounded-lg bg-neon-cyan px-2.5 py-2 text-[8px] font-black uppercase tracking-widest text-black disabled:opacity-40">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
