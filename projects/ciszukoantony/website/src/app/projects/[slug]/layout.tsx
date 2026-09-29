import type { Metadata } from 'next';
import { metadataForPath } from '@/lib/page-metadata';

/**
 * Metadata SSR estatica por slug de proyecto (Fase 4, STATIC_MIGRATION_PLAN
 * §4.5). La pagina es un client component; `params` no fuerza render dinamico
 * y permite conservar la metadata especifica de cada proyecto.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return metadataForPath(`/projects/${slug}`);
}

export default function ProjectSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
