'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { InfoCardGrid, InfoCtaRow, InfoHero, Icon, Modal, captureEvent, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import CvPreview from '@/components/curriculum/CvPreview';
import SkillLogo from '@/components/shared/SkillLogo';
import { CERTIFICATES } from '@/data/certificates';
import type { CvDocument, CurriculumData } from '@/data/curriculum';

const THEME: InfoTheme = {
  accent: 'text-neon-purple',
  accentBg: 'bg-neon-purple/10',
  accentBorder: 'border-neon-purple/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-neon-purple',
};

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const fmtDate = (iso?: string) => {
  if (!iso) return 'Sin fecha';
  const [year, month] = iso.split('-').map(Number);
  return `${MONTHS[(month || 1) - 1]} ${year}`;
};

/**

/**
 * `/curriculum` — página INDEPENDIENTE del portfolio, centrada en los 3
 * currículums en PDF. Se prioriza la previsualización completa en pantalla de
 * cada documento (adaptada a su orientación vertical u horizontal), con sus
 * datos verificables, la trayectoria interactiva y las certificaciones.
 *
 * El portfolio (`/portfolio`) queda para lo general y los trabajos; aquí vive
 * el currículum. El CV se resuelve en servidor para leer `shared/docs/` cuando
 * exista.
 */
