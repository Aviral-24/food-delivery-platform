import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { env } from "./env.js";
import { logger } from "./logger.js";

let sdk = null;

export const startTracing = () => {
  if (!env.OTEL_ENABLED) return;

  sdk = new NodeSDK({
    serviceName: "food-delivery-backend",
    traceExporter: new ConsoleSpanExporter(),
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
    ],
  });

  sdk.start();
  logger.info("OpenTelemetry tracing started");
};

export const stopTracing = async () => {
  if (!sdk) return;
  await sdk.shutdown();
  logger.info("OpenTelemetry tracing shut down");
};
