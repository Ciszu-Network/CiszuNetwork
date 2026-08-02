'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Icon } from '@ciszu/ui';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { INVITE_URL, LANGS, LOGO_LOGOTIPO, type Dict, type Lang } from '@/lib/i18n';

const NAV_LINKS: { href: string; key: 'home' | 'commands' | 'status' | 'support' }[] = [
  { href: '/', key: 'home' },
  { href: '/comandos', key: 'commands' },
  { href: '/estado', key: 'status' },
  { href: '/soporte', key: 'support' },
];

interface NavbarProps {
  lang: Lang;
  dict: Dict;
}

export default function Navbar({ lang, dict }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const setTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    root.classList.toggle('dark', next === 'dark');
    document.cookie = `ciszubot_theme=${next}; path=/; max-age=31536000`;
  };

  const setLang = (code: Lang) => {
    document.cookie = `ciszubot_lang=${code}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const linkCls = (href: string) =>
    `relative flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(href)
        ? 'bg-brand-400/10 text-brand-600 dark:text-brand-300'
        : 'text-muted hover:text-ink dark:hover:text-ink'
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-bg/85 backdrop-blur-xl border-b border-border">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center h-[60px] gap-2">
          <Link href="/" className="flex items-center gap-3 shrink-0 group cursor-pointer">
            <Image
              src={resolveAssetPath(LOGO_LOGOTIPO)}
              alt="CiszuBot"
              width={132}
              height={26}
              className="h-[26px] w-auto group-hover:opacity-90 transition-opacity"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-1 ml-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkCls(link.href)}>
                {dict.nav[link.key]}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button
              onClick={setTheme}
              className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface border border-border transition-all active:scale-95"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              <Icon name="moon" size={18} className="hidden dark:block" />
              <Icon name="sun" size={18} className="dark:hidden" />
            </button>

            <div className="hidden sm:flex items-center rounded-lg border border-border overflow-hidden">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-2.5 py-1.5 text-xs font-bold tracking-wide transition-colors ${
                    lang === l.code
                      ? 'bg-brand-400/15 text-brand-600 dark:text-brand-300'
                      : 'text-muted hover:text-ink'
                  }`}
                  aria-pressed={lang === l.code}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold btn-discord"
            >
              <Icon name="discord" size={16} className="[&>g]:fill-current" />
              <span>{dict.nav.invite}</span>
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-muted hover:text-ink border border-border hover:bg-surface transition-all active:scale-95"
              aria-label="Menu"
            >
              {menuOpen ? <Icon name="close" size={20} /> : <Icon name="menu" size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-bg/95 backdrop-blur-2xl px-4 py-3 animate-fade-in-down">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm text-muted hover:text-ink hover:bg-surface transition-all"
            >
              {dict.nav[link.key]}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-3 py-1.5 text-xs font-bold ${
                    lang === l.code
                      ? 'bg-brand-400/15 text-brand-600 dark:text-brand-300'
                      : 'text-muted'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold btn-discord"
            >
              <Icon name="discord" size={16} className="[&>g]:fill-current" />
              <span>{dict.nav.invite}</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
