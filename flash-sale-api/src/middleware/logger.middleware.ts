import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../config/logger.config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.loggerService.log(`[${req.method}] ${req.url}`, 'Request');
    res.on('finish', () => {
      this.loggerService.log(`[${req.method}] ${req.url} - ${res.statusCode}`, 'Response');
    });
    next();
  }
}
