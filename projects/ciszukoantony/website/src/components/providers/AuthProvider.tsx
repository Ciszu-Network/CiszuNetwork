'use client';

import { useEffect } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store';
import { applyFontSize, applyMuted, getPreferences, savePreferences, pushPreferencesToProfile } from '@/lib/preferences';

interface ProfileRow {
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

async function syncUserToStore(userId: string, email?: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // El perfil puede no existir aún (race condition con el trigger de registro)
      console.error('[AuthProvider] Error fetching profile:', error);
    }

    const p = (profile ?? {}) as ProfileRow;
    const usernameFromEmail = (email || 'user').split('@')[0].toLowerCase();

    useAppStore.getState().setUser({
      id: userId,
      email: email || '',
      username: p.username || usernameFromEmail,
      display_name: p.display_name || usernameFromEmail,
      avatar_url: p.avatar_url ?? undefined,
      role: p.role || 'user',
    });
  } catch (err) {
    console.error('[AuthProvider] Error sincronizando usuario:', err);
  }
}

/**
 * AuthProvider — Componente invisible que mantiene la sesión sincronizada.
 * Se monta UNA VEZ en el RootLayout y escucha cambios de auth de Supabase.
 * Hidrata el store global (Zustand) junto con las preferencias locales.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useAppStore((s) => s.setTheme);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setUser = useAppStore((s) => s.setUser);
  const setIsHydrated = useAppStore((s) => s.setIsHydrated);

  // 1. Hidratar preferencias locales (tema/idioma/zoom/silencio) en el store y el DOM
  //    IMPORTANTE: skipReload=true. Sin esto, setTheme/setLanguage programan
  //    la recarga diferida del store y la página se recargaba SOLA ~1.8s
  //    después de cargar ("se actualiza antes del guard"), en cada visita.
  useEffect(() => {
    const prefs = getPreferences();
    setTheme(prefs.theme, true);
    setLanguage(prefs.lang, true);
    applyFontSize(prefs.fontSize);
    if (prefs.muted) applyMuted(true);
  }, [setTheme, setLanguage]);

  // 2. Sesión existente + suscripción a cambios de auth (login, logout, refresh)
  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await syncUserToStore(session.user.id, session.user.email ?? undefined);
      }
      setIsHydrated(true);
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
          await syncUserToStore(session.user.id, session.user.email ?? undefined);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setIsHydrated]);

  // 3. Persistencia de tema/idioma (siempre) + sincronización al perfil (si hay sesión)
  const theme = useAppStore((s) => s.theme);
  const language = useAppStore((s) => s.language);
  const user = useAppStore((s) => s.user);
  const isHydrated = useAppStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    const prefs = getPreferences();
    savePreferences({ ...prefs, theme, lang: language });

    if (user) {
      pushPreferencesToProfile(user.id);
    }
  }, [isHydrated, theme, language, user]);

  return <>{children}</>;
}