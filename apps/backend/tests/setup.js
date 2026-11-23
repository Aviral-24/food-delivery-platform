import dotenv from 'dotenv';

dotenv.config();

process.env.NODE_ENV = 'test';
process.env.PORT ??= '5001';
process.env.CORS_ORIGIN ??= 'http://localhost:5173';
process.env.OTEL_ENABLED = 'false';
process.env.SUPABASE_URL ??= 'http://127.0.0.1:54321';
process.env.SUPABASE_ANON_KEY ??= 'test_anon_key_placeholder';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test_service_role_key_placeholder';
process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';