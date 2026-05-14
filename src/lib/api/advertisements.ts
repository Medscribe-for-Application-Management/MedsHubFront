import { advertisementDetailRevalidateSeconds, getEnv } from "@/lib/env";
/** Public ad reads — `GET /advertisement` vs `GET /advertisement/:segment` (UUID or urlPath). @see PUBLIC_ADVERTISEMENTS_API.md */
import {
  isLibelusDebugEnabled,
  libelusDebugLog,
} from "@/lib/instrumentation/debug-libelus";
import { normalizeAdvertisementLookupSegment } from "@/lib/ad-public-path";
import {
  advertisementAggregateSchema,
  coalesceAdvertisementPayload,
  parseSingleAdvertisementData,
  unwrapJsonStringFieldsAtAdvertisementLevel,
  type AdvertisementAggregate,
} from "@/lib/api/advertisement-schema";

/** Cache tag for `GET /advertisement` list responses (home, sitemap, static params). */
export const ADVERTISEMENT_LIST_CACHE_TAG = "advertisement-list" as const;

export function advertisementBySegmentCacheTag(lookupKey: string): string {
  return `advertisement:${lookupKey}`;
}

export function adHeroImageCacheTag(lookupKey: string): string {
  return `ad-hero:${lookupKey}`;
}

function advertisementJsonFetchInit(tags: string[]): RequestInit {
  const { advertisementFetchRevalidate } = getEnv();
  return {
    next: { revalidate: advertisementFetchRevalidate, tags },
    headers: { Accept: "application/json" },
  };
}

function advertisementDetailJsonFetchInit(tags: string[]): RequestInit {
  return {
    next: {
      revalidate: advertisementDetailRevalidateSeconds(),
      tags,
    },
    headers: { Accept: "application/json" },
  };
}

interface ListAdvertisementsParams {
  clinicId?: string;
  limit?: number;
  offset?: number;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractAdvertisementsFromListJson(json: unknown): AdvertisementAggregate[] {
  if (!isRecord(json)) return [];
  if (String(json.status ?? "").toLowerCase() === "error") return [];
  const data = json.data;
  let rows: unknown[] = [];
  if (Array.isArray(data)) {
    rows = data;
  } else if (isRecord(data) && Array.isArray(data.advertisements)) {
    rows = data.advertisements;
  } else {
    return [];
  }

  const out: AdvertisementAggregate[] = [];
  for (const row of rows) {
    const prepared = isRecord(row)
      ? unwrapJsonStringFieldsAtAdvertisementLevel(row)
      : row;
    const payload = coalesceAdvertisementPayload(prepared) ?? prepared;
    const parsed = advertisementAggregateSchema.safeParse(payload);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

export async function listAdvertisements(
  params: ListAdvertisementsParams = {},
): Promise<AdvertisementAggregate[]> {
  const { apiBaseUrl } = getEnv();
  const url = new URL(`${apiBaseUrl}/advertisement`);
  if (params.clinicId) url.searchParams.set("clinicId", params.clinicId);
  if (params.limit != null) url.searchParams.set("limit", String(params.limit));
  if (params.offset != null)
    url.searchParams.set("offset", String(params.offset));

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      ...advertisementJsonFetchInit([ADVERTISEMENT_LIST_CACHE_TAG]),
    });
  } catch (e) {
    console.error("listAdvertisements fetch failed:", e);
    return [];
  }

  if (!res.ok) {
    console.error(
      `listAdvertisements: ${res.status} ${res.statusText} for ${url}`,
    );
    return [];
  }

  const json = await readJson(res);
  const ads = extractAdvertisementsFromListJson(json);
  if (isLibelusDebugEnabled()) {
    libelusDebugLog("listAdvertisements", {
      url: url.toString(),
      ok: true,
      count: ads.length,
      topLevelKeys: isRecord(json) ? Object.keys(json) : typeof json,
      dataShape: describeDataShape(json),
    });
  }
  if (ads.length === 0 && json != null) {
    const hasArrayShape =
      isRecord(json) &&
      (Array.isArray(json.data) ||
        (isRecord(json.data) && Array.isArray(json.data.advertisements)));
    if (hasArrayShape) {
      console.warn(
        "listAdvertisements: response matched list shape but no items passed validation.",
      );
    }
  }
  return ads;
}

/** `segment` is advertisement UUID or public `urlPath` slug — same `GET /advertisement/:segment`. */
export async function getAdvertisementByPublicSegment(
  segment: string,
): Promise<AdvertisementAggregate | null> {
  const { apiBaseUrl } = getEnv();
  const lookupKey = normalizeAdvertisementLookupSegment(segment);
  let res: Response;
  try {
    res = await fetch(
      `${apiBaseUrl}/advertisement/${encodeURIComponent(lookupKey)}`,
      {
        ...advertisementDetailJsonFetchInit([
          advertisementBySegmentCacheTag(lookupKey),
        ]),
      },
    );
  } catch (e) {
    console.error("getAdvertisementByPublicSegment fetch failed:", e);
    return null;
  }

  if (res.status === 404) return null;

  if (!res.ok) {
    console.error(
      `getAdvertisementByPublicSegment: ${res.status} ${res.statusText} for ${lookupKey}`,
    );
    return null;
  }

  const json = await readJson(res);
  if (isLibelusDebugEnabled()) {
    libelusDebugLog("getAdvertisementByPublicSegment response", {
      segment,
      lookupKey,
      status: res.status,
      topLevelKeys: isRecord(json) ? Object.keys(json) : typeof json,
      dataShape: describeDataShape(json),
    });
  }

  const ad = parseSingleAdvertisementData(json);
  if (ad) {
    if (isLibelusDebugEnabled()) {
      libelusDebugLog("getAdvertisementByPublicSegment parsed", {
        segment,
        adId: ad.id,
      });
    }
    return ad;
  }

  if (isLibelusDebugEnabled() && isRecord(json) && isRecord(json.data)) {
    const d = json.data;
    libelusDebugLog("getAdvertisementByPublicSegment parse miss probe", {
      consultantType: typeof d.consultant,
      clinicType: typeof d.clinic,
      locationsType: typeof d.locations,
    });
  }

  if (isLibelusDebugEnabled() || process.env.NODE_ENV === "development") {
    const rawData = isRecord(json) && "data" in json ? json.data : json;
    const coalesced = isRecord(rawData)
      ? coalesceAdvertisementPayload(rawData)
      : null;
    const dbgPayload =
      coalesced != null ? coalesced : isRecord(rawData) ? rawData : json;
    const dbg = advertisementAggregateSchema.safeParse(dbgPayload);
    if (!dbg.success) {
      console.warn(
        "getAdvertisementByPublicSegment: aggregate Zod issues",
        dbg.error.flatten(),
      );
    }
  }

  return null;
}

function describeDataShape(json: unknown): Record<string, unknown> | string {
  if (!isRecord(json)) return typeof json;
  const data = json.data;
  if (data == null) return { data: "null/undefined" };
  if (Array.isArray(data)) return { data: "array", length: data.length };
  if (isRecord(data)) {
    return {
      data: "object",
      keys: Object.keys(data),
      hasAdvertisements: Array.isArray(
        (data as { advertisements?: unknown }).advertisements,
      ),
    };
  }
  return { data: typeof data };
}

export function isAdvertisementExpired(ad: AdvertisementAggregate): boolean {
  const exp = Date.parse(ad.expiration);
  if (Number.isNaN(exp)) return true;
  return exp <= Date.now();
}
