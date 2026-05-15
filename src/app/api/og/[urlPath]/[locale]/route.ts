import {
  adOgImageCacheTag,
  getAdvertisementByPublicSegment,
  isAdvertisementExpired,
} from "@/lib/api/advertisements";
import {
  apiAbsoluteMediaUrl,
  resolveOgImageFetchCandidates,
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

/** Align with ad page ISR; avoid `immutable` so image updates can propagate. */
const OG_IMAGE_CACHE =
  "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

async function fetchFirstImageFromCandidates(
  candidates: string[],
  apiBaseUrl: string,
  revalidate: number | false,
  cacheTag: string,
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  for (const sourceUrl of candidates) {
    const fetchUrl = apiAbsoluteMediaUrl(sourceUrl, apiBaseUrl);
    let upstream: Response;
    try {
      upstream = await fetch(fetchUrl, {
        headers: { Accept: "image/*,*/*;q=0.8" },
        next: { revalidate, tags: [cacheTag] },
      });
    } catch {
      continue;
    }

    if (!upstream.ok) continue;

    const rawType = upstream.headers.get("content-type");
    const contentType =
      rawType?.split(";")[0]?.trim() ?? "application/octet-stream";
    if (!contentType.startsWith("image/")) continue;

    return {
      body: await upstream.arrayBuffer(),
      contentType,
    };
  }
  return null;
}

/**
 * Pass-through OG image for social crawlers: stable URL per ad + locale,
 * served by Next.js. Tries API `ogEngImage` / `ogArabicImage`, then consultant hero.
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

  const candidates = resolveOgImageFetchCandidates(
    ad,
    routeLocale as AdPageRouteLocale,
  );
  if (candidates.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const { apiBaseUrl, advertisementFetchRevalidate } = getEnv();
  const cacheKey = normalizeAdvertisementLookupSegment(urlPath);
  const cacheTag = adOgImageCacheTag(cacheKey, routeLocale as AdPageRouteLocale);

  const image = await fetchFirstImageFromCandidates(
    candidates,
    apiBaseUrl,
    advertisementFetchRevalidate,
    cacheTag,
  );

  if (image == null) {
    return new Response("Bad gateway", { status: 502 });
  }

  return new Response(image.body, {
    status: 200,
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": OG_IMAGE_CACHE,
    },
  });
}
