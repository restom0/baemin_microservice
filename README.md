# Baemin Microservices

![Baemin microservice thumbnail](docs/thumbnail.svg)

This repo contains the NestJS API gateway and independently deployable Baemin backend services. The gateway accepts HTTP traffic from the client and talks to the services through RabbitMQ transports. Data services use Prisma with PostgreSQL, the product service uses Redis caching, and observability is wired through Elasticsearch, Logstash, Kibana, Prometheus, and Grafana.

## Services

| Service | Role | Main integration |
| --- | --- | --- |
| `api-gateway` | HTTP entrypoint for auth, products, orders, shipping, and `/metrics` | RabbitMQ clients |
| `user-service` | Registration, login, JWT issuing, password hashing | PostgreSQL |
| `products-service` | Product list, search, detail, pagination | PostgreSQL, Redis |
| `order-service` | Order persistence | PostgreSQL |
| `shipping-service` | Shipping persistence and notification dispatch | PostgreSQL, RabbitMQ |
| `notify-service` | Order/shipping email notifications | Gmail SMTP |

## Runtime Architecture

Source Mermaid lives in [`docs/architecture.mmd`](docs/architecture.mmd). Use [$figma:figma-generate-diagram](C:\Users\ACER\.codex\plugins\cache\openai-curated-remote\figma\2.0.16\skills\figma-generate-diagram\SKILL.md) with `useArchitectureLayoutCode: "FIGMA_DIAGRAM_2026"` to generate an editable FigJam architecture diagram.

```mermaid
flowchart LR
    subgraph client ["Client Apps"]
        webClient["Next.js Client"]
    end
    subgraph gateway ["API Layer"]
        apiGateway["NestJS API Gateway"]
    end
    subgraph service ["Core Services"]
        userService["User Service"]
        productService["Product Service"]
        orderService["Order Service"]
        shippingService["Shipping Service"]
        notifyService["Notify Service"]
    end
    subgraph datastore ["Data Stores"]
        postgres["PostgreSQL db_food"]
        redis["Redis Cache"]
    end
    subgraph external ["External"]
        gmail["Gmail SMTP"]
    end
    subgraph async ["Messaging"]
        rabbitmq["RabbitMQ"]
    end

    webClient -->|"HTTPS"| apiGateway
    apiGateway -->|"Auth RPC"| userService
    apiGateway -->|"Product RPC"| productService
    apiGateway -->|"Order RPC"| orderService
    apiGateway -->|"Shipping RPC"| shippingService
    userService -->|"Reads/Writes Users"| postgres
    productService -->|"Reads Products"| postgres
    productService -->|"Caches Products"| redis
    orderService -->|"Writes Orders"| postgres
    shippingService -->|"Writes Shipping"| postgres
    shippingService -.->|"Produces Notifications"| rabbitmq
    rabbitmq -.->|"Consumes Notifications"| notifyService
    notifyService -.->|"NotifyService: Sends Email"| gmail
```

## Observability Diagram

Source Mermaid lives in [`docs/observability.mmd`](docs/observability.mmd). This one is a standard flowchart for [$figma:figma-generate-diagram](C:\Users\ACER\.codex\plugins\cache\openai-curated-remote\figma\2.0.16\skills\figma-generate-diagram\SKILL.md).

```mermaid
flowchart LR
    services["NestJS services"] -->|"GELF logs"| logstash["Logstash"]
    logstash -->|"baemin-logs-* index"| elasticsearch["Elasticsearch"]
    elasticsearch -->|"Explore logs"| kibana["Kibana"]
    apiGateway["API Gateway /metrics"] -->|"Scrape target"| prometheus["Prometheus"]
    prometheus -->|"Metrics datasource"| grafana["Grafana"]
    elasticsearch -->|"Logs datasource"| grafana
```

## Message Patterns

- Gateway to user service: auth login/register over `USER_QUEUE`.
- Gateway to product service: product list, search, and detail over `PRODUCT_QUEUE`.
- Gateway to order service: order creation over `ORDER_QUEUE`.
- Gateway to shipping service: shipping creation over `SHIPPING_QUEUE`.
- Shipping service to notify service: `create-shipping-notify`.
- Notify service handlers: `create-order-notify` and `create-shipping-notify`.

## Thumbnail And Icon

- Microservice thumbnail source: [`docs/thumbnail.svg`](docs/thumbnail.svg).
- Microservice icon source: [`docs/icon.svg`](docs/icon.svg).

Use [$figma:figma-generate-design](C:\Users\ACER\.codex\plugins\cache\openai-curated-remote\figma\2.0.16\skills\figma-generate-design\SKILL.md) to recreate/refine the thumbnail and icon in Figma from these code-derived SVG bases. The visual cues come from the code and compose file: API Gateway, RabbitMQ queues, five Nest services, PostgreSQL, Redis, and the ELK/Prometheus/Grafana observability stack.

## Docker Compose

The compose file expects an external Docker network named `node-network`.

```bash
docker network create node-network
docker compose up -d elasticsearch logstash kibana prometheus grafana
docker compose up -d api-gateway user-service product-service order-service shipping-service notify-service
```

Useful local URLs:

- API gateway: `http://localhost:8080`
- API gateway metrics: `http://localhost:8080/metrics`
- Elasticsearch: `http://localhost:9200`
- Kibana: `http://localhost:5601`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

## PM2 Runtime

Build each service, then start the shared process file:

```bash
pm2 start ecosystem.config.js
pm2 status
pm2 logs baemin-api-gateway
```

Stop the stack with:

```bash
pm2 stop ecosystem.config.js
```

## Environment

Copy `.env.example` and adjust credentials as needed:

```bash
JWT_SECRET=BI_MAT
RABBITMQ_URL=amqp://admin:admin123@some-rabbit:5672
LOCAL_DATABASE_URL_POSTGRESQL=postgresql://postgres:admin123@some-postgres:5432/db_food
REDIS_HOST=some-redis
REDIS_PORT=6379
EMAIL=
EMAIL_TOKEN=
```

## Quality Commands

Run commands inside a service directory:

```bash
yarn install
yarn lint
yarn typecheck
yarn test
yarn test:cov
yarn build
```

From the platform root, the workspace runner can execute common scripts across all services and the client:

```bash
yarn lint
yarn typecheck
yarn test:cov
yarn build
```

## Figma Workflow

1. Generate runtime architecture from [`docs/architecture.mmd`](docs/architecture.mmd) with [$figma:figma-generate-diagram](C:\Users\ACER\.codex\plugins\cache\openai-curated-remote\figma\2.0.16\skills\figma-generate-diagram\SKILL.md) and `useArchitectureLayoutCode: "FIGMA_DIAGRAM_2026"`.
2. Generate observability flow from [`docs/observability.mmd`](docs/observability.mmd) with the same diagram skill as a standard flowchart.
3. Use [$figma:figma-generate-design](C:\Users\ACER\.codex\plugins\cache\openai-curated-remote\figma\2.0.16\skills\figma-generate-design\SKILL.md) with [`docs/thumbnail.svg`](docs/thumbnail.svg) and [`docs/icon.svg`](docs/icon.svg) as the visual source of truth.
4. Import SVG icons directly into Figma from the source SVG when refining the icon.