export default function CurriculumContent({ cv }: { cv: CurriculumData }) {
  usePageTitle('CURRICULUM');
  const dict = useDict();
  const [fullscreen, setFullscreen] = useState<CvDocument | null>(null);

  const featuredCerts = useMemo(
    () =>
      [...CERTIFICATES]
        .filter((cert) => cert.date)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 6),
    [],
  );

  const providerCount = useMemo(() => new Set(CERTIFICATES.map((cert) => cert.provider)).size, []);

  const cvStats = [
    { value: `${cv.documents.length}`, label: 'Currículums', sub: 'PDF verificables' },
    { value: `${cv.skills.length}`, label: 'Áreas técnicas', sub: 'Stack de desarrollo' },
    { value: `${providerCount}`, label: 'Emisores', sub: 'Instituciones y plataformas' },
    { value: `${CERTIFICATES.length}`, label: 'Documentos', sub: 'Certificados y credenciales' },
  ];

  const areas = [
    { icon: 'server', title: 'Experiencia', body: 'Dirección de Ciszu Network y desarrollo full-stack de sus 4 webs, bot y juego.' },
    { icon: 'medal', title: 'Formación', body: 'Bachillerato, EF SET B1 y programas de Cisco, Microsoft, IBM y HP.' },
    { icon: 'terminal', title: 'Habilidades', body: 'TypeScript, Next.js/React, Node.js, Python, bases de datos y diseño UI/UX.' },
    { icon: 'globe', title: 'Idiomas', body: 'Español nativo e inglés B1 certificado (EF SET 43/100).' },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <div className="print:hidden">
          <InfoHero
            icon="certificates"
            title="Currículum"
            subtitle={`Los ${cv.documents.length} currículums de ${cv.profile.name} en pantalla completa: previsualización directa de cada PDF, trayectoria, formación, habilidades, idiomas y certificaciones verificables.`}
            kicker="CV · Trayectoria profesional"
            theme={THEME}
          />
        </div>

        {/* Ficha de perfil + acciones */}
        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-neon-purple/10 via-transparent to-transparent border border-neon-purple/20 mb-14">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-header font-black uppercase italic text-white">{cv.profile.name}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-purple mt-1 mb-4">
                {cv.profile.role}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{cv.profile.summary}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                <span>{cv.profile.legalName}</span>
                <span>{cv.profile.location}</span>
                <a href={`mailto:${cv.profile.email}`} className="text-neon-purple hover:text-white transition-colors">
                  {cv.profile.email}
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto print:hidden">
              <Link
                href="/certificates"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple rounded-xl font-bold text-sm hover:bg-neon-purple hover:text-white transition-all"
              >
                <Icon name="certificates" size={16} />
                {dict.curriculum.viewCertificates}
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                <Icon name="palette" size={16} />
                {dict.portfolio.kicker}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                <Icon name="mail" size={16} />
                {dict.portfolio.ctaContact}
              </Link>
            </div>
          </div>
        </div>

        {/* Currículums: previsualización SIEMPRE visible, adaptada a la orientación.
              La versión destacada (featured) va primero y resaltada. */}
        <section className="mb-14">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple">
              <Icon name="certificates" size={15} />
              Currículums ({cv.documents.length})
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Icon name="clock" size={13} />
              Última actualización: oct 2026
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...cv.documents]
              .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
              .map((doc) => (
                <article
                  key={doc.id}
                  className={`relative flex flex-col p-5 rounded-[2rem] border transition-all ${
                    doc.featured
                      ? 'bg-gradient-to-br from-neon-purple/15 via-transparent to-transparent border-neon-purple/50 shadow-[0_0_30px_rgba(72,0,255,0.15)]'
                      : 'bg-white/5 border-white/10 hover:border-neon-purple/40'
                  }`}
                >
                  {doc.featured && (
                    <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neon-purple text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                      <Icon name="star" size={10} />
                      Recomendado
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-header font-bold text-white">{doc.label}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                        PDF · {doc.pages} páginas · {doc.size}
                        {doc.updated ? ` · Actualizado ${doc.updated.slice(0, 7)}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/40 text-neon-purple">
                      {doc.type}
                    </span>
                  </div>

                <CvPreview
                  href={doc.href}
                  label={doc.label}
                  orientation={doc.orientation}
                  frameClassName="max-w-[22rem]"
                  className="mb-4"
                />

                <p className="text-sm text-gray-400 leading-relaxed flex-1">{doc.description}</p>
                <div className="flex flex-wrap gap-2 mt-4 print:hidden">
                  <a
                    href={doc.href}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => captureEvent('curriculum_cv_download', { id: doc.id })}
                    className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple rounded-xl font-bold text-xs hover:bg-neon-purple hover:text-white transition-all active:scale-95"
                  >
                    <Icon name="download" size={15} />
                    Descargar
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setFullscreen(doc);
                      captureEvent('curriculum_cv_fullscreen', { id: doc.id });
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    <Icon name="eye" size={15} />
                    Pantalla completa
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-6">
            Documentos PDF {cv.documents.length} · previsualización y descarga directa desde el CDN de Ciszu Network.
          </p>
        </section>

        {/* Stats del CV */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {cvStats.map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-3xl font-header font-black text-neon-purple">{stat.value}</p>
              <p className="text-white font-header font-bold text-sm mt-1">{stat.label}</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Áreas */}
        <div className="mb-16">
          <InfoCardGrid title="Áreas de trayectoria" items={areas} theme={THEME} columns={4} />
        </div>

        {/* Formación */}
        <div className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="medal" size={15} />
            {dict.curriculum.training}
          </h2>
          <InfoCardGrid items={cv.education} theme={THEME} columns={2} />
        </div>

        {/* Experiencia (timeline) */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="trophy" size={15} />
            Experiencia
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-neon-purple via-neon-purple/40 to-transparent" />
            <div className="space-y-5">
              {cv.experience.map((item) => (
                <div
                  key={`${item.role}-${item.org}`}
                  className="relative pl-12 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-purple/40 transition-all"
                >
                  <span className="absolute left-2.5 top-7 w-3 h-3 rounded-full bg-neon-purple border-2 border-black" />
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={item.icon} size={14} className="text-neon-purple" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-neon-purple">{item.period}</p>
                  </div>
                  <h3 className="font-header font-bold text-white">
                    {item.role} · <span className="text-gray-500">{item.org}</span>
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Habilidades */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="target" size={15} />
            {dict.curriculum.skills}
          </h2>
          {(() => {
            const families = ['Lenguajes', 'Frontend', 'Backend', 'Bases de datos', 'DevOps', 'Herramientas'];
            const groups = families
              .map((family) => ({ family, skills: cv.skills.filter((s) => (s.family ?? 'Herramientas') === family) }))
              .filter((g) => g.skills.length > 0);
            return (
              <div className="space-y-8">
                {groups.map((group) => (
                  <div key={group.family}>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3">
                      {group.family}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.skills.map((skill) => (
                        <div
                          key={skill.name}
                          className="group flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-purple/40 hover:bg-white/[0.07] transition-all cursor-default"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 group-hover:scale-110 transition-transform">
                            <SkillLogo icon={skill.icon ?? ''} className="h-6 w-6" />
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="text-gray-200 font-medium">{skill.name}</span>
                              <span className="text-neon-purple font-bold">{skill.level}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand to-neon-purple transition-all duration-700 group-hover:from-neon-purple group-hover:to-neon-cyan"
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>

        {/* Idiomas */}
        <div className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="globe" size={15} />
            Idiomas
          </h2>
          <InfoCardGrid items={cv.languages} theme={THEME} columns={2} />
        </div>

        {/* Certificaciones destacadas */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="certificates" size={15} />
            {dict.curriculum.featuredCerts}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCerts.map((cert) => (
              <Link
                key={cert.id}
                href="/certificates"
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-purple/40 transition-all hover:-translate-y-0.5"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-neon-purple mb-2">
                  {fmtDate(cert.date)}
                </p>
                <h3 className="font-header font-bold text-white text-sm leading-snug mb-1">{cert.title}</h3>
                <p className="text-xs text-gray-500">{cert.provider}</p>
                {cert.level ? <p className="text-xs text-neon-green mt-2">{cert.level}</p> : null}
              </Link>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-6">
            Catálogo completo con documentos y verificación en{' '}
            <Link href="/certificates" className="text-neon-purple hover:text-white transition-colors">
              /certificates
            </Link>
          </p>
        </section>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: dict.portfolio.ctaCertificates, href: '/certificates', icon: 'certificates' },
            { label: dict.portfolio.goProjects, href: '/projects', icon: 'rocket' },
            { label: dict.portfolio.ctaCommissions, href: '/commissions', icon: 'money' },
            { label: dict.portfolio.ctaContact, href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />

        {/* Vista previa a pantalla completa */}
        <Modal
          open={fullscreen !== null}
          onOpenChange={(open) => {
            if (!open) setFullscreen(null);
          }}
          title={fullscreen?.label ?? 'Currículum'}
          description={
            fullscreen ? `Vista previa · PDF · ${fullscreen.pages} páginas · ${fullscreen.size}` : undefined
          }
          size="lg"
          className="max-w-5xl!"
        >
          {fullscreen ? (
            <div className="space-y-4">
              <CvPreview
                href={fullscreen.href}
                label={fullscreen.label}
                orientation={fullscreen.orientation}
                hideToolbar={false}
                frameClassName="max-w-[min(100%,52rem)]"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <a
                  href={fullscreen.href}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple rounded-xl font-bold text-xs hover:bg-neon-purple hover:text-white transition-all"
                >
                  <Icon name="download" size={15} />
                  Descargar PDF
                </a>
                <a
                  href={fullscreen.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all"
                >
                  <Icon name="external" size={15} />
                  Abrir en pestaña nueva
                </a>
              </div>
            </div>
          ) : null}
        </Modal>
      </PageReveal>

      <div className="print:hidden">
        <QuickDocks />
      </div>
    </div>
  );
}
