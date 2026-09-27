import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SocialProfile from '@/components/socials/SocialProfile';
import { getSocial, SOCIAL_IDS } from '@/data/socials';

type SocialPageProps = { params: Promise<{ platform: string }> };

/** Una URL estática por red real del catálogo. */
export function generateStaticParams() {
  return SOCIAL_IDS.map((platform) => ({ platform }));
}

export async function generateMetadata({ params }: SocialPageProps): Promise<Metadata> {
  const { platform } = await params;
  const social = getSocial(platform);
  if (!social) return { title: 'Socials | Ciszuko Antony' };
  return {
    title: `${social.name} | Ciszuko Antony`,
    description: `${social.name} (${social.handle}) — ${social.tagline}. ${social.about}`,
    alternates: { canonical: `https://ciszukoantony.vercel.app/socials/${social.id}` },
  };
}

/**
 * `/socials/<red>` — una página por red REAL de Ciszuko Antony. Las redes que
 * no existen en el catálogo devuelven 404; no se inventan plataformas.
 */
export default async function SocialPage({ params }: SocialPageProps) {
  const { platform } = await params;
  const social = getSocial(platform);
  if (!social) notFound();
  return <SocialProfile social={social} />;
}
