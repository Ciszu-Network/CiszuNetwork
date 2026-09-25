import type { Metadata } from 'next';
import { cookies } from 'next/headers';
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
import { BOT_VERSION, DISCORD_SERVER, getDict, parseLang } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

export const metadata: Metadata = {
  title: 'CiszuBot | INVITE',
  description:
    'Invita a CiszuBot a tu servidor de Discord: permisos que solicita, pasos de instalación y soporte oficial.',
};

const PERMISSION_ICONS = ['settings', 'message', 'security', 'music', 'group', 'globe'];

export default async function InvitePage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  const permissions: InfoCardItem[] = t.invitePage.permissions.map((permission, index) => ({
    icon: PERMISSION_ICONS[index] ?? 'check',
    title: permission.title,
    body: permission.body,
  }));

  const steps: InfoStepGroup[] = t.invitePage.steps.map((step) => ({
    title: step.title,
    body: step.body,
  }));

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

        <div className="-mt-8 mb-16">
          <PageReveal>
            <InviteButton
              label={t.invitePage.cta}
              thanks={t.invitePage.thanks}
              note={t.invitePage.ctaNote}
            />
          </PageReveal>
        </div>

        <div className="space-y-14">
          <div>
            <InfoCardGrid
              title={t.invitePage.permissionsTitle}
              items={permissions}
              theme={THEME}
              columns={3}
            />
            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl border p-5 ${THEME.border} ${THEME.card}`}
            >
              <span className={`mt-0.5 shrink-0 ${THEME.accent}`}>
                <Icon name="lock" size={18} />
              </span>
              <p className="text-sm text-white/60 leading-relaxed">{t.invitePage.permissionsNote}</p>
            </div>
          </div>

          <InfoSteps title={t.invitePage.stepsTitle} steps={steps} theme={THEME} />
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
