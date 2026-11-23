import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { httpLogger } from "./config/logger.js";
import { openApiSpec } from "./config/openapi.js";
import { requestId } from "./middlewares/requestId.js";
import { apiRateLimiter } from "./middlewares/rateLimiter.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import v1Routes from "./routes/index.js";

const app = express();

app.use(requestId);
app.use(httpLogger);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiRateLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    environment: env.NODE_ENV,
    requestId: req.id,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get("/openapi.json", (req, res) => res.json(openApiSpec));

app.use("/api/v1", v1Routes);

app.use(notFound);
app.use(errorHandler);

export default app;
