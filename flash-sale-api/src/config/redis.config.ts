import Redis from 'ioredis';
import { config } from 'dotenv';
import { LoggerService } from './logger.config';

config();
const logger = new LoggerService();

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

redis.on('connect', () => logger.log('已連接 Redis', 'RedisService'));
redis.on('error', (error) => logger.error('Redis 連接失敗', error.message, 'RedisService'));
