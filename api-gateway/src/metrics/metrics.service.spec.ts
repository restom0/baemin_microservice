import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  it('normalizes numeric path segments and counts requests', () => {
    const metricsService = new MetricsService();

    metricsService.recordHttpRequest('get', '/product/1');
    metricsService.recordHttpRequest('GET', '/product/2');

    const metrics = metricsService.render();

    expect(metrics).toContain(
      'baemin_api_gateway_http_requests_total{method="GET",path="/product/:id"} 2',
    );
  });

  it('escapes prometheus label values', () => {
    const metricsService = new MetricsService();

    metricsService.recordHttpRequest('GET"', '/bad"path');

    const metrics = metricsService.render();

    expect(metrics).toContain(
      'baemin_api_gateway_http_requests_total{method="GET\\"",path="/bad\\"path"} 1',
    );
  });
});
