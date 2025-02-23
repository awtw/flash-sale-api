import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { QueueService } from '../services/queue.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly queueService: QueueService,
  ) {}

  @Get(':id')
  async getStock(@Param('id') id: number) {
    let stock =  await this.productService.getStock(id);
    return {  stock: stock };
  }

  @Post('/purchase')
  async purchase(@Body('productId') productId: number) {
    await this.queueService.sendToQueue({ productId });
    return { message: '訂單已送出，請稍候處理' };
  }
}
