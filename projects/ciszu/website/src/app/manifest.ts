import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ciszu Network — Innovación Digital",
    short_name: "CiszuNetwork",
    description:
      "Ciszu Network desarrolla soluciones digitales de alto rendimiento. Proyectos: MuzicMania, CiszuBot, Minecraft, Discord y más.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#233f92",
    categories: ["web", "technology", "entertainment"],
    lang: "es",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}