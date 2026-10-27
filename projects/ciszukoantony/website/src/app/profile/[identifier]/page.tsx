'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/templates/MainLayout';
import { PublicProfileView, type PublicProfileData } from '@ciszu/ui';
import { supabase } from '@/config/supabase';
import { useDict } from '@/components/providers/I18nProvider';

interface ProfileRow {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const t = useDict();
  const params = useParams();
  const identifier = params?.identifier;
  const rawIdentifier = Array.isArray(identifier) ? identifier[0] : identifier;
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    const raw = rawIdentifier;

    if (!raw) {
      setLoading(false);
      setNotFound(true);
      return () => {
        alive = false;
      };
    }

    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch {
      decoded = raw;
    }

    const query = supabase.from('profiles').select('id, username, display_name, avatar_url');
    const request = decoded.startsWith('@')
      ? query.ilike('username', decoded.slice(1).toLowerCase())
      : query.eq('id', decoded);

    void request.maybeSingle().then(({ data, error }) => {
      if (!alive) return;
      if (error || !data) {
        setProfile(null);
        setNotFound(true);
      } else {
        const row = data as ProfileRow;
        setProfile({
          id: row.id,
          username: row.username,
          displayName: row.display_name,
          avatarUrl: row.avatar_url,
        });
        setNotFound(false);
      }
      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [rawIdentifier]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-neon-blue border-t-transparent" />
          <p className="animate-pulse text-[10px] font-black uppercase tracking-widest text-neon-blue">
            {t.common.loading}
          </p>
        </div>
      </MainLayout>
    );
  }

  if (notFound || !profile) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
          <h1 className="select-none text-8xl font-black text-white/10">404</h1>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-neon-pink">{t.notFound.profileTitle}</h2>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
              {t.notFound.profileBody}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-neon-pink transition hover:bg-neon-pink hover:text-white"
          >
            {t.common.backToHome}
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PublicProfileView profile={profile} siteName="Ciszuko Antony" />
    </MainLayout>
  );
}
