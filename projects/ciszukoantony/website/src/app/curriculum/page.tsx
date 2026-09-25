'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { InfoCardGrid, InfoCtaRow, InfoHero, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { CERTIFICATES, PROVIDER_OPTIONS } from '@/data/certificates';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const PROFILE = {
  name: 'Ciszuko Antony',
  legalName: 'Francisco Antonio García Menolascina',
  role: 'CEO & Fundador de Ciszu Network',
  location: 'Coro, Falcón, Venezuela',
  email: 'ciszunetwork@outlook.com',
  summary:
    'Desarrollador full-stack, artista digital y fundador de Ciszu Network. Construyo webs, bots, juegos y herramientas sobre un monorepo propio con Next.js, TypeScript y Supabase, con identidad visual y documentación de ingeniería verificable.',
};

const EXPERIENCE = [
  {
    period: '2023 — Presente',
    role: 'CEO & Fundador',
    org: 'Ciszu Network',
    desc: 'Dirección de la compañía: 4 webs Next.js, bot de Discord, juego MuzicMania, paquetes compartidos e infraestructura en Vercel y Supabase.',
  },
  {
    period: '2022 — Presente',
    role: 'Desarrollo full-stack',
    org: 'Proyectos propios',
    desc: 'Aplicaciones web, bots de Discord/WhatsApp/Telegram, servidores de Minecraft, scripts de automatización y herramientas internas.',
  },
  {
    period: '2024 — Presente',
    role: 'Creador de contenido',
    org: 'Ciszuko Antony',
    desc: 'YouTube, Twitch y redes: contenido gaming, música y tecnología para la comunidad del ecosistema.',
  },
];

const SKILLS = [
  { name: 'TypeScript', level: 90 },
  { name: 'Node.js', level: 85 },
  { name: 'Next.js / React', level: 80 },
  { name: 'Python', level: 75 },
  { name: 'Java', level: 65 },
  { name: 'MongoDB / Postgres', level: 80 },
  { name: 'Docker / Linux', level: 70 },
  { name: 'UI/UX y diseño', level: 75 },
];

const EDUCATION = [
  {
    icon: 'certificates',
    title: 'Bachillerato — Diploma de graduación',
    body: 'Institución educativa. Documento de graduación archivado en el catálogo de certificados.',
  },
  {
    icon: 'globe',
    title: 'EF SET English Certificate — B1',
    body: 'EF SET (Education First), 43/100, verificación oficial en cert.efset.org.',
  },
  {
    icon: 'server',
    title: 'Cisco Networking Academy',
    body: 'HTML Essentials, CSS Essentials, Python Essentials 1 y 2, Introduction to Modern AI y Digital Awareness.',
  },
  {
    icon: 'monitor',
    title: 'Microsoft Learn & IBM SkillsBuild',
    body: 'Fundamentos de nube (Microsoft Learn), IT, open source, UX y marketing digital (IBM SkillsBuild).',
  },
];

const LANGUAGES = [
  { icon: 'comment', title: 'Español', body: 'Idioma nativo. Documentación y comunicación profesional.' },
  { icon: 'globe', title: 'Inglés — B1 (Intermedio)', body: 'EF SET 43/100, certificado verificable. Inglés técnico de desarrollo.' },
];

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const fmtDate = (iso?: string) => {
  if (!iso) return 'Sin fecha';
  const [year, month] = iso.split('-').map(Number);
  return `${MONTHS[(month || 1) - 1]} ${year}`;
};

export default function CurriculumPage() {
  usePageTitle('CURRICULUM');

  const featured = useMemo(
    () =>
      [...CERTIFICATES]
        .filter((cert) => cert.date)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 6),
    [],
  );

  const stats = useMemo(
    () => [
      { value: `${CERTIFICATES.length}`, label: 'Documentos', sub: 'Certificados y credenciales' },
      { value: `${PROVIDER_OPTIONS.length - 1}`, label: 'Emisores', sub: 'Instituciones y plataformas' },
      { value: `${SKILLS.length}`, label: 'Áreas técnicas', sub: 'Stack de desarrollo' },
      { value: 'B1', label: 'Inglés', sub: 'EF SET certificado' },
    ],
    [],
  );

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="certificates"
          title="Curriculum"
          subtitle="Formación, certificaciones verificables, experiencia y habilidades de Ciszuko Antony (Francisco Antonio García Menolascina), CEO de Ciszu Network."
          kicker="CV"
          theme={THEME}
        />

        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-neon-blue/10 via-transparent to-transparent border border-neon-blue/20 mb-12">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-header font-bold text-white">{PROFILE.name}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-blue mt-1 mb-4">
                {PROFILE.role}
              </p>
              <p className="text-white/60 text-sm leading-relaxed mb-4">{PROFILE.summary}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50">
                <span>{PROFILE.legalName}</span>
                <span>{PROFILE.location}</span>
                <a href={`mailto:${PROFILE.email}`} className="text-neon-blue hover:text-white transition-colors">
                  {PROFILE.email}
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue rounded-xl font-bold text-sm hover:bg-neon-blue hover:text-white transition-all cursor-pointer"
              >
                Imprimir / Guardar PDF
              </button>
              <Link
                href="/certificates"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                Ver certificados
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-3xl font-header font-black text-neon-blue">{stat.value}</p>
              <p className="text-white font-header font-bold text-sm mt-1">{stat.label}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="mb-14">
          <InfoCardGrid title="Formación y certificaciones base" items={EDUCATION} theme={THEME} columns={2} />
        </div>

        <section className="mb-14">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
            Experiencia
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-neon-blue via-neon-blue/40 to-transparent" />
            <div className="space-y-5">
              {EXPERIENCE.map((item) => (
                <div key={item.role} className="relative pl-12 p-5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="absolute left-2.5 top-7 w-3 h-3 rounded-full bg-neon-blue border-2 border-black" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-neon-blue mb-1">{item.period}</p>
                  <h3 className="font-header font-bold text-white">
                    {item.role} · <span className="text-white/60">{item.org}</span>
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
            Certificaciones destacadas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((cert) => (
              <div key={cert.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-blue/40 transition-all">
                <p className="text-[10px] font-black uppercase tracking-widest text-neon-blue mb-2">
                  {fmtDate(cert.date)}
                </p>
                <h3 className="font-header font-bold text-white text-sm leading-snug mb-1">{cert.title}</h3>
                <p className="text-xs text-white/50">{cert.provider}</p>
                {cert.level ? <p className="text-xs text-neon-green mt-2">{cert.level}</p> : null}
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-6">
            Catálogo completo con documentos y verificación en{' '}
            <Link href="/certificates" className="text-neon-blue hover:text-white transition-colors">
              /certificates
            </Link>
          </p>
        </section>

        <section className="mb-14">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
            Habilidades técnicas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SKILLS.map((skill) => (
              <div key={skill.name} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">{skill.name}</span>
                  <span className="text-neon-blue font-bold">{skill.level}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-neon-blue"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-6">
          <InfoCardGrid title="Idiomas" items={LANGUAGES} theme={THEME} columns={2} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Certificados', href: '/certificates', icon: 'certificates' },
            { label: 'Proyectos', href: '/projects', icon: 'rocket' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
