import fs from 'fs';
import path from 'path';

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

const LEVELS: Record<LogLevel, number> = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };

class Logger {
  private readonly logDir = path.join(__dirname, '..', '..', 'logs');
  private readonly logFile = path.join(this.logDir, 'bot.log');
  private readonly errorFile = path.join(this.logDir, 'error.log');
  private readonly currentLevel: number;

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    const envLevel = (process.env.LOG_LEVEL || 'info').toUpperCase();
    this.currentLevel = LEVELS[envLevel as LogLevel] ?? LEVELS.INFO;
  }

  private format(level: LogLevel, message: string, data: unknown = null): string {
    const ts = new Date().toISOString();
    let out = `[${ts}] [${level}] ${message}`;
    if (data !== null && data !== undefined) {
      if (data instanceof Error) out += `\n${data.stack}`;
      else if (typeof data === 'object') out += `\n${JSON.stringify(data, null, 2)}`;
      else out += ` ${data}`;
    }
    return out;
  }

  private write(file: string, msg: string): void {
    try {
      fs.appendFileSync(file, msg + '\n');
    } catch {
      // nunca romper el bot por un fallo de log
    }
  }

  error(message: string, data?: unknown): void {
    if (this.currentLevel >= LEVELS.ERROR) {
      const line = this.format('ERROR', message, data);
      console.error('\x1b[31m%s\x1b[0m', line);
      this.write(this.errorFile, line);
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.currentLevel >= LEVELS.WARN) {
      const line = this.format('WARN', message, data);
      console.warn('\x1b[33m%s\x1b[0m', line);
      this.write(this.logFile, line);
    }
  }

  info(message: string, data?: unknown): void {
    if (this.currentLevel >= LEVELS.INFO) {
      const line = this.format('INFO', message, data);
      console.log('\x1b[36m%s\x1b[0m', line);
      this.write(this.logFile, line);
    }
  }

  debug(message: string, data?: unknown): void {
    if (this.currentLevel >= LEVELS.DEBUG) {
      const line = this.format('DEBUG', message, data);
      console.log('\x1b[37m%s\x1b[0m', line);
      this.write(this.logFile, line);
    }
  }
}

export const logger = new Logger();
