import { puckHandler } from "@puckeditor/cloud-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handleRequest = (request: Request) => {
  return puckHandler(request, {
    ai: {
      context:
        "Ciszuko Antony es el portfolio personal de Francisco García (Ciszuko Antony), CEO y fundador del ecosistema Ciszu Network: red principal en ciszunetwork.vercel.app, juego de ritmo MuzicMania en muzicmania.vercel.app y el bot de Discord CiszuBot en ciszubot.vercel.app. El portfolio muestra proyectos, certificados, medios y música. Identidad visual neon cyan/rosa sobre fondo negro, con acentos azul brand y púrpura neon. Crea landing pages y secciones de calidad que respeten esa identidad.",
    },
  });
};

export const DELETE = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;