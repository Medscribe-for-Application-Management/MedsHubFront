import type { AdvertisementAggregate } from "@/lib/api/advertisement-schema";

/** Advertisement row UUID (legacy public URL segment). */
export const ADVERTISEMENT_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public `urlPath` slug: lowercase `a-z`, `0-9`, single hyphens between groups, 1–128 chars.
 * Matches backend validation for `POST /advertisement`.
 */
export const ADVERTISEMENT_URL_PATH_SLUG_REGEX =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isAdvertisementRouteSegment(segment: string): boolean {
  const s = segment.trim();
  if (s.length === 0 || s.length > 128) return false;
  if (ADVERTISEMENT_UUID_REGEX.test(s)) return true;
  return ADVERTISEMENT_URL_PATH_SLUG_REGEX.test(s);
}

/** Path segment for `/ads/{segment}` links and canonical URLs. */
export function publicAdSegment(
  ad: Pick<AdvertisementAggregate, "id" | "urlPath">,
): string {
  const p = ad.urlPath?.trim();
  if (p && p.length > 0) return p;
  return ad.id;
}
