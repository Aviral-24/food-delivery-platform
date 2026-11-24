import { initTelemetry, shutdownTelemetry } from './config/otel.js';

initTelemetry();

import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { closePool } from './db/client.js';
import { startOutboxRelay, stopOutboxRelay } from './outbox/outbox.relay.js';
import {
  startOrderPlacedConsumer,
  stopOrderPlacedConsumer,
} from './events/consumers/orderPlaced.consumer.js';
import { disconnectKafka } from './events/kafka.client.js';

const server = app.listen(env.PORT, async () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV, otel: env.OTEL_ENABLED },
    `Server running on http://localhost:${env.PORT} (Docs: /api-docs)`
  );

  if (env.NODE_ENV !== 'test') {
    await startOutboxRelay();
    await startOrderPlacedConsumer();
  }
});

const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutting down server gracefully');
  stopOutboxRelay();
  await stopOrderPlacedConsumer();
  await disconnectKafka();

  server.close(async () => {
    await closePool();
    await shutdownTelemetry();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));