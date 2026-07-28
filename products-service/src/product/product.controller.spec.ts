import { Test } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController (integration)', () => {
  const productService = {
    getAllProducts: jest.fn(),
    getProductById: jest.fn(),
    getProductByName: jest.fn(),
  };
  let controller: ProductController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: productService }],
    }).compile();
    controller = moduleRef.get(ProductController);
  });

  it('lists products for a page', async () => {
    productService.getAllProducts.mockResolvedValue({ data: [] });

    await expect(controller.getAllProducts(2)).resolves.toEqual({ data: [] });
    expect(productService.getAllProducts).toHaveBeenCalledWith(2);
  });

  it('returns a product by numeric id', async () => {
    productService.getProductById.mockResolvedValue({ product_id: 7 });

    await expect(controller.getProductById('7')).resolves.toEqual({
      product_id: 7,
    });
    expect(productService.getProductById).toHaveBeenCalledWith(7);
  });

  it('rejects a non-numeric id with a 400 response', () => {
    expect(controller.getProductById('abc')).toEqual({
      status: 400,
      message: 'Invalid query parameters',
    });
    expect(productService.getProductById).not.toHaveBeenCalled();
  });

  it('searches products by name and page', async () => {
    productService.getProductByName.mockResolvedValue({ data: [] });

    await expect(controller.getProductByName('ga', 1)).resolves.toEqual({
      data: [],
    });
    expect(productService.getProductByName).toHaveBeenCalledWith('ga', 1);
  });
});
