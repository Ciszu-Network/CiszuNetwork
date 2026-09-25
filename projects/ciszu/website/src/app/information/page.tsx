import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  Icon,
  InfoHero,
  InfoLinkGrid,
  InfoCardGrid,
  InfoAccordion,
  InfoSteps,
  InfoCtaRow,
  type InfoTheme,
  type InfoLinkGroup,
  type InfoCardItem,
  type InfoAccordionItem,
  type InfoStepGroup,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import ColorSwatches, { type ColorSwatch } from '@/components/molecules/ColorSwatches';
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

// Rutas reales de los logos en el CDN (mismas que usan navbar, footer y home).
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

const FILE_FORMATS = [
  {
    ext: '.svg',
    title: 'Vector web',
    body: 'Formato preferente para logos e iconos: escala sin pérdida, trazo nítido y color editable por CSS.',
  },
  {
    ext: '.png',
    title: 'Raster con transparencia',
    body: 'Entrega para avatares, aplicaciones e insignias donde el vector no es viable.',
  },
  {
    ext: '.ai',
    title: 'Fuente editable',
    body: 'Archivo maestro de Adobe Illustrator. Vive dentro del proyecto y no se distribuye públicamente.',
  },
];

const MISSION_VISION: InfoCardItem[] = [
  {
    icon: 'target',
    title: 'Misión',
    body: 'Democratizar la tecnología de alto rendimiento: crear soluciones digitales accesibles, escalables y con un diseño de primer nivel, desde Latinoamérica para el mundo. Cada proyecto del ecosistema existe para resolver un problema real con la máxima calidad.',
  },
  {
    icon: 'globe',
    title: 'Visión',
    body: 'Ser el referente de innovación digital de la región: un ecosistema de productos conectados por una misma identidad que inspire a creadores y usuarios, y que demuestre que se puede construir tecnología de clase mundial desde Venezuela.',
  },
];

