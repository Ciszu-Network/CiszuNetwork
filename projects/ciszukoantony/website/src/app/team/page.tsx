'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  InfoHero,
  InfoCardGrid,
  InfoSteps,
  InfoCtaRow,
  CopyWithButton,
  Icon,
  type InfoTheme,
  type InfoCardItem,
  type InfoStepGroup,
} from '@ciszu/ui';
import { SOCIALS, I } from '@/config/navigation';
import { usePageTitle } from '@/lib/usePageTitle';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

/**
 * Equipo de Ciszuko Antony.
 *
 * El proyecto lo lleva una sola persona, así que la página muestra al fundador
 * con detalle, sus datos de contacto, los roles que cubre el ecosistema y cómo
 * entrar a colaborar — misma estructura que el resto de webs de Ciszu Network.
 */
const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const COPY = {
  name: 'Ciszuko Antony',
  legal: 'Francisco Antonio García Menolascina',
  role: 'CEO & Founder · Ciszuko Network',
  bio: 'Desarrollador full-stack y creador de Ciszuko Network. Diseña y mantiene las webs del ecosistema, los bots de Discord/WhatsApp/Telegram, MuzicMania y los servidores de Minecraft. También produce el contenido que se publica en el canal.',
  quote: 'Un solo núcleo creativo: el portfolio, las webs, el juego y la infraestructura salen del mismo taller.',
  contactTitle: 'Contacto directo',
  skillsTitle: 'Áreas que cubre el equipo',
  socialsTitle: 'Redes oficiales',
  rolesTitle: 'Roles activos',
  joinTitle: 'Cómo colaborar',
  networkTitle: 'Núcleo Ciszu Network',
  networkBody:
    'Ciszuko Antony es el fundador del ecosistema. Estos son los proyectos que mantiene y la comunidad donde se anuncian las novedades.',
};

const SKILLS = [
  'Next.js',
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Tailwind CSS',
  'Supabase',
  'Cloud & CI',
  'UI / UX',
  'Diseño de marca',
  'Minecraft / Plugins',
  'Edición de vídeo',
];

const CONTACT = [
  {
    label: 'Email personal',
    value: 'fplayersoffcial@gmail.com',
    href: 'mailto:fplayersoffcial@gmail.com',
    actionLabel: 'Escribir email',
  },
  {
    label: 'WhatsApp',
    value: '+58 412 6858111',
    href: 'https://wa.me/584126858111',
    actionLabel: 'Abrir WhatsApp',
  },
  {
    label: 'Ubicación',
    value: 'Coro, Falcón, Venezuela',
  },
];

const NETWORK = [
  {
    name: 'Ciszu Network',
    desc: 'Web principal y centro de documentación del ecosistema.',
    href: 'https://ciszunetwork.vercel.app',
  },
  {
    name: 'CiszuBot',
    desc: 'Bot de Discord con moderación, música y comandos del ecosistema.',
    href: 'https://ciszubot.vercel.app',
  },
  {
    name: 'MuzicMania',
    desc: 'Juego de ritmo para web con clasificaciones y app de escritorio.',
    href: 'https://muzicmania.vercel.app',
  },
  {
    name: 'CiszuGamens',
    desc: 'Comunidad en Discord donde se anuncian bots, eventos y vacantes.',
    href: 'https://discord.com/invite/W3kMtMMj6E',
  },
];

const ROLES: InfoCardItem[] = [
  {
    icon: 'crown',
    title: 'Dirección',
    body: 'Define la hoja de ruta del ecosistema, la identidad de marca y aprueba cada publicación y despliegue.',
  },
  {
    icon: 'terminal',
    title: 'Desarrollo',
    body: 'Webs, API, bots y automatizaciones. Todo el código vive en el GitHub de Ciszu Network.',
  },
  {
    icon: 'palette',
    title: 'Diseño',
    body: 'Logos, iconografía SVG, paletas y el sistema de UI compartido por las cuatro webs.',
  },
  {
    icon: 'music',
    title: 'Contenido',
    body: 'Vídeos, directos y material promocional de MuzicMania y los proyectos de Minecraft.',
  },
];

const STEPS: InfoStepGroup[] = [
  {
    title: 'Únete a la comunidad',
    body: 'El punto de entrada es el servidor de Discord y la comunidad de CiszuGamens, donde se anuncian las vacantes y las colaboraciones.',
  },
  {
    title: 'Elige un área',
    body: 'Desarrollo, diseño, traducción, moderación o soporte. Se valora cualquier aporte, no solo el código.',
  },
  {
    title: 'Presenta tu propuesta',
    body: 'Abre un issue o un pull request en GitHub con la idea y el alcance. Se revisa y se responde siempre.',
  },
  {
    title: 'Publicación con crédito',
    body: 'Cada aporte aceptado se publica en el changelog con su autoría visible en la ficha del cambio.',
  },
];

