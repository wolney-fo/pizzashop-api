import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .optional()
    .default("development"),
  PORT: z.coerce.number().optional().default(3333),
  DATABASE_URL: z.url(),
  API_BASE_URL: z.url(),
  AUTH_REDIRECT_URL: z.url(),
  JWT_SECRET_KEY: z.string().nonempty(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
