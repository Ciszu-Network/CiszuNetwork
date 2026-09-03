'use client';

import { useEffect } from 'react';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store';
import { loadPreferences, savePreferences, syncPreferencesToProfile } from '@/lib/preferences';

/**
 * AuthProvider — Componente invisible que mantiene la sesión CISZU ID sincronizada.
 * Se monta UNA VEZ en el RootLayout: hidrata el store global (Zustand) con el
 * usuario y sus preferencias en cada recarga, y escucha cambios de auth.
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
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
        await syncUserToStore(session.user.id, session.user.email ?? '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  async function syncUserToStore(userId: string, email: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, email, role, settings_lang, settings_theme, settings_controls')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // El perfil puede no existir aún (race condition con el trigger de registro).
      console.error('[AuthProvider] Error fetching profile:', error);
    }

    const usernameFromEmail = email.split('@')[0].toLowerCase();

    setUser({
      id: userId,
      email,
      username: profile?.username || usernameFromEmail,
      display_name: profile?.display_name || usernameFromEmail,
      avatar_url: profile?.avatar_url ?? undefined,
      role: profile?.role || 'user',
    });

    // Preferencias: si hay locales, subirlas al perfil; si no, aplicar las del perfil.
    const localPrefs = loadPreferences();
    const hasLocal = typeof window !== 'undefined' ? window.localStorage.getItem('ciszu_preferences') !== null : false;

    if (profile && !hasLocal) {
      const prefs = {
        lang: profile.settings_lang === 'en' ? 'en' as const : 'es' as const,
        theme: profile.settings_theme === 'light' ? 'light' as const : 'dark' as const,
        zoom: typeof profile.settings_controls?.zoom === 'number' ? profile.settings_controls.zoom : 100,
        tabMuted: profile.settings_controls?.tabMuted === true,
        redirectGuard: profile.settings_controls?.redirectGuard !== false,
        activityGuard: profile.settings_controls?.activityGuard !== false,
      };
      savePreferences(prefs);
      const { setTheme, setLanguage, setZoom, setTabMuted } = useAppStore.getState();
      setTheme(prefs.theme);
      setLanguage(prefs.lang);
      setZoom(prefs.zoom);
      setTabMuted(prefs.tabMuted);
    } else if (profile) {
      await syncPreferencesToProfile(userId, localPrefs);
    }
  }

  return <>{children}</>;
}