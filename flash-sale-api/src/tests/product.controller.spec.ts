import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

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
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('應該返回商品庫存', async () => {
    const stock = await controller.getStock(1);
    expect(stock).toBe(10);
  });

  it('應該成功購買商品', async () => {
    const response = await controller.purchase(1);
    expect(response).toEqual({ message: '訂單已送出，請稍候處理' });
  });
});
