'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@ciszu/ui';

interface GuildConfig {
  prefix?: string;
  lang?: string;
  leveling_enabled?: boolean;
  level_channel_id?: string | null;
  xp_rate?: number;
  welcome_channel_id?: string | null;
  welcome_message?: string;
  goodbye_channel_id?: string | null;
  goodbye_message?: string;
  autorole_ids?: string[];
  logs_channel_id?: string | null;
  tickets_enabled?: boolean;
  tickets_category_id?: string | null;
  tickets_role_id?: string | null;
  private_channels?: boolean;
  private_category_id?: string | null;
  automod_enabled?: boolean;
}

interface Props {
  guildId: string;
  guildName: string;
  guildIcon: string | null;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-white/85">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/45">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-neon-blue';

const toggleCls = (on: boolean) =>
  `relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-gradient-to-r from-neon-blue to-neon-pink' : 'bg-white/15'}`;

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className={toggleCls(on)} aria-pressed={on}>
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}

export default function DashboardGuildClient({ guildId, guildName, guildIcon }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<GuildConfig | null>(null);

  const { data: serverConfig, isPending } = useQuery({
    queryKey: ['guild-config', guildId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/${guildId}`, { cache: 'no-store' });
      if (res.status === 403 || res.status === 401) {
        window.location.href = '/dashboard';
        return null;
      }
      const json = (await res.json()) as { config?: GuildConfig | null };
      const cfg = json.config;
      return {
        prefix: cfg?.prefix ?? 'cz!',
        lang: cfg?.lang ?? 'es',
        leveling_enabled: cfg?.leveling_enabled ?? false,
        level_channel_id: cfg?.level_channel_id ?? null,
        xp_rate: cfg?.xp_rate ?? 1,
        welcome_channel_id: cfg?.welcome_channel_id ?? null,
        welcome_message: cfg?.welcome_message ?? 'Bienvenido/a {user} a {guild}!',
        goodbye_channel_id: cfg?.goodbye_channel_id ?? null,
        goodbye_message: cfg?.goodbye_message ?? 'Adiós {user}, que te vaya bien!',
        autorole_ids: Array.isArray(cfg?.autorole_ids) ? cfg.autorole_ids : [],
        logs_channel_id: cfg?.logs_channel_id ?? null,
        tickets_enabled: cfg?.tickets_enabled ?? false,
        private_channels: cfg?.private_channels ?? false,
        automod_enabled: cfg?.automod_enabled ?? false,
      } as GuildConfig;
    },
  });

  useEffect(() => {
    if (serverConfig && !config) setConfig(serverConfig);
  }, [serverConfig, config]);

  const saveMutation = useMutation({
    mutationFn: async (patch: GuildConfig) => {
      const res = await fetch(`/api/dashboard/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('save_failed');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guild-config', guildId] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: () => setError('No se pudo guardar la configuración.'),
  });

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-neon-blue" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-bg px-4 py-20 text-center text-white/70">
        {error ?? 'No se pudo cargar la configuración.'}
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pb-20">
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-neon-blue">
          <Icon name="arrow-right" size={14} className="rotate-180" /> Volver
        </Link>

        <div className="mt-4 flex items-center gap-3">
          {guildIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png`} alt="" className="h-11 w-11 rounded-full" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple font-bold text-white">
              {guildName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{guildName}</h1>
            <p className="text-sm text-white/50">Configuración de CiszuBot</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* General */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
              <Icon name="settings" size={18} className="text-neon-blue" /> General
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prefijo del bot" hint="Ejemplo: cz!">
                <input
                  className={inputCls}
                  value={config.prefix ?? 'cz!'}
                  maxLength={3}
                  onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                />
              </Field>
              <Field label="Idioma">
                <select
                  className={inputCls}
                  value={config.lang ?? 'es'}
                  onChange={(e) => setConfig({ ...config, lang: e.target.value })}
                >
                  <option value="es" className="bg-[#0a0a14]">Español</option>
                  <option value="en" className="bg-[#0a0a14]">English</option>
                </select>
              </Field>
            </div>
          </section>

          {/* Niveles */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
              <Icon name="star" size={18} className="text-neon-pink" /> Niveles y XP
            </h2>
            <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white/90">Sistema de niveles</p>
                <p className="text-xs text-white/50">Los miembros ganan XP al hablar</p>
              </div>
              <Toggle on={Boolean(config.leveling_enabled)} onChange={(v) => setConfig({ ...config, leveling_enabled: v })} />
            </div>
            {config.leveling_enabled && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Multiplicador de XP" hint="0.1 – 10 (default 1)">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    className={inputCls}
                    value={config.xp_rate ?? 1}
                    onChange={(e) => setConfig({ ...config, xp_rate: Number(e.target.value) })}
                  />
                </Field>
                <Field label="ID del canal de anuncios de nivel" hint="Deja vacío para anunciar en el chat">
                  <input
                    className={inputCls}
                    placeholder="ID del canal"
                    value={config.level_channel_id ?? ''}
                    onChange={(e) => setConfig({ ...config, level_channel_id: e.target.value || null })}
                  />
                </Field>
              </div>
            )}
          </section>

          {/* Bienvenidas */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
              <Icon name="heart" size={18} className="text-neon-pink" /> Bienvenidas y despedidas
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Canal de bienvenidas (ID)">
                <input
                  className={inputCls}
                  placeholder="Deja vacío para desactivar"
                  value={config.welcome_channel_id ?? ''}
                  onChange={(e) => setConfig({ ...config, welcome_channel_id: e.target.value || null })}
                />
              </Field>
              <Field label="Canal de despedidas (ID)">
                <input
                  className={inputCls}
                  placeholder="Deja vacío para desactivar"
                  value={config.goodbye_channel_id ?? ''}
                  onChange={(e) => setConfig({ ...config, goodbye_channel_id: e.target.value || null })}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Mensaje de bienvenida" hint="Variables: {user} {guild} {members}">
                <textarea
                  className={inputCls}
                  rows={2}
                  value={config.welcome_message ?? ''}
                  onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                />
              </Field>
              <Field label="Mensaje de despedida" hint="Variables: {user} {guild} {members}">
                <textarea
                  className={inputCls}
                  rows={2}
                  value={config.goodbye_message ?? ''}
                  onChange={(e) => setConfig({ ...config, goodbye_message: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Roles automáticos (IDs separados por coma)" hint="Se asignan a nuevos miembros">
              <input
                className={inputCls}
                placeholder="123456789, 987654321"
                value={Array.isArray(config.autorole_ids) ? config.autorole_ids.join(', ') : ''}
                onChange={(e) =>
                  setConfig({ ...config, autorole_ids: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
                }
              />
            </Field>
          </section>

          {/* Tickets y extras */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
              <Icon name="support" size={18} className="text-neon-blue" /> Tickets y extras
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">Sistema de tickets</p>
                  <p className="text-xs text-white/50">Actívalo con cz!setuptickets en el bot</p>
                </div>
                <Toggle on={Boolean(config.tickets_enabled)} onChange={(v) => setConfig({ ...config, tickets_enabled: v })} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">Canales privados</p>
                  <p className="text-xs text-white/50">Los miembros crean canales con un botón</p>
                </div>
                <Toggle on={Boolean(config.private_channels)} onChange={(v) => setConfig({ ...config, private_channels: v })} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">Auto-moderación</p>
                  <p className="text-xs text-white/50">Protección básica de spam</p>
                </div>
                <Toggle on={Boolean(config.automod_enabled)} onChange={(v) => setConfig({ ...config, automod_enabled: v })} />
              </div>
              <Field label="Canal de logs (ID)">
                <input
                  className={inputCls}
                  placeholder="Deja vacío para desactivar"
                  value={config.logs_channel_id ?? ''}
                  onChange={(e) => setConfig({ ...config, logs_channel_id: e.target.value || null })}
                />
              </Field>
            </div>
          </section>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={() => config && saveMutation.mutate(config)}
            disabled={saveMutation.isPending}
            className="w-full rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-3 font-bold text-white transition hover:scale-[1.01] disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Guardando...' : saved ? '✅ ¡Guardado!' : 'Guardar configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}
