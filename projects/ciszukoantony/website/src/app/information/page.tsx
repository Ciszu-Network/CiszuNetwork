import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDict, parseLang } from '@/lib/i18n';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  Icon,
  InfoCardGrid,
  InfoCtaRow,
  InfoHero,
  InfoLinkGrid,
  InfoSteps,
  ScrollSpy,
  type InfoLinkGroup,
  type InfoTheme,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import ColorSwatches, { type BrandColor } from '@/components/information/ColorSwatches';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import IconShowcase from './IconShowcase';

export const metadata: Metadata = {
  title: 'Information | Ciszuko Antony',
  description:
    'Identidad visual, colorología, iconografía y stack tecnológico del portfolio de Ciszuko Antony: la marca personal de Ciszu Network en una sola página.',
};

const ISOTYPE = assetResolver.resolve(
  'projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png'
);
const LOGOTYPE = assetResolver.resolve(
  'projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png'
);
const CIRCLE = assetResolver.resolve(
  'projects/ciszukoantony/content/logos/images/samples/circle/circle_1_yt.png'
);

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const ink = (color: string): string =>
  `color-mix(in srgb, ${color} var(--brand-ink-mix, 100%), #0d1526)`;

const BRAND_COLORS: BrandColor[] = [
  { name: 'Brand', role: 'Azul institucional', hex: '#233f92', rgb: '35, 63, 146', cmyk: '76, 57, 0, 43' },
  { name: 'Brand Light', role: 'Acento claro de marca', hex: '#5a82e8', rgb: '90, 130, 232', cmyk: '61, 44, 0, 9' },
  { name: 'Brand Dark', role: 'Fondo del gradiente', hex: '#1a2f6e', rgb: '26, 47, 110', cmyk: '76, 57, 0, 57' },
  { name: 'Neon Blue', role: 'Acento primario', hex: '#3d6adf', rgb: '61, 106, 223', cmyk: '73, 52, 0, 13' },
  { name: 'Neon Pink', role: 'Contraste de marca', hex: '#ff33cc', rgb: '255, 51, 204', cmyk: '0, 80, 20, 0' },
  { name: 'Neon Purple', role: 'Acento profundo', hex: '#4800ff', rgb: '72, 0, 255', cmyk: '72, 100, 0, 0' },
  { name: 'Neon Green', role: 'Estado positivo', hex: '#00ff88', rgb: '0, 255, 136', cmyk: '100, 0, 47, 0' },
  { name: 'Neon Orange', role: 'Alertas y avisos', hex: '#ff6600', rgb: '255, 102, 0', cmyk: '0, 60, 100, 0' },
  { name: 'Neon Yellow', role: 'Destacados', hex: '#ffd900', rgb: '255, 217, 0', cmyk: '0, 15, 100, 0' },
  { name: 'Ether White', role: 'Texto sobre oscuro', hex: '#ffffff', rgb: '255, 255, 255', cmyk: '0, 0, 0, 0' },
];

const FILE_FORMATS = [
  {
    category: 'Gráficos & Marca',
    icon: 'palette',
    formats: ['.svg', '.png', '.webp', '.ai', '.psd'],
    desc: 'Isotipo, logotipo, samples y recursos de identidad visual.',
    tone: 'text-neon-blue',
    border: 'border-neon-blue/20',
  },
  {
    category: 'Video & Animación',
    icon: 'camera',
    formats: ['.mp4', '.webm', '.gif', '.wfp'],
    desc: 'Clips de marca, fondos animados y piezas para redes.',
    tone: 'text-neon-pink',
    border: 'border-neon-pink/20',
  },
  {
    category: 'Audio & Música',
    icon: 'music',
    formats: ['.mp3', '.wav', '.flac', '.ogg'],
    desc: 'Composiciones, pistas y efectos del estudio personal.',
    tone: 'text-neon-green',
    border: 'border-neon-green/20',
  },
  {
    category: 'Datos & Documentación',
    icon: 'file-text',
    formats: ['.json', '.ts', '.md', '.pdf', '.docx'],
    desc: 'Configuración, esquemas, documentación técnica y certificados.',
    tone: 'text-neon-purple',
    border: 'border-neon-purple/20',
  },
];

