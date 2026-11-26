import pino from 'pino';
import pinoHttp from 'pino-http';
import { trace, context } from '@opentelemetry/api';
import { env } from './env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  mixin() {
    const span = trace.getSpan(context.active());
    if (!span) return {};
    const spanCtx = span.spanContext();
    return {
      trace_id: spanCtx.traceId,
      span_id: spanCtx.spanId,
    };
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
    ],
    censor: '[REDACTED]',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: env.OTEL_SERVICE_NAME,
    env: env.NODE_ENV,
  },
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id,
  customSuccessMessage: (req, res) => `${req.method} ${req.url} -> ${res.statusCode}`,
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});