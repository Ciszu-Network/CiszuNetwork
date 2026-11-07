'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon, useDebugMode, useToast } from '@ciszu/ui';
import { supabase } from '@/config/supabase';
import { TRACKS_DATA, type Track } from '@/data/tracks';
import { trackCover } from '@/utils/musicAssets';
import type { ChartNote, LevelDifficulty, NoteType } from '@/types/level';
import { donateToCreator } from '@/lib/economy/client';

export interface CustomLevelSummary {
  id: string;
  user_id: string;
  title: string;
  description: string;
  track_id: string;
  difficulty: LevelDifficulty;
  bpm: number;
  chart_offset: number;
  status: 'draft' | 'published';
  archived: boolean;
  plays: number;
  likes: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  official?: boolean;
  official_slot?: string | null;
}

export interface CustomLevelDetail extends CustomLevelSummary {
  chart: { formatVersion?: string; offset?: number; notes: ChartNote[] };
}

interface LevelStudioProps {
  userId: string | null;
  initialTab?: Tab;
  onPlay: (level: CustomLevelDetail) => void;
  onBack: () => void;
}

type Tab = 'mine' | 'explore' | 'official' | 'admin';
type EditorMode = 'tap' | 'hold' | 'mine';

const DIFFICULTIES: LevelDifficulty[] = ['Easy', 'Normal', 'Hard', 'Expert'];
const NOTE_TYPES: { value: EditorMode; label: string; hint: string }[] = [
  { value: 'tap', label: 'TAP', hint: 'Nota normal' },
  { value: 'hold', label: 'HOLD', hint: 'Mantener' },
  { value: 'mine', label: 'MINE', hint: 'Evitar' },
];

const STATUS_LABEL = { draft: 'BORRADOR', published: 'PUBLICADO' } as const;

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function authedFetch(input: string, init: RequestInit = {}) {
  const token = await getToken();
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string; issue?: string };
    return data.issue ?? data.error ?? 'Error';
  } catch {
    return 'Error';
  }
}

function trackOf(trackId: string): Track | undefined {
  return TRACKS_DATA.find((track) => track.id === trackId);
}

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function LevelStatus({ level }: { level: CustomLevelSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`rounded-full border px-2 py-0.5 text-[7px] font-black uppercase tracking-widest ${
        level.status === 'published'
          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
          : 'border-amber-400/35 bg-amber-400/10 text-amber-300'
      }`}>
        {STATUS_LABEL[level.status]}
      </span>
      {level.official && (
        <span className="rounded-full border border-neon-purple/30 bg-neon-purple/10 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-neon-purple">
          OFICIAL
        </span>
      )}
      {level.archived && (
        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-white/40">
          ARCHIVADO
        </span>
      )}
      <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-white/40">
        {level.difficulty}
      </span>
    </div>
  );
}

function TrackThumb({ trackId, size = 'h-12 w-12' }: { trackId: string; size?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`relative ${size} shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5`}>
      {!failed ? (
        <img
          src={trackCover(trackId)}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-white/25">
          <Icon name="music" size={18} />
        </span>
      )}
    </span>
  );
}

