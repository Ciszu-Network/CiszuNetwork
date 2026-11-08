'use client';

import { useState } from 'react';
import { Icon } from './Icon';

export interface PublicProfileData {
  id: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  country?: string | null;
  languages?: string[] | null;
  role?: string | null;
  createdAt?: string | null;
  emailVerified?: boolean | null;
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
  const role = (profile.role ?? '').toLowerCase();
  const roleStyle = role === 'owner'
    ? 'border-amber-300/40 bg-amber-400/10 text-amber-200'
    : role === 'admin'
      ? 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200'
      : role === 'mod'
        ? 'border-orange-400/40 bg-orange-400/10 text-orange-200'
        : 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200';
  const isNew = Boolean(profile.createdAt) && Date.now() - Date.parse(profile.createdAt as string) < 3 * 24 * 60 * 60 * 1000;
  const languages = Array.isArray(profile.languages) ? profile.languages : [];

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
        {profile.bannerUrl && <img src={profile.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
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
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {['owner', 'admin', 'mod', 'bot'].includes(role) && <span className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${roleStyle}`}>{role.toUpperCase()}</span>}
              {profile.emailVerified && <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-300">VERIFICADO</span>}
              {isNew && <span className="rounded-full border border-lime-400/40 bg-lime-400/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-lime-300">NUEVO</span>}
              {profile.country && <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white/55">{profile.country}</span>}
              {languages.map((language) => <span key={language} className="rounded-full border border-neon-purple/30 bg-neon-purple/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-neon-purple">{language}</span>)}
            </div>
            {(profile.bio || description) && <p className="mt-3 max-w-sm whitespace-pre-line text-xs font-semibold leading-relaxed text-white/45">{profile.bio || description || ''}</p>}
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
        </div>
      </section>
    </div>
  );
}

export default PublicProfileView;
