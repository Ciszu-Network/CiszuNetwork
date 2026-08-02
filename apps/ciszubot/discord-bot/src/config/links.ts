export const LINKS = {
  website: 'https://ciszubot.vercel.app',
  websiteLabel: 'ciszubot.vercel.app',
  network: 'https://ciszunetwork.vercel.app',
  networkLabel: 'ciszunetwork.vercel.app',
  antony: 'https://ciszukoantony.vercel.app',
  antonyLabel: 'ciszukoantony.vercel.app',
  invite: 'https://discord.com/oauth2/authorize?client_id=1395532235872141312&permissions=8&scope=bot%20applications.commands',
  discordServer: 'https://discord.gg/W3kMtMMj6E',
  discordServerLabel: 'discord.gg/W3kMtMMj6E',
  github: 'https://github.com/Ciszu-Network',
  youtube: 'https://www.youtube.com/@CiszuNetwork',
  topggBot: 'https://top.gg/bot/1395532235872141312',
  topggBotVote: 'https://top.gg/bot/1395532235872141312/vote',
  topggServer: 'https://top.gg/es/discord/servers/871620279188504576',
  discordBotListBot: 'https://discordbotlist.com/bots/ciszubot',
  discordBotListServer: 'https://discordbotlist.com/servers/ciszugamens',
  disboardServer: 'https://disboard.org/es/server/1215544133142450187',
  patreon: 'https://www.patreon.com/cw/ciszukoantony',
  koFi: 'https://ko-fi.com/ciszukoantony',
  buyMeACoffee: 'https://buymeacoffee.com/ciszukoantony',
} as const;

export const BOT_COLORS = {
  primary: '#4f46e5',
  secondary: '#8b5cf6',
  success: '#22c55e',
  danger: '#ef4444',
} as const;

export const BOT_FOOTER = (tag: string, iconURL?: string | null) => ({
  text: `CiszuBot • ${tag} • ${LINKS.websiteLabel}`,
  iconURL: iconURL ?? undefined,
});
