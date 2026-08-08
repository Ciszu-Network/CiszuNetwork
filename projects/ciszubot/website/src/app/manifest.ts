import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CiszuBot — Bot de Discord de Ciszu Network",
    short_name: "CiszuBot",
    description:
      "Bot multifuncional de Discord con moderación, música, economía, niveles y más. Panel de estado en vivo.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#12141a",
    theme_color: "#3f6fd6",
    categories: ["utilities", "games", "social"],
    lang: "es",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}