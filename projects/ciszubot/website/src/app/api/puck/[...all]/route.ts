import { puckHandler } from "@puckeditor/cloud-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handleRequest = (request: Request) => {
  return puckHandler(request, {
    ai: {
      context:
        "CiszuBot es el bot multipropósito de Discord del ecosistema Ciszu Network (ciszubot.vercel.app), creado por Ciszuko Antony. Ofrece moderación, música, juegos y comandos para servidores de Discord, con dashboard propio. Identidad visual estilo Discord: azules y morados pastel (#233f92, #007bc0), dark mode por defecto, fuente Inter y Exo 2. Crea landing pages y secciones de calidad que respeten esa identidad.",
    },
  });
};

export const DELETE = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;