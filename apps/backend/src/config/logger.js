import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "./env.js";

const isDev = env.NODE_ENV === "development";
const isTest = env.NODE_ENV === "test";

export const logger = pino({
  level: isTest ? "silent" : env.LOG_LEVEL,
  redact: {
    paths: ["req.headers.authorization", "req.body.password"],
    censor: "[REDACTED]",
  },
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id,
  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} -> ${res.statusCode}`,
});
