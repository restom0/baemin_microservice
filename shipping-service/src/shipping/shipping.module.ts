import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

const rabbitUrl =
  process.env.RABBITMQ_URL || 'amqp://admin:admin123@some-rabbit:5672';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFY_NAME',
        transport: Transport.RMQ,
        options: {
          urls: [rabbitUrl],
          queue: process.env.NOTIFY_QUEUE || 'notify_queue',
          queueOptions: {
            durable: process.env.RABBITMQ_DURABLE === 'true',
          },
        },
      },
    ]),
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
})
export class ShippingModule {}
