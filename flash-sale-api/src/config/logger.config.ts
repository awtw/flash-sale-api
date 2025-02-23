import { Logger } from '@nestjs/common';

export class LoggerService extends Logger {
  log(message: string, context?: string) {
    console.log(`[INFO] ${message}`);
  }

  warn(message: string, context?: string) {
    console.warn(`[WARNING] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[ERROR] ${message}`, trace);
  }

  debug(message: string, context?: string) {
    console.debug(`[DEBUG] ${message}`);
  }
}
