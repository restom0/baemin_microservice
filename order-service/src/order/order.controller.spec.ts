import { Test } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

describe('OrderController (integration)', () => {
  const orderService = { order: jest.fn() };
  let controller: OrderController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: orderService }],
    }).compile();
    controller = moduleRef.get(OrderController);
  });

  it('routes create-order to the service', async () => {
    const data = { user_id: 1, list_product: [{ product_id: 3 }] };
    orderService.order.mockResolvedValue({ order_id: 10 });

    await expect(controller.order(data)).resolves.toEqual({ order_id: 10 });
    expect(orderService.order).toHaveBeenCalledWith(data);
  });
});
