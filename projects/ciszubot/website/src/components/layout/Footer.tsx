'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@ciszu/ui';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import {
  CISZUKO_ANTONY,
  CISZU_NETWORK,
  DISCORD_SERVER,
  GITHUB_ORG,
  INVITE_URL,
  LOGO_LOGOTIPO,
  YOUTUBE,
  BOT_PREFIX,
  TOP_GG_BOT,
  DISCORD_BOT_LIST_BOT,
  DISBOARD_SERVER,
  type Dict,
  type Lang,
} from '@/lib/i18n';

const IcoDiscord = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.013.043.031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const IcoGithub = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const IcoYoutube = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const SOCIALS = [
  { Ico: IcoDiscord, href: DISCORD_SERVER, label: 'Discord', glow: 'hover:text-[#5865F2] hover:shadow-[0_0_15px_rgba(88,101,242,0.5)]' },
  { Ico: IcoGithub, href: GITHUB_ORG, label: 'GitHub', glow: 'hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]' },
  { Ico: IcoYoutube, href: YOUTUBE, label: 'YouTube', glow: 'hover:text-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.5)]' },
];

interface FooterProps {
  lang: Lang;
  dict: Dict;
}

export default function Footer({ lang, dict }: FooterProps) {
  return (
    <footer className="relative bg-[#0a0a14] border-t border-white/10 pt-12 pb-6 px-4 md:px-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[length:200%_auto] animate-gradient-x bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />
      <div className="max-w-screen-xl mx-auto relative">
        <div className="flex flex-col md:flex-row gap-10 pb-10">
          <div className="md:w-80 shrink-0">
            <Link href="/" className="flex flex-col items-start gap-4 group">
              <Image
                src={resolveAssetPath(LOGO_LOGOTIPO)}
                alt="CiszuBot"
                width={160}
                height={32}
                className="h-[32px] w-auto group-hover:drop-shadow-[0_0_15px_rgba(0,212,255,0.8)] transition-all duration-300"
              />
            </Link>
            <p className="mt-4 text-sm text-muted">
              {dict.nav.invite} · <code className="text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-1.5 py-0.5 rounded font-bold">{BOT_PREFIX}</code>
            </p>

            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white shadow-[0_8px_22px_-8px_rgba(88,101,242,0.8)] transition-all hover:scale-105 hover:shadow-[0_10px_28px_-8px_rgba(0,212,255,0.8)] active:scale-95"
            >
              <IcoDiscord />
              {dict.nav.invite}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M7 17L17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <div className="flex gap-2.5 mt-6">
              {SOCIALS.map(({ Ico, href, label, glow }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted transition-all duration-200 hover:scale-105 ${glow}`}
                >
                  <Ico />
                </a>
              ))}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-faint mb-1">
                {dict.footer.explore}
              </h4>
              {[
                { href: '/', label: dict.nav.home, icon: 'home' },
                { href: '/comandos', label: dict.nav.commands, icon: 'gamepad' },
                { href: '/estado', label: dict.nav.status, icon: 'clock' },
                { href: '/soporte', label: dict.nav.support, icon: 'support' },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center gap-2 text-sm text-muted hover:text-neon-blue transition-colors">
                  <Icon name={l.icon} size={14} className="opacity-60" />
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-faint mb-1">
                {dict.footer.projects}
              </h4>
              <a href={CISZU_NETWORK} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-neon-blue transition-colors">
                Ciszu Network
              </a>
              <a href={CISZUKO_ANTONY} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-neon-blue transition-colors">
                Ciszuko Antony
              </a>
              <a href={GITHUB_ORG} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-neon-blue transition-colors">
                GitHub
              </a>
            </div>

            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-faint mb-1">
                {dict.footer.bot}
              </h4>
              <span className="text-sm text-muted">
                {dict.footer.prefix}: <code className="text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-1.5 py-0.5 rounded">{BOT_PREFIX}</code>
              </span>
              <span className="text-sm text-muted">
                Slash: <code className="text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-1.5 py-0.5 rounded">/comandos</code>
              </span>
              <span className="text-sm text-muted">20 comandos · 4 categorías</span>
              <span className="text-sm text-muted">7 listas de bots</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-faint mb-1">
                {dict.footer.legal}
              </h4>
              <Link href="/terminos" className="text-sm text-muted hover:text-neon-blue transition-colors">
                {dict.footer.terms}
              </Link>
              <Link href="/privacidad" className="text-sm text-muted hover:text-neon-blue transition-colors">
                {dict.footer.privacy}
              </Link>
              <div className="flex gap-2 mt-2">
                {[
                  { href: TOP_GG_BOT, label: 'Top.gg', glow: 'hover:border-[#FF3366] hover:text-[#FF3366]' },
                  { href: DISCORD_BOT_LIST_BOT, label: 'DBL', glow: 'hover:border-neon-blue hover:text-neon-blue' },
                  { href: DISBOARD_SERVER, label: 'Disboard', glow: 'hover:border-neon-purple hover:text-neon-purple' },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-muted transition-all ${s.glow}`}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-faint">
          <p>
            © {new Date().getFullYear()}{' '}
            <a href={CISZU_NETWORK} target="_blank" rel="noopener noreferrer" className="hover:text-neon-blue transition-colors font-semibold">
              CISZU NETWORK
            </a>{' '}
            &amp; CISZUBOT. {dict.footer.rights}
          </p>
          <p>
            {dict.footer.madeBy}{' '}
            <a href={CISZUKO_ANTONY} target="_blank" rel="noopener noreferrer" className="text-neon-blue font-semibold transition-colors">
              Ciszuko Antony
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
