import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { of } from 'rxjs';
import { OrderController } from './order.controller';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

describe('OrderController', () => {
  const jwtService = {
    verifyAsync: jest.fn(),
  };
  const orderService = {
    send: jest.fn(),
  };
  const shippingService = {
    send: jest.fn(),
  };
  let controller: OrderController;

  const validOrder = {
    list_product: [{ product_id: 1, quantity: 2 }],
    email: 'user@example.com',
    full_name: 'User Example',
    phone: '0900000000',
    address: '123 Main St',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new OrderController(
      jwtService as any,
      orderService as any,
      shippingService as any,
    );
  });

  it('requires a token', async () => {
    await expect(controller.order('', '', validOrder)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects malformed order payloads', async () => {
    jwtService.verifyAsync.mockResolvedValue({ user_id: 1 });

    await expect(
      controller.order('Bearer token', '', {
        ...validOrder,
        list_product: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates an order and triggers shipping', async () => {
    jwtService.verifyAsync.mockResolvedValue({ user_id: 1 });
    orderService.send.mockReturnValue(of({ order_id: 9 }));
    shippingService.send.mockReturnValue(of({ shipping_id: 3 }));

    await expect(
      controller.order('', 'Bearer token', validOrder),
    ).resolves.toEqual({
      order_id: 9,
    });

    expect(orderService.send).toHaveBeenCalledWith('create-order', {
      ...validOrder,
      user_id: 1,
    });
    expect(shippingService.send).toHaveBeenCalledWith('create-shipping', {
      ...validOrder,
      user_id: 1,
      order_id: 9,
    });
  });
});
