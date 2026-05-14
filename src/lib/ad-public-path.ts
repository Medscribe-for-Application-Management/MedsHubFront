import type { AdvertisementAggregate } from "@/lib/api/advertisement-schema";

/** Advertisement row UUID (legacy public URL segment). */
export const ADVERTISEMENT_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public `urlPath` slug: letters, digits, single hyphens between groups, 1–128 chars
 * (case-insensitive; normalized to lowercase in `publicAdSegment`).
 */
export const ADVERTISEMENT_URL_PATH_SLUG_REGEX =
  /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;

export function isAdvertisementRouteSegment(segment: string): boolean {
  const s = segment.trim();
  if (s.length === 0 || s.length > 128) return false;
  if (ADVERTISEMENT_UUID_REGEX.test(s)) return true;
  return ADVERTISEMENT_URL_PATH_SLUG_REGEX.test(s);
}

/**
 * Path used for `GET /advertisement/:segment`. Slugs are lowercased so lookup matches DB;
 * UUIDs are left as-is (hex is case-insensitive but we preserve the segment).
 */
export function normalizeAdvertisementLookupSegment(segment: string): string {
  const s = segment.trim();
  if (s.length === 0) return s;
  if (ADVERTISEMENT_UUID_REGEX.test(s)) return s;
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
    if (ADVERTISEMENT_UUID_REGEX.test(raw)) return raw;
    return raw.toLowerCase();
  }
  return ad.id;
}
