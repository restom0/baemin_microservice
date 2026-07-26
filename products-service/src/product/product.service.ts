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
    const currentPage = this.normalizePage(page);
    const cacheKey = `products:page:${currentPage}`;
    const dataCache = await this.cacheManager.get(cacheKey);
    if (dataCache) {
      return dataCache;
    }
    const data = await this.prismaService.product.findMany({
      skip: (currentPage - 1) * 8,
      take: 8,
    });
    const pagination = await this.prismaService.product.count();
    const result = {
      data: data,
      pagination: {
        page: currentPage,
        size: 8,
        total: Math.ceil(pagination / 8),
      },
    };
    await this.cacheManager.set(cacheKey, result);
    return result;
  }
  async getProductByName(name: string, page: number) {
    const currentPage = this.normalizePage(page);
    const data = await this.prismaService.product.findMany({
      where: {
        product_name: {
          contains: name,
        },
      },
      skip: (currentPage - 1) * 8,
      take: 8,
    });
    const pagination = await this.prismaService.product.count({
      where: {
        product_name: {
          contains: name,
        },
      },
    });
    return {
      data: data,
      pagination: {
        page: currentPage,
        size: 8,
        total: Math.ceil(pagination / 8),
      },
    };
  }
  async getProductById(id: number) {
    const data = await this.prismaService.product.findFirst({
      where: {
        product_id: id,
      },
    });
    return data;
  }

  private normalizePage(page?: number) {
    if (!Number.isInteger(page) || page < 1) {
      return 1;
    }

    return page;
  }
}
