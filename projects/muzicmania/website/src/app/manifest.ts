
export default function manifest() {
  return {
    name: "MuzicMania — El Juego de Ritmo Definitivo",
    short_name: "MuzicMania",
    description:
      "Domina el beat en una dimensión online con estética futurista. Juego de ritmo musical de Ciszuko Network.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#010103",
    theme_color: "#ff33cc",
    categories: ["games", "music", "entertainment"],
    lang: "es",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}