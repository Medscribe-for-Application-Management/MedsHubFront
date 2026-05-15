import path from "node:path";
import { existsSync } from "node:fs";
import type { AdPageRouteLocale } from "@/lib/ad-page-locale";

/** Same-origin static OG files produced by `scripts/sync-ad-og-images.mjs` at build time. */
export const PUBLIC_OG_ASSETS_DIR = "og-assets" as const;

/** Public URL path (no origin), e.g. `/og-assets/mih-henry-schroeder/eng.jpg`. */
export function publicOgAssetPath(
  urlPathSlug: string,
  routeLocale: AdPageRouteLocale,
): string {
  const slug = urlPathSlug.trim().toLowerCase();
  return `/${PUBLIC_OG_ASSETS_DIR}/${slug}/${routeLocale}.jpg`;
}

/** Absolute URL for Open Graph / Twitter (frontend domain only). */
export function staticAdOgImageUrl(
  siteUrl: string,
  urlPathSlug: string,
  routeLocale: AdPageRouteLocale,
): string {
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}${publicOgAssetPath(urlPathSlug, routeLocale)}`;
}

/** Whether `prebuild` wrote the JPEG for this ad + locale. */
export function hasPublicOgAsset(
  urlPathSlug: string,
  routeLocale: AdPageRouteLocale,
): boolean {
  const slug = urlPathSlug.trim().toLowerCase();
  const file = path.join(
    process.cwd(),
    "public",
    PUBLIC_OG_ASSETS_DIR,
    slug,
    `${routeLocale}.jpg`,
  );
  return existsSync(file);
}
