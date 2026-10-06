// GENERADO por scripts/build-email-sites.js — NO editar a mano.
// Assets de los emails servidos por el CDN (ciszu-cdn) como URLs https, porque
// Gmail/Outlook no cargan bien los data: URI.
export interface EmailLogo { dataUri: string; width: number; height: number; }

/** Logotipo maestro de Ciszu Network (con engranaje), para el header. */
export const EMAIL_CISZU_WORDMARK: EmailLogo = { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/wordmark.png', width: 190, height: 196 };

/** Isotipo web (a color) para footer/header. */
export const EMAIL_SITE_ISOTYPES: Record<string, EmailLogo> = {
  "ciszu": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/iso-ciszu.png', width: 80, height: 81 },
  "ciszukoantony": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/iso-ciszukoantony.png', width: 80, height: 71 },
  "muzicmania": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/iso-muzicmania.png', width: 80, height: 80 },
  "ciszubot": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/iso-ciszubot.png', width: 120, height: 120 },
};

/** Extras de cabecera por web (adicionales al logotipo maestro). */
export const EMAIL_SITE_HEADER_EXTRAS: Record<string, EmailLogo[]> = {
  "ciszubot": [{ dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/iso-ciszubot.png', width: 120, height: 120 }],
  "muzicmania": [{ dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/head-muzicmania.png', width: 160, height: 32 }],
  "ciszukoantony": [{ dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/iso-ciszukoantony.png', width: 80, height: 71 },{ dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/head-antony-logo.png', width: 150, height: 34 },{ dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/head-antony-yt.png', width: 44, height: 44 }],
};

/** Isotipo monocromo outline blanco de Ciszu Network (footer). */
export const EMAIL_FOOTER_ISOTYPE: EmailLogo = { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/footer-isotipo.png', width: 64, height: 64 };

/** X crossover de unión (footer). */
export const EMAIL_CROSSOVER: EmailLogo = { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/crossover.png', width: 24, height: 24 };

/** Iconos de redes sociales con su color de marca. */
export const EMAIL_SOCIAL_ICONS: Record<string, EmailLogo> = {
  "youtube": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/social-youtube.png', width: 18, height: 18 },
  "instagram": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/social-instagram.png', width: 18, height: 18 },
  "x": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/social-x.png', width: 18, height: 18 },
  "discord": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/social-discord.png', width: 18, height: 18 },
  "github": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/social-github.png', width: 18, height: 18 },
  "tiktok": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/social-tiktok.png', width: 18, height: 18 },
  "facebook": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/social-facebook.png', width: 18, height: 18 },
  "whatsapp": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/social-whatsapp.png', width: 18, height: 18 },
  "telegram": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/social-telegram.png', width: 18, height: 18 },
  "linkedin": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/social-linkedin.png', width: 18, height: 18 },
};

/** Iconos de categoría (color semántico). */
export const EMAIL_CATEGORY_ICONS: Record<string, EmailLogo> = {
  "confirmation": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-confirmation.png', width: 20, height: 20 },
  "recovery": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-recovery.png', width: 20, height: 20 },
  "magic_link": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-magic_link.png', width: 20, height: 20 },
  "email_change": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-email_change.png', width: 20, height: 20 },
  "invite": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-invite.png', width: 20, height: 20 },
  "twofactor": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-twofactor.png', width: 20, height: 20 },
  "welcome": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-welcome.png', width: 20, height: 20 },
  "notification": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-notification.png', width: 20, height: 20 },
  "sponsorship": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-sponsorship.png', width: 20, height: 20 },
  "accountwarning": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-accountwarning.png', width: 20, height: 20 },
  "passwordchanged": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-passwordchanged.png', width: 20, height: 20 },
  "debug": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-debug.png', width: 20, height: 20 },
  "support_ticket": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-support_ticket.png', width: 20, height: 20 },
  "error": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-error.png', width: 20, height: 20 },
  "info": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-info.png', width: 20, height: 20 },
  "disclaimer": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-disclaimer.png', width: 20, height: 20 },
  "supabase": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/cat-supabase.png', width: 20, height: 20 },
};

/** Iconos de UI (copiar, flecha). */
export const EMAIL_UI_ICONS: Record<string, EmailLogo> = {
  "copy": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/ui-copy.png', width: 16, height: 16 },
  "arrow_right": { dataUri: 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/icons/email/ui-arrow_right.png', width: 16, height: 16 },
};
