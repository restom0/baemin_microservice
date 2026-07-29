import { Transport } from '@nestjs/microservices';
import { createRmqClient } from './rmq-client';

describe('createRmqClient', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('applies RabbitMQ environment overrides for durable queues', () => {
    process.env.RABBITMQ_URL = 'amqp://custom-host:5672';
    process.env.RABBITMQ_DURABLE = 'true';

    expect(createRmqClient('USER_NAME', 'user_queue')).toEqual({
      name: 'USER_NAME',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://custom-host:5672'],
        queue: 'user_queue',
        queueOptions: { durable: true },
      },
    });
  });

  it('falls back to defaults and non-durable queues when unset', () => {
    delete process.env.RABBITMQ_URL;
    delete process.env.RABBITMQ_DURABLE;

    expect(createRmqClient('ORDER_NAME', 'order_queue').options).toMatchObject({
      urls: ['amqp://admin:admin123@some-rabbit:5672'],
      queue: 'order_queue',
      queueOptions: { durable: false },
    });
  });
});
