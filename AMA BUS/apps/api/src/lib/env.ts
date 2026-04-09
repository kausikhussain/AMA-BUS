import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(12),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000,http://localhost:8081"),
  PAYMENT_SIMULATION: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  STRIPE_SECRET_KEY: z.string().optional(),
  MAPBOX_TOKEN: z.string().optional()
});

export const env = envSchema.parse(process.env);
