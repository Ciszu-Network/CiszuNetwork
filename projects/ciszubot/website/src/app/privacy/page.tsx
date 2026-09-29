'use client';

import LegalPage from '@/components/LegalPage';
import { useClientI18n } from '@/hooks/useClientI18n';
import QuickDocks from '@/components/molecules/QuickDocks';

export default function PrivacyPage() {
  const { dict: t } = useClientI18n();

  return (
    <>
      <LegalPage dict={t} kind="privacy" title={t.footer.privacy} />
      <QuickDocks />
    </>
  );
}
