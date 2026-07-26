import { of } from 'rxjs';
import { ShippingService } from './shipping.service';

describe('ShippingService', () => {
  const prismaService = {
    shipping: {
      create: jest.fn(),
    },
  };
  const notifyService = {
    send: jest.fn(),
  };
  let service: ShippingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ShippingService(prismaService as any, notifyService as any);
  });

  it('creates shipping and notifies the customer', async () => {
    prismaService.shipping.create.mockResolvedValue({ shipping_id: 7 });
    notifyService.send.mockReturnValue(of({ status: 200 }));

    await expect(
      service.shipping({
        address: '123 Main St',
        email: 'user@example.com',
        full_name: 'User Example',
        order_id: 1,
        phone: '0900000000',
      }),
    ).resolves.toEqual({ shipping_id: 7 });

    expect(notifyService.send).toHaveBeenCalledWith(
      'create-shipping-notify',
      expect.objectContaining({ order_id: 1 }),
    );
  });
});
