import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:5000/api/v1'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('Invalid frontend env variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Frontend environment configuration is invalid');
}

export const env = parsed.data;