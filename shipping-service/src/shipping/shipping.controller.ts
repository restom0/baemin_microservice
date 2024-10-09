import { Controller } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}
  @MessagePattern('create-shipping')
  shipping(@Payload() data: any) {
    return this.shippingService.shipping(data);
  }
}
