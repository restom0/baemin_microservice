import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly startedAt = Date.now();
  private readonly httpRequests = new Map<string, number>();

  recordHttpRequest(method: string, path = '/') {
    const normalizedMethod = method.toUpperCase();
    const normalizedPath = this.normalizePath(path);
    const key = `${normalizedMethod} ${normalizedPath}`;
    this.httpRequests.set(key, (this.httpRequests.get(key) || 0) + 1);
  }

  render() {
    const uptimeSeconds = Math.floor((Date.now() - this.startedAt) / 1000);
    const lines = [
      '# HELP baemin_api_gateway_up API gateway process health.',
      '# TYPE baemin_api_gateway_up gauge',
      'baemin_api_gateway_up 1',
      '# HELP baemin_api_gateway_uptime_seconds API gateway process uptime in seconds.',
      '# TYPE baemin_api_gateway_uptime_seconds gauge',
      `baemin_api_gateway_uptime_seconds ${uptimeSeconds}`,
      '# HELP baemin_api_gateway_http_requests_total HTTP requests handled by the API gateway.',
      '# TYPE baemin_api_gateway_http_requests_total counter',
      ...this.renderHttpRequestSamples(),
      '',
    ];

    return lines.join('\n');
  }

  private renderHttpRequestSamples() {
    return Array.from(this.httpRequests.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, count]) => {
        const [method, path] = key.split(' ');
        return `baemin_api_gateway_http_requests_total{method="${this.escapeLabel(
          method,
        )}",path="${this.escapeLabel(path)}"} ${count}`;
      });
  }

  private normalizePath(path: string) {
    const pathname = (path || '/').split('?')[0] || '/';
    return pathname.replace(/\/\d+(?=\/|$)/g, '/:id');
  }

  private escapeLabel(value: string) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}
