import React from 'react';

// ── Icons Dictionary (SVGs Inline) ─────────────────────────────────────────
export const I = {
  home:        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  play:        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  leaderboard: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  stats:       <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  changelog:   <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M16.13 7.07l2.12-2.12" strokeLinecap="round"/><path d="M12 2a10 10 0 1 0 10 10" stroke="currentColor"/><path d="M22 2v5h-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  info:        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/></svg>,
  contact:     <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  support:     <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  search:      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  close:       <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18m0-12 12 12"/></svg>,
  menu:        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
  chevron:     (open: boolean) => <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6"/></svg>,
  login:       <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  register:    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  team:        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  docs:        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  help:        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>,
  faq:         <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  guidelines:  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  rules:       <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  license:     <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>,
  policy:      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  terms:       <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  reviews:     <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  music:       <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  user:        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  handshake:   <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/></svg>,
  download:    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  feedback:    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>,
};

// ── Shared Routing Definitions ─────────────────────────────────────────────

export const MAIN_NAV_LINKS = [
  { name: 'Home',        href: '/',            icon: I.home,        hideCls: 'hidden min-[300px]:flex', keywords: ['inicio', 'index', 'main', 'muzicmania', 'logo'] },
  { name: 'Play',        href: '/play',         icon: I.play,        hideCls: 'hidden min-[350px]:flex', keywords: ['jugar', 'game', 'start', 'empezar', 'partida'] },
  { name: 'Library',     href: '/library',      icon: I.music,       hideCls: 'hidden min-[400px]:flex', keywords: ['biblioteca', 'songs', 'canciones', 'musica', 'music', 'tracks', 'maps'] },
  { name: 'Leaderboard', href: '/leaderboard',  icon: I.leaderboard, hideCls: 'hidden min-[450px]:flex', keywords: ['ranking', 'top', 'leaderboard', 'clasificacion', 'mundial', 'global'] },
  { name: 'Stats',       href: '/stats',        icon: I.stats,       hideCls: 'hidden min-[500px]:flex', keywords: ['estadisticas', 'stats', 'perfil', 'analisis', 'rendimiento', 'server'] },
  { name: 'Forum',       href: '/forum',        icon: I.faq,         hideCls: 'hidden min-[550px]:flex', keywords: ['foro', 'comunidad', 'community', 'discusión', 'discussion', 'posts'] },
  { name: 'Changelog',   href: '/changelog',    icon: I.changelog,   hideCls: 'hidden min-[600px]:flex', keywords: ['cambios', 'updates', 'actualizaciones', 'historial', 'news', 'noticias'] },
  { name: 'Reviews',     href: '/reviews',      icon: I.reviews,     hideCls: 'hidden min-[650px]:flex', keywords: ['reseñas', 'criticas', 'opiniones', 'feedback', 'estrellas'] },
  { name: 'Download',    href: '/download',     icon: I.download,    hideCls: 'hidden min-[700px]:flex', keywords: ['descargas', 'download', 'pc', 'windows', 'ejecutable', 'tauri', 'app'] },
  { name: 'Feedback',    href: '/feedback',     icon: I.feedback,    hideCls: 'hidden min-[780px]:flex', keywords: ['feedback', 'opiniones', 'sugerencias', 'reporte', 'bug', 'quejas'] },
];

export const COMMUNITY_LINKS = [
  { name: 'Team',          href: '/team',          icon: I.team,       keywords: ['equipo', 'staff', 'creadores', 'desarrolladores', 'members', 'miembros'] },
  { name: 'Credits',       href: '/credits',       icon: I.handshake,  keywords: ['creditos', 'contribuciones', 'agradecimientos', 'handshake', 'legal'] },
  { name: 'Contact',       href: '/contact',       icon: I.contact,    keywords: ['contacto', 'email', 'mensaje', 'soporte', 'support', 'hablar'] },
  { name: 'Support',        href: '/support',       icon: I.support,    keywords: ['ayuda', 'soporte', 'support', 'tecnico', 'technical', 'asistencia'] },
];

export const LEGAL_LINKS = [
  { name: 'Guidelines',    href: '/guidelines',    icon: I.guidelines, keywords: ['lineamientos', 'comportamiento', 'guia', 'guide', 'normas'] },
  { name: 'Rules',         href: '/rules',         icon: I.rules,      keywords: ['reglas', 'prohibido', 'fairplay', 'normas', 'bans'] },
  { name: 'License',       href: '/license',       icon: I.license,    keywords: ['licencia', 'legal', 'mit', 'software', 'copyleft'] },
  { name: 'Policy',        href: '/policy',        icon: I.policy,     keywords: ['politica', 'privacidad', 'privacy', 'datos', 'seguridad'] },
  { name: 'Terms',         href: '/terms',         icon: I.terms,      keywords: ['terminos', 'condiciones', 'contrato', 'legal', 'tos'] },
];

