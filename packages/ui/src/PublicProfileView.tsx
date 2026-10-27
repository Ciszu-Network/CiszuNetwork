'use client';

import { useState } from 'react';
import { Icon } from './Icon';

export interface PublicProfileData {
  id: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface PublicProfileViewProps {
  profile: PublicProfileData;
  siteName: string;
  backHref?: string;
  backLabel?: string;
  publicLabel?: string;
  description?: string;
  accentTextClass?: string;
  accentBorderClass?: string;
  glowClass?: string;
}

export function PublicProfileView({
  profile,
  siteName,
  backHref = '/',
  backLabel = 'Volver al inicio',
  publicLabel = 'Perfil público',
  description,
  accentTextClass = 'text-neon-blue',
  accentBorderClass = 'border-neon-blue/30',
  glowClass = 'bg-neon-blue/10',
}: PublicProfileViewProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const displayName = profile.displayName?.trim() || profile.username || 'Usuario';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <a
        href={backHref}
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:text-white"
      >
        <Icon name="home" size={14} />
        {backLabel}
      </a>

      <section
        className={
          'relative mt-6 overflow-hidden rounded-3xl border bg-white/[0.04] p-8 text-center shadow-2xl sm:p-12 ' +
          accentBorderClass
        }
      >
        <div className={'pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl ' + glowClass} />
        <div className="relative flex flex-col items-center gap-4">
          <div className={'relative h-28 w-28 overflow-hidden rounded-full border-2 bg-white/5 ' + accentBorderClass}>
            {profile.avatarUrl && !avatarFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <span className={'flex h-full w-full items-center justify-center text-4xl font-black ' + accentTextClass}>
                {initial}
              </span>
            )}
          </div>

          <div>
            <p className={'text-[10px] font-black uppercase tracking-[0.3em] ' + accentTextClass}>{publicLabel}</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">{displayName}</h1>
            {profile.username && <p className="mt-1 text-sm font-semibold text-white/50">@{profile.username}</p>}
          </div>

          <span
            className={
              'inline-flex items-center gap-2 rounded-full border bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ' +
              accentBorderClass +
              ' ' +
              accentTextClass
            }
          >
            <Icon name="verified" size={12} />
            CISZU ID · {siteName}
          </span>

          <p className="max-w-sm text-xs font-semibold leading-relaxed text-white/40">
            {description ?? `Este perfil pertenece a ${siteName}. Las cuentas CISZU ID son independientes en cada web del ecosistema.`}
          </p>
        </div>
      </section>
    </div>
  );
}

export default PublicProfileView;
