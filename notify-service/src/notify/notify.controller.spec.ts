import { Test } from '@nestjs/testing';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';

describe('NotifyController (integration)', () => {
  const notifyService = {
    sendMailInfoOrder: jest
      .fn()
      .mockResolvedValue({ status: 200, message: 'Order email sent' }),
    sendMailInfoShipping: jest
      .fn()
      .mockResolvedValue({ status: 200, message: 'Shipping email sent' }),
  };
  let controller: NotifyController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [NotifyController],
      providers: [{ provide: NotifyService, useValue: notifyService }],
    }).compile();
    controller = moduleRef.get(NotifyController);
  });

  it('routes create-order-notify to the service', async () => {
    const data = { email: 'u@example.com', full_name: 'U' };
    await expect(controller.sendMailInfoOrder(data)).resolves.toEqual({
      status: 200,
      message: 'Order email sent',
    });
    expect(notifyService.sendMailInfoOrder).toHaveBeenCalledWith(data);
  });

  it('routes create-shipping-notify to the service', async () => {
    const data = { email: 'u@example.com', full_name: 'U' };
    await expect(controller.sendMailInfoShipping(data)).resolves.toEqual({
      status: 200,
      message: 'Shipping email sent',
    });
    expect(notifyService.sendMailInfoShipping).toHaveBeenCalledWith(data);
  });
});
