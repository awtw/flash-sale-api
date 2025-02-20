import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../models/product.entity';
import { redis } from '../config/redis.config';
import { LoggerService } from '../config/logger.config';

@Injectable()
export class ProductService implements OnModuleInit {
  private readonly logger = new LoggerService();

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async onModuleInit() {
    await this.seedProducts();
  }

  /**
   * 初始化時插入測試商品
   */
  async seedProducts() {
    const count = await this.productRepo.count();
    if (count === 0) {
      this.logger.log('資料庫無商品，正在插入預設商品...', 'Database');

      const products = [
        { name: '限量商品 A', stock: 10 },
        { name: '限量商品 B', stock: 5 },
        { name: '限量商品 C', stock: 20 },
      ];

      await this.productRepo.save(products);
      this.logger.log('設商品插入完成', 'Database');
    } else {
      this.logger.log('商品已存在，跳過初始化', 'Database');
    }
  }

  async getStock(productId: number): Promise<number> {
    const cacheKey = `product:${productId}:stock`;

    // 檢查 Redis 快取
    const cachedStock = await redis.get(cacheKey);
    if (cachedStock !== null) {
      this.logger.log(`讀取快取庫存: ${cachedStock}`, 'Redis');
      return Number(cachedStock);
    }

    // 查詢資料庫
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) return 0;

    // 更新 Redis 快取，設定 10 秒過期
    await redis.set(cacheKey, product.stock, 'EX', 10);
    this.logger.log(`查詢資料庫，更新快取: ${product.stock}`, 'Database');

    return product.stock;
  }

  async purchase(productId: number): Promise<boolean> {
    const result = await this.productRepo.manager.transaction(
      async (entityManager) => {
        // 使用悲觀鎖避免超賣
        const product = await entityManager.findOne(Product, {
          where: { id: productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product || product.stock <= 0) {
          this.logger.warn(
            `購買失敗，庫存不足 (商品 ID: ${productId})`,
            'Purchase',
          );
          return false;
        }

        // 扣減庫存
        product.stock -= 1;
        await entityManager.save(product);

        // 更新 Redis
        await redis.set(`product:${productId}:stock`, product.stock, 'EX', 10);
        this.logger.log(
          `成功購買 (商品 ID: ${productId})，剩餘庫存: ${product.stock}`,
          'Purchase',
        );
        return true;
      },
    );
    return result;
  }
}
