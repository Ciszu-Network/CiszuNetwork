import { puckHandler } from "@puckeditor/cloud-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handleRequest = (request: Request) => {
  return puckHandler(request, {
    ai: {
      context:
        "Ciszu Network es un ecosistema digital creado por Ciszuko Antony: red principal en ciszunetwork.vercel.app, portfolio en ciszukoantony.vercel.app, juego de ritmo MuzicMania en muzicmania.vercel.app y el bot de Discord CiszuBot en ciszubot.vercel.app. Identidad visual neon cyan/rosa sobre fondo negro, fuente Geomanist. Crea landing pages y secciones de alta calidad que respeten esa identidad.",
    },
  });
};

export const DELETE = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;