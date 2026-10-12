// GENERADO por scripts/build-email-sites.js — NO editar a mano.
// Assets de los emails como PNG alojados por https en el CDN (ciszu-cdn/email/
// assets). Gmail bloquea los data: URIs y no renderiza SVG, así que las
// imágenes de email SIEMPRE van por URL https pública con alt text.
export interface EmailLogo { dataUri: string; width: number; height: number; }

/** Logotipo maestro FULL (el del index de ciszunetwork). */
export const EMAIL_CISZU_WORDMARK: EmailLogo =   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-01.png', width: 200, height: 107 };

/** Isotipo web a color (footer). ciszubot = isotipo circular. */
export const EMAIL_SITE_ISOTYPES: Record<string, EmailLogo> = {
  "ciszu":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-02.png', width: 80, height: 81 },
  "ciszukoantony":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-03.png', width: 80, height: 71 },
  "ciszubot":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-04.png', width: 72, height: 72 },
  "muzicmania":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-05.png', width: 80, height: 80 },
};

/** Isotipo de ciszunetwork monocromo outline blanco (footer, ciszu/web). */
export const EMAIL_FOOTER_ISOTYPE: EmailLogo =   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-06.png', width: 64, height: 64 };

/** Extras de cabecera por web (además del logotipo maestro). */
export const EMAIL_SITE_HEADER_EXTRAS: Record<string, EmailLogo[]> = {
  "ciszubot": [  { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-07.png', width: 72, height: 72 },  { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-08.png', width: 180, height: 33 }],
  "muzicmania": [  { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-09.png', width: 80, height: 80 },  { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-10.png', width: 170, height: 34 }],
  "ciszukoantony": [  { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-11.png', width: 80, height: 71 },  { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-12.png', width: 170, height: 40 },  { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-13.png', width: 46, height: 46 }],
  "ciszu": [],
};

/** X crossover (unión) — lucide, no la marca de Twitter. */
export const EMAIL_CROSSOVER: EmailLogo =   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-14.png', width: 26, height: 26 };

/** Iconos de redes sociales con su color de marca. */
export const EMAIL_SOCIAL_ICONS: Record<string, EmailLogo> = {
  "youtube":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-15.png', width: 18, height: 18 },
  "instagram":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-16.png', width: 18, height: 18 },
  "x":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-17.png', width: 18, height: 18 },
  "discord":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-18.png', width: 18, height: 18 },
  "github":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-19.png', width: 18, height: 18 },
  "tiktok":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-20.png', width: 18, height: 18 },
  "facebook":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-21.png', width: 18, height: 18 },
  "whatsapp":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-22.png', width: 18, height: 18 },
  "telegram":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-23.png', width: 18, height: 18 },
  "linkedin":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-24.png', width: 18, height: 18 },
  "twitch":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-25.png', width: 18, height: 18 },
};

/** Iconos de categoría (color semántico). */
export const EMAIL_CATEGORY_ICONS: Record<string, EmailLogo> = {
  "confirmation":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-26.png', width: 20, height: 20 },
  "recovery":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-27.png', width: 20, height: 20 },
  "magic_link":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-28.png', width: 20, height: 20 },
  "email_change":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-29.png', width: 20, height: 20 },
  "invite":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-30.png', width: 20, height: 20 },
  "twofactor":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-31.png', width: 20, height: 20 },
  "welcome":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-32.png', width: 20, height: 20 },
  "notification":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-33.png', width: 20, height: 20 },
  "sponsorship":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-34.png', width: 20, height: 20 },
  "accountwarning":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-35.png', width: 20, height: 20 },
  "passwordchanged":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-36.png', width: 20, height: 20 },
  "debug":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-37.png', width: 20, height: 20 },
  "support_ticket":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-38.png', width: 20, height: 20 },
  "error":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-39.png', width: 20, height: 20 },
  "info":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-40.png', width: 20, height: 20 },
  "disclaimer":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-41.png', width: 20, height: 20 },
  "supabase":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-42.png', width: 20, height: 20 },
};

/** Iconos de UI (copiar, flecha). */
export const EMAIL_UI_ICONS: Record<string, EmailLogo> = {
  "copy":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-43.png', width: 16, height: 16 },
  "arrow_right":   { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/email/assets/asset-44.png', width: 16, height: 16 },
};
