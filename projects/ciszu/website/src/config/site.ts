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
    tiktok: 'https://www.tiktok.com/@ciszunetwork',
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
  ciszubot: 'https://ciszubot.vercel.app/',
};

/** Repositorio público principal del ecosistema (monorepo). */
export const GITHUB_REPO = 'https://github.com/Ciszu-Network/CiszuNetwork';

export const CISZUBOT_LINKS = {
  website: 'https://ciszubot.vercel.app/',
  invite: 'https://discord.com/oauth2/authorize?client_id=1395532235872141312&permissions=8&scope=bot%20applications.commands',
  discordServer: 'https://discord.gg/W3kMtMMj6E',
  topggBot: 'https://top.gg/bot/1395532235872141312',
  topggBotVote: 'https://top.gg/bot/1395532235872141312/vote',
  topggServer: 'https://top.gg/es/discord/servers/871620279188504576',
  discordBotListBot: 'https://discordbotlist.com/bots/ciszubot',
  discordBotListServer: 'https://discordbotlist.com/servers/ciszugamens',
  disboardServer: 'https://disboard.org/es/server/1215544133142450187',
};

export const DONATION_LINKS = {
  patreon: 'https://www.patreon.com/cw/ciszukoantony',
  koFi: 'https://ko-fi.com/ciszukoantony',
  buyMeACoffee: 'https://buymeacoffee.com/ciszukoantony',
};

export const WIDGETS = {
  topggBot: 'https://top.gg/api/widget/1395532235872141312.svg',
  topggServer: 'https://top.gg/api/v1/widgets/large/871620279188504576',
  koFiButtonId: 'B0B81NQ9M4',
};

export type SocialPlatform = keyof typeof CISZU_NETWORK.social;

export const SOCIAL_ICONS: Record<SocialPlatform, string> = {
  youtube: '#youtube',
  facebook: '#facebook',
  instagram: '#instagram',
  x: '#x-twitter',
  github: '#github',
  discord: '#discord',
  tiktok: '#tiktok',
};

export const SOCIAL_COLORS: Record<SocialPlatform, string> = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E4405F',
  x: '#000000',
  github: '#333333',
  discord: '#5865F2',
  tiktok: '#000000',
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
