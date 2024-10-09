import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @MessagePattern('create-order')
  order(@Payload() data: any) {
    return this.orderService.order(data);
  }
}
