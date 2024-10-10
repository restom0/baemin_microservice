import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAllProducts(page: number) {
    let dataCache = await this.cacheManager.get('products');
    if (dataCache && (dataCache as any).pagination.page === page) {
      return dataCache;
    }
    let data = await this.prismaService.product.findMany({
      skip: (page - 1) * 8,
      take: 8,
    });
    let pagination = await this.prismaService.product.count();
    let result = {
      data: data,
      pagination: {
        page: page,
        size: 8,
        total: Math.ceil(pagination / 8),
      },
    };
    await this.cacheManager.set('products', result);
    return result;
  }
  async getProductByName(name: string, page: number) {
    let data = await this.prismaService.product.findMany({
      where: {
        product_name: {
          contains: name,
        },
      },
      skip: (page - 1) * 8,
      take: 8,
    });
    let pagination = await this.prismaService.product.count({
      where: {
        product_name: {
          contains: name,
        },
      },
    });
    return {
      data: data,
      pagination: {
        page: page,
        size: 8,
        total: Math.ceil(pagination / 8),
      },
    };
  }
  async getProductById(id: number) {
    let data = await this.prismaService.product.findFirst({
      where: {
        product_id: id,
      },
    });
    return data;
  }
}