const MISSION_STATS = [
  { value: '1', label: 'Marca personal', sub: 'Ciszuko Antony' },
  { value: '4+', label: 'Proyectos vivos', sub: 'Web, bot, juego y comunidad' },
  { value: '100%', label: 'Autoría propia', sub: 'Código, diseño y arte' },
];

const VISION_ITEMS = [
  {
    icon: 'palette',
    title: 'Corto plazo',
    body: 'Consolidar la identidad visual del portfolio: logos, paleta y documentación de marca accesibles desde el CDN propio.',
  },
  {
    icon: 'globe',
    title: 'Medio plazo',
    body: 'Escalar el portfolio a más idiomas y dispositivos, con métricas, reseñas y contenido verificable en cada sección.',
  },
  {
    icon: 'star',
    title: 'Largo plazo',
    body: 'Convertir a Ciszuko Antony en una referencia creativa y técnica dentro y fuera del ecosistema Ciszu Network.',
  },
];

const OBJECTIVES_GENERAL = [
  'Consolidar a Ciszuko Antony como marca personal y carta de presentación oficial de Ciszu Network.',
  'Documentar cada proyecto con estándares técnicos verificables: builds, auditorías y migraciones.',
  'Publicar y mantener la identidad visual (logos, colorología y formatos) en un solo lugar.',
  'Mantener la experiencia del portfolio coherente en tema oscuro, tema claro y todos los dispositivos.',
];

const OBJECTIVES_SPECIFIC = [
  'Mantener typecheck, lint y build sin errores en cada entrega del portfolio.',
  'Sincronizar los certificados desde el CDN y enlazarlos con su verificador oficial.',
  'Centralizar los assets de marca con el resolver de @ciszunetwork/cdn.',
  'Documentar la identidad en esta página de Information como fuente de verdad pública.',
];

const PILLARS = [
  {
    title: 'Autoría Propia',
    icon: 'verified',
    tone: 'text-neon-blue',
    border: 'border-neon-blue/30',
    bg: 'bg-neon-blue/5',
    desc: 'Cada línea, logo y nota sale de la misma dirección creativa: Ciszuko Antony (Francisco Garcia).',
  },
  {
    title: 'Transparencia',
    icon: 'eye',
    tone: 'text-neon-green',
    border: 'border-neon-green/30',
    bg: 'bg-neon-green/5',
    desc: 'Contacto, licencias y políticas son públicas, legibles y verificables sin letra pequeña.',
  },
  {
    title: 'Mejora Continua',
    icon: 'rocket',
    tone: 'text-neon-pink',
    border: 'border-neon-pink/30',
    bg: 'bg-neon-pink/5',
    desc: 'Cada certificado, reseña y proyecto nuevo alimenta la siguiente versión del portfolio.',
  },
  {
    title: 'Comunidad',
    icon: 'team',
    tone: 'text-neon-purple',
    border: 'border-neon-purple/30',
    bg: 'bg-neon-purple/5',
    desc: 'El ecosistema se construye con quien juega, lee, escucha y usa los proyectos cada día.',
  },
];

const PHILOSOPHY = [
  {
    label: 'Precisión',
    color: '#3d6adf',
    quote: 'Cada píxel, cada token de color y cada enlace tiene una razón de ser dentro del sistema.',
  },
  {
    label: 'Coherencia',
    color: '#5a82e8',
    quote: 'La marca se reconoce igual en un isotipo, en una tarjeta de certificado o en un metadato.',
  },
  {
    label: 'Iteración',
    color: '#ff33cc',
    quote: 'Publicar, medir y mejorar: el portfolio también es un producto que evoluciona por versiones.',
  },
  {
    label: 'Detalle',
    color: '#00ff88',
    quote: 'El acabado es parte de la ingeniería: si algo se muestra al mundo, se muestra bien.',
  },
];

