import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  OTEL_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  OTEL_SERVICE_NAME: z.string().default('food-delivery-backend'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional().default(''),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(10, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  DATABASE_URL: z.string().min(10, 'DATABASE_URL is required'),
  KAFKA_BROKERS: z.string().default('127.0.0.1:9092'),
  KAFKA_CLIENT_ID: z.string().default('food-delivery-backend'),
  OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(2000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;