import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFY_NAME',
        transport: Transport.RMQ,
        options: {
          // url kết nối đến server RabbitMQ
          urls: ['amqp://admin:admin123@some-rabbit:5672'],
          // tên queue xử lý
          queue: 'notify_queue',
          queueOptions: {
            // chế độ lưu trữ:
            // true: save - false not save, khi RabbitMQrestart
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
})
export class ShippingModule {}
