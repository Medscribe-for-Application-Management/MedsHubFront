# Advertisement module — frontend handoff

This document describes **recent `advertisement` table and API changes** for marketing/landing-page integration. For full server reference (auth, rate limits, errors), see **`API_DOCUMENTATION.md`** § Advertisement.

**Base URL:** `https://<api-host>` (e.g. local dev: `http://localhost:3000`).

---

## 1. What changed (summary)

| Area | Change |
|------|--------|
| **Database** | New nullable OG columns + `is_active` (default `true`) on `advertisement` |
| **Public GET** | New fields on aggregate JSON; OG images proxied like clinic/consultant images |
| **Visibility** | Public routes only return ads with `isActive === true` and `expiration` in the future |
| **Admin** | New **`PATCH /advertisement/:id`** for OG images/text and toggling `isActive` |
| **Create** | Optional `isActive` on **`POST /advertisement`** (defaults to `true`) |

Existing rows were migrated without data loss: OG fields are `null`, `is_active` is `true`.

---

## 2. `advertisement` table → JSON field map

| PostgreSQL column | API (camelCase) | Type in responses | Notes |
|-------------------|-----------------|-------------------|--------|
| `og_eng_image` | `ogEngImage` | `string \| null` | R2 URL; proxied on public GET |
| `og_arabic_image` | `ogArabicImage` | `string \| null` | R2 URL; proxied on public GET |
| `og_eng_title` | `ogEngTitle` | `string \| null` | Use for `<meta property="og:title">` (EN) |
| `og_arabic_title` | `ogArabicTitle` | `string \| null` | Use for OG title (AR) |
| `og_eng_description` | `ogEngDescription` | `string \| null` | `og:description` (EN) |
| `og_arabic_description` | `ogArabicDescription` | `string \| null` | `og:description` (AR) |
| `is_active` | `isActive` | `boolean` | Public GET only returns `true`; use PATCH to deactivate |

Unchanged top-level fields (still on every public aggregate): `id`, `adType`, `urlPath`, `engTitle`, `arTitle`, `engExcerpt`, `arExcerpt`, `expiration`, plus nested `consultant`, `clinic`, `locations`, `schedules`.

---

## 3. TypeScript shapes (public read)

Use these for typing fetch/SSR code against **`GET /advertisement`** and **`GET /advertisement/:segment`**:

```typescript
type TAdvertisementAdType = "temp_visit" | "perm_res";

interface AdvertisementPublicBundle {
  id: string;
  adType: TAdvertisementAdType;
  urlPath: string;
  engTitle: string;
  arTitle: string;
  engExcerpt: string;
  arExcerpt: string;
  expiration: string; // ISO-8601

  ogEngImage: string | null;
  ogArabicImage: string | null;
  ogEngTitle: string | null;
  ogArabicTitle: string | null;
  ogEngDescription: string | null;
  ogArabicDescription: string | null;
  isActive: boolean; // always true on public GET

  consultant: {
    consultantId: string;
    engName: string;
    arName: string;
    // ...speciality, bio, images[], etc.
    images: { imageUrl: string; altText: string }[];
  };
  clinic: {
    clinicId: string;
    engTitle: string;
    arTitle: string;
    logo: string; // proxied
    logoAltText: string;
    alphaCode: string;
  };
  locations: Array<{
    locationId: string;
    long: number;
    lat: number;
    engAddress: string;
    arAddress: string;
    clerks: { clerkId: string; waNum: string }[];
  }>;
  schedules: Array<{
    scheduleId: string;
    location: { locationId: string; long: number; lat: number; engAddress: string; arAddress: string };
    date: string;
    start: string;
    finish: string;
  }>;
}

// GET /advertisement
interface ListResponse {
  message: string;
  data: { advertisements: AdvertisementPublicBundle[] };
}

// GET /advertisement/:segment
interface SegmentResponse {
  message: string;
  data: AdvertisementPublicBundle;
}
```

---

## 4. Public endpoints (no auth)

### List — `GET /advertisement`

Query (all optional):

| Param | Default | Max |
|-------|---------|-----|
| `clinicId` | — | UUID filter |
| `limit` | `20` | `50` |
| `offset` | `0` | — |

Returns only **`isActive === true`** and **not expired** ads.

### Single ad — `GET /advertisement/:segment`

