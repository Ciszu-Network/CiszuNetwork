import { puckHandler } from "@puckeditor/cloud-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handleRequest = (request: Request) => {
  return puckHandler(request, {
    ai: {
      context:
        "MuzicMania es el juego de ritmo definitivo del ecosistema Ciszu Network (muzicmania.vercel.app), creado por Ciszuko Antony. Juego web con estética futurista neon/synthwave: fondo negro, acentos neon cyan, azul, rosa y púrpura, fuentes Exo 2, Rajdhani y Century Gothic. Incluye ranking online, canciones, descarga de app de escritorio (Tauri) y comunidad. Crea landing pages y secciones de calidad que respeten esa identidad.",
    },
  });
};

export const DELETE = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;