'use client';

import React from 'react';
import { INVITE_MARKER } from './InviteThanksModal';

interface Props extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick' | 'href'> {
  href: string;
}

/**
 * Enlace de invitación del bot: antes de abrir Discord marca en localStorage
 * la lista actual de servidores del bot, para que `InviteThanksModal` pueda
 * detectar el servidor NUEVO al volver al dashboard.
 */
export default function InviteLink({ href, children, ...rest }: Props) {
  const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    let before: string[] = [];
    try {
      const res = await fetch('/api/dashboard/bot-guilds', { cache: 'no-store' });
      const json = (await res.json()) as { guilds?: { id: string }[] };
      before = (json.guilds ?? []).map((g) => g.id);
    } catch {
      before = [];
    }
    try {
      localStorage.setItem(INVITE_MARKER, JSON.stringify({ ts: Date.now(), before }));
    } catch {
      /* sin storage */
    }
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}
