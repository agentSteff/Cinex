import dotenv from 'dotenv';
import type { CorsOptions } from 'cors';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  TMDB_API_KEY: z.string().min(1, 'TMDB_API_KEY es requerido'),
  FRONTEND_URL: z
    .string()
    .url('FRONTEND_URL debe ser una URL válida')
    .optional()
    .or(z.string().length(0).optional()),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Configuración de entorno inválida:', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsedEnv.data;

const normalizedOrigins = env.FRONTEND_URL && env.FRONTEND_URL.length > 0
  ? env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173'];

export const appConfig = {
  ...env,
  FRONTEND_ORIGINS: normalizedOrigins
};

export const corsOptions: CorsOptions = {
  origin: normalizedOrigins,
  credentials: true
};
