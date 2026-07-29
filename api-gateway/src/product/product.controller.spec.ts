import { BadRequestException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ProductController } from './product.controller';

const INTERNAL_ERROR = { status: 500, message: 'Internal server error' };

describe('ProductController', () => {
  const productService = {
    send: jest.fn(),
  };
  let controller: ProductController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ProductController(productService as any);
  });

  describe('getAllProducts', () => {
    it('defaults an undefined page to 1', async () => {
      productService.send.mockReturnValue(of({ data: [] }));

      await controller.getAllProducts();

      expect(productService.send).toHaveBeenCalledWith('get_all_products', 1);
    });

    it('defaults an empty page to 1', async () => {
      productService.send.mockReturnValue(of({ data: [] }));

      await controller.getAllProducts('');

      expect(productService.send).toHaveBeenCalledWith('get_all_products', 1);
    });

    it('passes a valid page through to the service', async () => {
      productService.send.mockReturnValue(of({ data: [] }));

      await controller.getAllProducts('3');

      expect(productService.send).toHaveBeenCalledWith('get_all_products', 3);
    });

    it('rejects a page below 1', async () => {
      await expect(controller.getAllProducts('0')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(productService.send).not.toHaveBeenCalled();
    });

    it('rejects a non-numeric page', async () => {
      await expect(controller.getAllProducts('abc')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('maps upstream failures to a 500 payload', async () => {
      productService.send.mockReturnValue(
        throwError(() => new Error('product service down')),
      );

      await expect(controller.getAllProducts('1')).resolves.toEqual(
        INTERNAL_ERROR,
      );
    });
  });

  describe('getProductByName', () => {
    it('supports query based search for backward compatibility', async () => {
      productService.send.mockReturnValue(of({ data: [] }));

      await controller.getProductByNameFromQuery('pho', '2');

      expect(productService.send).toHaveBeenCalledWith('get_product_by_name', {
        name: 'pho',
        page: 2,
      });
    });

    it('rejects an empty search name', async () => {
      await expect(
        controller.getProductByName(undefined as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(productService.send).not.toHaveBeenCalled();
    });

    it('maps upstream failures to a 500 payload', async () => {
      productService.send.mockReturnValue(
        throwError(() => new Error('product service down')),
      );

      await expect(controller.getProductByName('pho', '1')).resolves.toEqual(
        INTERNAL_ERROR,
      );
    });
  });

  describe('getProductById', () => {
    it('uses the path id parameter for product detail', async () => {
      productService.send.mockReturnValue(of({ product_id: 4 }));

      await controller.getProductById('4');

      expect(productService.send).toHaveBeenCalledWith('get_product_by_id', 4);
    });

    it('rejects a non-numeric id', async () => {
      await expect(controller.getProductById('abc')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects an id below 1', async () => {
      await expect(controller.getProductById('0')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('maps upstream failures to a 500 payload', async () => {
      productService.send.mockReturnValue(
        throwError(() => new Error('product service down')),
      );

      await expect(controller.getProductById('4')).resolves.toEqual(
        INTERNAL_ERROR,
      );
    });
  });
});
