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

  it('defaults, empties, and query-only paths all normalize to root', () => {
    const metricsService = new MetricsService();

    metricsService.recordHttpRequest('GET'); // default path parameter
    metricsService.recordHttpRequest('POST', ''); // empty path -> '/'
    metricsService.recordHttpRequest('PUT', '?q=1'); // query-only -> '/'

    const metrics = metricsService.render();

    expect(metrics).toContain(
      'baemin_api_gateway_http_requests_total{method="GET",path="/"} 1',
    );
    expect(metrics).toContain(
      'baemin_api_gateway_http_requests_total{method="POST",path="/"} 1',
    );
    expect(metrics).toContain(
      'baemin_api_gateway_http_requests_total{method="PUT",path="/"} 1',
    );
  });

  it('sorts distinct request samples alphabetically', () => {
    const metricsService = new MetricsService();

    metricsService.recordHttpRequest('GET', '/zebra');
    metricsService.recordHttpRequest('GET', '/apple');

    const metrics = metricsService.render();

    expect(metrics.indexOf('path="/apple"')).toBeLessThan(
      metrics.indexOf('path="/zebra"'),
    );
  });

  it('reports process health and uptime', () => {
    const metrics = new MetricsService().render();

    expect(metrics).toContain('baemin_api_gateway_up 1');
    expect(metrics).toMatch(/baemin_api_gateway_uptime_seconds \d+/);
  });
});
