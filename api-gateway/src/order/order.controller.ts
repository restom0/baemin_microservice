import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Inject,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, of, timeout } from 'rxjs';

@Controller('order')
export class OrderController {
  constructor(
    private jwtService: JwtService,
    @Inject('ORDER_NAME') private orderService: ClientProxy,
    @Inject('SHIPPING_NAME') private shippingService: ClientProxy,
  ) {}
  @Post()
  @Post('/order')
  async order(
    @Headers('token') token,
    @Headers('authorization') authorization,
    @Body() model,
  ) {
    const accessToken = this.extractToken(token || authorization);
    if (!accessToken) {
      throw new UnauthorizedException('Token is required');
    }

    const decode = await this.verifyToken(accessToken);
    const { list_product, email, full_name, phone, address } = model ?? {};
    if (
      !Array.isArray(list_product) ||
      !email ||
      !full_name ||
      !phone ||
      !address
    ) {
      throw new BadRequestException('Invalid order payload');
    }

    const newOrder = {
      user_id: decode.user_id,
      list_product,
      email,
      full_name,
      phone,
      address,
    };
    const orderResult = await lastValueFrom(
      this.orderService.send('create-order', newOrder).pipe(
        timeout(5000),
        catchError(() => of(null)),
      ),
    );

    if (orderResult == null) {
      throw new InternalServerErrorException('Could not create order');
    }

    void lastValueFrom(
      this.shippingService
        .send('create-shipping', {
          ...newOrder,
          order_id: orderResult.order_id,
        })
        .pipe(timeout(5000)),
    ).catch(() => undefined);

    return orderResult;
  }

  private extractToken(token?: string) {
    if (!token) {
      return null;
    }

    return token.replace(/^Bearer\s+/i, '').trim();
  }

  private async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<{ user_id: number }>(token, {
        secret: process.env.JWT_SECRET || 'BI_MAT',
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
