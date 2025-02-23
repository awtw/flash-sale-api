import { bootstrap } from '../main';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      listen: jest.fn().mockResolvedValue(true),
    }),
  },
}));

describe('Bootstrap', () => {
  it('應該成功啟動 NestJS 應用', async () => {
    await bootstrap();
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });
});
