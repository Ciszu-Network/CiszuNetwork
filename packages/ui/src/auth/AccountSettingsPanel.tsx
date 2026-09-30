'use client';

/**
 * AccountSettingsPanel — configuración de CUENTA común a las 4 webs.
 *
 * Se conecta por sí solo (tipado estructural, sin acoplar @supabase):
 *  - Perfil: cambiar el nombre display (user_metadata.display_name).
 *  - Seguridad: cambiar contraseña (con re-autenticación) y OTP por email
 *    (activar con código C-XXX XXX / desactivar) vía /api/auth/2fa.
 *  - Sesión: recordar sesión (persistencia por dispositivo), cerrar sesión y
 *    cerrar TODAS las sesiones (cierre seguro).
 *  - Notificaciones: email y recordatorio de OTP (preferencias en metadata).
 *  - Debug: información de la cuenta y estado (base para permisos de staff).
 *
 * Excluye lo puramente de perfil público (bio, avatar, gustos…), que vive en
 * cada web. La eliminación de cuenta (Danger Zone) es de otra fase.
 */

import { useCallback, useEffect, useState } from 'react';
import { isRememberEnabled, setRememberEnabled } from './rememberSession';

export interface AccountSettingsSupabase {
  /** Acceso al schema public para roles/estado (opcional; el cliente real lo trae). */
  schema?(name: string): { from(table: string): any } | any;
  auth: {
    getUser(): Promise<{
      data: { user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null } | null };
      error: { message: string } | null;
    }>;
    updateUser(attributes: {
      data?: Record<string, unknown>;
      password?: string;
    }): Promise<{ data: unknown; error: { message: string } | null }>;
    signInWithPassword(credentials: {
      email: string;
      password: string;
    }): Promise<{ data: unknown; error: { message: string } | null }>;
    signOut(options?: { scope?: 'global' | 'local' | 'others' }): Promise<{ error: { message: string } | null }>;
    getSession(): Promise<{ data: { session: { access_token: string } | null } }>;
  };
}

export interface AccountSettingsPanelProps {
  supabase: AccountSettingsSupabase;
  site: string;
  siteName?: string;
  apiBase?: string;
}

