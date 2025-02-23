import * as amqp from 'amqplib';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { config } from 'dotenv';
import { LoggerService } from './logger.config';

config();
const logger = new LoggerService();

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly queueName = 'purchase_queue';
  private consumerTag: string | null = null;

  async connect() {
    if (this.connection) return;

    try {
      this.connection = await amqp.connect({
        hostname: process.env.RABBITMQ_HOST,
        port: Number(process.env.RABBITMQ_PORT),
        username: process.env.RABBITMQ_USER,
        password: process.env.RABBITMQ_PASSWORD,
      });

      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });

      logger.log(`成功連接 RabbitMQ，佇列: ${this.queueName}`, 'RabbitMQService');

      this.connection.on('close', async () => {
        logger.warn('RabbitMQ 連線關閉，正在重新連接...', 'RabbitMQService');
        this.connection = null;
        this.channel = null;
        await this.connect();
      });

    } catch (error) {
      logger.error(`RabbitMQ 連接失敗`, error.message, 'RabbitMQService');
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
    }
  }

  async sendToQueue(message: object) {
    if (!this.channel) {
      await this.connect();
    }
    if (this.channel) {
      this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
      logger.log(`訂單已加入佇列: ${JSON.stringify(message)}`, 'RabbitMQService');
    }
  }

  async consumeQueue(processOrder: (msg: any) => Promise<void>) {
    if (!this.channel) {
      await this.connect();
    }
    if (this.channel) {
      const { consumerTag } = await this.channel.consume(this.queueName, async (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          logger.log(`從佇列處理訂單: ${JSON.stringify(data)}`, 'RabbitMQService');

          try {
            await processOrder(data);
            this.channel!.ack(msg);
            logger.log(`訂單處理成功: ${JSON.stringify(data)}`, 'RabbitMQService');
          } catch (error) {
            logger.error(`訂單處理失敗`, error.message, 'RabbitMQService');
          }
        }
      });

      this.consumerTag = consumerTag; // 記錄 consumerTag 以便測試時取消
    }
  }

  async closeConnection() {
    try {
      if (this.channel) {
        await this.channel.close();
        logger.log('RabbitMQ 頻道已關閉', 'RabbitMQService');
      }
      if (this.connection) {
        await this.connection.close();
        logger.log('RabbitMQ 連線已關閉', 'RabbitMQService');
      }
    } catch (error) {
      logger.error(`關閉 RabbitMQ 連線失敗: ${error.message}`, 'RabbitMQService');
    }
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }
}
