import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from '../config/rabbitmq.config';
import * as amqp from 'amqplib';

jest.mock('amqplib');

describe('RabbitMQService', () => {
  let rabbitMQService: RabbitMQService;
  let mockChannel: any;
  let mockConnection: any;

  beforeEach(async () => {
    mockChannel = {
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
      consume: jest.fn(),
      cancel: jest.fn(),
      ack: jest.fn(),
      close: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn(),
      on: jest.fn()
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [RabbitMQService],
    }).compile();

    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
  });

  afterEach(async () => {
    await rabbitMQService.closeConnection();
  });

  it('應該成功建立連線', async () => {
    await rabbitMQService.connect();
    expect(amqp.connect).toHaveBeenCalled();
    expect(mockConnection.createChannel).toHaveBeenCalled();
  });

  it('應該成功加入佇列', async () => {
    await rabbitMQService.sendToQueue({ productId: 1 });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'purchase_queue',
      Buffer.from(JSON.stringify({ productId: 1 })),
      { persistent: true }
    );
  });
});
