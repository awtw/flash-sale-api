import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../services/product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../models/product.entity';

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
  });

  it('應該正確返回商品庫存', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue({ id: 1, stock: 10 } as Product);
    const stock = await service.getStock(1);
    expect(stock).toBe(10);
  });

  it('應該成功購買商品（庫存足夠）', async () => {
    const mockProduct = { id: 1, stock: 5 } as Product;
    jest.spyOn(repo, 'findOne').mockResolvedValue(mockProduct);
    jest.spyOn(repo, 'save').mockResolvedValue({ ...mockProduct, stock: 4 });

    const result = await service.purchase(1);
    expect(result).toBe(true);
  });

  it('應該購買失敗（庫存不足）', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue({ id: 1, stock: 0 } as Product);
    const result = await service.purchase(1);
    expect(result).toBe(false);
  });
});
