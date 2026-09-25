import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { InfoHero } from '@ciszu/ui';
import CommandExplorer from '@/components/CommandExplorer';
import { BOT_PREFIX, getDict, parseLang } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

export const metadata: Metadata = {
  title: 'CiszuBot | COMMANDS',
  description:
    'Todos los comandos de CiszuBot con descripción, uso y aliases. Diversión, información, social y utilidad.',
};

export default async function CommandsPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <PageReveal>
          <InfoHero
            icon="terminal"
            title={t.commandsPage.title}
            subtitle={t.commandsPage.subtitle}
            theme={THEME}
          />
        </PageReveal>
        <p className="-mt-8 mb-12 text-center text-sm text-faint">
          {t.commandsPage.prefixNote}: <code className="text-brand-600 dark:text-brand-300 bg-card border border-border px-2 py-0.5 rounded">{BOT_PREFIX}</code>
        </p>
        <CommandExplorer dict={t} prefix={BOT_PREFIX} />
      </div>

      <QuickDocks />
    </div>
  );
}