export default function LevelStudio({ userId, initialTab = 'mine', onPlay, onBack }: LevelStudioProps) {
  const { toast } = useToast();
  const debug = useDebugMode();
  const canOfficial = debug.features.officialEditor && Boolean(userId);
  const canAdmin = canOfficial && (debug.staff?.role === 'owner' || debug.staff?.role === 'admin');
  const [tab, setTab] = useState<Tab>(initialTab);
  const [isOfficial, setIsOfficial] = useState(false);

  const [levels, setLevels] = useState<CustomLevelSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | LevelDifficulty>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [likedLevels, setLikedLevels] = useState<Set<string>>(new Set());

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trackId, setTrackId] = useState(TRACKS_DATA[0]?.id ?? '');
  const [levelDifficulty, setLevelDifficulty] = useState<LevelDifficulty>('Normal');
  const [bpm, setBpm] = useState(120);
  const [chartOffset, setChartOffset] = useState(0);
  const [notes, setNotes] = useState<ChartNote[]>([]);
  const [mode, setMode] = useState<EditorMode>('tap');

  const selectedTrack = trackOf(trackId);
  const duration = selectedTrack?.duration_sec ?? 180;
  const stepSec = useMemo(() => 60 / Math.max(40, bpm) / 2, [bpm]);
  const steps = useMemo(() => Math.ceil(duration / stepSec), [duration, stepSec]);
  const noteMap = useMemo(() => {
    const map = new Map<string, ChartNote>();
    for (const note of notes) map.set(`${note.time.toFixed(3)}:${note.lane}`, note);
    return map;
  }, [notes]);

  const loadLevels = useCallback(async () => {
    if ((tab === 'mine' && !userId) || (tab === 'official' && !canOfficial) || (tab === 'admin' && !canAdmin)) {
      setLevels([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ scope: tab });
      if (tab === 'explore' && query.trim()) params.set('q', query.trim());
      if (difficulty !== 'all') params.set('difficulty', difficulty);
      if ((tab === 'mine' || tab === 'admin') && showArchived) params.set('archived', '1');
      const response = await (tab === 'mine' ? authedFetch(`/api/levels?${params}`) : fetch(`/api/levels?${params}`));
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as { levels?: CustomLevelSummary[] };
      setLevels(Array.isArray(data.levels) ? data.levels : []);
    } catch (cause) {
      setLevels([]);
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los niveles.');
    } finally {
      setLoading(false);
    }
  }, [tab, userId, canOfficial, canAdmin, query, difficulty, showArchived]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadLevels(); }, tab === 'explore' ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [loadLevels, tab]);

  const fetchDetail = useCallback(async (id: string) => {
    const response = await authedFetch(`/api/levels/${id}`);
    if (!response.ok) throw new Error(await readError(response));
    const data = (await response.json()) as { level?: CustomLevelDetail };
    if (!data.level) throw new Error('Nivel no encontrado.');
    return data.level;
  }, []);

  const openNew = () => {
    if (!userId) {
      toast('Inicia sesión para crear niveles.', 'error');
      return;
    }
    const track = TRACKS_DATA[0];
    setEditingId(null);
    setIsOfficial(false);
    setTitle('Mi nivel');
    setDescription('');
    setTrackId(track?.id ?? '');
    setLevelDifficulty(track?.difficulty ?? 'Normal');
    setBpm(track?.bpm ?? 120);
    setChartOffset(0);
    setNotes([]);
    setMode('tap');
    setEditorOpen(true);
  };

  const openNewOfficial = (track: Track) => {
    if (!canOfficial) return;
    setEditingId(null);
    setIsOfficial(true);
    setTitle(track.name);
    setDescription(`Nivel oficial de ${track.name}.`);
    setTrackId(track.id);
    setLevelDifficulty(track.difficulty);
    setBpm(track.bpm);
    setChartOffset(0);
    setNotes([]);
    setMode('tap');
    setEditorOpen(true);
  };

  const openEdit = async (id: string) => {
    setSaving(true);
    try {
      const level = await fetchDetail(id);
      setEditingId(level.id);
      setIsOfficial(Boolean(level.official));
      setTitle(level.title);
      setDescription(level.description ?? '');
      setTrackId(level.track_id);
      setLevelDifficulty(level.difficulty);
      setBpm(Number(level.bpm));
      setChartOffset(Number(level.chart_offset ?? 0));
      setNotes(Array.isArray(level.chart?.notes) ? level.chart.notes : []);
      setMode('tap');
      setEditorOpen(true);
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'No se pudo abrir el nivel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleNote = (time: number, lane: number) => {
    const key = `${time.toFixed(3)}:${lane}`;
    setNotes((current) => {
      if (current.some((note) => note.time.toFixed(3) === time.toFixed(3) && note.lane === lane)) {
        return current.filter((note) => !(note.time.toFixed(3) === time.toFixed(3) && note.lane === lane));
      }
      if (current.length >= 5000) return current;
      const note: ChartNote = {
        time: Math.round(time * 1000) / 1000,
        lane,
        type: mode as NoteType,
        ...(mode === 'hold' ? { endTime: Math.round((time + stepSec * 2) * 1000) / 1000 } : {}),
      };
      return [...current, note].sort((a, b) => a.time - b.time);
    });
    void key;
  };

  const saveLevel = async (publish: boolean) => {
    if (!userId) return;
    const publishNow = publish || isOfficial;
    if (!title.trim()) {
      toast('Ponle un título a tu nivel.', 'error');
      return;
    }
    if (publishNow && notes.length === 0) {
      toast('Añade al menos una nota antes de publicar.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(isOfficial ? { official: true, official_slot: trackId } : {}),
        title: title.trim(),
        description: description.trim(),
        track_id: trackId,
        difficulty: levelDifficulty,
        bpm: Number(bpm),
        chart_offset: Number(chartOffset),
        chart: { formatVersion: '1.0', offset: Number(chartOffset), notes },
      };
      let id = editingId;
      if (id) {
        const response = await authedFetch(`/api/levels/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, status: publishNow ? 'published' : 'draft' }),
        });
        if (!response.ok) throw new Error(await readError(response));
      } else {
        const response = await authedFetch('/api/levels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(await readError(response));
        const data = (await response.json()) as { id?: string };
        id = data.id ?? null;
        if (!id) throw new Error('No se pudo crear el nivel.');
        if (publishNow) {
          const publishResponse = await authedFetch(`/api/levels/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'published' }),
          });
          if (!publishResponse.ok) throw new Error(await readError(publishResponse));
        }
      }
      toast(publishNow ? 'Nivel publicado.' : 'Borrador guardado.', 'success');
      setEditorOpen(false);
      setEditingId(null);
      setIsOfficial(false);
      await loadLevels();
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'No se pudo guardar el nivel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const patchLevel = async (id: string, body: Record<string, unknown>, success: string) => {
    setSaving(true);
    try {
      const response = await authedFetch(`/api/levels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await readError(response));
      toast(success, 'success');
      await loadLevels();
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'No se pudo actualizar el nivel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteLevel = async (level: CustomLevelSummary) => {
    if (!window.confirm(`¿Eliminar "${level.title}"? Esta acción no se puede deshacer.`)) return;
    setSaving(true);
    try {
      const response = await authedFetch(`/api/levels/${level.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await readError(response));
      toast('Nivel eliminado.', 'success');
      await loadLevels();
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'No se pudo eliminar el nivel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const likeLevel = async (level: CustomLevelSummary) => {
    if (!userId) {
      toast('Inicia sesión para dar like y ganar recompensas.', 'error');
      return;
    }
    if (likedLevels.has(level.id)) return;
    try {
      const response = await authedFetch(`/api/levels/${level.id}/like`, { method: 'POST' });
      const data = (await response.json().catch(() => ({}))) as { likes?: number; error?: string };
      if (!response.ok) {
        toast(data.error === 'self_like' ? 'No puedes dar like a tu propio nivel.' : 'No se pudo registrar el like.', 'error');
        return;
      }
      setLevels((current) => current.map((row) => row.id === level.id ? { ...row, likes: Number(data.likes ?? row.likes) } : row));
      setLikedLevels((current) => new Set(current).add(level.id));
      toast('Like registrado. El creador recibió su recompensa.', 'success');
    } catch {
      toast('No se pudo registrar el like.', 'error');
    }
  };

  const donateLevel = async (level: CustomLevelSummary) => {
    if (!userId) {
      toast('Inicia sesión para apoyar al creador.', 'error');
      return;
    }
    const value = window.prompt('¿Cuántos MZP quieres donar?', '50');
    if (!value) return;
    const amount = Number(value);
    if (!Number.isInteger(amount) || amount < 1) {
      toast('Cantidad inválida.', 'error');
      return;
    }
    try {
      await donateToCreator(level.id, amount);
      toast(`Donaste ${amount} MZP al creador.`, 'success');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'donation_failed';
      toast(message === 'self_donation' ? 'No puedes donar a tu propio nivel.' : message === 'insufficient_points' ? 'No tienes MZP suficientes.' : 'No se pudo completar la donación.', 'error');
    }
  };

  const playLevel = async (level: CustomLevelSummary) => {
    setSaving(true);
    try {
      onPlay(await fetchDetail(level.id));
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'No se pudo cargar el nivel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (editorOpen) {
    return (
      <div className="w-full max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setEditorOpen(false)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <Icon name="chevronRight" size={13} className="rotate-180" /> Volver a mis niveles
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveLevel(false)}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-white/10 disabled:opacity-40"
            >
              Guardar borrador
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveLevel(true)}
              className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-40"
            >
              Publicar
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-4">
            {isOfficial && (
              <div className="rounded-xl border border-neon-purple/35 bg-neon-purple/10 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-neon-purple">
                Nivel oficial de MuzicMania · guardado verificado en DB
              </div>
            )}
            <div className="rounded-2xl border border-emerald-400/15 bg-black/40 p-4 backdrop-blur-xl">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-white/35">Título del nivel</span>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400/60" />
                </label>
                <label>
                  <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-white/35">Canción base</span>
                  <select
                    disabled={isOfficial}
                    value={trackId}
                    onChange={(event) => {
                      const next = trackOf(event.target.value);
                      setTrackId(event.target.value);
                      if (next) {
                        setBpm(next.bpm);
                        setLevelDifficulty(next.difficulty);
                      }
                    }}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-400/60"
                  >
                    {TRACKS_DATA.map((track) => <option key={track.id} value={track.id}>{track.name} · {track.artist}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-white/35">Dificultad</span>
                  <select value={levelDifficulty} onChange={(event) => setLevelDifficulty(event.target.value as LevelDifficulty)} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-400/60">
                    {DIFFICULTIES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-white/35">BPM</span>
                  <input type="number" min={40} max={400} value={bpm} onChange={(event) => setBpm(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-400/60" />
                </label>
                <label>
                  <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-white/35">Offset (s)</span>
                  <input type="number" min={-30} max={30} step={0.01} value={chartOffset} onChange={(event) => setChartOffset(Number(event.target.value))} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-400/60" />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-white/35">Descripción</span>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={600} rows={2} className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-400/60" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/35">Pincel</span>
                  {NOTE_TYPES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      title={item.hint}
                      onClick={() => setMode(item.value)}
                      className={`rounded-lg border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest transition ${mode === item.value ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300' : 'border-white/10 bg-white/5 text-white/45 hover:text-white'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/35">{notes.length} notas</span>
                  <button type="button" onClick={() => setNotes([])} className="rounded-lg border border-red-400/20 bg-red-400/5 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-red-300/70 hover:bg-red-400/10">Limpiar</button>
                </div>
              </div>
              <div className="max-h-[48vh] overflow-y-auto rounded-xl border border-white/5 bg-black/30">
                <div className="sticky top-0 z-10 grid grid-cols-[3.6rem_repeat(4,minmax(0,1fr))] border-b border-white/10 bg-[#08080d]/95 text-center text-[7px] font-black uppercase tracking-widest text-white/35">
                  <span className="py-1.5">Tiempo</span>
                  <span className="py-1.5 text-neon-cyan">←</span>
                  <span className="py-1.5 text-[#68cfff]">↓</span>
                  <span className="py-1.5 text-neon-purple">↑</span>
                  <span className="py-1.5 text-neon-pink">→</span>
                </div>
                {Array.from({ length: steps }, (_, index) => {
                  const time = index * stepSec;
                  const isBeat = index % 4 === 0;
                  return (
                    <div key={index} className={`grid grid-cols-[3.6rem_repeat(4,minmax(0,1fr))] border-b border-white/[0.03] ${isBeat ? 'bg-white/[0.02]' : ''}`}>
                      <span className="flex items-center px-2 text-[8px] font-bold tabular-nums text-white/30">
                        {isBeat ? `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}` : ''}
                      </span>
                      {[3, 1, 2, 0].map((lane) => {
                        const note = noteMap.get(`${time.toFixed(3)}:${lane}`);
                        return (
                          <button
                            key={lane}
                            type="button"
                            onClick={() => toggleNote(time, lane)}
                            aria-label={`${note ? 'Quitar' : 'Añadir'} nota en carril ${lane} a ${time.toFixed(2)}s`}
                            className={`m-0.5 h-6 rounded-md border transition ${
                              note
                                ? note.type === 'hold'
                                  ? 'border-amber-300/70 bg-amber-400/35'
                                  : note.type === 'mine'
                                    ? 'border-red-400/70 bg-red-500/30'
                                    : 'border-neon-cyan/60 bg-neon-cyan/25'
                                : 'border-white/[0.04] bg-white/[0.025] hover:border-white/20 hover:bg-white/10'
                            }`}
                          >
                            {note?.type === 'hold' ? <span className="text-[8px] font-black text-amber-200">H</span> : note?.type === 'mine' ? <span className="text-[8px] font-black text-red-200">M</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              {selectedTrack && (
                <>
                  <img src={trackCover(selectedTrack.id)} alt="" className="h-32 w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                  <div className="p-3">
                    <p className="font-header text-sm font-black uppercase text-white">{selectedTrack.name}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/35">{selectedTrack.artist} · {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</p>
                    <p className="mt-2 text-[10px] leading-relaxed text-white/45">{selectedTrack.description}</p>
                  </div>
                </>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-[9px] leading-relaxed text-white/40">
              <p className="mb-2 font-black uppercase tracking-widest text-white/60">Cómo funciona</p>
              Haz clic en la cuadrícula para colocar notas. Elige TAP, HOLD o MINE antes de pintar. HOLD dura dos pasos; MINE se falla al tocarla. Publica para que aparezca en el buscador online.
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white/60 transition hover:bg-white/10 hover:text-white">
          <Icon name="chevronRight" size={13} className="rotate-180" /> Volver al menú
        </button>
        <button type="button" onClick={openNew} className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-400/20">
          <Icon name="add" size={14} /> Crear nivel
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-header text-3xl font-black uppercase italic tracking-tighter text-white sm:text-4xl">NIVELES</h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Crea, publica y descubre charts de la comunidad.</p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-black/35 p-1">
          {(['mine', 'explore', ...(canOfficial ? ['official'] : []), ...(canAdmin ? ['admin'] : [])] as Tab[]).map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-lg px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition ${tab === item ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white'}`}>
              {item === 'mine' ? 'MIS CREACIONES' : item === 'explore' ? 'EXPLORAR ONLINE' : item === 'official' ? 'OFICIALES' : 'ADMIN'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {tab === 'explore' && (
          <label className="flex min-w-[13rem] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2">
            <Icon name="search" size={13} className="text-white/30" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título o descripción…" className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25" />
          </label>
        )}
        {tab !== 'official' && (
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-white/60 outline-none">
            <option value="all">Todas las dificultades</option>
            {DIFFICULTIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        )}
        {(tab === 'mine' || tab === 'admin') && userId && (
          <button type="button" onClick={() => setShowArchived((value) => !value)} className={`rounded-xl border px-3 py-2 text-[8px] font-black uppercase tracking-widest transition ${showArchived ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-white/10 bg-black/35 text-white/40 hover:text-white'}`}>
            {showArchived ? 'Ocultar archivados' : 'Ver archivados'}
          </button>
        )}
      </div>

      {error && <p className="mb-3 rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-[10px] text-red-300">{error}</p>}

      {tab === 'mine' && !userId ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <Icon name="lock" size={28} className="mx-auto mb-3 text-white/20" />
          <p className="text-sm font-bold text-white/60">Inicia sesión para crear y gestionar tus niveles.</p>
          <Link href="/login" className="mt-3 inline-flex rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-neon-cyan">Iniciar sesión</Link>
        </div>
      ) : loading ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />)}
        </div>
      ) : tab === 'official' ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {TRACKS_DATA.map((track) => {
            const level = levels.find((row) => row.official_slot === track.id);
            return (
              <article key={track.id} className="rounded-2xl border border-neon-purple/20 bg-black/40 p-3">
                <div className="flex gap-3">
                  <TrackThumb trackId={track.id} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-header text-sm font-black uppercase text-white">{track.name}</h3>
                        <p className="truncate text-[9px] font-bold uppercase tracking-widest text-white/35">Nivel oficial · {level ? `${level.bpm} BPM` : 'chart base'}</p>
                      </div>
                      <span className="rounded-full border border-neon-purple/30 bg-neon-purple/10 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-neon-purple">OFICIAL</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {level ? (
                        <>
                          <button type="button" disabled={saving} onClick={() => void openEdit(level.id)} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-white/60 hover:text-white disabled:opacity-40">Editar</button>
                          <button type="button" disabled={saving} onClick={() => void playLevel(level)} className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-neon-cyan disabled:opacity-40">Probar</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => openNewOfficial(track)} className="rounded-lg border border-neon-purple/35 bg-neon-purple/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-neon-purple">Crear override oficial</button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : levels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <Icon name="music" size={28} className="mx-auto mb-3 text-white/20" />
          <p className="text-sm font-bold text-white/60">{tab === 'mine' ? (showArchived ? 'No tienes niveles archivados.' : 'Todavía no has creado un nivel.') : 'No hay niveles que coincidan con la búsqueda.'}</p>
          {tab === 'mine' && <button type="button" onClick={openNew} className="mt-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-emerald-300">Crear el primero</button>}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {levels.map((level) => {
            const track = trackOf(level.track_id);
            return (
              <article key={level.id} className="rounded-2xl border border-white/10 bg-black/40 p-3 transition hover:border-white/20">
                <div className="flex gap-3">
                  <TrackThumb trackId={level.track_id} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-header text-sm font-black uppercase text-white">{level.title}</h3>
                        <p className="truncate text-[9px] font-bold uppercase tracking-widest text-white/35">{track?.name ?? level.track_id} · {level.bpm} BPM · {level.plays} plays</p>
                      </div>
                      {tab !== 'explore' && <LevelStatus level={level} />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-white/40">{level.description || 'Sin descripción.'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <button type="button" disabled={saving} onClick={() => void playLevel(level)} className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-neon-cyan disabled:opacity-40">
                        <Icon name="play" size={9} className="mr-1 inline" /> Probar
                      </button>
                      {tab === 'explore' && (
                        <>
                          <button type="button" disabled={likedLevels.has(level.id)} onClick={() => void likeLevel(level)} className="rounded-lg border border-neon-pink/25 bg-neon-pink/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-neon-pink disabled:opacity-50">
                            <Icon name="heart" size={9} className="mr-1 inline" /> {level.likes} {likedLevels.has(level.id) ? 'GUSTADO' : 'LIKE'}
                          </button>
                          {level.user_id !== userId && (
                            <button type="button" disabled={saving} onClick={() => void donateLevel(level)} className="rounded-lg border border-yellow-400/25 bg-yellow-400/5 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-yellow-300 disabled:opacity-40">
                              Donar MZP
                            </button>
                          )}
                        </>
                      )}
                      {(tab === 'mine' || tab === 'admin') && (
                        <>
                          <button type="button" disabled={saving} onClick={() => void openEdit(level.id)} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-white/55 hover:text-white disabled:opacity-40">Editar</button>
                          <button type="button" disabled={saving} onClick={() => void patchLevel(level.id, { status: level.status === 'published' ? 'draft' : 'published' }, level.status === 'published' ? 'Nivel despublicado.' : 'Nivel publicado.')} className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-emerald-300/80 hover:bg-emerald-400/10 disabled:opacity-40">
                            {level.status === 'published' ? 'Despublicar' : 'Publicar'}
                          </button>
                          <button type="button" disabled={saving} onClick={() => void patchLevel(level.id, { archived: !level.archived }, level.archived ? 'Nivel restaurado.' : 'Nivel archivado.')} className="rounded-lg border border-amber-400/25 bg-amber-400/5 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-amber-300/80 hover:bg-amber-400/10 disabled:opacity-40">
                            {level.archived ? 'Restaurar' : 'Archivar'}
                          </button>
                          <button type="button" disabled={saving} onClick={() => void deleteLevel(level)} className="rounded-lg border border-red-400/20 bg-red-400/5 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-red-300/70 hover:bg-red-400/10 disabled:opacity-40">Eliminar</button>
                        </>
                      )}
                    </div>
                    {tab === 'mine' && <p className="mt-1.5 text-[7px] font-bold uppercase tracking-widest text-white/20">Actualizado {formatDate(level.updated_at)}</p>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
