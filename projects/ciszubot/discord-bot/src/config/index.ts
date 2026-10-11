import { ActivityType } from 'discord.js';
import fs from 'fs';
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

// Layout-agnóstico: funciona compilado (dist/src/config), desde la raíz del
// paquete o desde el cwd del panel (standalone).
const CANDIDATES = [
  path.join(__dirname, '..', '..', '..', 'bot-config.json'),
  path.join(process.cwd(), 'bot-config.json'),
  path.join(__dirname, '..', '..', 'bot-config.json'),
];

function loadRawConfig(): Partial<BotConfig> {
  for (const candidate of CANDIDATES) {
    try {
      if (fs.existsSync(candidate)) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(candidate) as Partial<BotConfig>;
      }
    } catch {
      // siguiente candidato
    }
  }
  return {};
}

const raw = loadRawConfig();

export const config: BotConfig = {
  activity: raw.activity ?? { name: 'cz!help', type: ActivityType.Playing },
  colors: raw.colors ?? { primary: '#4f46e5', secondary: '#8b5cf6' },
  prefix: process.env.PREFIX || raw.prefix || 'cz!',
  version: raw.version ?? '3.2.0',
};

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const GUILD_ID = process.env.GUILD_ID || null;
export const NODE_ENV = process.env.NODE_ENV || 'production';
