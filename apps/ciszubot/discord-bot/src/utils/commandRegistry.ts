import { Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import type { BotCommand } from '../types/command';
import { logger } from '../services/logger';

export class CommandRegistry {
  commands = new Collection<string, BotCommand>();
  aliases = new Collection<string, string>();

  load(dir: string): void {
    const commandsPath = path.join(dir, 'commands');
    if (!fs.existsSync(commandsPath)) {
      fs.mkdirSync(commandsPath, { recursive: true });
      logger.info('Directorio commands creado');
      return;
    }

    const files = fs
      .readdirSync(commandsPath)
      .filter((f) => f.endsWith('.js') && !f.endsWith('.d.ts'));

    for (const file of files) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const loaded = require(path.join(commandsPath, file)) as BotCommand & { default?: BotCommand };
      const command = loaded.default ?? loaded;
      if (command?.name && typeof command.execute === 'function') {
        this.commands.set(command.name, command);
        logger.info(`Comando cargado: ${command.name}`);
        for (const alias of command.aliases ?? []) {
          this.aliases.set(alias, command.name);
          logger.info(`Alias cargado: ${alias} -> ${command.name}`);
        }
      } else {
        logger.warn(`El comando en ${file} no tiene las propiedades requeridas`);
      }
    }
  }

  get(name: string): BotCommand | undefined {
    return this.commands.get(name) || this.commands.get(this.aliases.get(name) ?? '');
  }
}
