import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { databaseConfig } from './config/database.config';
import { Product } from './models/product.entity';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { QueueService } from './services/queue.service';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { LoggerService } from './config/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Product]),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [ProductController],
  providers: [ProductService, QueueService, LoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
