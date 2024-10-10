import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, of, retry, timeout } from 'rxjs';

@Controller('product')
export class ProductController {
  constructor(@Inject('PRODUCT_NAME') private productService: ClientProxy) {}
  @Get('')
  async getAllProducts(@Query('page') page?: string) {
    if (isNaN(+page)) {
      return {
        status: 400,
        message: 'Invalid query parameters',
      };
    }
    return await lastValueFrom(
      this.productService.send('get_all_products', +page || 0).pipe(
        timeout(5000),
        retry(3),
        catchError(() => of({ status: 500, message: 'Internal server error' })),
      ),
    );
  }
  @Get(':id')
  async getProductById(@Query('id') id: string) {
    if (isNaN(+id)) {
      return {
        status: 400,
        message: 'Invalid query parameters',
      };
    }
    return await lastValueFrom(
      this.productService.send('get_product_by_id', +id).pipe(
        timeout(5000),
        retry(3),
        catchError(() => of({ status: 500, message: 'Internal server error' })),
      ),
    );
  }
  @Get('search/:name')
  async getProductByName(
    @Param('name') name: string,
    @Query('page') page?: string,
  ) {
    return await lastValueFrom(
      this.productService
        .send('get_product_by_name', {
          name,
          page: +page || 0,
        })
        .pipe(
          timeout(5000),
          retry(3),
          catchError(() =>
            of({ status: 500, message: 'Internal server error' }),
          ),
        ),
    );
  }
}
