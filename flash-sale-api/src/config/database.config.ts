import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '../models/product.entity';
import { LoggerService } from './logger.config';
import { config } from 'dotenv';
config();

const logger = new LoggerService();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Product],
  synchronize: true,
};

logger.log(`Connecting to PostgreSQL at ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`);
