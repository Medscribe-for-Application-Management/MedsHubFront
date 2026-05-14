import type { AdvertisementAggregate } from "@/lib/api/advertisement-schema";

/** Path prefix proxied by `next.config.ts` → `API_BASE_URL/media/*` (same-origin in the browser). */
export const LIBELUS_MEDIA_PROXY_PREFIX = "/_libelus-media";

/**
 * Maps `http://api.../media/...` → `/_libelus-media/...` so the browser loads media from the
 * Next origin and avoids `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin` (CORP / cross-origin blocks).
 */
export function rewriteApiMediaUrlToSiteProxy(
  url: string,
  apiBaseUrl: string,
): string {
  const apiRoot = apiBaseUrl.replace(/\/+$/, "");
  try {
    const u = new URL(url);
    const api = new URL(apiRoot);
    if (u.origin !== api.origin) return url;
    if (!u.pathname.startsWith("/media/")) return url;
    const afterMedia = u.pathname.slice("/media".length);
    return `${LIBELUS_MEDIA_PROXY_PREFIX}${afterMedia}${u.search}${u.hash}`;
  } catch {
    return url;
  }
}

export function absoluteSiteMediaUrl(
  apiAbsoluteUrl: string,
  apiBaseUrl: string,
  siteUrl: string,
): string {
  const path = rewriteApiMediaUrlToSiteProxy(apiAbsoluteUrl, apiBaseUrl);
  if (path.startsWith("http")) return path;
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}${path}`;
}

export function proxyAdvertisementMediaUrls(
  ad: AdvertisementAggregate,
  apiBaseUrl: string,
): AdvertisementAggregate {
  const mapUrl = (url: string | null | undefined): string | undefined => {
    if (url == null || url === "") return undefined;
    return rewriteApiMediaUrlToSiteProxy(url, apiBaseUrl);
  };

  return {
    ...ad,
    consultant: {
      ...ad.consultant,
      images: ad.consultant.images.map((img) => ({
        ...img,
        imageUrl: mapUrl(img.imageUrl) ?? img.imageUrl,
      })),
    },
    clinic: {
      ...ad.clinic,
      logo: mapUrl(ad.clinic.logo) ?? ad.clinic.logo,
    },
  };
}
