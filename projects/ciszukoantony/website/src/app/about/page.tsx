'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { assetResolver } from '@ciszunetwork/cdn';
import { InfoHero, Icon, type InfoTheme } from '@ciszu/ui';
import { RichText, type RichPart } from '@/components/RichText';
import SkillLogo from '@/components/shared/SkillLogo';
import BrandCard from '@/components/shared/BrandCard';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import {
  PROFILE,
  PROFILE_FACTS,
  PROFILE_ROLES,
  PROFILE_TOOLS,
  PROFILE_BROWSERS,
  PROFILE_AI,
  PROFILE_INTERESTS,
  PROFILE_ASPIRATIONS,
  PROFILE_PLATFORMS,
  PROFILE_SKILLS,
  PROFILE_TIMELINE,
  PROFILE_FAMILIES,
} from '@/data/profile';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const timeline: { year: string; event: RichPart[] }[] = PROFILE_TIMELINE.map((t) => ({
  year: t.year,
  event: [{ text: t.text }] as RichPart[],
}));

export default function AboutPage() {
  const dict = useDict();
  usePageTitle('ABOUT');

  const families = PROFILE_FAMILIES;

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="info"
          title={dict.about.title}
          subtitle="Ciszuko Antony (Francisco Antonio García Menolascina) — CEO, full-stack y artista digital"
          theme={THEME}
        />

        {/* Perfil */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-8 rounded-2xl bg-white/5 border border-white/10 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Image
              src={assetResolver.resolve('shared/images/francisco_selfie/IMG_20251207_001627@869886661.jpg')}
              alt={dict.about.founderAria}
              width={128} height={128}
              className="rounded-full object-cover shrink-0 border-2 border-brand/30"
            />
            <div>
              <h2 className="text-2xl font-header font-bold text-white mb-3">{PROFILE.name} ({PROFILE.shortName})</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                {PROFILE.role} de{' '}
                <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="text-brand font-bold hover:text-brand-200 transition-colors">{dict.about.network}</a>
                . {PROFILE.summary}
              </p>
              <p className="text-gray-400 leading-relaxed">
                Soy de Venezuela (Coro, Falcón), tengo 17 años y estudio en la UPTAG orientado a
                Ingeniería de Información y Sistemas. Trabajo como programador, publisher, diseñador,
                editor e ilustrador, y produzco contenido gaming, tutoriales, mods y música con FL Studio.
                Cada proyecto es una oportunidad para aprender, innovar y compartir con la comunidad.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Datos personales */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            {dict.about.aboutMe}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PROFILE_FACTS.map((p, i) => (
              <motion.div key={p.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-brand/40 transition-colors"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 border border-brand/30 text-brand">
                  <Icon name={p.icon} size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{p.label}</p>
                  <p className="text-sm text-gray-200 font-medium truncate">{p.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Roles */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            {dict.about.whatIDo}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROFILE_ROLES.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-brand/40 hover:bg-white/[0.06] transition-all"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 border border-brand/30 text-brand mb-3 group-hover:scale-110 transition-transform">
                  <Icon name={r.icon} size={20} />
                </span>
                <h3 className="text-white font-header font-bold mb-1">{r.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Habilidades
          </h2>
          <div className="space-y-8">
            {families.map((family) => {
              const list = PROFILE_SKILLS.filter((s) => s.family === family);
              if (!list.length) return null;
              return (
                <div key={family}>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3">{family}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {list.map((s, i) => (
                      <motion.div key={s.name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-brand/40 transition-colors"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10">
                          <SkillLogo icon={s.icon} className="h-6 w-6" />
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-200 font-medium">{s.name}</span>
                            <span className="text-brand font-bold">{s.level}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} whileInView={{ width: `${s.level}%` }} viewport={{ once: true }}
                              transition={{ duration: 1, delay: i * 0.05 }}
                              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-200"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* {dict.about.toolsEcosystem}: iconos reales + barras + tags */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            {dict.about.toolsEcosystem}
          </h2>

          {/* Herramientas de diseño, edición y productividad */}
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3">{dict.about.designEdition}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {PROFILE_TOOLS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <BrandCard brand={t} />
              </motion.div>
            ))}
          </div>

          {/* Navegadores */}
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3">Navegadores</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {PROFILE_BROWSERS.map((b, i) => (
              <motion.div key={b.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <BrandCard brand={b} />
              </motion.div>
            ))}
          </div>

          {/* {dict.about.aiAssistants} */}
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3">{dict.about.aiAssistants}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {PROFILE_AI.map((a, i) => (
              <motion.div key={a.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <BrandCard brand={a} />
              </motion.div>
            ))}
          </div>

          {/* {dict.about.platformsServices} */}
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3">{dict.about.platformsServices}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROFILE_PLATFORMS.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <BrandCard brand={p} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Intereses y aspiraciones */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4">{dict.about.interestsHobbies}</h3>
              <div className="grid grid-cols-2 gap-3">
                {PROFILE_INTERESTS.map((it, i) => (
                  <div key={it.label} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <Icon name={it.icon} size={16} className="text-brand" />
                    <span className="text-xs text-gray-300 font-medium">{it.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-brand/10 via-transparent to-transparent border border-brand/30">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-brand mb-4">{dict.about.aspirations}</h3>
              <ul className="space-y-2.5">
                {PROFILE_ASPIRATIONS.map((a, i) => (
                  <motion.li key={a} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <Icon name="check" size={16} className="text-brand mt-0.5 shrink-0" />
                    {a}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-header font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Trayectoria
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-brand via-brand-200 to-transparent" />
            <div className="space-y-8">
              {timeline.map((t, i) => (
                <motion.div key={t.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-brand border-2 border-black" />
                  <span className="text-sm font-bold text-brand">{t.year}</span>
                  <RichText parts={t.event} className="text-gray-400 text-sm mt-1" linkClassName="text-brand font-bold hover:text-brand-200 transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}