export const GENERAL_INFO_LINKS = [
  { name: 'Documentation', href: '/documentation', icon: I.docs,       keywords: ['documentacion', 'docs', 'guia', 'desarrollo', 'api'] },
  { name: 'Help',          href: '/help',          icon: I.help,       keywords: ['ayuda', 'help', 'centro', 'preguntas', 'guias', 'tutorial'] },
  { name: 'FAQ',           href: '/faq',           icon: I.faq,        keywords: ['faq', 'preguntas', 'frecuentes', 'respuestas', 'dudas'] },
  { name: 'Information',   href: '/information',   icon: I.info,       keywords: ['informacion', 'info', 'acerca', 'about', 'proyecto', 'ciszu'] },
];

// Unified collection suitable for Global Search & Reference
export const ALL_PAGES = [
  ...MAIN_NAV_LINKS,
  ...COMMUNITY_LINKS,
  ...LEGAL_LINKS,
  ...GENERAL_INFO_LINKS,
  { name: 'Login',         href: '/login',          icon: I.login,     keywords: ['ingresar', 'entrar', 'acceder', 'account', 'cuenta'] },
  { name: 'Register',      href: '/register',       icon: I.register,  keywords: ['registrarse', 'unirse', 'crear cuenta', 'join', 'signup'] },
].filter((v, i, a) => a.findIndex(t => (t.href === v.href)) === i); // Unique deduplication

// Footer Specific Compilation
export const FOOTER_NAV = [
  {
    title: 'Navegación',
    titleClass: 'text-neon-cyan drop-shadow-neon-cyan',
    links: MAIN_NAV_LINKS
  },
  {
    title: 'Comunidad & Ayuda',
    titleClass: 'text-neon-purple drop-shadow-neon-purple',
    links: [ ...COMMUNITY_LINKS, ...GENERAL_INFO_LINKS ]
  },
  {
    title: 'Legal',
    titleClass: 'text-neon-pink drop-shadow-neon-pink',
    links: LEGAL_LINKS
  }
];

// ── Context Variables (Langs & Socials) ───────────────────────────────────

