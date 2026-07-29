import { NextFunction, Request, Response } from 'express';
import { MetricsMiddleware } from './metrics.middleware';
import { MetricsService } from './metrics.service';

describe('MetricsMiddleware', () => {
  it('records the request and forwards to the next handler', () => {
    const metricsService = {
      recordHttpRequest: jest.fn(),
    } as unknown as MetricsService;
    const middleware = new MetricsMiddleware(metricsService);
    const next = jest.fn() as NextFunction;

    middleware.use(
      { method: 'GET', path: '/product/1' } as Request,
      {} as Response,
      next,
    );

    expect(metricsService.recordHttpRequest).toHaveBeenCalledWith(
      'GET',
      '/product/1',
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});
