import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, of, retry, timeout } from 'rxjs';

@Controller('product')
export class ProductController {
  constructor(@Inject('PRODUCT_NAME') private productService: ClientProxy) {}

  private parsePage(page?: string) {
    if (page === undefined || page === '') {
      return 1;
    }

    const parsed = Number(page);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException('Invalid query parameters');
    }

    return parsed;
  }

  @Get('')
  async getAllProducts(@Query('page') page?: string) {
    const currentPage = this.parsePage(page);
    return await lastValueFrom(
      this.productService.send('get_all_products', currentPage).pipe(
        timeout(5000),
        retry(3),
        catchError(() => of({ status: 500, message: 'Internal server error' })),
      ),
    );
  }

  @Get('search')
  async getProductByNameFromQuery(
    @Query('name') name: string,
    @Query('page') page?: string,
  ) {
    return this.getProductByName(name, page);
  }

  @Get('search/:name')
  async getProductByName(
    @Param('name') name: string,
    @Query('page') page?: string,
  ) {
    if (!name?.trim()) {
      throw new BadRequestException('Search name is required');
    }

    const currentPage = this.parsePage(page);
    return await lastValueFrom(
      this.productService
        .send('get_product_by_name', {
          name: name.trim(),
          page: currentPage,
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

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException('Invalid query parameters');
    }

    return await lastValueFrom(
      this.productService.send('get_product_by_id', parsed).pipe(
        timeout(5000),
        retry(3),
        catchError(() => of({ status: 500, message: 'Internal server error' })),
      ),
    );
  }
}
