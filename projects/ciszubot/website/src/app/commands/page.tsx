import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { InfoHero, type InfoTheme } from '@ciszu/ui';
import CommandExplorer from '@/components/CommandExplorer';
import { BOT_PREFIX, getDict, parseLang } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';

export const metadata: Metadata = {
  title: 'CiszuBot | COMMANDS',
  description:
    'Todos los comandos de CiszuBot con descripción, uso y aliases. Diversión, información, social y utilidad.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-neon-blue to-neon-purple',
};

export default async function CommandsPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  return (
    <div className="bg-bg py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <InfoHero
          icon="terminal"
          title={t.commandsPage.title}
          subtitle={t.commandsPage.subtitle}
          theme={THEME}
        />
        <p className="-mt-8 mb-12 text-center text-sm text-faint">
          {t.commandsPage.prefixNote}: <code className="text-brand-600 dark:text-brand-300 bg-card border border-border px-2 py-0.5 rounded">{BOT_PREFIX}</code>
        </p>
        <CommandExplorer dict={t} prefix={BOT_PREFIX} />
      </div>

      <QuickDocks />
    </div>
  );
}
