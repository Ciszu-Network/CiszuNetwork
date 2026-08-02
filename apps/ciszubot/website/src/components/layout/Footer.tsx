'use client';

import Link from 'next/link';
import Image from 'next/image';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import {
  CISZUKO_ANTONY,
  CISZU_NETWORK,
  DISCORD_SERVER,
  GITHUB_ORG,
  LOGO_ISOTIPO_CIRCLE,
  YOUTUBE,
  BOT_PREFIX,
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
  { Ico: IcoDiscord, href: DISCORD_SERVER, label: 'Discord', hover: 'hover:text-[#5865F2]' },
  { Ico: IcoGithub, href: GITHUB_ORG, label: 'GitHub', hover: 'hover:text-ink' },
  { Ico: IcoYoutube, href: YOUTUBE, label: 'YouTube', hover: 'hover:text-[#FF0000]' },
];

interface FooterProps {
  lang: Lang;
  dict: Dict;
}

export default function Footer({ lang, dict }: FooterProps) {
  return (
    <footer className="bg-surface border-t border-border pt-10 pb-6 px-4 md:px-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 pb-10">
          <div className="md:w-72 shrink-0">
            <Link href="/" className="flex flex-col items-start gap-4 group">
              <span className="w-16 h-16 rounded-full border border-border bg-card flex items-center justify-center overflow-hidden">
                <Image
                  src={resolveAssetPath(LOGO_ISOTIPO_CIRCLE)}
                  alt="CiszuBot"
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              </span>
              <span className="text-lg font-bold text-ink">CiszuBot</span>
            </Link>
            <p className="mt-4 text-sm text-muted">
              {dict.nav.invite} · <code className="text-brand-600 dark:text-brand-300">{BOT_PREFIX}</code>
            </p>

            <div className="flex gap-2.5 mt-6">
              {SOCIALS.map(({ Ico, href, label, hover }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className={`w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted transition-all duration-200 hover:scale-105 ${hover}`}
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
              <Link href="/" className="text-sm text-muted hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                {dict.nav.home}
              </Link>
              <Link href="/comandos" className="text-sm text-muted hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                {dict.nav.commands}
              </Link>
              <Link href="/estado" className="text-sm text-muted hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                {dict.nav.status}
              </Link>
              <Link href="/soporte" className="text-sm text-muted hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                {dict.nav.support}
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-faint mb-1">
                {dict.footer.projects}
              </h4>
              <a href={CISZU_NETWORK} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                Ciszu Network
              </a>
              <a href={CISZUKO_ANTONY} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                Ciszuko Antony
              </a>
              <a href={GITHUB_ORG} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                GitHub
              </a>
            </div>

            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-faint mb-1">
                {dict.footer.bot}
              </h4>
              <span className="text-sm text-muted">
                {dict.footer.prefix}: <code className="text-brand-600 dark:text-brand-300 bg-card border border-border px-1.5 py-0.5 rounded">{BOT_PREFIX}</code>
              </span>
              <span className="text-sm text-muted">
                Slash: <code className="text-brand-600 dark:text-brand-300 bg-card border border-border px-1.5 py-0.5 rounded">/comandos</code>
              </span>
              <span className="text-sm text-muted">12 comandos · 4 categorías</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-faint mb-1">
                {dict.footer.legal}
              </h4>
              <Link href="/terminos" className="text-sm text-muted hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                {dict.footer.terms}
              </Link>
              <Link href="/privacidad" className="text-sm text-muted hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                {dict.footer.privacy}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-faint">
          <p>
            © {new Date().getFullYear()}{' '}
            <a href={CISZU_NETWORK} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 dark:hover:text-brand-300 transition-colors font-semibold">
              CISZU NETWORK
            </a>{' '}
            &amp; CISZUBOT. {dict.footer.rights}
          </p>
          <p>
            {dict.footer.madeBy}{' '}
            <a href={CISZUKO_ANTONY} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-300 font-semibold transition-colors">
              Ciszuko Antony
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
