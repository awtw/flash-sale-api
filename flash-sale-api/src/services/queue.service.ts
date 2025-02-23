

import * as amqp from 'amqplib';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../config/logger.config';
import { ProductService } from '../services/product.service';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
    private readonly queueName = 'purchase_queue';
    private readonly logger = new LoggerService();

    constructor(private readonly productService: ProductService) {} // 正確注入 ProductService

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

            this.logger.log(`成功連接 RabbitMQ，佇列: ${this.queueName}`, 'RabbitMQService');

            // 監聽連線關閉
            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ 連線關閉，正在重新連接...', 'RabbitMQService');
                this.connection = null;
                this.channel = null;
                setTimeout(() => this.connect(), 5000);
            });
        } catch (error) {
            this.logger.error(`RabbitMQ 連接失敗: ${error.message}`, 'RabbitMQService');
            process.exit(1);
        }
    }

    async sendToQueue(data: { productId: number }) {
        if (!this.channel) {
            this.logger.warn('RabbitMQ 連線丟失，正在重新建立連線...', 'RabbitMQService');
            await this.connect();
        }
        if (this.channel) {
            this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(data)), {
                persistent: true,
            });
            this.logger.log(`訂單已加入佇列: ${JSON.stringify(data)}`, 'RabbitMQService');
        } else {
            this.logger.error(`佇列不可用，訊息遺失: ${JSON.stringify(data)}`, 'RabbitMQService');
        }
    }

    async consumeQueue(processOrder: (msg: { productId: number }) => Promise<void>) {
        if (!this.channel) {
            await this.connect();
        }
        if (!this.channel) {
            this.logger.error('RabbitMQ 佇列無法連接，消費者無法啟動', 'RabbitMQService');
            return;
        }

        this.channel.consume(this.queueName, async (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                this.logger.log(`從佇列處理訂單: ${JSON.stringify(data)}`, 'RabbitMQService');

                try {
                    await processOrder(data);
                    this.channel!.ack(msg);
                    this.logger.log(`訂單處理成功: ${JSON.stringify(data)}`, 'RabbitMQService');
                } catch (error) {
                    this.logger.error(`訂單處理發生錯誤: ${error.message}`, 'RabbitMQService');
                }
            }
        });
    }

    private async processPurchase(data: { productId: number }) {
        this.logger.log(`處理訂單: ${JSON.stringify(data)}`, 'QueueService');

        try {
            const success = await this.productService.purchase(data.productId);

            if (success) {
                this.logger.log(`訂單處理成功 (商品 ID: ${data.productId})`, 'QueueService');
            } else {
                this.logger.warn(`訂單處理失敗，庫存不足 (商品 ID: ${data.productId})`, 'QueueService');
                throw new Error(`庫存不足，無法處理訂單 (商品 ID: ${data.productId})`);
            }
        } catch (error) {
            this.logger.error(`訂單處理錯誤: ${error.message}`, 'QueueService');
            throw error;
        }
    }

    async onModuleInit() {
        await this.connect(); // 正確建立 RabbitMQ 連線
        await this.consumeQueue(this.processPurchase.bind(this)); // 正確調用 consumeQueue()
    }

    async closeConnection() {
        try {
            if (this.channel) {
                await this.channel.close();
                this.logger.log('RabbitMQ 頻道已關閉', 'RabbitMQService');
            }
            if (this.connection) {
                await this.connection.close();
                this.logger.log('RabbitMQ 連線已關閉', 'RabbitMQService');
            }
        } catch (error) {
            this.logger.error(`關閉 RabbitMQ 連線失敗: ${error.message}`, 'RabbitMQService');
        }
    }

    async onModuleDestroy() {
        await this.closeConnection();
    }
}
