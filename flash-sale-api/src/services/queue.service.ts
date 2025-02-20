import * as amqp from 'amqplib';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../config/logger.config';
import { RabbitMQService } from '../config/rabbitmq.config';
import { ProductService } from './product.service';

@Injectable()
export class QueueService implements OnModuleInit {
  private rabbitMQService = new RabbitMQService();
  private logger = new LoggerService();

  constructor(private readonly productService: ProductService) {}
  
  async onModuleInit() {
    await this.rabbitMQService.connect();
    await this.rabbitMQService.consumeQueue(this.processPurchase.bind(this));
  }
  
  async processPurchase(data: { productId: number }) {
    this.logger.log(`🔄 從佇列處理訂單: ${JSON.stringify(data)}`, 'QueueService');

    const success = await this.productService.purchase(data.productId);

    if (success) {
      this.logger.log(`訂單處理成功 (商品 ID: ${data.productId})`, 'QueueService');
    } else {
      this.logger.warn(`訂單處理失敗，庫存不足 (商品 ID: ${data.productId})`, 'QueueService');
      throw new Error(`庫存不足，無法處理訂單 (商品 ID: ${data.productId})`);
    }
  }

  async addToQueue(productId: number) {
    await this.rabbitMQService.sendToQueue({ productId });
  }
}
