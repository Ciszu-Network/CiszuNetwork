'use client';

import { useEffect, useRef } from 'react';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { useAppStore, type AppUser } from '@/store';

interface DiscordSessionPayload {
  id: string;
  name: string | null;
  avatar: string | null;
  provider: 'discord';
}

/**
 * AuthProvider — componente invisible que sincroniza la sesión global.
 * Se monta una vez en el RootLayout y resuelve la identidad del visitante:
 *  - Sesión CISZU ID (Supabase, schema ciszubot) vía supabase.auth.
 *  - Sesión de Discord (cookie HMAC httpOnly) vía `/api/auth/session`.
 * Prioridad: CISZU ID > Discord. Hidrata el store global (Zustand) en cada
 * montaje y escucha cambios futuros de auth para mantenerlo al día.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsHydrated } = useAppStore();
  const active = useRef(true);

  useEffect(() => {
    active.current = true;

    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active.current) return;

        if (session?.user) {
          await syncSupabaseUser(session.user.id, session.user.email ?? '');
        } else {
          const res = await fetch('/api/auth/session', { cache: 'no-store' });
          const data = (await res.json()) as { session: DiscordSessionPayload | null };
          if (!active.current) return;
          if (data.session) {
            setUser({
              id: data.session.id,
              name: data.session.name,
              avatar: data.session.avatar,
              email: null,
              username: data.session.name ?? undefined,
              display_name: data.session.name ?? undefined,
              provider: 'discord',
            });
          }
        }
      } catch {
        // Red no disponible o endpoint caído: se queda sin sesión (invitado).
      } finally {
        if (active.current) setIsHydrated(true);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!active.current) return;
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
          await syncSupabaseUser(session.user.id, session.user.email ?? '');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      active.current = false;
      subscription.unsubscribe();
    };
  }, [setUser, setIsHydrated]);

  async function syncSupabaseUser(userId: string, email: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url, email, role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthProvider] Error buscando perfil:', error);
      }

      const username = profile?.username || email.split('@')[0].toLowerCase();
      const displayName = profile?.display_name || username;
      const user: AppUser = {
        id: userId,
        name: displayName,
        avatar: profile?.avatar_url ?? null,
        email: profile?.email ?? email,
        username,
        display_name: displayName,
        provider: 'ciszu',
      };
      setUser(user);
    } catch (err) {
      console.error('[AuthProvider] Error sincronizando usuario:', err);
    }
  }

  return <>{children}</>;
}