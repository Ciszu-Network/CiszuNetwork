import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import CommandExplorer from '@/components/CommandExplorer';
import { BOT_PREFIX, getDict, parseLang } from '@/lib/i18n';

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
    <div className="bg-bg py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-ink">{t.commandsPage.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t.commandsPage.subtitle}</p>
          <p className="mt-3 text-sm text-faint">
            {t.commandsPage.prefixNote}: <code className="text-brand-600 dark:text-brand-300 bg-card border border-border px-2 py-0.5 rounded">{BOT_PREFIX}</code>
          </p>
        </div>
        <CommandExplorer dict={t} prefix={BOT_PREFIX} />
      </div>
    </div>
  );
}
