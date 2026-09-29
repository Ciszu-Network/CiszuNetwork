'use client';

import {
  Icon,
  InfoHero,
  InfoCardGrid,
  InfoSteps,
  InfoCtaRow,
  type InfoCardItem,
  type InfoStepGroup,
} from '@ciszu/ui';
import InviteButton from './InviteButton';
import { BOT_VERSION, DISCORD_SERVER } from '@/lib/i18n';
import { useClientI18n } from '@/hooks/useClientI18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import Reveal from '@/components/home/Reveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

const PERMISSION_ICONS = ['settings', 'message', 'security', 'music', 'group', 'globe'];
const MODULE_ICONS = ['terminal', 'music', 'money', 'shield', 'star', 'gamepad'];

export default function InvitePage() {
  const { dict: t } = useClientI18n();

  const permissions: InfoCardItem[] = t.invitePage.permissions.map((permission, index) => ({
    icon: PERMISSION_ICONS[index] ?? 'check',
    title: permission.title,
    body: permission.body,
  }));

  const steps: InfoStepGroup[] = t.invitePage.steps.map((step) => ({
    title: step.title,
    body: step.body,
  }));

  const modules: InfoCardItem[] = t.features.items.map((item, index) => ({
    icon: MODULE_ICONS[index] ?? 'check',
    title: item.title,
    body: item.desc,
  }));

  const facts = [
    { icon: 'terminal', label: t.commandsSection.kicker },
    { icon: 'verified', label: BOT_VERSION },
    { icon: 'check', label: t.hero.tagline },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <PageReveal>
          <InfoHero
            icon="discord"
            title={t.invitePage.title}
            subtitle={t.invitePage.subtitle}
            kicker={`${BOT_VERSION} · ${t.invitePage.kicker}`}
            theme={THEME}
          />
        </PageReveal>

        {/* Escenario central: la invitación es el objetivo de la página */}
        <Reveal className="relative -mt-6 mb-16">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[3rem]">
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-blue/10 blur-[100px]" />
            <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-neon-pink/10 blur-[100px]" />
          </div>
          <div className="rounded-[3rem] border border-white/10 bg-black/40 p-8 sm:p-12 backdrop-blur-sm">
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              {facts.map((fact) => (
                <span
                  key={fact.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white/70"
                >
                  <span className="text-neon-blue">
                    <Icon name={fact.icon} size={13} />
                  </span>
                  {fact.label}
                </span>
              ))}
            </div>

            <InviteButton
              label={t.invitePage.cta}
              thanks={t.invitePage.thanks}
              note={t.invitePage.ctaNote}
              flow={{
                title: t.invitePage.flowTitle,
                body: t.invitePage.flowBody,
                done: t.invitePage.flowDone,
                home: t.invitePage.flowHome,
                wait: t.invitePage.flowWait,
                cancel: t.invitePage.flowCancel,
                countdown: t.invitePage.flowCountdown,
                again: t.invitePage.flowAgain,
                confirmed: t.invitePage.flowConfirmed,
              }}
            />

            <p className="mt-8 text-center text-xs text-white/40">{t.features.subtitle}</p>
          </div>
        </Reveal>

        <div className="space-y-16">
          {/* Por qué invitar */}
          <Reveal>
            <InfoCardGrid title={t.features.title} items={modules} theme={THEME} columns={4} />
          </Reveal>

          {/* Permisos */}
          <Reveal>
            <div>
              <InfoCardGrid
                title={t.invitePage.permissionsTitle}
                items={permissions}
                theme={THEME}
                columns={3}
              />
              <div className={`mt-6 flex items-start gap-3 rounded-2xl border p-5 ${THEME.border} ${THEME.card}`}>
                <span className={`mt-0.5 shrink-0 ${THEME.accent}`}>
                  <Icon name="lock" size={18} />
                </span>
                <p className="text-sm text-white/60 leading-relaxed">{t.invitePage.permissionsNote}</p>
              </div>
            </div>
          </Reveal>

          {/* Pasos */}
          <Reveal>
            <InfoSteps title={t.invitePage.stepsTitle} steps={steps} theme={THEME} />
          </Reveal>
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            {
              label: t.invitePage.supportCta,
              href: DISCORD_SERVER,
              icon: 'discord',
              external: true,
              variant: 'ghost',
            },
            {
              label: t.invitePage.exploreCta,
              href: '/explore',
              icon: 'globe',
              variant: 'ghost',
            },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
