import { ActivityType } from 'discord.js';
import path from 'path';

interface BotConfig {
  activity: {
    name: string;
    type: keyof typeof ActivityType | ActivityType;
  };
  colors: {
    primary: string;
    secondary: string;
  };
  prefix: string;
  version: string;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const raw = require(path.join(__dirname, '..', '..', 'bot-config.json')) as BotConfig;

export const config: BotConfig = {
  ...raw,
  prefix: process.env.PREFIX || raw.prefix || 'cz!',
};

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const GUILD_ID = process.env.GUILD_ID || null;
export const NODE_ENV = process.env.NODE_ENV || 'production';
