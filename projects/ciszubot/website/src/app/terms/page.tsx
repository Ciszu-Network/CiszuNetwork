'use client';

import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import { useClientI18n } from '@/hooks/useClientI18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import { PREMIUM_COPY } from '@/lib/premiumContent';
import { SupportPolicy } from '@ciszu/ui';

export default function TermsPage() {
  const { dict: t, lang } = useClientI18n();
  const c = PREMIUM_COPY[lang.startsWith('en') ? 'en' : 'es'];

  return (
    <>
      <LegalPage dict={t} kind="terms" title={t.footer.terms} />
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5 text-sm text-white/60">
          <h2 className="font-header text-sm font-black uppercase tracking-widest text-rose-300">{c.refundTitle}</h2>
          <p className="mt-2">{c.refundBody}</p>
          <p className="mt-2">{c.termsBody}</p>
          <Link href="/premium" className="mt-3 inline-flex text-xs font-bold text-rose-200 underline">
            {c.termsLink}
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 pb-10">
        <div className="rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 p-5 text-sm text-white/60">
          <h2 className="font-header text-sm font-black uppercase tracking-widest text-neon-cyan">Telemetría</h2>
          <p className="mt-2">
            CiszuBot registra eventos técnicos de uso (comandos, servidores, versión, errores y estado del bot) para seguridad, soporte y mejora del servicio. Las webs del ecosistema registran eventos de uso y dispositivo; el launcher y la web permiten desactivar la telemetría opcional, mientras que instaladores, desinstaladores y eventos operativos del bot son necesarios. No se venden datos personales. Consulta la Política de Privacidad para finalidad, retención y derechos.
          </p>
        </div>
      </section>      <div className="mx-auto max-w-3xl px-4 pb-10">
        <SupportPolicy mode="support" siteName="CiszuBot" lang={lang.startsWith('en') ? 'en' : 'es'} />
      </div>
      <QuickDocks />
    </>
  );
}

