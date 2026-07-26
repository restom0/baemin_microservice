import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './product/product.controller';
import { AuthController } from './auth/auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import { OrderController } from './order/order.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { createRmqClient } from './config/rmq-client';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsMiddleware } from './metrics/metrics.middleware';
import { MetricsService } from './metrics/metrics.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      createRmqClient(
        'PRODUCT_NAME',
        process.env.PRODUCT_QUEUE || 'product_queue',
      ),
      createRmqClient('USER_NAME', process.env.USER_QUEUE || 'user_queue'),
      createRmqClient('ORDER_NAME', process.env.ORDER_QUEUE || 'order_queue'),
      createRmqClient(
        'NOTIFY_NAME',
        process.env.NOTIFY_QUEUE || 'notify_queue',
      ),
      createRmqClient(
        'SHIPPING_NAME',
        process.env.SHIPPING_QUEUE || 'shipping_queue',
      ),
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'BI_MAT',
    }),
  ],
  controllers: [
    AppController,
    ProductController,
    AuthController,
    OrderController,
    MetricsController,
  ],
  providers: [AppService, MetricsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
