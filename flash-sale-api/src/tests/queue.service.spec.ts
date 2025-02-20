import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from '../services/queue.service';
import { ProductService } from '../services/product.service';

describe('QueueService', () => {
  let service: QueueService;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: ProductService,
          useValue: {
            purchase: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    productService = module.get<ProductService>(ProductService);
  });

  it('應該成功處理訂單', async () => {
    await service.processPurchase({ productId: 1 });
    expect(productService.purchase).toHaveBeenCalledWith(1);
  });
});