- **`segment`** = public slug (`urlPath`), e.g. `mih-henry-schroeder` — **not** the internal UUID.
- **`404`** if slug unknown, expired, or inactive.

### Image URLs (important)

Do **not** use raw R2 hostnames from admin PATCH responses in the browser. On **public GET**, use these fields as-is:

- `clinic.logo`
- `consultant.images[].imageUrl`
- `ogEngImage`, `ogArabicImage` (when non-null)

They are already rewritten to:

```text
https://<api-host>/media/r2?key=advertisement-og%2F<slug>%2Feng-....jpg
```

Load images and OG tags from the **same API origin** (or set server-side `PUBLIC_ASSET_BASE_URL` in backend env if behind a proxy).

---

## 5. Suggested OG / meta usage

Pick locale-specific OG fields when rendering `<head>`:

| Locale | Title | Description | Image |
|--------|-------|-------------|-------|
| English | `ogEngTitle` ?? `engTitle` | `ogEngDescription` ?? `engExcerpt` | `ogEngImage` ?? fallback (e.g. consultant image) |
| Arabic | `ogArabicTitle` ?? `arTitle` | `ogArabicDescription` ?? `arExcerpt` | `ogArabicImage` ?? fallback |

If OG fields are `null`, fall back to the main ad copy fields (`engTitle` / `arTitle`, etc.).

Example (Next.js / React Helmet style):

```html
<meta property="og:title" content="{ogEngTitle || engTitle}" />
<meta property="og:description" content="{ogEngDescription || engExcerpt}" />
<meta property="og:image" content="{ogEngImage}" />
<meta property="og:url" content="https://<marketing-site>/ads/{urlPath}" />
```

---

## 6. Admin / dashboard endpoints (JWT required)

Roles: **`superAdmin`** or **`admin`** (admin scoped to own clinic).

### Create — `POST /advertisement`

`Content-Type: application/json`

Optional new field:

| Field | Type | Default |
|-------|------|---------|
| `isActive` | boolean | `true` |

OG fields are **not** accepted on create. After create, call PATCH with the returned `id`.

### Update OG + active flag — `PATCH /advertisement/:id`

`Content-Type: multipart/form-data`  
Path **`id`** = advertisement **UUID**.

Send **at least one** of:

| Form field | Type |
|------------|------|
| `ogEngImage` | file |
| `ogArabicImage` | file |
| `ogEngTitle` | text |
| `ogArabicTitle` | text |
| `ogEngDescription` | text |
| `ogArabicDescription` | text |
| `isActive` | `true` / `false` |

- Omit a field → unchanged.
- Send empty text → stored as `null` (clears OG text).
- Deactivate listing: `isActive=false` (ad disappears from public GET until set back to `true`).

**Response** `200` — `data` includes all OG fields + `isActive`. Image URLs in PATCH responses are **direct R2 URLs** (for admin preview only); public site should always use GET aggregate URLs.

### Example (curl)

```bash
curl -X PATCH "https://<api-host>/advertisement/<AD_UUID>" \
  -H "Authorization: Bearer <JWT>" \
  -F "ogEngImage=@./og-en.jpg" \
  -F "ogArabicImage=@./og-ar.jpg" \
  -F "ogEngTitle=Book your visit today" \
  -F "ogArabicTitle=احجز زيارتك اليوم" \
  -F "ogEngDescription=Expert cardiology care." \
  -F "ogArabicDescription=رعاية قلب متخصصة." \
  -F "isActive=true"
```

---

## 7. Frontend checklist

- [ ] Extend ad types with six OG fields + `isActive`.
- [ ] Use `urlPath` for public routes, not `id`.
- [ ] Handle `null` OG fields with fallbacks to `engTitle` / `arTitle` / excerpts.
- [ ] Use proxied image URLs from GET only (never raw R2 in `<img>` / `og:image` on the public site).
- [ ] Listing page: `GET /advertisement?clinicId=&limit=&offset=` — only active, non-expired ads returned.
- [ ] Admin: after `POST /advertisement`, open PATCH form for OG upload + copy.
- [ ] “Unpublish” without delete: `PATCH` with `isActive=false`.

---

## 8. Related docs

- **`API_DOCUMENTATION.md`** — Advertisement section (validators, errors, rate limits)
- **`src/advertisement/advertisement.interface.ts`** — source-of-truth TypeScript interfaces on the server
