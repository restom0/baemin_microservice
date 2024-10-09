import { Controller } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}
  @MessagePattern('create-order-notify')
  sendMailInfoOrder(@Payload() data: any) {
    this.notifyService.sendMailInfoOrder(data);
  }
  @MessagePattern('create-shipping-notify')
  sendMailInfoShipping(@Payload() data: any) {
    this.notifyService.sendMailInfoShipping(data);
  }
}
