import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../services/product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../models/product.entity';
import { redis } from '../config/redis.config';

describe('ProductService', () => {
  let service: ProductService;
  let repo: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repo = module.get<Repository<Product>>(getRepositoryToken(Product));

    // ✅ 確保 `repo.manager` 存在
    Object.defineProperty(repo, 'manager', {
      value: {
        transaction: jest.fn(),
      },
    });

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterAll(async () => {
    await redis.quit(); // 確保 Redis 連線關閉
  });

  it('應該正確返回商品庫存', async () => {
    // Mock `repo.findOne()` 而不是 `transaction()`
    jest.spyOn(repo, 'findOne').mockResolvedValue({ id: 1, stock: 5 } as Product);

    const stock = await service.getStock(1);
    expect(stock).toBe(5);
  });

  it('應該成功購買商品', async () => {
    jest.spyOn(repo.manager, 'transaction').mockImplementation(async (callback: any) =>
      callback({
        findOne: jest.fn().mockResolvedValue({ id: 1, stock: 5 } as Product),
        save: jest.fn().mockResolvedValue({ id: 1, stock: 4 } as Product) // 減少庫存
      } as any)
    );

    const result = await service.purchase(1);
    expect(result).toBe(true);
  });

  it('應該購買失敗（庫存不足）', async () => {
    jest.spyOn(repo.manager, 'transaction').mockImplementation(async (callback: any) =>
      callback({
        findOne: jest.fn().mockResolvedValue({ id: 1, stock: 0 } as Product),
        save: jest.fn(),
      } as any)
    );

    const result = await service.purchase(1);
    expect(result).toBe(false);
  });
});
