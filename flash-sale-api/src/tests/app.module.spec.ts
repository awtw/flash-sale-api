import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('應該成功建立 AppModule', () => {
    expect(module).toBeDefined();
  });
});
