import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './product/product.controller';
import { AuthController } from './auth/auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderController } from './order/order.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_NAME',
        transport: Transport.RMQ,
        options: {
          // url kết nối đến server RabbitMQ
          urls: ['amqp://admin:admin123@some-rabbit:5672'],
          // tên queue xử lý
          queue: 'product_queue',
          queueOptions: {
            // chế độ lưu trữ:
            // true: save - false not save, khi RabbitMQrestart
            durable: false,
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'USER_NAME',
        transport: Transport.RMQ,
        options: {
          // url kết nối đến server RabbitMQ
          urls: ['amqp://admin:admin123@some-rabbit:5672'],
          // tên queue xử lý
          queue: 'user_queue',
          queueOptions: {
            // chế độ lưu trữ:
            // true: save - false not save, khi RabbitMQrestart
            durable: false,
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'ORDER_NAME',
        transport: Transport.RMQ,
        options: {
          // url kết nối đến server RabbitMQ
          urls: ['amqp://admin:admin123@some-rabbit:5672'],
          // tên queue xử lý
          queue: 'order_queue',
          queueOptions: {
            // chế độ lưu trữ:
            // true: save - false not save, khi RabbitMQrestart
            durable: false,
          },
        },
      },
    ]),
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
    ClientsModule.register([
      {
        name: 'SHIPPING_NAME',
        transport: Transport.RMQ,
        options: {
          // url kết nối đến server RabbitMQ
          urls: ['amqp://admin:admin123@some-rabbit:5672'],
          // tên queue xử lý
          queue: 'shipping_queue',
          queueOptions: {
            // chế độ lưu trữ:
            // true: save - false not save, khi RabbitMQrestart
            durable: false,
          },
        },
      },
    ]),
    JwtModule.register({ global: true }),
  ],
  controllers: [
    AppController,
    ProductController,
    AuthController,
    OrderController,
  ],
  providers: [AppService],
})
export class AppModule {}
