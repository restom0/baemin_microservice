jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn().mockResolvedValue(undefined);
  },
}));

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('connects to the database on module init', async () => {
    const service = new PrismaService();
    await service.onModuleInit();
    expect((service as unknown as { $connect: jest.Mock }).$connect).toHaveBeenCalledTimes(1);
  });
});
