import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  ADVERTISEMENT_LIST_CACHE_TAG,
  advertisementBySegmentCacheTag,
  adHeroImageCacheTag,
  listAdvertisements,
} from "@/lib/api/advertisements";
import {
  normalizeAdvertisementLookupSegment,
  publicAdSegment,
} from "@/lib/ad-public-path";
import { getEnv } from "@/lib/env";

const REVALIDATE_TAG_PROFILE = "default" as const;

/**
 * On-demand cache purge for advertisement JSON and hero image fetches.
 * `Authorization: Bearer <REVALIDATE_AD_SECRET>` required.
 *
 * Body: `{ "all": true }` revalidates the list tag and every ad segment from
 * `listAdvertisements` (same limit as sitemap). `{ "segments": ["slug-a"] }`
 * revalidates only those lookup keys.
 */
export async function POST(request: Request): Promise<Response> {
  const { revalidateAdSecret } = getEnv();
  if (!revalidateAdSecret) {
    return NextResponse.json(
      { error: "REVALIDATE_AD_SECRET is not set" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${revalidateAdSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rec = body as Record<string, unknown>;
  const all = rec.all === true;
  const segmentsRaw = rec.segments;
  const segments: string[] | null =
    Array.isArray(segmentsRaw) &&
    segmentsRaw.every((s) => typeof s === "string" && String(s).trim().length > 0)
      ? (segmentsRaw as string[]).map((s) => String(s).trim())
      : null;

  if (all) {
    revalidateTag(ADVERTISEMENT_LIST_CACHE_TAG, REVALIDATE_TAG_PROFILE);
    const ads = await listAdvertisements({ limit: 50, offset: 0 });
    for (const ad of ads) {
      const key = normalizeAdvertisementLookupSegment(publicAdSegment(ad));
      revalidateTag(advertisementBySegmentCacheTag(key), REVALIDATE_TAG_PROFILE);
      revalidateTag(adHeroImageCacheTag(key), REVALIDATE_TAG_PROFILE);
    }
    return NextResponse.json({
      ok: true,
      mode: "all",
      advertisementListTag: ADVERTISEMENT_LIST_CACHE_TAG,
      segmentsPurged: ads.length,
    });
  }

  if (!segments || segments.length === 0) {
    return NextResponse.json(
      {
        error:
          'Provide JSON body { "all": true } or { "segments": ["ad-slug", ...] }',
      },
      { status: 400 },
    );
  }

  for (const seg of segments) {
    const key = normalizeAdvertisementLookupSegment(seg);
    revalidateTag(advertisementBySegmentCacheTag(key), REVALIDATE_TAG_PROFILE);
    revalidateTag(adHeroImageCacheTag(key), REVALIDATE_TAG_PROFILE);
  }

  return NextResponse.json({
    ok: true,
    mode: "segments",
    segments: segments.map((s) => normalizeAdvertisementLookupSegment(s)),
  });
}
