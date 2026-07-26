import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const rabbitUrl =
    process.env.RABBITMQ_URL || 'amqp://admin:admin123@some-rabbit:5672';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: process.env.NOTIFY_QUEUE || 'notify_queue',
        queueOptions: {
          durable: process.env.RABBITMQ_DURABLE === 'true',
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
