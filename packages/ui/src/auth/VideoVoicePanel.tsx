'use client';

import React, { useCallback, useEffect, useState } from 'react';

/**
 * "Video y voz" (MuzicMania): volumen de música y efectos sincronizados con la
 * cuenta (profiles.settings_controls.video_voice) y con el juego (los mismos
 * valores de localStorage que usa el store del juego: audio_music_vol/audio_sfx_vol).
 */

interface AuthLike {
  auth: { getSession(): Promise<{ data: { session: { access_token: string } | null } }> };
}

const MUSIC_KEY = 'audio_music_vol';
const SFX_KEY = 'audio_sfx_vol';

export function VideoVoicePanel({ supabase, apiBase = '/api/auth/2fa' }: { supabase: AuthLike; apiBase?: string }) {
  const base = apiBase.replace(/\/2fa$/, '');
  const [musicVol, setMusicVol] = useState(100);
  const [sfxVol, setSfxVol] = useState(100);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;
        const res = await fetch(`${base}/account/audio`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        const json = (await res.json()) as { prefs?: { musicVol?: number; sfxVol?: number } };
        if (json.prefs) {
          const m = json.prefs.musicVol ?? 100;
          const s = json.prefs.sfxVol ?? 100;
          setMusicVol(m);
          setSfxVol(s);
          // Sincroniza el juego con la cuenta al abrir esta pantalla.
          try {
            window.localStorage.setItem(MUSIC_KEY, String(m));
            window.localStorage.setItem(SFX_KEY, String(s));
          } catch { /* almacenamiento no disponible */ }
        }
      } catch { /* sin sesión o red */ }
    })();
  }, [base, supabase]);

  const save = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(`${base}/account/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({ musicVol, sfxVol }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? 'No se pudo guardar.');
      try {
        window.localStorage.setItem(MUSIC_KEY, String(musicVol));
        window.localStorage.setItem(SFX_KEY, String(sfxVol));
      } catch { /* almacenamiento no disponible */ }
      setMsg('Guardado. Se aplica en tu próxima partida.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  }, [base, supabase, musicVol, sfxVol]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 flex items-center justify-between text-xs font-bold text-ink">
          Volumen de música <span className="text-muted">{musicVol}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={musicVol}
          onChange={(e) => setMusicVol(Number(e.target.value))}
          className="w-full accent-[#22d3ee]"
        />
      </label>
      <label className="block">
        <span className="mb-1 flex items-center justify-between text-xs font-bold text-ink">
          Volumen de efectos (notas y golpes) <span className="text-muted">{sfxVol}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={sfxVol}
          onChange={(e) => setSfxVol(Number(e.target.value))}
          className="w-full accent-[#22d3ee]"
        />
      </label>
      <button
        type="button"
        onClick={() => void save()}
        disabled={busy}
        className="w-full rounded-xl border border-border px-4 py-2.5 font-header text-[11px] font-black uppercase tracking-widest text-muted transition hover:text-ink disabled:opacity-50"
      >
        {busy ? 'Guardando…' : 'Guardar video y voz'}
      </button>
      {msg && <p className="text-[11px] font-bold text-muted">{msg}</p>}
    </div>
  );
}

export default VideoVoicePanel;
