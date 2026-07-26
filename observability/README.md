# Baemin Observability

Start the stack from `baemin_microservice`:

```bash
docker compose up -d elasticsearch logstash kibana prometheus grafana
docker compose up -d api-gateway user-service product-service order-service shipping-service notify-service
```

Local endpoints:

- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (`admin` / `admin` by default)
- Logstash GELF input: `udp://localhost:12201`
- Logstash JSON lines input: `tcp://localhost:5000`

Docker service logs are shipped through the GELF driver into Logstash and indexed as `baemin-logs-*`.
Prometheus scrapes the API gateway `/metrics` endpoint and Grafana is provisioned with Prometheus and Elasticsearch datasources plus the `Baemin Overview` dashboard.
