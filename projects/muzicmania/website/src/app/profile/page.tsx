'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import MainLayout from '@/components/templates/MainLayout';
import { usePageTitle } from '@/lib/usePageTitle';

export default function ProfileRedirect() {
  usePageTitle('PROFILE');
  const router = useRouter();
  const { user, showToast } = useAppStore();

  useEffect(() => {
    if (user) {
      router.replace(`/profile/@${user.username}`);
    } else {
      showToast('[SISTEMA]: Debes iniciar sesión para ver tu perfil.');
      router.replace('/login');
    }
  }, [user, router, showToast]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin shadow-neon-blue" />
        <p className="text-neon-cyan font-header font-black uppercase tracking-widest text-xs animate-pulse">
          Redirigiendo...
        </p>
      </div>
    </MainLayout>
  );
}
