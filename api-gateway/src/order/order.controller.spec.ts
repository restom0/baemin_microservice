import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
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

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('requires a token', async () => {
    await expect(controller.order('', '', validOrder)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an invalid/expired token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));

    await expect(
      controller.order('Bearer token', '', validOrder),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an empty order body', async () => {
    jwtService.verifyAsync.mockResolvedValue({ user_id: 1 });

    await expect(
      controller.order('Bearer token', '', undefined),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([
    ['list_product', { list_product: null }],
    ['email', { email: '' }],
    ['full_name', { full_name: '' }],
    ['phone', { phone: '' }],
    ['address', { address: '' }],
  ])('rejects an order missing %s', async (_field, override) => {
    jwtService.verifyAsync.mockResolvedValue({ user_id: 1 });

    await expect(
      controller.order('Bearer token', '', { ...validOrder, ...override }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(orderService.send).not.toHaveBeenCalled();
  });

  it('creates an order from the token header and dispatches shipping', async () => {
    process.env.JWT_SECRET = 'custom-secret';
    jwtService.verifyAsync.mockResolvedValue({ user_id: 1 });
    orderService.send.mockReturnValue(of({ order_id: 9 }));
    shippingService.send.mockReturnValue(of({ shipping_id: 3 }));

    await expect(
      controller.order('Bearer token', '', validOrder),
    ).resolves.toEqual({ order_id: 9 });

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', {
      secret: 'custom-secret',
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

  it('accepts the token from the authorization header', async () => {
    jwtService.verifyAsync.mockResolvedValue({ user_id: 2 });
    orderService.send.mockReturnValue(of({ order_id: 10 }));
    shippingService.send.mockReturnValue(of({ shipping_id: 4 }));

    await expect(
      controller.order('', 'Bearer token', validOrder),
    ).resolves.toEqual({ order_id: 10 });

    // Falls back to the default secret when JWT_SECRET is unset.
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', {
      secret: 'BI_MAT',
    });
  });

  it('returns a 500 when the order service fails', async () => {
    jwtService.verifyAsync.mockResolvedValue({ user_id: 1 });
    orderService.send.mockReturnValue(
      throwError(() => new Error('order service down')),
    );

    await expect(
      controller.order('Bearer token', '', validOrder),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(shippingService.send).not.toHaveBeenCalled();
  });

  it('still returns the order when shipping dispatch fails', async () => {
    jwtService.verifyAsync.mockResolvedValue({ user_id: 1 });
    orderService.send.mockReturnValue(of({ order_id: 11 }));
    shippingService.send.mockReturnValue(
      throwError(() => new Error('shipping down')),
    );

    await expect(
      controller.order('Bearer token', '', validOrder),
    ).resolves.toEqual({ order_id: 11 });

    // Let the fire-and-forget shipping promise reject so the .catch runs.
    await new Promise((resolve) => setImmediate(resolve));
    expect(shippingService.send).toHaveBeenCalledTimes(1);
  });
});
