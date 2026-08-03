'use client';

import { useEffect } from 'react';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store/useAppStore';

/**
 * AuthProvider — Componente invisible que mantiene la sesión sincronizada.
 * Se monta UNA VEZ en el RootLayout y escucha cambios de auth de Supabase.
 * Hidrata el store global (Zustand) con el usuario actual en cada recarga.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsHydrated } = useAppStore();

  useEffect(() => {
    // 1. Cargar sesión existente al montar (hidratación inicial)
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await syncUserToStore(session.user.id, session.user.email ?? '');
      }
      setIsHydrated(true);
    };

    loadSession();

    // 2. Suscribirse a cambios futuros de auth (login, logout, token refresh, email confirm)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        await syncUserToStore(session.user.id, session.user.email ?? '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await syncUserToStore(session.user.id, session.user.email ?? '');
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  async function syncUserToStore(userId: string, email: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, role, is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // El perfil puede no existir aún (race condition con el trigger de registro)
        console.error('[AuthProvider] Error fetching profile:', error);
      }

      // Si el perfil existe y tiene username válido, usarlo.
      // Si no, usar el prefijo del email como fallback temporal.
      const usernameFromEmail = email.split('@')[0].toLowerCase();
      
      setUser({
        id: userId,
        email,
        username: profile?.username || usernameFromEmail,
        display_name: profile?.display_name || usernameFromEmail,
        avatar_url: profile?.avatar_url ?? undefined,
        role: profile?.is_admin ? 'admin' : (profile?.role || 'user'),
      });
    } catch (err) {
      console.error('[AuthProvider] Error sincronizando usuario:', err);
    }
  }

  return <>{children}</>;
}
