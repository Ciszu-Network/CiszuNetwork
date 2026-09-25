'use client';

import { Icon, useToast } from '@ciszu/ui';
import { INVITE_URL } from '@/lib/i18n';

/**
 * Botón de invitación del bot con agradecimiento al usuario.
 *
 * Abre la autorización oficial de Discord en una pestaña nueva y, al pulsar,
 * muestra un toast de éxito para confirmar que la invitación se está
 * completando. Es el único punto con interactividad de `/invite`: el resto de
 * la página es contenido estático servido desde el diccionario.
 */
export default function InviteButton({
  label,
  thanks,
  note,
}: {
  label: string;
  thanks: string;
  note: string;
}) {
  const { toast } = useToast();

  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => toast(thanks, 'success')}
        className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-8 py-4 font-header text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_30px_-8px_rgba(0,212,255,0.8)] transition-all duration-300 hover:scale-105 hover:shadow-[0_14px_40px_-8px_rgba(255,51,204,0.8)] active:scale-95"
      >
        <Icon
          name="discord"
          size={20}
          className="[&>g]:fill-current transition-transform duration-300 group-hover:scale-110"
        />
        {label}
      </a>
      <p className="max-w-md text-center text-xs text-muted">{note}</p>
    </div>
  );
}
