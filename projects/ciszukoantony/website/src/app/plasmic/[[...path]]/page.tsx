import { ComponentRenderData, PlasmicComponent } from "@plasmicapp/loader-nextjs";
import { notFound } from "next/navigation";
import { PLASMIC } from "../../../lib/plasmic-init";
import { ClientPlasmicRootProvider } from "../../../lib/plasmic-init-client";

interface Params {
  path: string[];
}

export const dynamic = "force-dynamic";

/**
 * /plasmic/[[...path]] — renderiza páginas/componentes diseñados en Plasmic.
 * SOLO LOCAL: si PLASMIC es null (sin envs = producción) responde notFound().
 * Prefijo /plasmic/* evita colisionar con las rutas reales de cada web.
 */
export default async function PlasmicPage({ params }: { params: Promise<Params> }) {
  if (!PLASMIC) notFound();

  const { path } = await params;
  const pagePath = path && path.length ? `/${path.join("/")}` : "/";

  const componentData: ComponentRenderData | null = await PLASMIC.maybeFetchComponentData(pagePath);
  if (!componentData || componentData.entryCompMetas.length === 0) notFound();

  const pageMeta = componentData.entryCompMetas[0];

  return (
    <ClientPlasmicRootProvider prefetchedData={componentData} pageRoute={pageMeta.path} pageParams={pageMeta.params}>
      <PlasmicComponent component={pageMeta.displayName} />
    </ClientPlasmicRootProvider>
  );
}