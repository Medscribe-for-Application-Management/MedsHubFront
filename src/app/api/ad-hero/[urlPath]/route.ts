import {
  adHeroImageCacheTag,
  getAdvertisementByPublicSegment,
  isAdvertisementExpired,
} from "@/lib/api/advertisements";
import {
  isAdvertisementRouteSegment,
  normalizeAdvertisementLookupSegment,
} from "@/lib/ad-public-path";
import { getEnv } from "@/lib/env";

/**
 * Proxies the consultant hero image through the site origin so social crawlers
 * (WhatsApp, Facebook, etc.) receive a stable `image/*` URL without relying on
 * `/_libelus-media` rewrites or API CORP headers from their fetch infrastructure.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ urlPath: string }> },
): Promise<Response> {
  const { urlPath: raw } = await context.params;
  const urlPath = decodeURIComponent(raw);
  if (!isAdvertisementRouteSegment(urlPath)) {
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

  const heroUrl = ad.consultant.images?.[0]?.imageUrl;
  if (heroUrl == null || heroUrl === "") {
    return new Response("Not found", { status: 404 });
  }

  const { apiBaseUrl, advertisementFetchRevalidate } = getEnv();
  const apiRoot = apiBaseUrl.replace(/\/+$/, "");
  const absoluteUrl = heroUrl.startsWith("http")
    ? heroUrl
    : `${apiRoot}${heroUrl.startsWith("/") ? "" : "/"}${heroUrl}`;

  const cacheKey = normalizeAdvertisementLookupSegment(urlPath);

  let upstream: Response;
  try {
    upstream = await fetch(absoluteUrl, {
      headers: { Accept: "image/*" },
      next: {
        revalidate: advertisementFetchRevalidate,
        tags: [adHeroImageCacheTag(cacheKey)],
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
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
