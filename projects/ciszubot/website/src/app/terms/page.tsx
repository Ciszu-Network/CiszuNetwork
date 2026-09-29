'use client';

import LegalPage from '@/components/LegalPage';
import { useClientI18n } from '@/hooks/useClientI18n';
import QuickDocks from '@/components/molecules/QuickDocks';

export default function TermsPage() {
  const { dict: t } = useClientI18n();

  return (
    <>
      <LegalPage dict={t} kind="terms" title={t.footer.terms} />
      <QuickDocks />
    </>
  );
}