const ICON_LIBRARY: Array<{ name: string; label: string }> = [
  { name: 'home', label: 'Home' },
  { name: 'user', label: 'Usuario' },
  { name: 'heart', label: 'Favoritos' },
  { name: 'star', label: 'Reseñas' },
  { name: 'check', label: 'Verificado' },
  { name: 'download', label: 'Descargas' },
  { name: 'mail', label: 'Contacto' },
  { name: 'globe', label: 'Idiomas' },
  { name: 'lock', label: 'Seguridad' },
  { name: 'key', label: 'Acceso' },
  { name: 'security', label: 'Protección' },
  { name: 'certificates', label: 'Certificados' },
  { name: 'music', label: 'Música' },
  { name: 'gamepad', label: 'Proyectos' },
  { name: 'terminal', label: 'Terminal' },
  { name: 'server', label: 'Infraestructura' },
  { name: 'palette', label: 'Diseño' },
  { name: 'camera', label: 'Media' },
  { name: 'play', label: 'Contenido' },
  { name: 'gift', label: 'Recompensas' },
  { name: 'trophy', label: 'Logros' },
  { name: 'medal', label: 'Certámenes' },
  { name: 'rocket', label: 'Lanzamientos' },
  { name: 'bell', label: 'Avisos' },
];

const TECH_STACK: Array<{
  name: string;
  icon: string;
  /** SVG de marca real del repo (`shared/icons/svg/**`, CDN con fallback local). */
  brand?: string;
  brandStyle?: 'filled' | 'outline';
  tech: string;
  use: string;
  href: string;
}> = [
  {
    name: 'Next.js 15',
    icon: 'globe',
    brand: 'ri-filled-nextjs',
    brandStyle: 'filled',
    tech: 'App Router · Server Components · SEO',
    use: 'Estructura y renderizado del portfolio, metadata SSR por ruta.',
    href: 'https://nextjs.org',
  },
  {
    name: 'React 19',
    icon: 'rocket',
    brand: 'ri-filled-reactjs',
    brandStyle: 'filled',
    tech: 'Hooks · Server Actions · UI',
    use: 'Interfaz reactiva de páginas, docks y editores visuales.',
    href: 'https://react.dev',
  },
  {
    name: 'TypeScript 6',
    icon: 'terminal',
    brand: 'ri-typescript',
    brandStyle: 'outline',
    tech: 'Strict · Tipos compartidos',
    use: 'Tipado estricto en webs, paquetes compartidos y scripts.',
    href: 'https://www.typescriptlang.org',
  },
  {
    name: 'Tailwind CSS 4',
    icon: 'palette',
    brand: 'ri-filled-tailwind-css',
    brandStyle: 'filled',
    tech: 'JIT · Design tokens',
    use: 'Sistema visual neón con tema oscuro y tema claro.',
    href: 'https://tailwindcss.com',
  },
  {
    name: 'Supabase',
    icon: 'security',
    brand: 'ri-filled-supabase',
    brandStyle: 'filled',
    tech: 'Auth · Postgres · Storage · RLS',
    use: 'CISZU ID, datos, certificados y CDN de assets de marca.',
    href: 'https://supabase.com',
  },
  {
    name: 'PostgreSQL + Drizzle',
    icon: 'server',
    brand: 'ri-filled-drizzle',
    brandStyle: 'filled',
    tech: 'ORM tipado · Migraciones',
    use: 'Capa @ciszunetwork/db: esquemas y cliente de base de datos.',
    href: 'https://orm.drizzle.team',
  },
  {
    name: 'Vercel',
    icon: 'signal',
    tech: 'Edge · CI/CD',
    use: 'Despliegue continuo desde GitHub hacia producción.',
    href: 'https://vercel.com',
  },
  {
    name: 'Sentry + PostHog',
    icon: 'chart-bar',
    tech: 'Errores · Analytics',
    use: 'Observabilidad de errores, métricas y comportamiento.',
    href: 'https://sentry.io',
  },
  {
    name: 'Puck',
    icon: 'edit',
    tech: 'Editor visual · React',
    use: 'Edición visual de páginas del portfolio sobre componentes propios.',
    href: 'https://puckeditor.com',
  },
];

const HERO_STATS = [
  { value: '01', label: 'Marca personal', sub: 'Ciszuko Antony' },
  { value: '4+', label: 'Proyectos', sub: 'Web, bot, juego y comunidad' },
  { value: '62', label: 'Documentos', sub: 'Ingeniería verificable' },
  { value: '100%', label: 'Autoría propia', sub: 'Código, diseño y arte' },
];

