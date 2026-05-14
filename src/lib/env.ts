import { z } from "zod";

const appEnvSchema = z.enum(["development", "production", "preview"]);

const rawEnvSchema = z.object({
  APP_ENV: z
    .string()
    .optional()
    .transform((v) => (v ? appEnvSchema.parse(v) : undefined)),
  API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export interface AppEnv {
  appEnv: z.infer<typeof appEnvSchema>;
  apiBaseUrl: string;
  siteUrl: string;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;

  const raw = rawEnvSchema.parse({
    APP_ENV: process.env.APP_ENV,
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  const appEnv = raw.APP_ENV ?? "development";

  let apiBaseUrl = raw.API_BASE_URL;
  if (!apiBaseUrl) {
    if (appEnv === "development") {
      apiBaseUrl = "http://localhost:3000";
    } else {
      throw new Error(
        "API_BASE_URL must be set when APP_ENV is not development (production or preview deployments).",
      );
    }
  }
  apiBaseUrl = stripTrailingSlash(apiBaseUrl);

  let siteUrl = raw.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    if (appEnv === "development") {
      siteUrl = "http://localhost:5173";
    } else {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL must be set for production or preview (canonical URLs, Open Graph, sitemap).",
      );
    }
  }
  siteUrl = stripTrailingSlash(siteUrl);

  cached = { appEnv, apiBaseUrl, siteUrl };
  return cached;
}

export function isDevelopment(): boolean {
  return getEnv().appEnv === "development";
}
