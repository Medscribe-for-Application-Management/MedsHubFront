import { z } from "zod";

/**
 * Public advertisement bundle — matches backend `IAdvertisementPublicBundle`
 * (see `PUBLIC_ADVERTISEMENTS_API.md`). API may send `locationId`, `consultantId`,
 * and `clinicId`; we normalize to `id` on consultant/clinic/locations for UI and types.
 */

/** Campaign kind from public API (`adType` JSON / `ad_type` column). */
export type AdvertisementAdType = "temp_visit" | "perm_res";

const adTypeField = z
  .union([
    z.literal("temp_visit"),
    z.literal("perm_res"),
    z.undefined(),
    z.null(),
    z.string(),
  ])
  .transform((v): AdvertisementAdType => {
    if (v === "temp_visit" || v === "perm_res") return v;
    return "perm_res";
  });

const urlPathField = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((v): string | undefined => {
    if (v == null) return undefined;
    const t = String(v).trim();
    return t.length > 0 ? t : undefined;
  });

/** API may send UUIDs or other string ids; avoid rejecting valid rows. */
const idString = z.string().min(1);

const apiText = z.preprocess(
  (v) => (v == null || v === undefined ? "" : String(v)),
  z.string(),
);

const nullableApiText = z.preprocess(
  (v) => (v == null || v === undefined ? null : String(v)),
  z.string().nullable(),
);

export const clerkContactSchema = z.object({
  clerkId: idString.optional(),
  waNum: z.preprocess(
    (val) => (val == null ? "" : String(val)),
    z.string(),
  ),
});

export const locationSchema = z
  .object({
    id: idString.optional(),
    /** Backend public bundle uses `locationId`; we normalize to `id` after parse. */
    locationId: idString.optional(),
    long: z.coerce.number().optional(),
    lat: z.coerce.number().optional(),
    engAddress: z.string().nullish(),
    arAddress: z.string().nullish(),
    clerks: z.array(clerkContactSchema).optional().default([]),
  })
  .passthrough()
  .transform((loc) => ({
    ...loc,
    id: loc.id ?? loc.locationId ?? "unknown-location",
  }));

export const scheduleLocationSnapshotSchema = z
  .object({
    id: idString.optional(),
    locationId: idString.optional(),
    long: z.coerce.number().optional(),
    lat: z.coerce.number().optional(),
    engAddress: z.string().nullish(),
    arAddress: z.string().nullish(),
  })
  .passthrough()
  .transform((loc) => ({
    ...loc,
    id: loc.id ?? loc.locationId,
  }));

export const scheduleSchema = z
  .object({
    scheduleId: z.string().optional(),
    id: z.string().optional(),
    date: apiText,
    start: apiText,
    finish: apiText,
    location: scheduleLocationSnapshotSchema.optional(),
  })
  .passthrough()
  .transform((s) => ({
    ...s,
    scheduleId: s.scheduleId ?? s.id ?? "unknown-schedule",
  }));

export const consultantImageSchema = z.object({
  imageUrl: z.preprocess(
    (v) => (v == null ? "" : String(v)),
    z.string(),
  ),
  altText: z.string().nullable().optional(),
});

export const consultantSchema = z
  .object({
    /** Some bundles use `consultantId` (public API); normalize to `id` on output. */
    id: idString.optional(),
    consultantId: idString.optional(),
    engName: apiText,
    arName: apiText,
    engSpeciality: z.string().nullish(),
    arSpeciality: z.string().nullish(),
    engSubSpeciality: z.string().nullable().optional(),
    arSubSpeciality: z.string().nullable().optional(),
    engExcerpt: z.string().nullish(),
    arExcerpt: z.string().nullish(),
    engBriefBio: z.string().nullish(),
    arBriefBio: z.string().nullish(),
    waNum: z.string().nullish(),
    images: z.array(consultantImageSchema).optional().default([]),
  })
  .passthrough()
  .refine((c) => Boolean(c.id ?? c.consultantId), {
    message: "Expected id or consultantId",
    path: ["id"],
  })
  .transform((c) => ({
    ...c,
    id: (c.id ?? c.consultantId) as string,
  }));

export const clinicSchema = z
  .object({
    id: idString.optional(),
    clinicId: idString.optional(),
    engTitle: apiText,
    arTitle: apiText,
    engExcerpt: z.string().nullish(),
    arExcerpt: z.string().nullish(),
    logo: z.string().nullable().optional(),
    logoAltText: z.string().nullable().optional(),
    alphaCode: z.string().optional(),
  })
  .passthrough()
  .refine((c) => Boolean(c.id ?? c.clinicId), {
    message: "Expected id or clinicId",
    path: ["id"],
  })
  .transform((c) => ({
    ...c,
    id: (c.id ?? c.clinicId) as string,
  }));

