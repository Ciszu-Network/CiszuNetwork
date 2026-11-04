'use client';

import { useEffect, useState } from 'react';
import { useDebugMode } from './DebugProvider';
import type { DebugFeature } from './types';

const FEATURE_LABELS: Record<DebugFeature, { label: string; hint: string }> = {
  placeholders: { label: 'Cuentas placeholder', hint: 'Usuarios BOT simulados solo en tu navegador.' },
  simulatedAnalytics: { label: 'Analíticas simuladas', hint: 'Muestra métricas de prueba sin tocar la DB.' },
  officialEditor: { label: 'Editor oficial', hint: 'Edita los niveles oficiales de MuzicMania.' },
  cheats: { label: 'Cheats limpios', hint: 'Vida infinita y salto de nivel en MuzicMania.' },
};

export function DebugTag({ label = 'BOT', className = '' }: { label?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-amber-400/50 bg-amber-400/15 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-amber-300 ${className}`}>
      {label}
    </span>
  );
}

export function DebugDock() {
  const debug = useDebugMode();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [wl, setWl] = useState<{ staff: Array<{ staff_id: string; nombre: string; nivel: number }>; whitelist: Array<{ staff_id: string; site: string; role: string; enabled: boolean }> } | null>(null);
  const [wlStaff, setWlStaff] = useState('');
  const [wlBusy, setWlBusy] = useState(false);

  useEffect(() => {
    if (!open || !debug.authorized || debug.staff?.role !== 'owner') return;
    void debug.apiFetch('/api/debug/whitelist').then((response) => (response.ok ? response.json() : null)).then((data) => setWl(data)).catch(() => undefined);
  }, [open, debug.authorized, debug.staff?.role, debug.apiFetch]);

  if (!debug.staff) return null;

  const verify = async () => {
    setVerifying(true);
    setError('');
    const result = await debug.verifyCode(code);
    if (!result.ok) setError(result.error ?? 'No se pudo verificar.');
    else setCode('');
    setVerifying(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed right-3 top-[72px] z-[120] flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md transition ${
          debug.authorized && debug.enabled
            ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
            : 'border-amber-400/40 bg-amber-400/10 text-amber-300'
        }`}
        title="Debug / beta testing"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${debug.authorized && debug.enabled ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'}`} />
        {debug.authorized && debug.enabled ? 'DEBUG' : 'STAFF'}
      </button>

      {open && (
        <div className="fixed inset-0 z-[1500] flex items-start justify-center overflow-y-auto bg-black/80 p-3 pt-20 backdrop-blur-md sm:pt-24" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-[#07070d] p-4 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-300">Ciszu Debug · {debug.site}</p>
                <h2 className="mt-1 font-header text-2xl font-black uppercase italic text-white">{debug.staff.name}</h2>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/35">
                  {debug.staff.staffId} · {debug.staff.role} · nivel {debug.staff.nivel}
                </p>
              </div>
              <button type="button" aria-label="Cerrar debug" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            {!debug.authorized ? (
              <div className="space-y-3">
                <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-[10px] leading-relaxed text-amber-200/80">
                  {debug.elevationRequired
                    ? 'Tu cuenta está en la whitelist. Introduce el código step-up generado desde devcon para desbloquear el modo debug durante esta sesión.'
                    : 'Tu cuenta no tiene acceso debug activo. Un owner debe añadirte a la whitelist de staffcon.'}
                </p>
                {debug.elevationRequired && (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-white/35">Código step-up de devcon</span>
                      <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="ELEV-XXXX-XXXX-XXXX-XXXX" className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-400/60" />
                    </label>
                    {error && <p className="text-[10px] text-red-300">{error}</p>}
                    <button type="button" onClick={() => void verify()} disabled={verifying || code.trim().length < 8} className="w-full rounded-xl border border-emerald-400/40 bg-emerald-400/15 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-emerald-300 disabled:opacity-40">
                      {verifying ? 'Verificando…' : 'Verificar y activar'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Modo debug</p>
                    <p className="mt-0.5 text-[8px] uppercase tracking-widest text-white/30">Solo cliente local · no modifica la DB</p>
                  </div>
                  <button type="button" onClick={() => debug.setEnabled(!debug.enabled)} className={`relative h-6 w-12 rounded-full border transition ${debug.enabled ? 'border-emerald-400 bg-emerald-400/70' : 'border-white/20 bg-white/10'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${debug.enabled ? 'left-[26px]' : 'left-[1px]'}`} />
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(FEATURE_LABELS) as DebugFeature[]).map((feature) => {
                    const allowed = debug.status?.features?.[feature] ?? false;
                    return (
                      <button
                        key={feature}
                        type="button"
                        disabled={!allowed || !debug.enabled}
                        onClick={() => debug.setFeature(feature, !debug.features[feature])}
                        className={`rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-35 ${debug.features[feature] ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-white/10 bg-white/[0.02]'}`}
                      >
                        <span className="block text-[9px] font-black uppercase tracking-widest text-white/80">{FEATURE_LABELS[feature].label}</span>
                        <span className="mt-1 block text-[8px] leading-relaxed text-white/35">{FEATURE_LABELS[feature].hint}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Placeholders locales</p>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => debug.addPlaceholders(3)} className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-amber-300">+3 BOT</button>
                      <button type="button" onClick={debug.clearPlaceholders} className="rounded-lg border border-red-400/20 bg-red-400/5 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-red-300/70">Limpiar</button>
                    </div>
                  </div>
                  {debug.placeholders.length === 0 ? (
                    <p className="mt-2 text-[9px] text-white/30">No hay cuentas placeholder. Añade algunas para probar listas y reseñas sin escribir en la DB.</p>
                  ) : (
                    <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                      {debug.placeholders.map((placeholder) => (
                        <div key={placeholder.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/30 px-2 py-1.5">
                          <span className="flex min-w-0 items-center gap-2">
                            <DebugTag label={placeholder.tag} />
                            <span className="truncate text-[9px] font-bold text-white/70">@{placeholder.username}</span>
                          </span>
                          <button type="button" onClick={() => debug.removePlaceholder(placeholder.id)} className="text-[10px] text-red-300/60 hover:text-red-300">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Cuentas CISZU vinculadas</p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {debug.links.map((link) => (
                      <div key={link.site} className={`rounded-lg border px-2 py-1.5 ${link.linked ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-white/10 bg-black/20'}`}>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/45">{link.site}</p>
                        <p className="truncate text-[9px] font-bold text-white/70">{link.linked ? `@${link.username ?? 'cuenta'}` : 'Sin vincular'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {debug.staff.role === 'owner' && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Whitelist de staff</p>
                    <div className="mt-2 flex gap-1.5">
                      <select value={wlStaff} onChange={(event) => setWlStaff(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/50 px-2 py-1.5 text-[9px] font-bold text-white outline-none">
                        <option value="">Añadir empleado…</option>
                        {(wl?.staff ?? []).filter((employee) => !wl?.whitelist.some((entry) => entry.staff_id === employee.staff_id && entry.site === '*')).map((employee) => (
                          <option key={employee.staff_id} value={employee.staff_id}>{employee.staff_id} · {employee.nombre}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!wlStaff || wlBusy}
                        onClick={() => {
                          if (!wlStaff) return;
                          setWlBusy(true);
                          void debug.apiFetch('/api/debug/whitelist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ staff_id: wlStaff, site: '*', role: 'beta', features: { placeholders: true, simulatedAnalytics: true, officialEditor: false, cheats: false }, enabled: true }) })
                            .then((response) => (response.ok ? response.json() : null))
                            .then(() => debug.apiFetch('/api/debug/whitelist').then((response) => (response.ok ? response.json() : null)).then((data) => { setWl(data); setWlStaff(''); }))
                            .finally(() => setWlBusy(false));
                        }}
                        className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest text-emerald-300 disabled:opacity-40"
                      >
                        Añadir
                      </button>
                    </div>
                    <div className="mt-2 max-h-28 space-y-1 overflow-y-auto">
                      {(wl?.whitelist ?? []).map((entry) => (
                        <div key={`${entry.staff_id}:${entry.site}`} className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/30 px-2 py-1">
                          <span className="truncate text-[9px] font-bold text-white/60">{entry.staff_id} · {entry.site} · {entry.role}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setWlBusy(true);
                              void debug.apiFetch(`/api/debug/whitelist?staff_id=${encodeURIComponent(entry.staff_id)}&site=${encodeURIComponent(entry.site)}`, { method: 'DELETE' })
                                .then(() => debug.apiFetch('/api/debug/whitelist').then((response) => (response.ok ? response.json() : null)).then((data) => setWl(data)))
                                .finally(() => setWlBusy(false));
                            }}
                            className="text-[10px] text-red-300/60 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {debug.site === 'muzicmania' && debug.features.officialEditor && (
                  <a href="/play?studio=official" className="block rounded-xl border border-neon-purple/40 bg-neon-purple/10 px-4 py-2.5 text-center text-[9px] font-black uppercase tracking-widest text-neon-purple">
                    Abrir editor de niveles oficiales
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