export default function TeamPage() {
  usePageTitle('TEAM');

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="users"
          title="Team"
          subtitle="Quién está detrás de Ciszuko Antony: el fundador, los roles que cubre el ecosistema y cómo entrar a colaborar."
          theme={THEME}
        />

        {/* Fundador */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-14 p-8 md:p-12 rounded-3xl border text-center relative overflow-hidden ${THEME.border} ${THEME.card}`}
        >
          <div className="relative z-10">
            <Image
              src={assetResolver.resolve('shared/images/francisco_selfie/IMG_20251207_001632@893898207.jpg')}
              alt={COPY.name}
              width={132}
              height={132}
              className="rounded-full object-cover mx-auto mb-6 border-2 border-neon-blue/40 w-32 h-32"
            />
            <h2 className="text-3xl font-header font-black text-white uppercase tracking-tight">{COPY.name}</h2>
            <p className="text-[11px] text-gray-500 mt-1">{COPY.legal}</p>
            <p className={`text-xs font-black uppercase tracking-[0.35em] mt-3 mb-6 ${THEME.accent}`}>
              {COPY.role}
            </p>
            <p className="max-w-2xl mx-auto text-sm text-gray-400 leading-relaxed mb-6">{COPY.bio}</p>
            <p
              className={`mx-auto mb-8 max-w-2xl rounded-2xl border px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-300 ${THEME.accentBorder} ${THEME.accentBg}`}
            >
              {COPY.quote}
            </p>

            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${THEME.accent}`}>
              {COPY.skillsTitle}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {SKILLS.map((skill) => (
                <span
                  key={skill}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-bold ${THEME.accentBorder} ${THEME.accentBg} ${THEME.accent}`}
                >
                  {skill}
                </span>
              ))}
            </div>

            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${THEME.accent}`}>
              {COPY.contactTitle}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {CONTACT.map((field) => (
                <div
                  key={field.label}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${THEME.border} ${THEME.card}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${THEME.accentBg} ${THEME.accent}`}
                    >
                      <Icon name={field.href ? 'mail' : 'globe'} size={18} />
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{field.label}</p>
                      {field.href ? (
                        <CopyWithButton value={field.value} label={`Copiar ${field.label}`}>
                          <span className="text-xs font-bold text-white truncate md:text-sm">{field.value}</span>
                        </CopyWithButton>
                      ) : (
                        <span className="text-xs font-bold text-white md:text-sm">{field.value}</span>
                      )}
                    </div>
                  </div>
                  {field.href ? (
                    <a
                      href={field.href}
                      target={field.href.startsWith('http') ? '_blank' : undefined}
                      rel={field.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      title={field.actionLabel}
                      aria-label={field.actionLabel}
                      className={`shrink-0 rounded-lg border p-2 transition-all hover:scale-110 ${THEME.border} ${THEME.card} ${THEME.accent}`}
                    >
                      <Icon name="chevronRight" size={16} />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>

            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-10 mb-4 ${THEME.accent}`}>
              {COPY.socialsTitle}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                  aria-label={social.name}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center text-gray-300 transition-all hover:scale-110 hover:text-white ${THEME.border} ${THEME.card}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Núcleo Ciszu Network */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className={`mb-14 p-8 md:p-12 rounded-3xl border relative overflow-hidden ${THEME.border} ${THEME.card}`}
        >
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-header font-black uppercase tracking-tight text-white mb-3">
              {COPY.networkTitle}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">{COPY.networkBody}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {NETWORK.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${THEME.border} ${THEME.card}`}
              >
                <span
                  className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${THEME.accentBg} ${THEME.accent}`}
                >
                  {I.projects}
                </span>
                <h3 className="font-header font-bold text-white mb-2">{item.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </a>
            ))}
          </div>
        </motion.section>

        <div className="space-y-14">
          <InfoCardGrid title={COPY.rolesTitle} items={ROLES} theme={THEME} columns={4} />
          <InfoSteps title={COPY.joinTitle} steps={STEPS} theme={THEME} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Contacto', href: '/contact', icon: 'mail' },
            { label: 'Ver proyectos', href: '/projects', icon: 'rocket', variant: 'ghost' },
            {
              label: 'Únete al Discord',
              href: SOCIALS.find((social) => social.name === 'Discord')?.href ?? 'https://discord.com/invite/W3kMtMMj6E',
              icon: 'support',
              variant: 'ghost',
              external: true,
            },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
