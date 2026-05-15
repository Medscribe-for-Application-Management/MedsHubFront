import type { AdPageRouteLocale } from "@/lib/ad-page-locale";
import {
  adPageLocaleFromRouteSegment,
  isAdPageRouteLocale,
} from "@/lib/ad-page-locale";
import type { AdvertisementAggregate } from "@/lib/api/advertisement-schema";
import { LIBELUS_MEDIA_PROXY_PREFIX } from "@/lib/media-browser-proxy";

/** Stable path for pass-through OG image (no runtime resize). */
export function staticAdOgImagePath(
  publicPath: string,
  routeLocale: AdPageRouteLocale,
): string {
  return `/api/og/${encodeURIComponent(publicPath)}/${routeLocale}`;
}

export function staticAdOgImageUrl(
  siteUrl: string,
  publicPath: string,
  routeLocale: AdPageRouteLocale,
): string {
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}${staticAdOgImagePath(publicPath, routeLocale)}`;
}

/** Resolve API-origin URL for server-side fetch (bypasses browser proxy). */
export function apiAbsoluteMediaUrl(
  url: string,
  apiBaseUrl: string,
): string {
  const apiRoot = apiBaseUrl.replace(/\/+$/, "");
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith(LIBELUS_MEDIA_PROXY_PREFIX)) {
    const after = url.slice(LIBELUS_MEDIA_PROXY_PREFIX.length);
    return `${apiRoot}/media${after.startsWith("/") ? after : `/${after}`}`;
  }
  if (url.startsWith("/media/")) {
    return `${apiRoot}${url}`;
  }
  return `${apiRoot}${url.startsWith("/") ? "" : "/"}${url}`;
}

function trimMediaUrl(s: string | null | undefined): string | undefined {
  const t = String(s ?? "").trim();
  return t.length > 0 ? t : undefined;
}

/** OG image from API fields, else consultant hero (raw URLs before site proxy). */
export function resolveOgSourceMediaUrl(
  ad: AdvertisementAggregate,
  routeLocale: AdPageRouteLocale,
): string | undefined {
  if (!isAdPageRouteLocale(routeLocale)) return undefined;
  const contentLocale = adPageLocaleFromRouteSegment(routeLocale);
  const ogFromApi =
    contentLocale === "ar"
      ? trimMediaUrl(ad.ogArabicImage)
      : trimMediaUrl(ad.ogEngImage);
  if (ogFromApi) return ogFromApi;
  const hero = ad.consultant.images?.[0]?.imageUrl;
  return trimMediaUrl(hero);
}
