process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.JWT_SECRET = "test_secret_key_for_vitest_runs_12345";
process.env.JWT_EXPIRES_IN = "1h";
process.env.CORS_ORIGIN = "http://localhost:5173";
process.env.OTEL_ENABLED = "false";
