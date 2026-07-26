import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}
  async order(data: any) {
    try {
      const { user_id, list_product } = data;
      const newOrder = {
        user_id: user_id,
        list_product: list_product,
      };
      const orderSuccess = await this.prismaService.orders.create({
        data: newOrder,
      });
      return orderSuccess;
    } catch {
      return null;
    }
  }
}
