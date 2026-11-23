import { startTracing, stopTracing } from "./config/tracing.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import app from "./app.js";

startTracing();

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    `Server running on http://localhost:${env.PORT} (Docs: /api-docs)`,
  );
});

const shutdown = (signal) => {
  logger.info({ signal }, "Shutdown signal received");
  server.close(async () => {
    await stopTracing();
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