type UserInfo = {
  id: string;
  email: string;
  metadata: Record<string, unknown>;
};

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-header text-sm font-black uppercase tracking-widest text-ink">{title}</h3>
      {description && <p className="mt-1 text-xs text-muted leading-relaxed">{description}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-left">
      <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-neon-blue';

const btnPrimary =
  'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-4 py-2.5 font-header text-[11px] font-black uppercase tracking-widest text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50';
const btnGhost =
  'inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 font-header text-[11px] font-black uppercase tracking-widest text-muted transition hover:text-ink disabled:opacity-50';

export default function AccountSettingsPanel({
  supabase,
  site,
  siteName = 'Ciszu Network',
  apiBase = '/api/auth/2fa',
}: AccountSettingsPanelProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  const [otpEnabled, setOtpEnabled] = useState<boolean | null>(null);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpAskCode, setOtpAskCode] = useState(false);
  const [otpMsg, setOtpMsg] = useState<string | null>(null);

  const [remember, setRemember] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [otpReminder, setOtpReminder] = useState(true);
  const [notifMsg, setNotifMsg] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [staffView, setStaffView] = useState(false);
  const [delPw, setDelPw] = useState('');
  const [delUser, setDelUser] = useState('');
  const [delPhrase, setDelPhrase] = useState('');
  const [delOpen, setDelOpen] = useState(false);
  const [delBusy, setDelBusy] = useState(false);
  const [delMsg, setDelMsg] = useState<string | null>(null);
  // Privacidad del perfil (aplicada especialmente en muzicmania).
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [visibilityMsg, setVisibilityMsg] = useState<string | null>(null);

  const api = useCallback(
    async (path: string, init?: RequestInit) => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(`${apiBase}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers ?? {}),
        },
      });
      return (await res.json().catch(() => ({}))) as Record<string, unknown>;
    },
    [supabase, apiBase],
  );

  const loadStatus = useCallback(async () => {
    try {
      const status = await api('/status', { method: 'GET' });
      if (typeof status.enabled === 'boolean') setOtpEnabled(status.enabled);
    } catch {
      /* sin sesión o red */
    }
  }, [api]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        if (data.user) {
          const metadata = (data.user.user_metadata ?? {}) as Record<string, unknown>;
          setUser({ id: data.user.id, email: data.user.email ?? '', metadata });
          setDisplayName(typeof metadata.display_name === 'string' ? metadata.display_name : '');
          setEmailNotif(metadata.email_notifications !== false);
          setOtpReminder(metadata.otp_reminder !== false);
          // Rol global en ESTA web (tag de perfil / paneles por rango).
          try {
            const publicDb = supabase.schema?.('public');
            const res = await publicDb
              .from('user_roles')
              .select('role')
              .eq('user_id', data.user.id)
              .eq('website', site)
              .maybeSingle();
            const role = (res?.data as { role?: string } | null)?.role;
            setMyRole(role ?? null);
            const privacyRes = await publicDb
              .from('account_privacy')
              .select('visibility')
              .eq('user_id', data.user.id)
              .maybeSingle();
            const vis = (privacyRes?.data as { visibility?: string } | null)?.visibility;
            if (vis === 'friends' || vis === 'private' || vis === 'public') setVisibility(vis);
          } catch {
            /* sin rol */
          }
        }
      } catch {
        /* sesión no disponible */
      } finally {
        if (!cancelled) setLoading(false);
      }
      if (!cancelled) {
        setRemember(isRememberEnabled(site));
        void loadStatus();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, site, loadStatus]);

  const saveProfile = async () => {
    setProfileMsg(null);
    const value = displayName.trim();
    if (value.length < 2) {
      setProfileMsg('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ data: { display_name: value } });
    setProfileMsg(error ? error.message : 'Nombre actualizado.');
  };

  const savePassword = async () => {
    setPwMsg(null);
    if (newPw.length < 8) {
      setPwMsg('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPw !== newPw2) {
      setPwMsg('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPw === curPw) {
      setPwMsg('La contraseña nueva no puede ser la actual.');
      return;
    }
    if (!user?.email) {
      setPwMsg('No hay email de sesión.');
      return;
    }
    const reauth = await supabase.auth.signInWithPassword({ email: user.email, password: curPw });
    if (reauth.error) {
      setPwMsg('La contraseña actual no es correcta.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      setPwMsg(error.message);
      return;
    }
    setCurPw('');
    setNewPw('');
    setNewPw2('');
    setPwMsg('Contraseña actualizada. Se recomienda volver a iniciar sesión.');
  };

  const toggleOtpOn = async () => {
    setOtpMsg(null);
    setOtpBusy(true);
    try {
      const gen = await api('/generate', { method: 'POST' });
      if (gen.success === false) {
        setOtpMsg(typeof gen.error === 'string' ? gen.error : 'No pudimos enviar la clave.');
      } else {
        setOtpAskCode(true);
        setOtpMsg(`Te enviamos una clave C-XXX XXX a ${user?.email ?? 'tu email'}.`);
      }
    } finally {
      setOtpBusy(false);
    }
  };

  const confirmOtpOn = async () => {
    setOtpMsg(null);
    setOtpBusy(true);
    try {
      const res = await api('/enable', { method: 'POST', body: JSON.stringify({ code: otpCode }) });
      if (res.success === true) {
        setOtpEnabled(true);
        setOtpAskCode(false);
        setOtpCode('');
        setOtpMsg('OTP activado: los próximos inicios de sesión pedirán la clave.');
      } else {
        setOtpMsg(typeof res.error === 'string' ? res.error : 'La clave no es correcta.');
      }
    } finally {
      setOtpBusy(false);
    }
  };

  const disableOtp = async () => {
    setOtpMsg(null);
    setOtpBusy(true);
    try {
      const res = await api('/disable', { method: 'POST' });
      if (res.success === true) {
        setOtpEnabled(false);
        setOtpMsg('OTP desactivado en esta web.');
      } else {
        setOtpMsg(typeof res.error === 'string' ? res.error : 'No pudimos desactivar el OTP.');
      }
    } finally {
      setOtpBusy(false);
    }
  };

  const saveNotifs = async (patch: { email_notifications?: boolean; otp_reminder?: boolean }) => {
    setNotifMsg(null);
    const { error } = await supabase.auth.updateUser({ data: patch });
    setNotifMsg(error ? error.message : 'Preferencias guardadas.');
  };

  const changeRemember = (value: boolean) => {
    setRememberEnabled(site, value);
    setRemember(value);
    setMsg(value ? 'Sesión recordada en este dispositivo.' : 'La sesión ya no se recordará en este dispositivo.');
  };

  const logout = async () => {
    await supabase.auth.signOut().catch(() => {});
  };

  const logoutAll = async () => {
    setMsg(null);
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) setMsg(error.message);
  };

  /** Danger Zone: solicita la eliminación (15 días de suspensión, datos guardados). */
  const requestDeletion = async () => {
    setDelMsg(null);
    if (!delPw || !delUser.trim() || delPhrase.trim().toUpperCase() !== 'ELIMINAR') {
      setDelMsg('Completa contraseña, tu usuario exacto y escribe ELIMINAR.');
      return;
    }
    setDelBusy(true);
    try {
      const accountBase = apiBase.replace(/\/2fa$/, '/account');
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(`${accountBase}/delete-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: delPw, username: delUser.trim(), phrase: delPhrase }),
      });
      const result = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || result.success !== true) {
        setDelMsg(result.error ?? 'No pudimos procesar la eliminación.');
        return;
      }
      await supabase.auth.signOut().catch(() => {});
      window.location.href = '/';
    } finally {
      setDelBusy(false);
    }
  };

  /** Guarda la privacidad del perfil (aplicada especialmente en muzicmania). */
  const saveVisibility = async (value: 'public' | 'friends' | 'private') => {
    setVisibility(value);
    setVisibilityMsg(null);
    try {
      const accountBase = apiBase.replace(/\/2fa$/, '/account');
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(`${accountBase}/privacy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ visibility: value }),
      });
      const result = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      setVisibilityMsg(
        result.success === true ? 'Privacidad actualizada.' : (result.error ?? 'No pudimos guardarla.'),
      );
    } catch {
      setVisibilityMsg('No pudimos guardar la privacidad.');
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-neon-blue" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted">
        Inicia sesión para ver la configuración de tu cuenta en {siteName}.
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="account-settings">
      {msg && <p className="text-xs font-bold text-brand-300">{msg}</p>}

      <Section title="Perfil" description="Cómo se muestra tu nombre dentro de la web.">
        <Field label="Nombre display">
          <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} />
        </Field>
        <div className="flex items-center gap-3">
          <button type="button" className={btnPrimary} onClick={saveProfile}>
            Guardar
          </button>
          {profileMsg && <span className="text-[11px] font-bold text-muted">{profileMsg}</span>}
        </div>
      </Section>

      <Section title="Seguridad" description="Contraseña y verificación en dos pasos por email (C-XXX XXX).">
        <Field label="Contraseña actual">
          <input type="password" className={inputCls} value={curPw} onChange={(e) => setCurPw(e.target.value)} autoComplete="current-password" />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nueva contraseña">
            <input type="password" className={inputCls} value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Repetir nueva">
            <input type="password" className={inputCls} value={newPw2} onChange={(e) => setNewPw2(e.target.value)} autoComplete="new-password" />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className={btnPrimary} onClick={savePassword}>
            Cambiar contraseña
          </button>
          {pwMsg && <span className="text-[11px] font-bold text-muted">{pwMsg}</span>}
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-ink">
            OTP por email: {otpEnabled === null ? '…' : otpEnabled ? 'ACTIVADO' : 'desactivado'}
          </span>
          {otpEnabled ? (
            <button type="button" className={btnGhost} onClick={disableOtp} disabled={otpBusy}>
              Desactivar OTP
            </button>
          ) : otpAskCode ? (
            <div className="flex w-full flex-wrap items-center gap-2">
              <input
                className={`${inputCls} max-w-[200px]`}
                placeholder="C-123 434"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
              <button type="button" className={btnPrimary} onClick={confirmOtpOn} disabled={otpBusy}>
                Confirmar código
              </button>
            </div>
          ) : (
            <button type="button" className={btnGhost} onClick={toggleOtpOn} disabled={otpBusy}>
              Activar OTP
            </button>
          )}
        </div>
        {otpMsg && <p className="text-[11px] font-bold text-muted">{otpMsg}</p>}
      </Section>

      <Section title="Sesión" description={`Las sesiones expiran por seguridad; puedes mantenerla recordada en este dispositivo.`}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => changeRemember(e.target.checked)}
            className="h-4 w-4 accent-[#22d3ee]"
          />
          <span className="text-xs font-bold text-ink">Recordar sesión en este dispositivo</span>
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" className={btnGhost} onClick={logout}>
            Cerrar sesión
          </button>
          <button type="button" className={btnGhost} onClick={logoutAll}>
            Cerrar TODAS las sesiones
          </button>
        </div>
      </Section>

      <Section title="Notificaciones" description="Correos del ecosistema (nunca publicidad de terceros).">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={emailNotif}
            onChange={(e) => {
              setEmailNotif(e.target.checked);
              void saveNotifs({ email_notifications: e.target.checked });
            }}
            className="h-4 w-4 accent-[#22d3ee]"
          />
          <span className="text-xs font-bold text-ink">Recibir emails de la cuenta</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={otpReminder}
            onChange={(e) => {
              setOtpReminder(e.target.checked);
              void saveNotifs({ otp_reminder: e.target.checked });
            }}
            className="h-4 w-4 accent-[#22d3ee]"
          />
          <span className="text-xs font-bold text-ink">Recordatorio de verificación OTP</span>
        </label>
        {notifMsg && <p className="text-[11px] font-bold text-muted">{notifMsg}</p>}
      </Section>

      <Section title="Debug" description="Información técnica de tu cuenta (útil para soporte).">
        <button type="button" className={btnGhost} onClick={() => setDebugOpen((v) => !v)}>
          {debugOpen ? 'Ocultar' : 'Mostrar'} detalles
        </button>
        {debugOpen && (
          <pre className="overflow-x-auto rounded-xl border border-border bg-surface p-3 text-[11px] leading-relaxed text-muted">
{`userId: ${user.id}
email: ${user.email}
website: ${site} (${siteName})
rol: ${myRole ?? 'usuario'}${myRole && ['owner', 'admin', 'mod', 'bot'].includes(myRole) ? ' [con permisos de staff]' : ''}
otp: ${otpEnabled === null ? 'desconocido' : otpEnabled ? 'activado' : 'desactivado'}
remember: ${remember ? 'on' : 'off'}
build: ${typeof window !== 'undefined' ? window.location.host : ''}`}
          </pre>
        )}

        {myRole && ['owner', 'admin', 'mod', 'bot'].includes(myRole) && (
          <label className="flex items-center gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={staffView}
              onChange={(e) => setStaffView(e.target.checked)}
              className="h-4 w-4 accent-[#ff33cc]"
            />
            <span className="text-xs font-bold text-ink">
              Vista de staff en perfiles ({staffView ? 'activada' : 'desactivada'})
            </span>
          </label>
        )}
        {myRole && ['owner', 'admin', 'mod', 'bot'].includes(myRole) && (
          <p className="text-[10px] font-bold text-muted">
            Panel de {myRole}: las acciones de moderación quedan marcadas con tu identidad (auditoría) y se
            habilitarán por rangos en la siguiente iteración (owner completo &gt; admin &gt; mod &gt; bot).
          </p>
        )}
      </Section>

      <Section
        title="Privacidad del perfil"
        description="Público: todo visible. Amigos: los datos detallados (records, historial, logros, amistades y comentarios) solo los ven tus amigos (cuando exista el sistema de amistades) — por ahora solo tú. Privado: solo tú. El nombre, la foto y la bio siguen visibles en todos los niveles. Se aplica especialmente en el perfil público de muzicmania."
      >
        {visibilityMsg && <p className="text-[11px] font-bold text-muted">{visibilityMsg}</p>}
        <div className="flex flex-wrap gap-2">
          {(['public', 'friends', 'private'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => void saveVisibility(level)}
              className={visibility === level ? btnPrimary : btnGhost}
            >
              {level === 'public' ? 'Público' : level === 'friends' ? 'Amigos' : 'Privado'}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Danger Zone"
        description="Eliminar tu cuenta CISZU ID: pasa a suspensión de 15 días (desindexada y anonimizada públicamente; tus datos se conservan). Podrás recuperarla iniciando sesión en ese plazo; al recuperarla no podrás eliminarla de nuevo durante 30 días."
      >
        {delMsg && <p className="text-[11px] font-bold text-red-400">{delMsg}</p>}
        {delOpen ? (
          <div className="space-y-3 text-left">
            <Field label="Contraseña actual">
              <input
                type="password"
                className={inputCls}
                value={delPw}
                onChange={(e) => setDelPw(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <Field label="Escribe tu nombre de usuario exacto">
              <input className={inputCls} value={delUser} onChange={(e) => setDelUser(e.target.value)} />
            </Field>
            <Field label="Escribe ELIMINAR para confirmar (advertencia final)">
              <input
                className={inputCls}
                value={delPhrase}
                onChange={(e) => setDelPhrase(e.target.value)}
                placeholder="ELIMINAR"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={delBusy}
                onClick={requestDeletion}
                className="inline-flex items-center justify-center rounded-xl bg-red-500/90 px-4 py-2.5 font-header text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                Eliminar mi cuenta
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  setDelOpen(false);
                  setDelMsg(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={btnGhost} onClick={() => setDelOpen(true)}>
            Eliminar cuenta…
          </button>
        )}
      </Section>
    </div>
  );
}
