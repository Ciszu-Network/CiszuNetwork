"use client";

import { PlasmicRootProvider } from "@plasmicapp/loader-nextjs";
import { PLASMIC } from "./plasmic-init";

/**
 * ClientPlasmicRootProvider — provee el loader al árbol de Plasmic.
 * Solo renderiza si PLASMIC está activo (dev local con envs).
 */
export function ClientPlasmicRootProvider(props: Omit<React.ComponentProps<typeof PlasmicRootProvider>, "loader">) {
  if (!PLASMIC) return null;
  return <PlasmicRootProvider loader={PLASMIC} {...props} />;
}

// Permite el side-effect import desde /plasmic-host (registro de componentes).
export {};