const GENERAL_GOALS: InfoCardItem[] = [
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

const SPECIFIC_GOALS: InfoCardItem[] = [
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

const IDEOLOGY: InfoCardItem[] = [
  {
    icon: 'globe',
    title: 'Open Web',
    body: 'Tecnología accesible desde cualquier dispositivo y navegador, sin barreras de entrada ni dependencia de una sola plataforma.',
  },
  {
    icon: 'lock',
    title: 'Privacy First',
    body: 'Privacidad por diseño: datos mínimos, políticas claras y control del usuario sobre lo que comparte.',
  },
  {
    icon: 'star',
    title: 'Calidad de marca',
    body: 'La estética es funcionalidad: cada píxel y cada línea de código forman parte de la misma identidad.',
  },
  {
    icon: 'heart',
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

/** Stack real declarado en `package.json` de la web + servicios del ecosistema. */
const TECH_STACK: InfoCardItem[] = [
  {
    icon: 'rocket',
    title: 'Next.js 15',
    body: 'Framework de las 4 webs: App Router, server components y renderizado optimizado para SEO.',
  },
  {
    icon: 'monitor',
    title: 'React 19',
    body: 'Base de la interfaz: componentes reutilizables, hooks y el modelo de interacción de todo el ecosistema.',
  },
  {
    icon: 'security',
    title: 'TypeScript',
    body: 'Tipado estricto de punta a punta para evitar errores en producción y sostener el código a escala.',
  },
  {
    icon: 'palette',
    title: 'Tailwind CSS 4',
    body: 'Sistema de estilos atómico con tokens propios de marca: brand, neones, superficies y tipografía.',
  },
  {
    icon: 'server',
    title: 'Supabase',
    body: 'Postgres con Row Level Security, autenticación CISZU ID, Storage y el CDN que sirve los assets.',
  },
  {
    icon: 'globe',
    title: 'Vercel',
    body: 'Edge network y despliegues continuos de cada web desde el repositorio de GitHub.',
  },
  {
    icon: 'settings',
    title: 'Zustand',
    body: 'Estado global ligero del cliente: preferencias, tema, idioma y UI compartida entre páginas.',
  },
  {
    icon: 'chart-bar',
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

function SectionHeading({ icon, title, kicker }: { icon: string; title: string; kicker?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${THEME.accentBg} ${THEME.accent}`}
        >
          <Icon name={icon} size={18} />
        </span>
        <h2 className="text-xl md:text-2xl font-header font-black uppercase tracking-tight text-white">
          {title}
        </h2>
      </div>
      {kicker ? (
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-2 ml-12">{kicker}</p>
      ) : null}
    </div>
  );
}

export default function InformationPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-screen-xl mx-auto space-y-16">
        <InfoHero
          icon="info"
          title="Information"
          kicker="Branding & Identidad"
          subtitle={`Manual visual y mapa completo de ${CISZU_NETWORK.name}: quiénes somos, cómo se ve la marca y dónde vive cada sección del ecosistema.`}
          theme={THEME}
        />

        {/* ── Identidad visual ─────────────────────────────────────────── */}
        <section>
          <SectionHeading icon="info" title="Identidad Visual" kicker="Isotipo · Logotipo · Composición" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <article className={`p-6 md:p-8 rounded-2xl border ${THEME.border} ${THEME.card}`}>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-28 h-28 shrink-0 flex items-center justify-center">
                  <Image
                    src={assetResolver.resolve(LOGO_ISOTYPE)}
                    alt="Isotipo de Ciszu Network"
                    width={112}
                    height={116}
                    className="object-contain drop-shadow-brand"
                  />
                </div>
                <div className="space-y-3 text-center sm:text-left">
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

            <article className={`p-6 md:p-8 rounded-2xl border ${THEME.border} ${THEME.card}`}>
              <div className="flex flex-col items-center gap-6">
                <div className="w-full max-w-sm">
                  <Image
                    src={assetResolver.resolve(LOGO_WORDMARK)}
                    alt="Logotipo de Ciszu Network"
                    width={356}
                    height={108}
                    className="w-full h-auto"
                  />
                </div>
                <div className="space-y-3 text-center">
                  <h3 className="font-header font-bold text-white text-lg">Logotipo</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Lettering propio de «Ciszu» con trazo continuo, punto sobre la i y nodo verde terminal.
                    Su versión simple se usa en la navbar y su versión completa encabeza la portada.
                  </p>
                </div>
              </div>
            </article>
          </div>

          <article className={`mt-5 p-6 md:p-10 rounded-2xl border ${THEME.border} ${THEME.card}`}>
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="w-full max-w-md shrink-0">
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
        <section>
          <SectionHeading
            icon="palette"
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
        <section>
          <SectionHeading icon="file-text" title="Formatos de Archivo" kicker="Entrega y fuente de los assets de marca" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FILE_FORMATS.map((format) => (
              <article key={format.ext} className={`p-6 rounded-2xl border ${THEME.border} ${THEME.card}`}>
                <code className={`inline-block px-3 py-1 rounded-lg text-sm font-black tracking-wider mb-4 ${THEME.accentBg} ${THEME.accent}`}>
                  {format.ext}
                </code>
                <h3 className="font-header font-bold text-white mb-2">{format.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{format.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/40 leading-relaxed max-w-3xl">
            Los logos se publican hoy en .svg, .png y .ai. Las derivadas optimizadas .webp / .avif se
            reservan para multimedia raster y se generarán cuando el asset lo requiera.
          </p>
        </section>

        {/* ── Misión y visión ─────────────────────────────────────────── */}
        <InfoCardGrid title="Misión y Visión" items={MISSION_VISION} theme={THEME} columns={2} />

        {/* ── Objetivos ───────────────────────────────────────────────── */}
        <div className="space-y-12">
          <InfoCardGrid title="Objetivos Generales" items={GENERAL_GOALS} theme={THEME} columns={2} />
          <InfoCardGrid title="Objetivos Específicos" items={SPECIFIC_GOALS} theme={THEME} columns={2} />
        </div>

        {/* ── Ideología ───────────────────────────────────────────────── */}
        <InfoCardGrid title="Ideología" items={IDEOLOGY} theme={THEME} columns={4} />

        {/* ── Filosofía ───────────────────────────────────────────────── */}
        <section>
          <SectionHeading icon="moon" title="Filosofía" kicker="El código es el lienzo" />
          <div className={`p-6 md:p-10 rounded-2xl border ${THEME.border} ${THEME.card} mb-6`}>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4">
              Tagline oficial · {CISZU_NETWORK.name}
            </p>
            <blockquote className={`text-2xl md:text-4xl font-header font-black uppercase leading-tight bg-gradient-to-r bg-clip-text text-transparent ${THEME.gradient}`}>
              Bright Future Promised
            </blockquote>
            <p className="text-sm text-white/60 leading-relaxed mt-4 max-w-3xl">
              Un futuro brillante no se promete: se construye. Cada web, cada bot y cada juego del
              ecosistema es una línea más de esa promesa.
            </p>
          </div>
          <InfoAccordion items={PHILOSOPHY} theme={THEME} />
        </section>

        {/* ── Librería de iconos ──────────────────────────────────────── */}
        <section>
          <SectionHeading
            icon="star"
            title="Librería de Iconos Maestra"
            kicker={`Selección de ${ICON_LIBRARY.length} iconos del registro inline de @ciszu/ui`}
          />
          <div className={`p-5 rounded-2xl border ${THEME.border} ${THEME.card}`}>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {ICON_LIBRARY.map((item) => (
                <div
                  key={item.name}
                  title={item.name}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-black/30 hover:border-brand/40 transition-all"
                >
                  <span className="text-white/70 group-hover:text-brand-light transition-colors">
                    <Icon name={item.name} size={24} />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/70 text-center leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ecosistema tecnológico ──────────────────────────────────── */}
        <InfoCardGrid
          title="Ecosistema Tecnológico"
          items={TECH_STACK}
          theme={THEME}
          columns={4}
        />

        {/* ── Explora el proyecto ─────────────────────────────────────── */}
        <section>
          <SectionHeading icon="globe" title="Explora el Proyecto" kicker="Todas las secciones del ecosistema" />
          <InfoLinkGrid groups={GROUPS} theme={THEME} />
        </section>

        {/* ── Orígenes & arquitectura ─────────────────────────────────── */}
        <section>
          <SectionHeading
            icon="server"
            title="Orígenes & Arquitectura"
            kicker="Monorepo · Paquetes · Datos · Despliegue"
          />
          <InfoSteps steps={ARCHITECTURE_STEPS} theme={THEME} />

          <Link
            href="/team"
            className={`mt-6 flex flex-col sm:flex-row items-center gap-5 p-6 rounded-2xl border transition-all group ${THEME.border} ${THEME.card} hover:border-brand/40`}
          >
            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${THEME.accentBg} ${THEME.accent}`}>
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
      </div>

      <QuickDocks />
    </div>
  );
}
