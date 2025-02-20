import { Logger } from '@nestjs/common';

export class LoggerService extends Logger {
  log(message: string, context?: string) {
    super.log(`[INFO] ${message}`, context || 'Application');
  }

  warn(message: string, context?: string) {
    super.warn(`[WARNING] ${message}`, context || 'Application');
  }

  error(message: string, trace?: string, context?: string) {
    super.error(`[ERROR] ${message}`, trace, context || 'Application');
  }

  debug(message: string, context?: string) {
    super.debug(`[DEBUG] ${message}`, context || 'Application');
  }
}
