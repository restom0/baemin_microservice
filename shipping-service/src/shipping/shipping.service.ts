import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShippingService {
  constructor(
    private prismaService: PrismaService,
    @Inject('NOTIFY_NAME') private notifyService: ClientProxy,
  ) {}
  async shipping(data) {
    let { order_id, full_name, email, phone, address } = data;
    let newShip = {
      order_id: order_id,
      full_name: full_name,
      email: email,
      phone: phone,
      address: address,
      create_at: new Date(),
    };
    await this.prismaService.shipping.create({ data: newShip });
    this.notifyService.send('create-shipping-notify', data);
  }
}