export const advertisementAggregateSchema = z
  .object({
    id: idString,
    adType: adTypeField,
    urlPath: urlPathField,
    engTitle: apiText,
    arTitle: apiText,
    engExcerpt: apiText,
    arExcerpt: apiText,
    expiration: apiText,
    ogEngImage: nullableApiText.optional(),
    ogArabicImage: nullableApiText.optional(),
    ogEngTitle: nullableApiText.optional(),
    ogArabicTitle: nullableApiText.optional(),
    ogEngDescription: nullableApiText.optional(),
    ogArabicDescription: nullableApiText.optional(),
    isActive: z.boolean().optional(),
    consultant: consultantSchema,
    clinic: clinicSchema,
    locations: z.array(locationSchema).optional().default([]),
    schedules: z.array(scheduleSchema).optional().default([]),
  })
  .passthrough();

export type AdvertisementAggregate = z.infer<typeof advertisementAggregateSchema>;
export type ConsultantImage = z.infer<typeof consultantImageSchema>;
export type ClerkContact = z.infer<typeof clerkContactSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;

function looksLikeResponseEnvelope(
  json: Record<string, unknown>,
): boolean {
  if (!("data" in json) || json.data === undefined) return false;
  return (
    "status" in json ||
    "statusCode" in json ||
    "message" in json
  );
}

export function parseSingleAdvertisementData(
  json: unknown,
): AdvertisementAggregate | null {
  if (!isPlainObject(json)) return null;
  if (String(json.status ?? "").toLowerCase() === "error") return null;

  const body = looksLikeResponseEnvelope(json) ? json.data : json;

  const payload = coalesceAdvertisementPayload(body);
  if (payload == null) return null;
  const parsed = advertisementAggregateSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

/** Unwrap common nesting patterns for GET /advertisement/:id */
export function coalesceAdvertisementPayload(data: unknown): unknown {
  if (data == null) return null;
  if (Array.isArray(data)) {
    return data.length === 1 ? coalesceAdvertisementPayload(data[0]) : null;
  }
  if (!isPlainObject(data)) return data;

  const normalized = unwrapJsonStringFieldsAtAdvertisementLevel(data);

  if ("advertisement" in normalized && normalized.advertisement != null) {
    return coalesceAdvertisementPayload(normalized.advertisement);
  }
  if ("ad" in normalized && normalized.ad != null) {
    return coalesceAdvertisementPayload(normalized.ad);
  }
  if ("result" in normalized && normalized.result != null) {
    return coalesceAdvertisementPayload(normalized.result);
  }
  if ("item" in normalized && normalized.item != null) {
    return coalesceAdvertisementPayload(normalized.item);
  }
  if ("payload" in normalized && normalized.payload != null) {
    return coalesceAdvertisementPayload(normalized.payload);
  }
  if ("row" in normalized && normalized.row != null) {
    return coalesceAdvertisementPayload(normalized.row);
  }
  if ("data" in normalized && normalized.data != null) {
    const inner = normalized.data;
    if (inner !== normalized) {
      const next = coalesceAdvertisementPayload(inner);
      if (
        next != null &&
        (looksLikeAdvertisementAggregate(next) || isPublicAdBundleShape(next))
      ) {
        return next;
      }
    }
  }

  if (looksLikeAdvertisementAggregate(normalized)) return normalized;
  if (isPublicAdBundleShape(normalized)) return normalized;
  if (hasAdBundleKeys(normalized)) return normalized;
  return null;
}

/** Single JSON.parse; returns original string on failure or non-JSON. */
function parseJsonStringLoose(raw: string): unknown {
  const t = raw.replace(/^\uFEFF/, "").trim();
  if (t.length < 2) return raw;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    return raw;
  }
}

/** Handles double-encoded JSON strings (string of JSON string, etc.). */
function deepUnwrapJsonString(value: unknown, maxPasses: number): unknown {
  let v: unknown = value;
  for (let i = 0; i < maxPasses; i++) {
    if (typeof v !== "string") return v;
    const next = parseJsonStringLoose(v);
    if (next === v) return v;
    v = next;
  }
  return v;
}

