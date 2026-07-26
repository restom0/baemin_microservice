import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  it('returns prometheus text metrics', () => {
    const metricsService = new MetricsService();
    const controller = new MetricsController(metricsService);

    metricsService.recordHttpRequest('GET', '/product/12');

    const metrics = controller.getMetrics();

    expect(metrics).toContain('# TYPE baemin_api_gateway_up gauge');
    expect(metrics).toContain('baemin_api_gateway_up 1');
    expect(metrics).toContain(
      'baemin_api_gateway_http_requests_total{method="GET",path="/product/:id"} 1',
    );
  });
});
