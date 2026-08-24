import { initPlasmicLoader } from "@plasmicapp/loader-nextjs/react-server-conditional";

/**
 * Plasmic — visual builder (integración LOCAL, no en producción).
 *
 * El loader se inicializa SOLO si están definidas las env de desarrollo:
 *   PLASMIC_PROJECT_ID   — ID del proyecto en studio.plasmic.app (URL del Studio).
 *   PLASMIC_PUBLIC_TOKEN — Public API token (botón "Code" del Studio).
 *
 * Sin esas env (caso Vercel/producción) el loader es un no-op y las rutas
 * /plasmic/* responden notFound(): Plasmic NUNCA se usa en producción.
 * El diseño se hace en el Studio local y se sirve en el dev server.
 */
const projectId = process.env.PLASMIC_PROJECT_ID;
const publicToken = process.env.PLASMIC_PUBLIC_TOKEN;

export const PLASMIC = projectId && publicToken
  ? initPlasmicLoader({
      projects: [{ id: projectId, token: publicToken }],
      preview: process.env.NODE_ENV === "development",
    })
  : null;