const GROUPS: InfoLinkGroup[] = [
  {
    title: 'Producto',
    items: [
      { name: 'Home', href: '/', icon: 'home', desc: 'Portada y proyectos destacados' },
      { name: 'Projects', href: '/projects', icon: 'rocket', desc: 'Todos los proyectos de Ciszuko Antony' },
      { name: 'Portfolio', href: '/portfolio', icon: 'palette', desc: 'Galería visual de trabajos y proyectos' },
      { name: 'Curriculum', href: '/curriculum', icon: 'certificates', desc: 'Formación, experiencia y habilidades' },
      { name: 'Commissions', href: '/commissions', icon: 'money', desc: 'Servicios, proceso y términos' },
      { name: 'Certificates', href: '/certificates', icon: 'certificates', desc: 'Catálogo de certificados y logros' },
      { name: 'Documentation', href: '/documentation', icon: 'policies', desc: 'Guías técnicas y referencia' },
      { name: 'Downloads', href: '/downloads', icon: 'download', desc: 'Aplicación de escritorio (PDWA)' },
    ],
  },
  {
    title: 'Contenido',
    items: [
      { name: 'Changelog', href: '/changelog', icon: 'history', desc: 'Historial de cambios por versión' },
      { name: 'Reviews', href: '/reviews', icon: 'star', desc: 'Reseñas verificadas de la comunidad' },
      { name: 'Stats', href: '/stats', icon: 'signal', desc: 'Métricas de proyectos y audiencia' },
      { name: 'Forum', href: '/forum', icon: 'comment', desc: 'Debates y comunidad' },
      { name: 'Feedback', href: '/feedback', icon: 'message', desc: 'Reportes y sugerencias' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { name: 'Help', href: '/help', icon: 'help', desc: 'Centro de ayuda paso a paso' },
      { name: 'FAQ', href: '/faq', icon: 'faq', desc: 'Preguntas frecuentes' },
      { name: 'Support', href: '/support', icon: 'support', desc: 'Abrir una incidencia' },
      { name: 'Contact', href: '/contact', icon: 'mail', desc: 'Correo y canales oficiales' },
    ],
  },
  {
    title: 'Institucional',
    items: [
      { name: 'About', href: '/about', icon: 'info', desc: 'Quién es Ciszuko Antony' },
      { name: 'Team', href: '/team', icon: 'team', desc: 'Equipo detrás del proyecto' },
      { name: 'Créditos', href: '/credits', icon: 'file-text', desc: 'Autoría, tecnologías base y proyectos' },
      { name: 'Policies', href: '/policies', icon: 'terms', desc: 'Términos, privacidad y cookies' },
      { name: 'Donar', href: '/donate', icon: 'heart', desc: 'Apoya los proyectos' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { name: 'Guidelines', href: '/guidelines', icon: 'policies', desc: 'Uso, contenido y estándares del portfolio' },
      { name: 'Rules', href: '/rules', icon: 'shield', desc: 'Conducta y uso aceptable de la comunidad' },
      { name: 'License', href: '/license', icon: 'certificates', desc: 'Licencia MIT y propiedad intelectual' },
      { name: 'Policy', href: '/policy', icon: 'lock', desc: 'Privacidad, datos, cookies y anuncios' },
    ],
  },
];

const ORIGIN_STEPS = [
  {
    title: 'Raíces',
    body: 'Ciszuko Antony (Francisco Garcia) nace como identidad creativa dentro de Ciszu Network, el ecosistema digital fundado en Venezuela.',
  },
  {
    title: 'Construcción',
    body: 'El portfolio se levantó sobre Next.js 15, React 19 y Tailwind CSS 4, con cada asset servido desde el CDN propio del ecosistema.',
  },
  {
    title: 'Datos',
    body: 'Supabase aporta autenticación CISZU ID, Postgres, Storage y RLS; @ciszunetwork/db concentra los esquemas Drizzle compartidos.',
  },
  {
    title: 'Actualidad',
    body: 'Hoy el portfolio reúne certificados, música, proyectos y documentación bajo una misma identidad visual y una misma firma.',
  },
];

function SectionHeading({
  icon,
  title,
  kicker,
  tone,
  toneBg,
  toneBorder,
}: {
  icon: string;
  title: string;
  kicker: string;
  tone: string;
  toneBg: string;
  toneBorder: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span
        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${toneBg} ${toneBorder} ${tone}`}
      >
        <Icon name={icon} size={22} />
      </span>
      <h2 className="text-2xl md:text-4xl font-header font-black uppercase italic tracking-widest text-white">
        {title}
      </h2>
      <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${tone}`}>{kicker}</p>
    </div>
  );
}

export default async function InformationPage() {
  const lang = parseLang((await cookies()).get('ciszu_lang')?.value);
  const dict = getDict(lang);

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <ScrollSpy
        items={[
          { id: 'hero', label: 'Inicio' },
          { id: 'identidad', label: 'Identidad' },
          { id: 'color', label: 'Colorología' },
          { id: 'formatos', label: 'Formatos' },
          { id: 'mision', label: 'Misión' },
          { id: 'vision', label: 'Visión' },
          { id: 'objetivos', label: 'Objetivos' },
          { id: 'ideologia', label: 'Ideología' },
          { id: 'filosofia', label: 'Filosofía' },
          { id: 'libreria', label: 'Iconos' },
          { id: 'ecosistema', label: 'Tecnologías' },
          { id: 'explora', label: 'Explora' },
          { id: 'origenes', label: 'Orígenes' },
        ]}
      />

      <PageReveal className="relative mx-auto max-w-screen-xl space-y-24">
        <section id="hero" className="scroll-mt-28">
          <InfoHero
            icon="info"
            title={dict.nav.information}
            kicker={dict.information.heroKicker}
            subtitle={dict.information.heroSubtitle}
            theme={THEME}
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="group rounded-[2rem] border border-white/10 bg-white/5 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-neon-blue/40"
              >
                <p className="font-header text-3xl font-black text-neon-blue transition-transform duration-300 group-hover:scale-110">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-black uppercase text-white">{stat.label}</p>
                <p className="mt-0.5 text-[10px] font-bold text-white/40">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="identidad" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="palette"
            title={dict.information.identity}
            kicker={dict.information.identityKicker}
            tone="text-neon-blue"
            toneBg="bg-neon-blue/10"
            toneBorder="border-neon-blue/30"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="group rounded-[2.5rem] border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-neon-blue/40 hover:bg-white/[0.07]">
              <div className="flex flex-col xl:flex-row items-center xl:items-start gap-7">
                <div className="relative h-28 w-28 shrink-0 animate-float">
                  <Image
                    src={ISOTYPE}
                    alt={dict.information.isotypeAlt}
                    fill
                    sizes="112px"
                    className="object-contain drop-shadow-neon-blue"
                  />
                </div>
                <div className="flex-1 space-y-4 text-center xl:text-left">
                  <h3 className="text-xl font-header font-black uppercase italic text-white">{dict.information.isotypeTitle}</h3>
                  <div className="rounded-2xl border-l-4 border-neon-blue/40 bg-black/40 p-4 text-left">
                    <p className="mb-1 text-[10px] font-black uppercase text-neon-blue">{dict.information.artVision}</p>
                    <p className="text-xs font-bold leading-relaxed text-white/60">
                      {dict.information.artVisionBody}
                    </p>
                  </div>
                  <div className="rounded-2xl border-l-4 border-neon-purple/40 bg-black/40 p-4 text-left">
                    <p className="mb-1 text-[10px] font-black uppercase text-neon-purple">{dict.information.techSpec}</p>
                    <p className="text-xs font-bold leading-relaxed text-white/60">
                      {dict.information.techSpecBody}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <article className="group rounded-[2.5rem] border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-neon-blue/40 hover:bg-white/[0.07]">
              <div className="flex flex-col items-center gap-7 text-center">
                <div className="relative h-28 w-full max-w-[300px] shrink-0">
                  <Image
                    src={LOGOTYPE}
                    alt={dict.information.logotypeAlt}
                    fill
                    sizes="300px"
                    className="object-contain"
                  />
                </div>
                <div className="w-full space-y-4">
                  <h3 className="text-xl font-header font-black uppercase italic text-white">{dict.information.logotypeTitle}</h3>
                  <div className="rounded-2xl border-l-4 border-neon-cyan/40 bg-black/40 p-4 text-left">
                    <p className="mb-1 text-[10px] font-black uppercase text-neon-cyan">{dict.information.aeroDesign}</p>
                    <p className="text-xs font-bold leading-relaxed text-white/60">
                      {dict.information.aeroDesignBody}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="relative overflow-hidden rounded-[3rem] border-2 border-white/10 bg-white/5 p-8 md:p-12">
            <span className="pointer-events-none absolute right-6 top-4 select-none text-6xl md:text-8xl font-header font-black uppercase italic tracking-tighter text-white/5">
              Imagotipo
            </span>
            <div className="relative flex flex-col lg:flex-row items-center gap-10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-24 w-24 animate-float">
                  <Image src={ISOTYPE} alt={dict.information.isotypeAlt} fill sizes="96px" className="object-contain" />
                </div>
                <div className="relative h-14 w-64">
                  <Image src={LOGOTYPE} alt={dict.information.logotypeAlt} fill sizes="256px" className="object-contain" />
                </div>
                <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-brand/40">
                  <Image src={CIRCLE} alt={dict.information.avatarAlt} fill sizes="56px" className="object-cover" />
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <div className="space-y-2 text-center lg:text-left">
                  <h3 className="text-2xl md:text-4xl font-header font-black uppercase italic tracking-tight text-white">
                    {dict.information.masterComposition}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neon-cyan">
                    {dict.information.portfolioSeal}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Sincronía Visual',
                      icon: 'eye',
                      tone: 'text-neon-blue',
                      desc: 'Isotipo, logotipo y avatar comparten proporción y ritmo para un reconocimiento inmediato.',
                    },
                    {
                      title: 'Estructura Técnica',
                      icon: 'verified',
                      tone: 'text-neon-cyan',
                      desc: 'Cada activo respeta márgenes de seguridad y se publica con su formato y variante.',
                    },
                    {
                      title: 'Filosofía de Diseño',
                      icon: 'heart',
                      tone: 'text-neon-pink',
                      desc: 'Una identidad funcional: sirve igual en una página, una app o una miniatura de video.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="space-y-3 rounded-3xl border border-white/10 bg-black/40 p-5">
                      <span className={`block h-8 w-8 ${item.tone}`}>
                        <Icon name={item.icon} size={28} />
                      </span>
                      <h4 className="text-xs font-black uppercase text-white">{item.title}</h4>
                      <p className="text-[10px] font-bold leading-relaxed text-white/50">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="color" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="palette"
            title={dict.information.colorTitle}
            kicker={dict.information.colorKicker}
            tone="text-neon-pink"
            toneBg="bg-neon-pink/10"
            toneBorder="border-neon-pink/30"
          />
          <ColorSwatches colors={BRAND_COLORS} />
        </section>

        <section id="formatos" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="file-text"
            title={dict.information.formatsTitle}
            kicker={dict.information.formatsKicker}
            tone="text-neon-purple"
            toneBg="bg-neon-purple/10"
            toneBorder="border-neon-purple/30"
          />
          <div className="space-y-4 rounded-[3rem] border border-white/10 bg-white/5 p-6 md:p-8">
            {FILE_FORMATS.map((category) => (
              <div
                key={category.category}
                className={`group flex flex-col gap-5 rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/5 sm:flex-row ${category.border}`}
              >
                <span className={`h-10 w-10 shrink-0 transition-transform duration-300 group-hover:scale-110 ${category.tone}`}>
                  <Icon name={category.icon} size={36} />
                </span>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-sm font-black uppercase italic text-white">{category.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.formats.map((format) => (
                        <code
                          key={format}
                          className={`rounded-lg border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-black tracking-wider ${category.tone}`}
                        >
                          {format}
                        </code>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-white/50">{category.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="mision" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="target"
            title={dict.information.missionTitle}
            kicker={dict.information.missionKicker}
            tone="text-neon-pink"
            toneBg="bg-neon-pink/10"
            toneBorder="border-neon-pink/30"
          />
          <div className="relative overflow-hidden rounded-[3rem] border border-white/10 border-l-4 border-l-neon-pink bg-white/5 p-8 md:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-neon-pink/5 blur-3xl" />
            <div className="relative space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neon-pink">
                {dict.information.personalBrand}
              </p>
              <blockquote className="text-xl md:text-3xl font-header font-black uppercase italic leading-snug text-white">
                &quot;{dict.information.missionQuote}&quot;
              </blockquote>
              <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
                {MISSION_STATS.map((stat) => (
                  <div key={stat.label} className="space-y-1 text-center">
                    <p className="text-3xl font-header font-black text-neon-pink">{stat.value}</p>
                    <p className="text-xs font-black uppercase text-white">{stat.label}</p>
                    <p className="text-[10px] font-bold text-white/50">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="vision" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="globe"
            title={dict.information.visionTitle}
            kicker={dict.information.visionKicker}
            tone="text-neon-blue"
            toneBg="bg-neon-blue/10"
            toneBorder="border-neon-blue/30"
          />
          <InfoCardGrid items={VISION_ITEMS} theme={THEME} columns={3} />
        </section>

        <section id="objetivos" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="chart-bar"
            title={dict.information.objectivesTitle}
            kicker={dict.information.objectivesKicker}
            tone="text-neon-green"
            toneBg="bg-neon-green/10"
            toneBorder="border-neon-green/30"
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-[2.5rem] border border-neon-green/20 bg-white/5 p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-green/20 bg-neon-green/10 text-neon-green">
                  <Icon name="target" size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-header font-black uppercase italic text-neon-green">
                    {dict.information.generalObjectives}
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{dict.information.macroStrategy}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {OBJECTIVES_GENERAL.map((objective, index) => (
                  <li key={objective} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neon-green/30 bg-neon-green/10 text-[10px] font-black text-neon-green">
                      {index + 1}
                    </span>
                    <p className="text-xs font-bold leading-relaxed text-white/60">{objective}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-5 rounded-[2.5rem] border border-neon-cyan/20 bg-white/5 p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan">
                  <Icon name="settings" size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-header font-black uppercase italic text-neon-cyan">
                    {dict.information.specificObjectives}
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{dict.information.microTactic}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {OBJECTIVES_SPECIFIC.map((objective, index) => (
                  <li key={objective} className="flex items-start gap-3">
                    <code className="mt-0.5 shrink-0 rounded-lg border border-neon-cyan/20 bg-neon-cyan/10 px-1.5 py-0.5 text-[9px] font-black text-neon-cyan">
                      0{index + 1}
                    </code>
                    <p className="text-xs font-bold leading-relaxed text-white/60">{objective}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="ideologia" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="heart"
            title={dict.information.ideologyTitle}
            kicker={dict.information.ideologyKicker}
            tone="text-neon-purple"
            toneBg="bg-neon-purple/10"
            toneBorder="border-neon-purple/30"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className={`group rounded-[2rem] border p-7 transition-all duration-300 hover:-translate-y-1.5 ${pillar.border} ${pillar.bg}`}
              >
                <span className={`mb-4 block h-11 w-11 transition-transform group-hover:scale-110 ${pillar.tone}`}>
                  <Icon name={pillar.icon} size={40} />
                </span>
                <h4 className={`mb-3 text-lg font-header font-black uppercase italic leading-none ${pillar.tone}`}>
                  {pillar.title}
                </h4>
                <p className="text-[11px] font-bold leading-relaxed text-white/60">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="filosofia" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="moon"
            title={dict.information.philosophyTitle}
            kicker={dict.information.philosophyKicker}
            tone="text-neon-cyan"
            toneBg="bg-neon-cyan/10"
            toneBorder="border-neon-cyan/30"
          />
          <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 p-8 md:p-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5" />
            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-3">
              <div className="flex flex-col justify-center space-y-4 border-white/10 lg:border-r lg:pr-10">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neon-cyan">{dict.information.reasonToBe}</p>
                <h3 className="text-2xl md:text-3xl font-header font-black uppercase italic leading-tight text-white">
                  {dict.information.brandIsMessage}
                </h3>
                <p className="text-sm font-bold leading-relaxed text-white/50">
                  {dict.information.brandIsMessageBody}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
                {PHILOSOPHY.map((item) => (
                  <div
                    key={item.label}
                    className="space-y-3 rounded-2xl border border-white/10 border-t-2 bg-black/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-black/60"
                    style={{ borderTopColor: item.color }}
                  >
                    <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: ink(item.color) }}>
                      {item.label}
                    </h4>
                    <p className="text-[11px] font-bold italic leading-relaxed text-white/60">
                      &quot;{item.quote}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="libreria" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="star"
            title={dict.information.iconsTitle}
            kicker={dict.information.iconsKicker}
            tone="text-neon-blue"
            toneBg="bg-neon-blue/10"
            toneBorder="border-neon-blue/30"
          />
          <IconShowcase
            icons={ICON_LIBRARY}
            accent="text-neon-blue"
            accentBg="bg-neon-blue/10"
            accentBorder="border-neon-blue/40"
            glow="bg-neon-blue/20"
          />
        </section>

        <section id="ecosistema" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="server"
            title={dict.information.techTitle}
            kicker={dict.information.techKicker}
            tone="text-neon-cyan"
            toneBg="bg-neon-cyan/10"
            toneBorder="border-neon-cyan/30"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TECH_STACK.map((tech) => (
              <Link
                key={tech.name}
                href={tech.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-neon-cyan/40 hover:bg-white/[0.07]"
              >
                <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-neon-cyan/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1020] shadow-inner transition-transform duration-300 group-hover:scale-110">
                    {tech.brand ? (
                      <Icon name={tech.brand} style={tech.brandStyle} size={30} className="invert" />
                    ) : (
                      <Icon name={tech.icon} size={26} className="text-neon-blue" />
                    )}
                  </span>
                  <span className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-neon-cyan">
                    {tech.tech.split('·')[0].trim()}
                  </span>
                </div>
                <div className="relative space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xl font-header font-black uppercase italic tracking-tight text-white">
                      {tech.name}
                    </h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{tech.tech}</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-[11px] font-bold leading-relaxed text-white/50">
                      <span className="mb-1 block text-neon-cyan">{dict.information.projectUse}</span>
                      {tech.use}
                    </p>
                  </div>
                </div>
                <div className="relative mt-auto flex items-center gap-2 pt-4 text-[10px] font-black uppercase italic text-white/40 transition-colors group-hover:text-white">
                  {dict.information.officialDocs}
                  <Icon name="arrow-right" size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="explora" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="home"
            title={dict.information.exploreTitle}
            kicker={dict.information.exploreKicker}
            tone="text-neon-blue"
            toneBg="bg-neon-blue/10"
            toneBorder="border-neon-blue/30"
          />
          <InfoLinkGrid groups={GROUPS} theme={THEME} />
        </section>

        <section id="origenes" className="scroll-mt-28 space-y-10">
          <SectionHeading
            icon="user"
            title={dict.information.originsTitle}
            kicker={dict.information.originsKicker}
            tone="text-neon-purple"
            toneBg="bg-neon-purple/10"
            toneBorder="border-neon-purple/30"
          />
          <InfoSteps steps={ORIGIN_STEPS} theme={THEME} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/about"
              className="group flex items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 transition-colors hover:border-neon-blue/50"
            >
              <div className="flex items-center gap-4">
                <span className="h-9 w-9 text-neon-blue">
                  <Icon name="user" size={34} />
                </span>
                <div>
                  <h4 className="text-sm font-black uppercase italic text-white">{dict.information.meetAuthor}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {dict.information.authorBio}
                  </p>
                </div>
              </div>
              <span className="text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white">
                <Icon name="arrow-right" size={18} />
              </span>
            </Link>
            <Link
              href="/team"
              className="group flex items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 transition-colors hover:border-neon-pink/50"
            >
              <div className="flex items-center gap-4">
                <span className="h-9 w-9 text-neon-pink">
                  <Icon name="team" size={34} />
                </span>
                <div>
                  <h4 className="text-sm font-black uppercase italic text-white">{dict.information.orgMatrix}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {dict.information.orgMatrixBody}
                  </p>
                </div>
              </div>
              <span className="text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white">
                <Icon name="arrow-right" size={18} />
              </span>
            </Link>
          </div>
        </section>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Ver proyectos', href: '/projects', icon: 'rocket' },
            { label: 'Certificados', href: '/certificates', icon: 'certificates' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
