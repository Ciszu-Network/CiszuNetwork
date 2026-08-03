import React from 'react';

export const I = {
  home: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  info: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/></svg>,
  contact: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  team: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  close: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18m0-12 12 12"/></svg>,
  menu: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
};

export const NAV_LINKS = [
  { name: 'Inicio', href: '/', icon: I.home },
  { name: 'Info', href: '/about', icon: I.info },
  { name: 'Equipo', href: '/team', icon: I.team },
  { name: 'Contacto', href: '/contact', icon: I.contact },
];

export const FOOTER_NAV = [
  {
    title: 'Ciszu Network',
    links: [
      { name: 'Inicio', href: '/', icon: I.home },
      { name: 'Sobre Nosotros', href: '/about', icon: I.info },
      { name: 'Equipo', href: '/team', icon: I.team },
      { name: 'Contacto', href: '/contact', icon: I.contact },
    ],
  },
  {
    title: 'Información',
    links: [
      { name: 'FAQ', href: '/faq', icon: I.info },
      { name: 'Políticas', href: '/policies', icon: I.info },
      { name: 'Guías', href: '/guidelines', icon: I.info },
      { name: 'Soporte', href: '/support', icon: I.contact },
    ],
  },
];
