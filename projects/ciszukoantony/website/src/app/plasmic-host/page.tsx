"use client";

import { PlasmicCanvasHost } from "@plasmicapp/loader-nextjs";
import { PLASMIC } from "../../lib/plasmic-init";
import "../../lib/plasmic-init-client";

/**
 * /plasmic-host — página interna del Studio de Plasmic (local).
 * Solo existe en dev: en producción PLASMIC es null y no renderiza nada.
 * No es una página para humanos; es el hook del Studio.
 */
export default function PlasmicHost() {
  if (!PLASMIC) return null;
  return <PlasmicCanvasHost />;
}