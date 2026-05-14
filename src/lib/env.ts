import { z } from "zod";
import { normalizeAbsoluteUrl } from "@/lib/normalize-absolute-url";

const appEnvSchema = z.enum(["development", "production", "preview"]);

const rawEnvSchema = z.object({
  APP_ENV: z
    .string()
    .optional()
    .transform((v) => (v ? appEnvSchema.parse(v) : undefined)),
  API_BASE_URL: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  ADVERTISEMENT_FETCH_REVALIDATE_SECONDS: z.string().optional(),
  REVALIDATE_AD_SECRET: z.string().optional(),
});

export interface AppEnv {
  appEnv: z.infer<typeof appEnvSchema>;
  apiBaseUrl: string;
  siteUrl: string;
  /** `false` = cache until redeploy; `0` = always revalidate; else ISR seconds. */
  advertisementFetchRevalidate: number | false;
  /** Bearer secret for `POST /api/revalidate-ad`. Omit to disable that route. */
  revalidateAdSecret: string | undefined;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function parseAdvertisementFetchRevalidate(
  raw: string | undefined,
  appEnv: z.infer<typeof appEnvSchema>,
): number | false {
  if (raw == null || raw.trim() === "") {
    return appEnv === "development" ? 60 : false;
  }
  const t = raw.trim().toLowerCase();
  if (t === "false") return false;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(
      "ADVERTISEMENT_FETCH_REVALIDATE_SECONDS must be `false`, `0`, or a non-negative number.",
    );
  }
  return n;
}

function parseOptionalAbsoluteUrl(
  label: string,
  value: string | undefined,
): string | undefined {
  if (value == null || value.trim() === "") return undefined;
  const normalized = normalizeAbsoluteUrl(value.trim());
  try {
    new URL(normalized);
    return normalized;
  } catch {
    throw new Error(`${label} must be a valid URL (received: ${JSON.stringify(value)})`);
  }
}

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;

  const raw = rawEnvSchema.parse({
    APP_ENV: process.env.APP_ENV,
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    ADVERTISEMENT_FETCH_REVALIDATE_SECONDS:
      process.env.ADVERTISEMENT_FETCH_REVALIDATE_SECONDS,
    REVALIDATE_AD_SECRET: process.env.REVALIDATE_AD_SECRET,
  });

  const appEnv = raw.APP_ENV ?? "development";

  let apiBaseUrl = parseOptionalAbsoluteUrl("API_BASE_URL", raw.API_BASE_URL);
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

  let siteUrl = parseOptionalAbsoluteUrl(
    "NEXT_PUBLIC_SITE_URL",
    raw.NEXT_PUBLIC_SITE_URL,
  );
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

  const advertisementFetchRevalidate = parseAdvertisementFetchRevalidate(
    raw.ADVERTISEMENT_FETCH_REVALIDATE_SECONDS,
    appEnv,
  );
  const secretTrim = raw.REVALIDATE_AD_SECRET?.trim();
  const revalidateAdSecret =
    secretTrim != null && secretTrim.length > 0 ? secretTrim : undefined;

  cached = {
    appEnv,
    apiBaseUrl,
    siteUrl,
    advertisementFetchRevalidate,
    revalidateAdSecret,
  };
  return cached;
}

export function isDevelopment(): boolean {
  return getEnv().appEnv === "development";
}
