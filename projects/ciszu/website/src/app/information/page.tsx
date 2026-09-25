import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  Icon,
  InfoHero,
  InfoLinkGrid,
  InfoAccordion,
  InfoSteps,
  InfoCtaRow,
  ScrollSpy,
  type InfoTheme,
  type InfoLinkGroup,
  type InfoAccordionItem,
  type InfoStepGroup,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import ColorSwatches, { type ColorSwatch } from '@/components/molecules/ColorSwatches';
import IconShowcase from './IconShowcase';
import { CISZU_NETWORK, GITHUB_REPO } from '@/config/site';

export const metadata: Metadata = {
  title: 'Ciszu Network | INFORMATION',
  description:
    'Branding completo de Ciszu Network: identidad visual, colorología, iconografía, ecosistema tecnológico, misión, visión y todas las secciones del ecosistema.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

/** Acentos reales de la paleta de la web (`globals.scss`). */
const ACCENTS = {
  brand: {
    text: 'text-brand-light',
    bg: 'bg-brand/10',
    border: 'border-brand/40',
    bar: 'bg-brand-light',
    glow: 'bg-brand/25',
  },
  blue: {
    text: 'text-neon-blue',
    bg: 'bg-neon-blue/10',
    border: 'border-neon-blue/40',
    bar: 'bg-neon-blue',
    glow: 'bg-neon-blue/25',
  },
  cyan: {
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/40',
    bar: 'bg-neon-cyan',
    glow: 'bg-neon-cyan/25',
  },
  pink: {
    text: 'text-neon-pink',
    bg: 'bg-neon-pink/10',
    border: 'border-neon-pink/40',
    bar: 'bg-neon-pink',
    glow: 'bg-neon-pink/25',
  },
  purple: {
    text: 'text-neon-purple',
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/40',
    bar: 'bg-neon-purple',
    glow: 'bg-neon-purple/25',
  },
  green: {
    text: 'text-neon-green',
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/40',
    bar: 'bg-neon-green',
    glow: 'bg-neon-green/25',
  },
} as const;

type AccentKey = keyof typeof ACCENTS;

/** Rutas reales de los logos en el CDN (mismas que usan navbar, footer y home). */
const LOGO_ISOTYPE =
  'projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg';
const LOGO_WORDMARK =
  'projects/ciszu/content/logos/images/outline/logotype/color/ciszu_logotipo_outline_zcolor_cwhite_short.svg';
const LOGO_MASTER =
  'projects/ciszu/content/logos/images/outline/logotype/gradient/color/ciszu_logotipo_outline_zcolor_cwhite_full.svg';
const LOGO_TAGLINE = 'projects/ciszu/content/logos/images/outline/tagline/tagline_white.svg';

/** Tokens reales de `globals.scss` (paleta de marca y neones). */
const BRAND_COLORS: ColorSwatch[] = [
  { name: 'Brand', hex: '#233F92', role: 'Color principal del logo y la marca' },
  { name: 'Brand Light', hex: '#3A6BF0', role: 'Hover, enlaces y estados activos' },
  { name: 'Brand Accent', hex: '#4A7DFF', role: 'Acentos de interfaz y realces' },
  { name: 'Brand Dark', hex: '#1A2E6B', role: 'Fondos, gradientes y profundidad' },
  { name: 'Neon Blue', hex: '#59B4FF', role: 'Bordes, glows y enlaces vivos' },
  { name: 'Neon Cyan', hex: '#68CFFF', role: 'Glow cyan y gradientes' },
  { name: 'Neon Pink', hex: '#FF33CC', role: 'Acento creativo y highlights' },
  { name: 'Neon Purple', hex: '#4800FF', role: 'Violeta de profundidad' },
];

/** Métricas reales del ecosistema (AGENTS.md / documentación). */
const HERO_STATS = [
  { value: '4', label: 'Webs Next.js', sub: 'Deploys en Vercel' },
  { value: '7', label: 'Paquetes', sub: 'Compartidos en el monorepo' },
  { value: '62', label: 'Documentos', sub: 'Fuente de verdad técnica' },
  { value: '100%', label: 'Open source', sub: 'Repositorio público' },
];

const FILE_FORMATS: Array<{
  ext: string;
  icon: string;
  accent: AccentKey;
  title: string;
  body: string;
}> = [
  {
    ext: '.svg',
    icon: 'star',
    accent: 'brand',
    title: 'Vector web',
    body: 'Formato preferente para logos e iconos: escala sin pérdida, trazo nítido y color editable por CSS.',
  },
  {
    ext: '.png',
    icon: 'camera',
    accent: 'cyan',
    title: 'Raster con transparencia',
    body: 'Entrega para avatares, aplicaciones e insignias donde el vector no es viable.',
  },
  {
    ext: '.ai',
    icon: 'edit',
    accent: 'pink',
    title: 'Fuente editable',
    body: 'Archivo maestro de Adobe Illustrator. Vive dentro del proyecto y no se distribuye públicamente.',
  },
];

const MISSION_VISION: Array<{
  icon: string;
  accent: AccentKey;
  title: string;
  body: string;
}> = [
  {
    icon: 'target',
    accent: 'pink',
    title: 'Misión',
    body: 'Democratizar la tecnología de alto rendimiento: crear soluciones digitales accesibles, escalables y con un diseño de primer nivel, desde Latinoamérica para el mundo. Cada proyecto del ecosistema existe para resolver un problema real con la máxima calidad.',
  },
  {
    icon: 'globe',
    accent: 'blue',
    title: 'Visión',
    body: 'Ser el referente de innovación digital de la región: un ecosistema de productos conectados por una misma identidad que inspire a creadores y usuarios, y que demuestre que se puede construir tecnología de clase mundial desde Venezuela.',
  },
];

const GENERAL_GOALS: Array<{ icon: string; title: string; body: string }> = [
  {
    icon: 'globe',
    title: 'Consolidar el ecosistema',
    body: 'Coordinar las 4 webs, el bot de Discord y el juego bajo una misma identidad, estándares de calidad y experiencia de usuario.',
  },
  {
    icon: 'team',
    title: 'Hacer crecer la comunidad',
    body: 'Convertir Ciszugamens, MuzicMania y CiszuBot en puntos de encuentro activos, con soporte, eventos y canales de feedback reales.',
  },
  {
    icon: 'palette',
    title: 'Estandarizar la marca',
    body: 'Aplicar el mismo sistema visual en todas las webs y canales oficiales: paleta, tipografía, iconografía y componentes compartidos.',
  },
  {
    icon: 'policies',
    title: 'Documentar y abrir',
    body: 'Mantener documentación viva y código abierto para que el ecosistema sea auditable, mantenible y replicable.',
  },
];

const SPECIFIC_GOALS: Array<{ icon: string; title: string; body: string }> = [
  {
    icon: 'server',
    title: 'Monorepo sin duplicación',
    body: 'Un solo repositorio pnpm con paquetes compartidos (@ciszu/ui, @ciszunetwork/db, utils, cdn, email, payments y config) que se propagan a todo el ecosistema.',
  },
  {
    icon: 'lock',
    title: 'Datos seguros por defecto',
    body: 'Postgres con Row Level Security en toda tabla nueva, autenticación CISZU ID compartida y Storage CDN para los assets.',
  },
  {
    icon: 'rocket',
    title: 'CI/CD verificable',
    body: 'Deploys desde GitHub Actions hacia Vercel con lint, tests, SAST/DAST, CodeQL y auditoría de dependencias en cada cambio.',
  },
  {
    icon: 'signal',
    title: 'Rendimiento y monitoreo',
    body: 'Webs optimizadas en el edge, con errores en Sentry, analítica en PostHog y disponibilidad vigilada por UptimeRobot.',
  },
];

const IDEOLOGY: Array<{ icon: string; accent: AccentKey; title: string; body: string }> = [
  {
    icon: 'globe',
    accent: 'cyan',
    title: 'Open Web',
    body: 'Tecnología accesible desde cualquier dispositivo y navegador, sin barreras de entrada ni dependencia de una sola plataforma.',
  },
  {
    icon: 'lock',
    accent: 'purple',
    title: 'Privacy First',
    body: 'Privacidad por diseño: datos mínimos, políticas claras y control del usuario sobre lo que comparte.',
  },
  {
    icon: 'star',
    accent: 'pink',
    title: 'Calidad de marca',
    body: 'La estética es funcionalidad: cada píxel y cada línea de código forman parte de la misma identidad.',
  },
  {
    icon: 'heart',
    accent: 'green',
    title: 'Comunidad primero',
    body: 'El feedback de la comunidad —changelog, reviews, stats y reportes— guía la evolución del ecosistema.',
  },
];

const PHILOSOPHY: InfoAccordionItem[] = [
  {
    q: '¿Qué significa "Bright Future Promised"?',
    a: 'Es la promesa de marca de Ciszu Network: un futuro brillante no se declara, se construye. El tagline acompaña al logo y resume el compromiso de entregar tecnología con propósito.',
  },
  {
    q: '¿Cómo se construye cada proyecto?',
    a: 'Con principios DRY, KISS y SOLID, documentación como fuente de verdad y verificación con build real antes de dar una tarea por terminada.',
  },
  {
    q: '¿Cómo conviven diseño y código?',
    a: 'En un mismo sistema: tokens de color y tipografía, una librería UI compartida entre las webs y componentes que se prueban antes de publicarse.',
  },
  {
    q: '¿Cómo se mide el éxito?',
    a: 'Con señales reales: métricas de rendimiento, disponibilidad, errores en producción y el feedback que la comunidad deja en reviews, stats y feedback.',
  },
];

/** Iconos registrados del subset inline de `@ciszu/ui` (selección de muestra). */
const ICON_LIBRARY: { name: string; label: string }[] = [
  { name: 'home', label: 'Inicio' },
  { name: 'search', label: 'Búsqueda' },
  { name: 'settings', label: 'Ajustes' },
  { name: 'menu', label: 'Menú' },
  { name: 'user', label: 'Usuario' },
  { name: 'team', label: 'Equipo' },
  { name: 'heart', label: 'Favorito' },
  { name: 'star', label: 'Destacado' },
  { name: 'check', label: 'Verificado' },
  { name: 'download', label: 'Descarga' },
  { name: 'calendar', label: 'Calendario' },
  { name: 'clock', label: 'Tiempo' },
  { name: 'info', label: 'Información' },
  { name: 'help', label: 'Ayuda' },
  { name: 'mail', label: 'Correo' },
  { name: 'globe', label: 'Global' },
  { name: 'lock', label: 'Candado' },
  { name: 'copy', label: 'Copiar' },
  { name: 'message', label: 'Mensaje' },
  { name: 'support', label: 'Soporte' },
  { name: 'policies', label: 'Lineamientos' },
  { name: 'file-text', label: 'Documento' },
  { name: 'history', label: 'Historial' },
  { name: 'chart-bar', label: 'Métricas' },
  { name: 'certificates', label: 'Certificado' },
  { name: 'music', label: 'Música' },
  { name: 'rocket', label: 'Lanzamiento' },
  { name: 'shield', label: 'Escudo' },
];

/**
 * Stack real declarado en `package.json` de la web + servicios del ecosistema.
 * `brand` apunta a los SVG de marca reales del repo (`shared/icons/svg/**`,
 * servidos por el CDN con fallback local); `icon` es el icono registrado de
 * `@ciszu/ui` que se usa cuando no hay marca disponible.
 */
const TECH_STACK: Array<{
  icon: string;
  brand?: string;
  brandStyle?: 'filled' | 'outline';
  role: string;
  accent: AccentKey;
  title: string;
  body: string;
}> = [
  {
    icon: 'rocket',
    brand: 'ri-filled-nextjs',
    brandStyle: 'filled',
    role: 'Framework',
    accent: 'brand',
    title: 'Next.js 15',
    body: 'Framework de las 4 webs: App Router, server components y renderizado optimizado para SEO.',
  },
  {
    icon: 'monitor',
    brand: 'ri-filled-reactjs',
    brandStyle: 'filled',
    role: 'UI Library',
    accent: 'cyan',
    title: 'React 19',
    body: 'Base de la interfaz: componentes reutilizables, hooks y el modelo de interacción de todo el ecosistema.',
  },
  {
    icon: 'security',
    brand: 'ri-typescript',
    brandStyle: 'outline',
    role: 'Type System',
    accent: 'blue',
    title: 'TypeScript',
    body: 'Tipado estricto de punta a punta para evitar errores en producción y sostener el código a escala.',
  },
  {
    icon: 'palette',
    brand: 'ri-filled-tailwind-css',
    brandStyle: 'filled',
    role: 'Styling',
    accent: 'cyan',
    title: 'Tailwind CSS 4',
    body: 'Sistema de estilos atómico con tokens propios de marca: brand, neones, superficies y tipografía.',
  },
  {
    icon: 'server',
    brand: 'ri-filled-supabase',
    brandStyle: 'filled',
    role: 'Backend',
    accent: 'green',
    title: 'Supabase',
    body: 'Postgres con Row Level Security, autenticación CISZU ID, Storage y el CDN que sirve los assets.',
  },
  {
    icon: 'globe',
    role: 'Deploy',
    accent: 'purple',
    title: 'Vercel',
    body: 'Edge network y despliegues continuos de cada web desde el repositorio de GitHub.',
  },
  {
    icon: 'settings',
    role: 'State',
    accent: 'pink',
    title: 'Zustand',
    body: 'Estado global ligero del cliente: preferencias, tema, idioma y UI compartida entre páginas.',
  },
  {
    icon: 'chart-bar',
    role: 'Observability',
    accent: 'blue',
    title: 'Sentry + PostHog',
    body: 'Observabilidad y analítica: errores en tiempo real y métricas de uso para decidir con datos.',
  },
];

const GROUPS: InfoLinkGroup[] = [
  {
    title: 'Producto',
    items: [
      { name: 'Inicio', href: '/', icon: 'home', desc: 'Portada, ecosistema y proyectos destacados' },
      { name: 'Productos', href: '/projects', icon: 'rocket', desc: 'CiszuGamens, CiszuBot, MuzicMania y más' },
      { name: 'Courses', href: '/courses', icon: 'certificates', desc: 'Formación y recursos de aprendizaje' },
      { name: 'Documentación', href: '/documentation', icon: 'policies', desc: 'Guías técnicas y referencia de API' },
      { name: 'Descargas', href: '/downloads', icon: 'download', desc: 'Aplicaciones de escritorio (PDWA)' },
    ],
  },
  {
    title: 'Contenido',
    items: [
      { name: 'Changelog', href: '/changelog', icon: 'history', desc: 'Historial de cambios por versión' },
      { name: 'Reviews', href: '/reviews', icon: 'star', desc: 'Reseñas verificadas de la comunidad' },
      { name: 'Stats', href: '/stats', icon: 'signal', desc: 'Métricas de proyectos e infraestructura' },
      { name: 'Foro', href: '/forum', icon: 'comment', desc: 'Debates, anuncios y comunidad' },
      { name: 'Feedback', href: '/feedback', icon: 'message', desc: 'Reportes de bugs y sugerencias' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { name: 'Centro de ayuda', href: '/help', icon: 'help', desc: 'Guías paso a paso y solución de problemas' },
      { name: 'FAQ', href: '/faq', icon: 'faq', desc: 'Preguntas frecuentes' },
      { name: 'Soporte', href: '/support', icon: 'support', desc: 'Abrir una incidencia técnica' },
      { name: 'Contacto', href: '/contact', icon: 'mail', desc: 'Correo, WhatsApp y redes oficiales' },
    ],
  },
  {
    title: 'Institucional',
    items: [
      { name: 'Sobre nosotros', href: '/about', icon: 'info', desc: 'Misión, visión y compañía' },
      { name: 'Equipo', href: '/team', icon: 'team', desc: 'Quién está detrás de Ciszu Network' },
      { name: 'Créditos', href: '/credits', icon: 'file-text', desc: 'Equipo y tecnologías base' },
      { name: 'Donar', href: '/donate', icon: 'heart', desc: 'Apoya el desarrollo del ecosistema' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { name: 'Lineamientos', href: '/guidelines', icon: 'policies', desc: 'Uso, identidad y estándares' },
      { name: 'Reglas', href: '/rules', icon: 'shield', desc: 'Convivencia y uso aceptable' },
      { name: 'Licencia', href: '/license', icon: 'certificates', desc: 'MIT y propiedad intelectual' },
      { name: 'Política', href: '/policy', icon: 'lock', desc: 'Privacidad, datos y cookies' },
    ],
  },
];

const ARCHITECTURE_STEPS: InfoStepGroup[] = [
  {
    title: 'Monorepo pnpm',
    body: 'Un único repositorio reúne las 4 webs Next.js, el bot de Discord, el juego y los paquetes; turbo orquesta dev, build, lint y tests.',
  },
  {
    title: 'Paquetes compartidos',
    body: '@ciszu/ui (componentes), @ciszunetwork/db (esquemas Drizzle), utils, cdn, email, payments y config: un cambio se propaga a todo el ecosistema sin duplicar código.',
  },
  {
    title: 'Datos y autenticación',
    body: 'Supabase centraliza Postgres con RLS, el auth CISZU ID compartido y el Storage CDN que sirve logos, iconos y multimedia.',
  },
  {
    title: 'Despliegue continuo',
    body: 'GitHub Actions ejecuta CI (lint, tests, SAST, DAST, CodeQL) y publica cada web en Vercel; UptimeRobot y Sentry vigilan la producción.',
  },
];

const SECTIONS = [
  { id: 'hero', label: 'Inicio' },
  { id: 'identidad', label: 'Identidad' },
  { id: 'color', label: 'Colorología' },
  { id: 'formatos', label: 'Formatos' },
  { id: 'proposito', label: 'Misión' },
  { id: 'objetivos', label: 'Objetivos' },
  { id: 'ideologia', label: 'Ideología' },
  { id: 'filosofia', label: 'Filosofía' },
  { id: 'libreria', label: 'Iconos' },
  { id: 'tecnologias', label: 'Tecnologías' },
  { id: 'explora', label: 'Explora' },
  { id: 'origenes', label: 'Orígenes' },
];

function SectionHeading({
  icon,
  title,
  kicker,
  accent,
}: {
  icon: string;
  title: string;
  kicker?: string;
  accent: AccentKey;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="mb-6 flex items-start gap-4">
      <span
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 hover:scale-110 ${a.bg} ${a.border} ${a.text}`}
      >
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <h2 className="text-xl font-header font-black uppercase tracking-tight text-white md:text-2xl">
          {title}
        </h2>
        {kicker ? (
          <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.3em] ${a.text} opacity-80`}>
            {kicker}
          </p>
        ) : null}
        <span className={`mt-3 block h-0.5 w-14 rounded-full ${a.bar}`} />
      </div>
    </div>
  );
}

