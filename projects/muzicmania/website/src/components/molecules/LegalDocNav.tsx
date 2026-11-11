'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LEGAL_LINKS } from '@/config/navigation';

export default function LegalDocNav({ className = '' }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Documentos legales"
      className={`rounded-[2rem] border border-white/5 bg-doc-dark p-6 md:p-8 ${className}`}
    >
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-pink">Documentos legales</p>
          <p className="mt-1 text-xs font-bold text-gray-400">Términos, privacidad, reglas y licencia vigentes.</p>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-500">Actualizado 10 nov 2026</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {LEGAL_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] transition-all ${
                active
                  ? 'border-neon-pink/60 bg-neon-pink/15 text-neon-pink'
                  : 'border-white/5 text-gray-400 hover:border-neon-pink/40 hover:bg-neon-pink/10 hover:text-white'
              }`}
            >
              <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{link.icon}</span>
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
