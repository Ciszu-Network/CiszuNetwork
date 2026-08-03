import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import LegalPage from '@/components/LegalPage';
import { getDict, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Términos de servicio — CiszuBot',
  description: 'Términos de servicio de CiszuBot, el bot de Discord de Ciszu Network.',
};

export default async function TermsPage() {
  const store = await cookies();
  const lang = (store.get('ciszubot_lang')?.value ?? 'es') as Lang;
  const t = getDict(lang);

  return <LegalPage dict={t} kind="terms" title={t.footer.terms} />;
}
