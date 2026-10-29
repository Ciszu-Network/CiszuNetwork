'use client';

import Link from 'next/link';

export interface SupportPolicyProps {
  mode: 'contact' | 'support';
  siteName: string;
  lang?: 'es' | 'en';
  limit?: number;
  className?: string;
}

const COPY = {
  es: {
    contactTitle: 'Cómo funciona el contacto',
    contactBody:
      'El formulario de contacto no crea un ticket ni se guarda en la base de datos. Se envía directamente por email al equipo de {site} y recibirás una copia con tu referencia. Si respondes a ese correo, se crea un hilo manual.',
    supportTitle: 'Cómo funciona el soporte',
    supportBody:
      'El soporte sí crea un ticket con un ID único por cuenta y website. Puedes tener hasta {limit} tickets activos a la vez. El ticket se guarda en la base de datos y recibirás una copia con su ID y enlace. El equipo responde por email; desde STAFFCON se puede cerrar como completado/no completado o eliminar. Cuando un ticket se cierra, los correos posteriores se ignoran.',
    terms: 'Leer términos y condiciones',
    privacy: 'Privacidad',
  },
  en: {
    contactTitle: 'How contact works',
    contactBody:
      'The contact form does not create a ticket or store data in the database. It is sent directly by email to the {site} team and you will receive a copy with your reference. Replying to that email starts a manual thread.',
    supportTitle: 'How support works',
    supportBody:
      'Support creates a ticket with a unique ID per account and website. You can have up to {limit} active tickets at once. The ticket is stored in the database and you will receive a copy with its ID and link. The team replies by email; STAFFCON can close it as completed/not completed or delete it. Once a ticket is closed, later emails are ignored.',
    terms: 'Read terms and conditions',
    privacy: 'Privacy',
  },
};

export function SupportPolicy({ mode, siteName, lang = 'es', limit = 3, className = '' }: SupportPolicyProps) {
  const t = COPY[lang];
  const isContact = mode === 'contact';
  return (
    <div className={'rounded-2xl border border-white/10 bg-black/30 p-5 text-xs leading-relaxed text-white/55 ' + className}>
      <p className="font-header text-[11px] font-black uppercase tracking-widest text-white/80">
        {isContact ? t.contactTitle : t.supportTitle}
      </p>
      <p className="mt-2">
        {(isContact ? t.contactBody : t.supportBody).replace('{site}', siteName).replace('{limit}', String(limit))}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link href="/terms" className="font-bold text-neon-blue hover:underline">
          {t.terms}
        </Link>
        <Link href="/privacy" className="font-bold text-white/50 hover:text-white hover:underline">
          {t.privacy}
        </Link>
      </div>
    </div>
  );
}

export default SupportPolicy;
