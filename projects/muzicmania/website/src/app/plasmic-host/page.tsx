"use client";

import { PlasmicCanvasHost } from "@plasmicapp/loader-nextjs";
import { notFound } from "next/navigation";
import { PLASMIC } from "../../lib/plasmic-init";
import "../../lib/plasmic-init-client";

/**
 * /plasmic-host — página interna del Studio de Plasmic (local).
 * Solo existe en dev: en producción PLASMIC es null → notFound() (404).
 * No es una página para humanos; es el hook del Studio.
 */
export default function PlasmicHost() {
  if (!PLASMIC) notFound();
  return <PlasmicCanvasHost />;
}