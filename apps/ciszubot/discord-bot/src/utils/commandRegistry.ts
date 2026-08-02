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
      const loaded = require(path.join(commandsPath, file)) as
        | BotCommand
        | BotCommand[]
        | (() => BotCommand)
        | Array<() => BotCommand>
        | { default?: BotCommand | BotCommand[] | (() => BotCommand) | Array<() => BotCommand> };
      const raw = (loaded as { default?: BotCommand | BotCommand[] | (() => BotCommand) | Array<() => BotCommand> }).default ?? loaded;
      const list = Array.isArray(raw) ? raw : [raw];
      for (const entry of list) {
        // Los comandos pueden ser fábricas: ejecutarlas para obtener el objeto
        let command: BotCommand;
        try {
          command = typeof entry === 'function' ? (entry as () => BotCommand)() : (entry as BotCommand);
        } catch (error) {
          logger.warn(`La fábrica del comando en ${file} falló:`, error);
          continue;
        }
        if (!command?.name || typeof command.execute !== 'function') {
          logger.warn(`El comando en ${file} no tiene las propiedades requeridas`);
          continue;
        }
        this.commands.set(command.name, command);
        logger.info(`Comando cargado: ${command.name}`);
        for (const alias of command.aliases ?? []) {
          this.aliases.set(alias, command.name);
          logger.info(`Alias cargado: ${alias} -> ${command.name}`);
        }
      }
    }
  }

  get(name: string): BotCommand | undefined {
    return this.commands.get(name) || this.commands.get(this.aliases.get(name) ?? '');
  }
}
