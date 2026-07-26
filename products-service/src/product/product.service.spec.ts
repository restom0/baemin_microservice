import { ProductService } from './product.service';

describe('ProductService', () => {
  const prismaService = {
    product: {
      count: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };
  const cacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };
  let service: ProductService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductService(prismaService as any, cacheManager as any);
  });

  it('normalizes invalid listing pages to page 1', async () => {
    cacheManager.get.mockResolvedValue(null);
    prismaService.product.findMany.mockResolvedValue([]);
    prismaService.product.count.mockResolvedValue(0);

    await service.getAllProducts(0);

    expect(prismaService.product.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 8,
    });
    expect(cacheManager.set).toHaveBeenCalledWith(
      'products:page:1',
      expect.objectContaining({
        pagination: expect.objectContaining({ page: 1 }),
      }),
    );
  });

  it('paginates product search by name', async () => {
    prismaService.product.findMany.mockResolvedValue([]);
    prismaService.product.count.mockResolvedValue(16);

    await service.getProductByName('ga', 2);

    expect(prismaService.product.findMany).toHaveBeenCalledWith({
      where: { product_name: { contains: 'ga' } },
      skip: 8,
      take: 8,
    });
  });
});