export default function InformationPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <ScrollSpy items={SECTIONS} />

      <PageReveal className="relative mx-auto max-w-screen-xl space-y-16">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section id="hero" className="scroll-mt-28">
          <InfoHero
            icon="info"
            title="Information"
            kicker="Branding & Identidad"
            subtitle={`Manual visual y mapa completo de ${CISZU_NETWORK.name}: quiénes somos, cómo se ve la marca y dónde vive cada sección del ecosistema.`}
            theme={THEME}
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-brand/5"
              >
                <p className="font-header text-3xl font-black text-brand-light transition-transform duration-300 group-hover:scale-110">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-black uppercase text-white">{stat.label}</p>
                <p className="mt-0.5 text-[10px] font-bold text-white/40">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Identidad visual ─────────────────────────────────────────── */}
        <section id="identidad" className="scroll-mt-28">
          <SectionHeading
            icon="info"
            accent="brand"
            title="Identidad Visual"
            kicker="Isotipo · Logotipo · Composición"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 md:p-8">
              <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/15 blur-3xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0" />
              <div className="relative flex flex-col items-center gap-6 sm:flex-row">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30 p-3 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={assetResolver.resolve(LOGO_ISOTYPE)}
                    alt="Isotipo de Ciszu Network"
                    width={112}
                    height={116}
                    className="object-contain drop-shadow-brand"
                  />
                </div>
                <div className="space-y-3 text-center sm:text-left">
                  <span className="inline-flex rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-light">
                    Unidad mínima
                  </span>
                  <h3 className="font-header font-bold text-white text-lg">Isotipo</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Engranaje en degradado azul con una «C» en perspectiva, acento cian y un nodo verde de
                    estado. Es la unidad mínima de la marca y la pieza que identifica al ecosistema en
                    tamaños pequeños.
                  </p>
                  <ul className="space-y-1 text-left">
                    <li className="text-[11px] text-white/40">
                      · Variantes outline / not-outline y combinaciones z/c para cualquier fondo.
                    </li>
                    <li className="text-[11px] text-white/40">
                      · Prohibido deformarlo, rotarlo o recolorearlo fuera de la paleta oficial.
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/40 md:p-8">
              <div className="relative flex flex-col items-center gap-6">
                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/30 p-5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <Image
                    src={assetResolver.resolve(LOGO_WORDMARK)}
                    alt="Logotipo de Ciszu Network"
                    width={356}
                    height={108}
                    className="w-full h-auto"
                  />
                </div>
                <div className="space-y-3 text-center">
                  <span className="inline-flex rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-neon-cyan">
                    Lettering propio
                  </span>
                  <h3 className="font-header font-bold text-white text-lg">Logotipo</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Lettering propio de «Ciszu» con trazo continuo, punto sobre la i y nodo verde terminal.
                    Su versión simple se usa en la navbar y su versión completa encabeza la portada.
                  </p>
                </div>
              </div>
            </article>
          </div>

          <article className="group relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-brand/40 md:p-10">
            <span className="pointer-events-none absolute right-6 top-4 select-none font-header text-6xl font-black uppercase tracking-tighter text-white/5 md:text-8xl">
              Brand
            </span>
            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
              <div className="w-full max-w-md shrink-0 rounded-2xl border border-white/10 bg-black/30 p-5 transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src={assetResolver.resolve(LOGO_MASTER)}
                  alt="Composición maestra de Ciszu Network: isotipo y logotipo"
                  width={342}
                  height={183}
                  className="w-full h-auto drop-shadow-brand"
                />
              </div>
              <div className="space-y-4 text-center lg:text-left">
                <h3 className="font-header font-bold text-white text-lg">Composición Maestra</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Isotipo y logotipo unidos en una sola pieza. Es la versión canónica para portadas,
                  presentaciones y piezas donde la marca debe leerse completa.
                </p>
                <div className="flex justify-center lg:justify-start">
                  <Image
                    src={assetResolver.resolve(LOGO_TAGLINE) + '?v=2'}
                    alt={CISZU_NETWORK.tagline}
                    width={285}
                    height={22}
                    className="h-auto opacity-90"
                  />
                </div>
                <ul className="space-y-1">
                  <li className="text-[11px] text-white/40">
                    · Espacio de seguridad: un módulo del isotipo alrededor de la composición.
                  </li>
                  <li className="text-[11px] text-white/40">
                    · Usar siempre la variante con contraste válido sobre el fondo destino.
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </section>

        {/* ── Colorología ──────────────────────────────────────────────── */}
        <section id="color" className="scroll-mt-28">
          <SectionHeading
            icon="palette"
            accent="pink"
            title="Colorología de Marca"
            kicker="Haz click en un swatch para copiar su HEX"
          />
          <ColorSwatches colors={BRAND_COLORS} />
          <p className="mt-5 text-xs text-white/40 leading-relaxed max-w-3xl">
            Regla de marca: neón cian y rosa sobre negro. El azul brand sostiene la identidad, el cian
            aporta energía tecnológica, el rosa creatividad y el negro la base inmersiva de todo el
            ecosistema.
          </p>
        </section>

        {/* ── Formatos de archivo ─────────────────────────────────────── */}
        <section id="formatos" className="scroll-mt-28">
          <SectionHeading
            icon="file-text"
            accent="green"
            title="Formatos de Archivo"
            kicker="Entrega y fuente de los assets de marca"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {FILE_FORMATS.map((format) => {
              const a = ACCENTS[format.accent];
              return (
                <article
                  key={format.ext}
                  className={`group rounded-2xl border bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.07] ${a.border}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${a.bg} ${a.border} ${a.text} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon name={format.icon} size={20} />
                    </span>
                    <code
                      className={`rounded-lg border px-2.5 py-1 text-xs font-black tracking-wider ${a.bg} ${a.border} ${a.text}`}
                    >
                      {format.ext}
                    </code>
                  </div>
                  <h3 className="mt-4 font-header font-bold text-white">{format.title}</h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{format.body}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-white/40 leading-relaxed max-w-3xl">
            Los logos se publican hoy en .svg, .png y .ai. Las derivadas optimizadas .webp / .avif se
            reservan para multimedia raster y se generarán cuando el asset lo requiera.
          </p>
        </section>

        {/* ── Misión y visión ─────────────────────────────────────────── */}
        <section id="proposito" className="scroll-mt-28">
          <SectionHeading icon="target" accent="cyan" title="Propósito" kicker="Misión · Visión" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {MISSION_VISION.map((item) => {
              const a = ACCENTS[item.accent];
              return (
                <article
                  key={item.title}
                  className={`group relative overflow-hidden rounded-2xl border bg-white/5 p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07] ${a.border}`}
                >
                  <span
                    className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl ${a.glow}`}
                  />
                  <div className="relative flex items-center gap-3">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${a.bg} ${a.border} ${a.text} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon name={item.icon} size={22} />
                    </span>
                    <h3 className={`font-header text-lg font-black uppercase ${a.text}`}>{item.title}</h3>
                  </div>
                  <p className="relative mt-4 text-sm leading-relaxed text-white/60">{item.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Objetivos ───────────────────────────────────────────────── */}
        <section id="objetivos" className="scroll-mt-28 space-y-8">
          <SectionHeading icon="chart-bar" accent="blue" title="Objetivos" kicker="Macro estrategia · Micro táctica" />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-neon-blue/25 bg-white/5 p-7">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-blue/30 bg-neon-blue/10 text-neon-blue">
                  <Icon name="target" size={20} />
                </span>
                <div>
                  <h3 className="font-header text-lg font-black uppercase text-neon-blue">
                    Objetivos Generales
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    Macro estrategia
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {GENERAL_GOALS.map((goal, index) => (
                  <li
                    key={goal.title}
                    className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neon-blue/30 bg-neon-blue/10 text-[10px] font-black text-neon-blue transition-transform duration-300 group-hover:scale-110">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-black uppercase text-white">{goal.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/60">{goal.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-neon-cyan/25 bg-white/5 p-7">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan">
                  <Icon name="settings" size={20} />
                </span>
                <div>
                  <h3 className="font-header text-lg font-black uppercase text-neon-cyan">
                    Objetivos Específicos
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    Micro táctica
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {SPECIFIC_GOALS.map((goal, index) => (
                  <li
                    key={goal.title}
                    className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
                  >
                    <code className="mt-0.5 shrink-0 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-1.5 py-0.5 text-[9px] font-black text-neon-cyan transition-transform duration-300 group-hover:scale-110">
                      {String(index + 1).padStart(2, '0')}
                    </code>
                    <div>
                      <p className="text-xs font-black uppercase text-white">{goal.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/60">{goal.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Ideología ───────────────────────────────────────────────── */}
        <section id="ideologia" className="scroll-mt-28">
          <SectionHeading icon="heart" accent="purple" title="Ideología" kicker="Los cuatro pilares" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {IDEOLOGY.map((pillar) => {
              const a = ACCENTS[pillar.accent];
              return (
                <article
                  key={pillar.title}
                  className={`group relative overflow-hidden rounded-2xl border bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.07] ${a.border}`}
                >
                  <span
                    className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${a.glow}`}
                  />
                  <span
                    className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${a.bg} ${a.border} ${a.text} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon name={pillar.icon} size={24} />
                  </span>
                  <h3 className={`relative mt-4 font-header font-black uppercase ${a.text}`}>
                    {pillar.title}
                  </h3>
                  <p className="relative mt-2 text-xs leading-relaxed text-white/60">{pillar.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Filosofía ───────────────────────────────────────────────── */}
        <section id="filosofia" className="scroll-mt-28">
          <SectionHeading icon="moon" accent="cyan" title="Filosofía" kicker="El código es el lienzo" />
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                  Tagline oficial · {CISZU_NETWORK.name}
                </p>
                <blockquote
                  className={`bg-gradient-to-r bg-clip-text font-header text-2xl font-black uppercase leading-tight text-transparent md:text-4xl ${THEME.gradient}`}
                >
                  Bright Future Promised
                </blockquote>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/60">
                  Un futuro brillante no se promete: se construye. Cada web, cada bot y cada juego del
                  ecosistema es una línea más de esa promesa.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {['DRY', 'KISS', 'SOLID'].map((principle, index) => (
                  <span
                    key={principle}
                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-transform duration-300 hover:scale-110 ${
                      index === 0
                        ? 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan'
                        : index === 1
                          ? 'border-neon-pink/30 bg-neon-pink/10 text-neon-pink'
                          : 'border-neon-purple/30 bg-neon-purple/10 text-neon-purple'
                    }`}
                  >
                    {principle}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <InfoAccordion items={PHILOSOPHY} theme={THEME} />
        </section>

        {/* ── Librería de iconos ──────────────────────────────────────── */}
        <section id="libreria" className="scroll-mt-28">
          <SectionHeading
            icon="star"
            accent="brand"
            title="Librería de Iconos Maestra"
            kicker={`Selección de ${ICON_LIBRARY.length} iconos del registro inline de @ciszu/ui`}
          />
          <IconShowcase
            icons={ICON_LIBRARY}
            accent={ACCENTS.brand.text}
            accentBg={ACCENTS.brand.bg}
            accentBorder={ACCENTS.brand.border}
            glow={ACCENTS.brand.glow}
          />
        </section>

        {/* ── Ecosistema tecnológico ──────────────────────────────────── */}
        <section id="tecnologias" className="scroll-mt-28">
          <SectionHeading
            icon="server"
            accent="blue"
            title="Ecosistema Tecnológico"
            kicker="La infraestructura que sostiene el ecosistema"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TECH_STACK.map((tech) => {
              const a = ACCENTS[tech.accent];
              return (
                <article
                  key={tech.title}
                  className={`group relative overflow-hidden rounded-2xl border bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.07] ${a.border}`}
                >
                  <span
                    className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${a.glow}`}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1020] shadow-inner transition-transform duration-300 group-hover:scale-110">
                      {tech.brand ? (
                        <Icon
                          name={tech.brand}
                          style={tech.brandStyle}
                          size={30}
                          className="invert"
                        />
                      ) : (
                        <Icon name={tech.icon} size={26} className={a.text} />
                      )}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${a.bg} ${a.border} ${a.text}`}
                    >
                      {tech.role}
                    </span>
                  </div>
                  <h3 className="relative mt-5 font-header font-bold text-white">{tech.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-white/60">{tech.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Explora el proyecto ─────────────────────────────────────── */}
        <section id="explora" className="scroll-mt-28">
          <SectionHeading icon="globe" accent="cyan" title="Explora el Proyecto" kicker="Todas las secciones del ecosistema" />
          <InfoLinkGrid groups={GROUPS} theme={THEME} />
        </section>

        {/* ── Orígenes & arquitectura ─────────────────────────────────── */}
        <section id="origenes" className="scroll-mt-28">
          <SectionHeading
            icon="server"
            accent="brand"
            title="Orígenes & Arquitectura"
            kicker="Monorepo · Paquetes · Datos · Despliegue"
          />
          <InfoSteps steps={ARCHITECTURE_STEPS} theme={THEME} />

          <Link
            href="/team"
            className={`mt-6 flex flex-col items-center gap-5 rounded-2xl border p-6 transition-all duration-300 group hover:-translate-y-1 ${THEME.border} ${THEME.card} hover:border-brand/40`}
          >
            <span
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${THEME.accentBg} ${THEME.accent}`}
            >
              <Icon name="team" size={24} />
            </span>
            <span className="flex-1 text-center sm:text-left">
              <span className="block font-header font-bold text-white mb-1">Orígenes</span>
              <span className="block text-sm text-white/60 leading-relaxed">
                Detrás de cada proyecto está {CISZU_NETWORK.name}, liderado por su CEO y fundador. Conoce
                al equipo y la historia del ecosistema.
              </span>
            </span>
            <span className={`text-sm font-bold shrink-0 ${THEME.accent} group-hover:underline`}>
              Conocer al equipo →
            </span>
          </Link>
        </section>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Ver proyectos', href: '/projects', icon: 'rocket' },
            { label: 'Conoce al equipo', href: '/team', icon: 'team', variant: 'ghost' },
            { label: 'Repositorio GitHub', href: GITHUB_REPO, icon: 'external', external: true, variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
