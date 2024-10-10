import { Body, Controller, Headers, Inject, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('order')
export class OrderController {
  constructor(
    private jwtService: JwtService,
    @Inject('ORDER_NAME') private orderService: ClientProxy,
    @Inject('SHIPPING_NAME') private shippingService: ClientProxy,
  ) {}
  @Post('/order')
  async order(@Headers('token') token, @Body() model) {
    let decode = this.jwtService.decode(token);
    let newOrder = {
      user_id: decode.user_id,
      list_product: model.list_product,
      email: model.email,
      full_name: model.full_name,
      phone: model.phone,
      address: model.address,
    };
    let orderResult = await lastValueFrom(
      this.orderService.send('create-order', newOrder),
    );
    if (orderResult != null) {
      this.shippingService.send('create-shipping', {
        ...newOrder,
        order_id: orderResult.order_id,
      });
    }
    //this.notifyService.send('create-order-notify', newOrder);
    return orderResult;
  }
}
