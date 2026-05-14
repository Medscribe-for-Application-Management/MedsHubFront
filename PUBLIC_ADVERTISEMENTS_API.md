# Public advertisements API (frontend guide)

This document describes how a browser or SPA can load **marketing advertisements** without logging in. These routes are **public**: no JWT, no cookies required.

**Base path:** `{API_BASE}/advertisement`  
Replace `{API_BASE}` with your backend origin (e.g. `https://api.example.com` in production, `http://localhost:3000` in local dev).

**CORS:** The server allows credentialed requests from the configured frontend origin. For these read-only endpoints you can use a normal `fetch` or `axios` call from your allowed origin; you do **not** need an `Authorization` header.

---

## Response shape (success)

Successful JSON responses are wrapped by the global response formatter:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OK",
  "data": { }
}
```

The fields you use are under **`data`**. Validation errors (`400`) and other errors may use a different body; treat non-2xx responses as errors.

---

## List advertisements — `GET /advertisement`

Returns **active** advertisements only: `expiration` is in the future. Newest campaign urgency is reflected by ordering: **soonest expiration first**.

| Query parameter | Required | Rules |
|-----------------|----------|--------|
| `clinicId` | No | If set, must be a **UUID**; filters to that clinic |
| `limit` | No | Integer **1–50**; default **20** |
| `offset` | No | Integer **0–100000**; default **0** (pagination) |

**Example — first page (default limit):**

```http
GET {API_BASE}/advertisement
```

**Example — clinic feed with pagination:**

```http
GET {API_BASE}/advertisement?clinicId=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee&limit=10&offset=0
```

**Success payload:** `data.advertisements` is an **array** of advertisement bundles (same object shape as the single-ad endpoint below). Each element includes **`adType`**, **`urlPath`**, and **`id`** at the top level next to titles, excerpts, and `expiration`.

**Pagination hint:** The API does not return a total count. If you need “load more”, request `limit + 1` or use `offset += advertisements.length` until you receive fewer items than `limit`.

**Rate limiting:** This route uses a **dedicated, higher** per-IP limit (default **8000** requests per **15 minutes**). Check `RateLimit-*` response headers when implementing retries.

---

## Single advertisement — `GET /advertisement/:segment`

| Path parameter | Rules |
|------------------|--------|
| `segment` | Advertisement **`urlPath`** (public slug) **or** legacy advertisement **UUID**. The server resolves either to the same non-expired bundle. |

**Example (UUID):**

```http
GET {API_BASE}/advertisement/123e4567-e89b-12d3-a456-426614174000
```

**Example (`urlPath` slug):**

```http
GET {API_BASE}/advertisement/dr-smith-jan-visit
```

**Success payload:** `data` is **one** bundle object (not nested under `advertisements`). It includes **`adType`** and **`urlPath`** at the top level.

**Not found:** `404` when the segment does not match an active advertisement or the advertisement is **expired**.

---

## Bundle object (what each item contains)

Each bundle is one tree: ad copy + consultant + clinic + locations + schedules. Field names are fixed (English / Arabic pairs use `eng*` / `ar*` prefixes).

| Area | Highlights |
|------|------------|
| **Ad** | `id` (stable UUID), **`urlPath`** (unique public slug for links), `adType` (`temp_visit` \| `perm_res`), `engTitle`, `arTitle`, `engExcerpt`, `arExcerpt`, `expiration` (ISO-8601 string) |
| **`consultant`** | Names, specialities, bios, optional position/quals/recognition/publications, `images[]` with `imageUrl` and `altText` |
| **`clinic`** | Titles, excerpts, `logo`, `logoAltText`, `alphaCode` |
| **`locations[]`** | `locationId`, `long`, `lat`, `engAddress`, `arAddress`, `clerks[]` (`clerkId`, `waNum`) |
| **`schedules[]`** | `scheduleId`, nested `location` (id, coords, addresses), `date`, `start`, `finish` |

**`adType`:** `temp_visit` means a temporary visit campaign (frontends often summarize availability from `schedules`). `perm_res` means a permanent residence campaign. Older rows default to `perm_res` when the field was added. The JSON field is **`adType`** (some stacks may emit **`ad_type`**; clients may normalize).

**`urlPath`:** Lowercase slug (**1–128** characters: `a-z`, `0-9`, hyphens between groups). Unique per advertisement. The JSON field is **`urlPath`** (DB column **`url_path`**). **Public Next.js routes** in this repo use **`/ads/{urlPath}`** for shareable URLs; **`id`** remains the canonical row identifier for logs and APIs. If `urlPath` is missing on an older payload, the UI may fall back to **`/ads/{id}`** until the API is fully migrated.

---

## Images and logos (important)

`clinic.logo` and `consultant.images[].imageUrl` are **not** meant to be loaded as raw R2 URLs in the browser. The API rewrites them to **absolute URLs on the API host** that stream the file via:

`GET {API_BASE}/media/r2?key=<url-encoded-object-key>`

**What you should do:** use the `imageUrl` / `logo` strings from the JSON **as the `src` of `<img>`** (or equivalent). The browser will call your API, which serves the bytes from object storage.

That proxy route is also **public** (no JWT). It shares the same relaxed rate-limit bucket as the advertisement reads.

If the API sits behind a reverse proxy and rewritten URLs would be wrong, the server can be configured with **`PUBLIC_ASSET_BASE_URL`** (no trailing slash) so asset links point at the public API URL.

---

## Minimal `fetch` examples

```ts
const API_BASE = import.meta.env.VITE_API_URL; // or your config

async function listAds(params?: { clinicId?: string; limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.clinicId) qs.set("clinicId", params.clinicId);
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const url = `${API_BASE}/advertisement${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.data.advertisements as unknown[];
}

async function getAdById(id: string) {
  const res = await fetch(`${API_BASE}/advertisement/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.data as unknown;
}
```

---

## Related server documentation

Full API reference (including admin **`POST /advertisement`**) is in `API_DOCUMENTATION.md` under **Advertisement**.