function isNonNullPlainObject(v: unknown): boolean {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

/** True when `data` is clearly the public bundle (nested objects present, not null). */
function isPublicAdBundleShape(value: unknown): boolean {
  if (!isPlainObject(value)) return false;
  const u = unwrapJsonStringFieldsAtAdvertisementLevel(value);
  return (
    ("id" in u || "expiration" in u) &&
    isNonNullPlainObject(u.consultant) &&
    isNonNullPlainObject(u.clinic)
  );
}

/** Last resort: let Zod validate real API payloads (clearer than envelope fallback). */
function hasAdBundleKeys(value: Record<string, unknown>): boolean {
  return "id" in value && "consultant" in value && "clinic" in value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const CONSULTANT_SNAKE_ALIASES: [string, string][] = [
  ["engName", "eng_name"],
  ["arName", "ar_name"],
  ["engSpeciality", "eng_speciality"],
  ["arSpeciality", "ar_speciality"],
  ["engSubSpeciality", "eng_sub_speciality"],
  ["arSubSpeciality", "ar_sub_speciality"],
  ["engExcerpt", "eng_excerpt"],
  ["arExcerpt", "ar_excerpt"],
  ["engBriefBio", "eng_brief_bio"],
  ["arBriefBio", "ar_brief_bio"],
  ["waNum", "wa_num"],
];

const CLINIC_SNAKE_ALIASES: [string, string][] = [
  ["engTitle", "eng_title"],
  ["arTitle", "ar_title"],
  ["engExcerpt", "eng_excerpt"],
  ["arExcerpt", "ar_excerpt"],
  ["logoAltText", "logo_alt_text"],
  ["alphaCode", "alpha_code"],
];

function aliasSnakeToCamel(
  obj: Record<string, unknown>,
  pairs: [string, string][],
): void {
  for (const [camel, snake] of pairs) {
    if (!(camel in obj) && snake in obj) {
      obj[camel] = obj[snake];
    }
  }
}

function normalizeNestedBundleObjects(out: Record<string, unknown>): void {
  const cons = out.consultant;
  if (isNonNullPlainObject(cons)) {
    aliasSnakeToCamel(cons as Record<string, unknown>, CONSULTANT_SNAKE_ALIASES);
  }
  const clin = out.clinic;
  if (isNonNullPlainObject(clin)) {
    aliasSnakeToCamel(clin as Record<string, unknown>, CLINIC_SNAKE_ALIASES);
  }
}

function hasNonEmptyStringUrlPath(out: Record<string, unknown>): boolean {
  const v = out.urlPath;
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Some APIs / ORM layers return nested objects as JSON strings, or consultant/clinic
 * as a single-element array. Normalize before `looksLike` / Zod.
 * Export for list extraction so `url_path` / variants map to `urlPath` before `safeParse`.
 */
export function unwrapJsonStringFieldsAtAdvertisementLevel(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...input };

  if (!("adType" in out) && "ad_type" in out) {
    out.adType = out.ad_type;
  }

  if (!hasNonEmptyStringUrlPath(out)) {
    const urlPathAliases = [
      "url_path",
      "urlpath",
      "UrlPath",
      "URL_PATH",
    ] as const;
    for (const key of urlPathAliases) {
      const v = out[key];
      if (typeof v === "string" && v.trim().length > 0) {
        out.urlPath = v;
        break;
      }
    }
  }

  const ogFieldAliases: [string, string][] = [
    ["ogEngImage", "og_eng_image"],
    ["ogArabicImage", "og_arabic_image"],
    ["ogEngTitle", "og_eng_title"],
    ["ogArabicTitle", "og_arabic_title"],
    ["ogEngDescription", "og_eng_description"],
    ["ogArabicDescription", "og_arabic_description"],
    ["isActive", "is_active"],
  ];
  for (const [camel, snake] of ogFieldAliases) {
    if (!(camel in out) && snake in out) {
      out[camel] = out[snake];
    }
  }

  for (const key of ["consultant", "clinic"] as const) {
    let v = out[key];
    if (Array.isArray(v)) {
      const first = v.find(
        (x) => x != null && typeof x === "object" && !Array.isArray(x),
      );
      if (first != null) {
        out[key] = first;
        v = out[key];
      }
    }
    if (typeof v === "string") {
      out[key] = deepUnwrapJsonString(v, 6);
    }
  }

  for (const key of ["locations", "schedules"] as const) {
    const v = out[key];
    if (typeof v !== "string") continue;
    const parsed = deepUnwrapJsonString(v, 6);
    if (parsed === v) continue;
    if (key === "locations" && parsed == null) {
      out[key] = [];
    } else if (key === "schedules" && parsed == null) {
      out[key] = [];
    } else {
      out[key] = parsed;
    }
  }

  normalizeNestedBundleObjects(out);

  return out;
}

function looksLikeAdvertisementAggregate(value: unknown): boolean {
  if (!isPlainObject(value)) return false;
  const v = unwrapJsonStringFieldsAtAdvertisementLevel(value);
  return (
    (typeof v.id === "string" || typeof v.id === "number") &&
    (typeof v.engTitle === "string" ||
      typeof v.engTitle === "number" ||
      v.engTitle == null) &&
    typeof v.consultant === "object" &&
    v.consultant != null &&
    typeof v.clinic === "object" &&
    v.clinic != null
  );
}
