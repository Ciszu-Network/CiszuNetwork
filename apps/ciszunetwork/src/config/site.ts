export const CISZU_NETWORK = {
  name: 'Ciszu Network',
  tagline: 'Bright Future Promised',
  email: 'ciszunetowork@gmail.com',
  phone: '+58 412 6858111',
  location: 'Coro, Falcón, Venezuela',
  timezone: 'GMT-4',
  social: {
    youtube: 'https://www.youtube.com/@CiszuNetwork',
    facebook: 'https://www.facebook.com/profile.php?id=61572023767657',
    instagram: 'https://www.instagram.com/ciszunetwork/',
    x: 'https://x.com/CiszukoAntony',
    github: 'https://github.com/Ciszu-Network',
    discord: 'https://discord.com/invite/W3kMtMMj6E',
  },
};

export const CISZUKO_ANTONY = {
  name: 'Ciszuko Antony',
  role: 'CEO & Fundador — Ciszu Network',
  email: 'fplayersoffcial@gmail.com',
  phone: '+58 412 6858111',
  social: {
    youtube: 'https://www.youtube.com/@CiszukoAntony',
    facebook: 'https://www.facebook.com/ciszukoantony',
    instagram: 'https://www.instagram.com/itz.ciszukoant0nyz/',
    x: 'https://x.com/CiszukoAntony',
    github: 'https://github.com/CiszukoAntony',
    discord: 'https://discord.com/invite/W3kMtMMj6E',
    discordTag: '@ciszukoantony',
  },
  portfolio: 'https://ciszukoantony.vercel.app/',
};

export const EXTERNAL_LINKS = {
  muzicmania: 'https://muzicmania.vercel.app/',
  ciszunetwork: 'https://ciszunetwork.vercel.app/',
  ciszukoantony: 'https://ciszukoantony.vercel.app/',
};

export type SocialPlatform = keyof typeof CISZU_NETWORK.social;

export const SOCIAL_ICONS: Record<SocialPlatform, string> = {
  youtube: '#youtube',
  facebook: '#facebook',
  instagram: '#instagram',
  x: '#x-twitter',
  github: '#github',
  discord: '#discord',
};

export const SOCIAL_COLORS: Record<SocialPlatform, string> = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E4405F',
  x: '#000000',
  github: '#333333',
  discord: '#5865F2',
};

export const PROJECT_SECTIONS = [
  {
    id: 'minecraft',
    title: 'Minecraft',
    desc: 'Texture packs, mods y servidores personalizados con identidad Ciszu.',
    icon: 'pickaxe',
    color: '#44B272',
  },
  {
    id: 'discord',
    title: 'Discord',
    desc: 'Servidores comunitarios y bots inteligentes para tu experiencia.',
    icon: 'message-circle',
    color: '#5865F2',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    desc: 'Comunidades y bots de automatización para empresas y grupos.',
    icon: 'message-square',
    color: '#25D366',
  },
  {
    id: 'telegram',
    title: 'Telegram',
    desc: 'Canales, grupos y bots con tecnología Ciszu.',
    icon: 'send',
    color: '#26A5E4',
  },
  {
    id: 'muzicmania',
    title: 'MuzicMania',
    desc: 'Juego de ritmo definitivo en la web. Estética futurista, mecánicas adictivas.',
    icon: 'music',
    color: '#233f92',
  },
  {
    id: 'ciszunetwork',
    title: 'Ciszu Network',
    desc: 'Compañía de innovación digital. Desarrollo web, infraestructura cloud y UI/UX.',
    icon: 'building',
    color: '#3a6bf0',
  },
  {
    id: 'ciszukoantony',
    title: 'Ciszuko Antony',
    desc: 'Proyecto artístico de youtuber y streamer. Contenido gaming, tech y música.',
    icon: 'user',
    color: '#4a7dff',
  },
];
