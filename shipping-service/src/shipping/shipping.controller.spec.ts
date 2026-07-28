import { Test } from '@nestjs/testing';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';

describe('ShippingController (integration)', () => {
  const shippingService = { shipping: jest.fn() };
  let controller: ShippingController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [ShippingController],
      providers: [{ provide: ShippingService, useValue: shippingService }],
    }).compile();
    controller = moduleRef.get(ShippingController);
  });

  it('routes create-shipping to the service', async () => {
    const data = { order_id: 1, full_name: 'User', email: 'u@e.com' };
    shippingService.shipping.mockResolvedValue({ ship_id: 3 });

    await expect(controller.shipping(data)).resolves.toEqual({ ship_id: 3 });
    expect(shippingService.shipping).toHaveBeenCalledWith(data);
  });
});
