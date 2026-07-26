import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';
import { ProductController } from './product.controller';

describe('ProductController', () => {
  const productService = {
    send: jest.fn(),
  };
  let controller: ProductController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ProductController(productService as any);
  });

  it('defaults product listing to page 1', async () => {
    productService.send.mockReturnValue(
      of({ data: [], pagination: { page: 1 } }),
    );

    await controller.getAllProducts();

    expect(productService.send).toHaveBeenCalledWith('get_all_products', 1);
  });

  it('rejects invalid pages before calling the service', async () => {
    await expect(controller.getAllProducts('0')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(productService.send).not.toHaveBeenCalled();
  });

  it('supports query based search for backward compatibility', async () => {
    productService.send.mockReturnValue(of({ data: [] }));

    await controller.getProductByNameFromQuery('pho', '2');

    expect(productService.send).toHaveBeenCalledWith('get_product_by_name', {
      name: 'pho',
      page: 2,
    });
  });

  it('uses the path id parameter for product detail', async () => {
    productService.send.mockReturnValue(of({ product_id: 4 }));

    await controller.getProductById('4');

    expect(productService.send).toHaveBeenCalledWith('get_product_by_id', 4);
  });
});
