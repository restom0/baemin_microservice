import { OrderService } from './order.service';

describe('OrderService', () => {
  const prismaService = {
    orders: {
      create: jest.fn(),
    },
  };
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrderService(prismaService as any);
  });

  it('creates an order with user and product data', async () => {
    prismaService.orders.create.mockResolvedValue({ order_id: 1 });

    await expect(
      service.order({ user_id: 5, list_product: [{ product_id: 3 }] }),
    ).resolves.toEqual({ order_id: 1 });

    expect(prismaService.orders.create).toHaveBeenCalledWith({
      data: { user_id: 5, list_product: [{ product_id: 3 }] },
    });
  });

  it('returns null when persistence fails', async () => {
    prismaService.orders.create.mockRejectedValue(new Error('db failed'));

    await expect(service.order({})).resolves.toBeNull();
  });
});
