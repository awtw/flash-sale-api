import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';
import { QueueService } from '../services/queue.service';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;
  let queueService: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getStock: jest.fn().mockResolvedValue(10),
            purchase: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: QueueService,
          useValue: {
            sendToQueue: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
    queueService = module.get<QueueService>(QueueService);
  });

  it('應該返回商品庫存', async () => {
    const response = await controller.getStock(1);
    expect(response).toEqual({ stock: 10 });
  });

  it('應該成功購買商品', async () => {
    const response = await controller.purchase(1);
    expect(queueService.sendToQueue).toHaveBeenCalledWith({"productId": 1});
    expect(response).toEqual({ message: '訂單已送出，請稍候處理' });
  });
});
