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

  it('returns cached listing data without hitting the database', async () => {
    cacheManager.get.mockResolvedValue({ cached: true });

    await expect(service.getAllProducts(3)).resolves.toEqual({ cached: true });

    expect(cacheManager.get).toHaveBeenCalledWith('products:page:3');
    expect(prismaService.product.findMany).not.toHaveBeenCalled();
    expect(cacheManager.set).not.toHaveBeenCalled();
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

  it('defaults a missing page to 1 and caches the computed listing', async () => {
    cacheManager.get.mockResolvedValue(null);
    prismaService.product.findMany.mockResolvedValue([{ product_id: 1 }]);
    prismaService.product.count.mockResolvedValue(24);

    const result = await service.getAllProducts(undefined as unknown as number);

    expect(result).toEqual({
      data: [{ product_id: 1 }],
      pagination: { page: 1, size: 8, total: 3 },
    });
    expect(cacheManager.set).toHaveBeenCalledWith('products:page:1', result);
  });

  it('paginates product search by name', async () => {
    prismaService.product.findMany.mockResolvedValue([]);
    prismaService.product.count.mockResolvedValue(16);

    const result = await service.getProductByName('ga', 2);

    expect(prismaService.product.findMany).toHaveBeenCalledWith({
      where: { product_name: { contains: 'ga' } },
      skip: 8,
      take: 8,
    });
    expect(result.pagination).toEqual({ page: 2, size: 8, total: 2 });
  });

  it('fetches a single product by id', async () => {
    prismaService.product.findFirst.mockResolvedValue({ product_id: 5 });

    await expect(service.getProductById(5)).resolves.toEqual({ product_id: 5 });
    expect(prismaService.product.findFirst).toHaveBeenCalledWith({
      where: { product_id: 5 },
    });
  });
});
