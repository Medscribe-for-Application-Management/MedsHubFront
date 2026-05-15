import {
  adOgImageCacheTag,
  getAdvertisementByPublicSegment,
  isAdvertisementExpired,
} from "@/lib/api/advertisements";
import {
  apiAbsoluteMediaUrl,
  resolveOgSourceMediaUrl,
} from "@/lib/ad-og-image";
import {
  isAdPageRouteLocale,
  type AdPageRouteLocale,
} from "@/lib/ad-page-locale";
import {
  isAdvertisementRouteSegment,
  normalizeAdvertisementLookupSegment,
} from "@/lib/ad-public-path";
import { getEnv } from "@/lib/env";

const STATIC_CACHE =
  "public, max-age=31536000, immutable, s-maxage=31536000";

/**
 * Pass-through OG image for social crawlers: stable URL per ad + locale,
 * bytes from API `ogEngImage` / `ogArabicImage` (or consultant hero fallback).
 * No Sharp resize — assets are already 1200×630 when uploaded as OG images.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ urlPath: string; locale: string }> },
): Promise<Response> {
  const { urlPath: rawPath, locale: rawLocale } = await context.params;
  const urlPath = decodeURIComponent(rawPath);
  const routeLocale = rawLocale.toLowerCase();

  if (!isAdvertisementRouteSegment(urlPath) || !isAdPageRouteLocale(routeLocale)) {
    return new Response("Not found", { status: 404 });
  }

  let ad = null;
  try {
    ad = await getAdvertisementByPublicSegment(urlPath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (!ad || isAdvertisementExpired(ad)) {
    return new Response("Not found", { status: 404 });
  }

  const sourceUrl = resolveOgSourceMediaUrl(ad, routeLocale as AdPageRouteLocale);
  if (sourceUrl == null) {
    return new Response("Not found", { status: 404 });
  }

  const { apiBaseUrl, advertisementFetchRevalidate } = getEnv();
  const fetchUrl = apiAbsoluteMediaUrl(sourceUrl, apiBaseUrl);
  const cacheKey = normalizeAdvertisementLookupSegment(urlPath);

  let upstream: Response;
  try {
    upstream = await fetch(fetchUrl, {
      headers: { Accept: "image/*" },
      next: {
        revalidate: advertisementFetchRevalidate,
        tags: [adOgImageCacheTag(cacheKey, routeLocale as AdPageRouteLocale)],
      },
    });
  } catch {
    return new Response("Bad gateway", { status: 502 });
  }

  if (!upstream.ok) {
    return new Response("Bad gateway", { status: 502 });
  }

  const rawType = upstream.headers.get("content-type");
  const contentType =
    rawType?.split(";")[0]?.trim() ?? "application/octet-stream";
  if (!contentType.startsWith("image/")) {
    return new Response("Bad gateway", { status: 502 });
  }

  const buf = await upstream.arrayBuffer();

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": STATIC_CACHE,
    },
  });
}
