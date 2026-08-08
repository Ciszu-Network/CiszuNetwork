import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ciszuko Antony | CEO & Founder of Ciszuko Network",
    short_name: "CiszukoAntony",
    description:
      "Portfolio oficial de Ciszuko Antony (Francisco García Antonio M.) — CEO & Founder de Ciszuko Network. Innovación, desarrollo y tecnología.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#233f92",
    categories: ["portfolio", "technology", "personal"],
    lang: "en",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}