import * as amqp from 'amqplib';
import { config } from 'dotenv';
import { LoggerService } from './logger.config';

config();
const logger = new LoggerService();

export class RabbitMQService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly queueName = 'purchase_queue';

  async connect() {
    try {
      this.connection = await amqp.connect({
        hostname: process.env.RABBITMQ_HOST,
        port: Number(process.env.RABBITMQ_PORT),
        username: process.env.RABBITMQ_USER,
        password: process.env.RABBITMQ_PASSWORD,
      });
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });

      logger.log(`功連接 RabbitMQ，佇列: ${this.queueName}`, 'RabbitMQService');
    } catch (error) {
      logger.error(`RabbitMQ 連接失敗`, error.message, 'RabbitMQService');
      process.exit(1);
    }
  }

  async sendToQueue(message: object) {
    if (!this.channel) {
      await this.connect();
    }
    this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(message)));
    logger.log(`訂單已加入佇列: ${JSON.stringify(message)}`, 'RabbitMQService');
  }

  async consumeQueue(processOrder: (msg: any) => Promise<void>) {
    if (!this.channel) {
      await this.connect();
    }
    this.channel.consume(this.queueName, async (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        logger.log(`從佇列處理訂單: ${JSON.stringify(data)}`, 'RabbitMQService');

        try {
          await processOrder(data);
          this.channel.ack(msg);
          logger.log(`訂單處理成功: ${JSON.stringify(data)}`, 'RabbitMQService');
        } catch (error) {
          logger.error(`訂單處理失敗`, error.message, 'RabbitMQService');
        }
      }
    });
  }
}
