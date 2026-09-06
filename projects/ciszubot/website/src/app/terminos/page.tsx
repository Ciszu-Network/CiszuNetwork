import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import LegalPage from '@/components/LegalPage';
import { getDict, parseLang } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';

export const metadata: Metadata = {
  title: 'CiszuBot | TERMS',
  description: 'Términos de servicio de CiszuBot, el bot de Discord de Ciszu Network.',
};

export default async function TermsPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  return (
    <>
      <QuickDocks />
      <LegalPage dict={t} kind="terms" title={t.footer.terms} />
    </>
  );
}