export const LANGS = [
  { code: 'ES-LA', label: 'Español (Latam)', flag: (
    <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner">
      <rect width="512" height="170.6" fill="#ffcc00"/>
      <rect width="512" height="170.6" y="170.6" fill="#003399"/>
      <rect width="512" height="170.6" y="341.2" fill="#cf142b"/>
      <g fill="#fff" transform="translate(256,230) scale(4)">
        <circle cx="0" cy="0" r="18" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2,2"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-45) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-22.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(22.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(45) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-67.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(67.5) translate(0,-18) scale(0.4)"/>
      </g>
    </svg>
  ) },
  { code: 'ES-ES', label: 'Español (España)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#ad1519"/><rect width="512" height="300" y="106" fill="#fabd00"/><circle cx="150" cy="256" r="50" fill="#ad1519"/></svg> },
  { code: 'EN-US', label: 'English (US)', flag: (
    <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner font-sans">
      <rect width="512" height="512" fill="#bd3d44"/>
      <rect width="512" height="36" y="36.5" fill="#fff"/><rect width="512" height="36" y="109.5" fill="#fff"/><rect width="512" height="36" y="182.5" fill="#fff"/><rect width="512" height="36" y="255.5" fill="#fff"/><rect width="512" height="36" y="328.5" fill="#fff"/><rect width="512" height="36" y="401.5" fill="#fff"/><rect width="512" height="36" y="474.5" fill="#fff"/>
      <rect width="240" height="260" fill="#192f5d"/>
      <g fill="#fff">
        <circle cx="30" cy="35" r="5"/><circle cx="70" cy="35" r="5"/><circle cx="110" cy="35" r="5"/><circle cx="150" cy="35" r="5"/><circle cx="190" cy="35" r="5"/>
        <circle cx="50" cy="65" r="5"/><circle cx="90" cy="65" r="5"/><circle cx="130" cy="65" r="5"/><circle cx="170" cy="65" r="5"/><circle cx="210" cy="65" r="5"/>
        <circle cx="30" cy="95" r="5"/><circle cx="70" cy="95" r="5"/><circle cx="110" cy="95" r="5"/><circle cx="150" cy="95" r="5"/><circle cx="190" cy="95" r="5"/>
        <circle cx="50" cy="125" r="5"/><circle cx="90" cy="125" r="5"/><circle cx="130" cy="125" r="5"/><circle cx="170" cy="125" r="5"/><circle cx="210" cy="125" r="5"/>
        <circle cx="30" cy="155" r="5"/><circle cx="70" cy="155" r="5"/><circle cx="110" cy="155" r="5"/><circle cx="150" cy="155" r="5"/><circle cx="190" cy="155" r="5"/>
      </g>
    </svg>
  ) },
  { code: 'EN-UK', label: 'English (UK)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#012169"/><path d="M0 0l512 512M512 0L0 512" stroke="#fff" strokeWidth="60"/><path d="M0 0l512 512M512 0L0 512" stroke="#cf142b" strokeWidth="30"/><rect width="512" height="100" y="206" fill="#fff"/><rect width="100" height="512" x="206" fill="#fff"/><rect width="512" height="60" y="226" fill="#cf142b"/><rect width="60" height="512" x="226" fill="#cf142b"/></svg> },
  { code: 'PT', label: 'Português (Brasil)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#009c3b"/><path d="M256 70l186 186-186 186L70 256z" fill="#ffdf00"/><circle cx="256" cy="256" r="100" fill="#002776"/></svg> },
  { code: 'FR', label: 'Français', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#002395"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ed2939"/></svg> },
  { code: 'IT', label: 'Italiano', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#009246"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ce2b37"/></svg> },
  { code: 'DE', label: 'Deutsch', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#000"/><rect width="512" height="170" y="171" fill="#d00"/><rect width="512" height="171" y="341" fill="#ffce00"/></svg> },
  { code: 'RU', label: 'Русский', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#fff"/><rect width="512" height="170" y="171" fill="#0039a6"/><rect width="512" height="171" y="341" fill="#d52b1e"/></svg> },
  { code: 'JA', label: '日本語 (Japanese)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="120" fill="#bc002d"/></svg> },
  { code: 'KO', label: '한국어 (Korean)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="80" fill="#cd2e3a"/><path d="M256 176a80 80 0 0 0 0 160c44 0 44-80 80-80s36 80 80 80" fill="#0047a0"/></svg> }];

export const SOCIALS = [
  {
    name: 'Discord',
    href: 'https://discord.gg/W3kMtMMj6E',
    textCol: 'text-[#5865F2]',
    borderCol: 'border-[#5865F2]/40',
    bgCol: 'bg-[#5865F2]/10',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-[#5865F2] hover:to-[#7289da]',
    hoverColor: 'hover:text-white',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>,
  },
  {
    name: 'Twitter / X',
    href: 'https://x.com/CiszukoAntony',
    textCol: 'text-gray-300',
    borderCol: 'border-white/30',
    bgCol: 'bg-white/5',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-gray-800 hover:to-gray-600',
    hoverColor: 'hover:text-white',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.733-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@CiszuNetwork',
    textCol: 'text-[#FF0000]',
    borderCol: 'border-[#FF0000]/40',
    bgCol: 'bg-[#FF0000]/10',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-[#FF0000] hover:to-[#cc0000]',
    hoverColor: 'hover:text-white',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/ciszunetwork/',
    textCol: 'text-[#E1306C]',
    borderCol: 'border-[#E1306C]/40',
    bgCol: 'bg-[#E1306C]/10',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888]',
    hoverColor: 'hover:text-white',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@ciszunetwork',
    textCol: 'text-[#00F2FE]',
    borderCol: 'border-[#00F2FE]/40',
    bgCol: 'bg-[#00F2FE]/10',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-black hover:to-zinc-900',
    hoverColor: 'hover:text-white',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.26 8.26 0 004.83 1.55V6.87a4.85 4.85 0 01-1.06-.18z"/></svg>,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61572023767657',
    textCol: 'text-[#1877F2]',
    borderCol: 'border-[#1877F2]/40',
    bgCol: 'bg-[#1877F2]/10',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-[#1877F2] hover:to-[#145dba]',
    hoverColor: 'hover:text-white',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/Ciszu-Network',
    textCol: 'text-gray-300',
    borderCol: 'border-white/30',
    bgCol: 'bg-white/5',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-gray-700 hover:to-black',
    hoverColor: 'hover:text-white',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
  },
];
