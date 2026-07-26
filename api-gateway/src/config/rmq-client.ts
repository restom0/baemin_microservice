import { ClientProviderOptions, Transport } from '@nestjs/microservices';

const defaultUrl = 'amqp://admin:admin123@some-rabbit:5672';

export function createRmqClient(
  name: string,
  queue: string,
): ClientProviderOptions {
  return {
    name,
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || defaultUrl],
      queue,
      queueOptions: {
        durable: process.env.RABBITMQ_DURABLE === 'true',
      },
    },
  };
}
