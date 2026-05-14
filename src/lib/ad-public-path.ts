import type { AdvertisementAggregate } from "@/lib/api/advertisement-schema";

/** Row UUID shape — rejected in `/ads/{segment}` because `GET /advertisement/:segment` is `urlPath` only. */
const ADVERTISEMENT_ROW_UUID_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public `urlPath` slug: letters, digits, single hyphens between groups, 1–128 chars
 * (normalized to lowercase for URLs and `GET /advertisement/:segment`).
 * Matches backend `getAdvertisementBySegmentValidator` expectations.
 */
export const ADVERTISEMENT_URL_PATH_SLUG_REGEX =
  /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;

export function isAdvertisementRouteSegment(segment: string): boolean {
  const s = segment.trim();
  if (s.length === 0 || s.length > 128) return false;
  if (ADVERTISEMENT_ROW_UUID_SEGMENT.test(s)) return false;
  return ADVERTISEMENT_URL_PATH_SLUG_REGEX.test(s);
}

/**
 * Path used for `GET /advertisement/:segment`. Lowercased so lookup matches DB `url_path`.
 */
export function normalizeAdvertisementLookupSegment(segment: string): string {
  const s = segment.trim();
  if (s.length === 0) return s;
  return s.toLowerCase();
}

/** Path segment for `/ads/{segment}` links and canonical URLs. */
export function publicAdSegment(
  ad: Pick<AdvertisementAggregate, "id" | "urlPath">,
): string {
  const fromRecord = ad as Record<string, unknown>;
  const raw =
    (typeof ad.urlPath === "string" ? ad.urlPath.trim() : "") ||
    (typeof fromRecord.url_path === "string" ? fromRecord.url_path.trim() : "") ||
    (typeof fromRecord.urlpath === "string" ? fromRecord.urlpath.trim() : "");
  if (raw.length > 0) {
    return raw.toLowerCase();
  }
  return ad.id;
}
