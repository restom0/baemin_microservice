const sharedEnv = {
  JWT_SECRET: process.env.JWT_SECRET || 'BI_MAT',
  RABBITMQ_URL:
    process.env.RABBITMQ_URL || 'amqp://admin:admin123@some-rabbit:5672',
  RABBITMQ_DURABLE: process.env.RABBITMQ_DURABLE || 'false',
  PRODUCT_QUEUE: process.env.PRODUCT_QUEUE || 'product_queue',
  USER_QUEUE: process.env.USER_QUEUE || 'user_queue',
  ORDER_QUEUE: process.env.ORDER_QUEUE || 'order_queue',
  SHIPPING_QUEUE: process.env.SHIPPING_QUEUE || 'shipping_queue',
  NOTIFY_QUEUE: process.env.NOTIFY_QUEUE || 'notify_queue',
  LOCAL_DATABASE_URL_POSTGRESQL:
    process.env.LOCAL_DATABASE_URL_POSTGRESQL ||
    'postgresql://postgres:admin123@some-postgres:5432/db_food',
  REDIS_HOST: process.env.REDIS_HOST || 'some-redis',
  REDIS_PORT: process.env.REDIS_PORT || '6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'admin123',
  REDIS_TTL: process.env.REDIS_TTL || '5000',
  EMAIL: process.env.EMAIL || '',
  EMAIL_TOKEN: process.env.EMAIL_TOKEN || '',
};

const service = (name, cwd) => ({
  name,
  cwd,
  script: 'dist/main.js',
  exec_mode: 'fork',
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '512M',
  out_file: `./logs/${name}.out.log`,
  error_file: `./logs/${name}.error.log`,
  env: sharedEnv,
});

module.exports = {
  apps: [
    service('baemin-api-gateway', './api-gateway'),
    service('baemin-user-service', './user-service'),
    service('baemin-products-service', './products-service'),
    service('baemin-order-service', './order-service'),
    service('baemin-shipping-service', './shipping-service'),
    service('baemin-notify-service', './notify-service'),
  ],
};
