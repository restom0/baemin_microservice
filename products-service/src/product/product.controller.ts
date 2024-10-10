import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @MessagePattern('get_all_products')
  getAllProducts(@Payload() page?: number) {
    return this.productService.getAllProducts(page);
  }
  @MessagePattern('get_product_by_id')
  getProductById(@Payload() id: string) {
    if (isNaN(+id)) {
      return {
        status: 400,
        message: 'Invalid query parameters',
      };
    }
    return this.productService.getProductById(+id);
  }
  @MessagePattern('get_product_by_name')
  getProductByName(
    @Payload('name') name: string,
    @Payload('page') page?: string,
  ) {
    return this.productService.getProductByName(name, +page || 0);
  }
}
