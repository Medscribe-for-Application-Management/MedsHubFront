# API Documentation

This document is the source of truth for all current and future API endpoints in `libelusClinServer`.
Update it whenever an endpoint is added, modified, deprecated, or removed.

All successful responses are wrapped by `responseFormatter` unless the status code is `4xx`/`5xx` (see error shape below).

## Versioning and Base URLs

- API versioning strategy: `<define strategy, e.g. URL /v1 or header-based>`
- Local base URL: `<http://localhost:PORT>`
- Staging base URL: `<staging URL>`
- Production base URL: `<production URL>`

## Authentication and Authorization

- Authentication mechanism: JWT (Bearer token or HTTP-only cookie; see `extractJWT` middleware)
- JWT middleware: `extractJWT` (on protected routes)
- Role middleware (from `authorize.middleware.ts`): `requireSuperAdmin`, `requireSuperAdminOrAdmin`, `requireAdmin`, `requireConsultant`, `requireClerk`, `requirePatient`
- JWT payload shape (claims):

```json
{
  "email": "user@example.com",
  "role": "superAdmin",
  "_id": "user-id"
}
```

Access authenticated user via `res.locals.jwt`.

Obtain a token:

- `POST /auth/superAdmin/login` (public) — for seeded super admin accounts only. There is **no** endpoint to create new super admins.
- `POST /auth/admin/login` (public) — for admin accounts created as a side-effect of `POST /clinic`. There is **no** standalone endpoint to create admins.
- `POST /auth/clerk/login` (public) — for clerk accounts created via `POST /clerk`.

Consultant and patient logins will be added under `/auth/...` when implemented.

### Rate limiting

- Global default: `express-rate-limit` on all routes except **GET** `/advertisement`, **GET** `/advertisement/:id`, and **GET** `/media/r2` (see `src/middleware/rateLimit.middleware.ts`). Configure with `GLOBAL_RATE_LIMIT_MAX` (default `1000` requests / 15 minutes / IP).
- Public advertisement reads use a **separate, higher** per-IP ceiling: `ADVERTISEMENT_PUBLIC_RATE_LIMIT_MAX` (default `8000` / 15 minutes / IP).

## Response envelope

**Success (2xx/3xx):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request completed successfully",
  "data": {}
}
```

**Error:**

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Human-readable message",
  "error": {}
}
```

## Common Error Codes

| Status Code | Meaning | Typical Cause |
|---|---|---|
| 400 | Bad Request | Validation failure |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Role is not allowed |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate/constraint violation |
| 422 | Unprocessable Entity | Domain rule violation |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Dependency/database unavailable |

---

## Root

### `GET /`

Returns API metadata. No authentication.

**Example success:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OK",
  "data": {
    "name": "libelusClinServer",
    "version": "0.1.0"
  }
}
```

---

## Auth

The auth module is the single HTTP surface for sign-in/out flows. It DI-injects per-role providers (`SuperAdminProvider`, `AdminProvider`, `ClerkProvider`, …) to verify credentials and issue JWTs. New role logins should be added here, not as separate HTTP surfaces inside user modules (those modules still own persistence and business rules).

### `POST /auth/superAdmin/login`

Authenticates a **seeded** super admin from the `super_admin` table and returns a JWT `accessToken`. There is **no** public or authenticated endpoint to create additional super admins.

- Auth required: **No**
- Validation middleware: `loginSuperAdminValidator`
- Controller method: `AuthController.handlePostSuperAdminLogin`

#### Request

**Headers**

- `Content-Type: application/json`

**Body** (JSON)

| Field | Type | Notes |
|---|---|---|
| `email` | string | Required, RFC email |
| `password` | string | Required, plaintext; compared to stored bcrypt hash |

Example:

```json
{
  "email": "ibrahimrefaeei@gmail.com",
  "password": "your-password-here"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "850d3196-6182-4a0e-ab6c-947aa950321c",
      "email": "ibrahimrefaeei@gmail.com",
      "name": "Super Admin",
      "role": "superAdmin"
    }
  }
}
```

The JWT payload includes `{ "email", "role": "superAdmin", "_id" }` and is signed with `JWT_SECRET`. Optional env `JWT_EXPIRES_IN` defaults to `24h` (e.g. `8h`, `7d`).

#### Error Responses

- `400 Bad Request`: validation errors
- `401 Unauthorized`: invalid email or password (same message for both)
- `500 Internal Server Error`: `JWT_SECRET` not configured

### `POST /auth/admin/login`

Authenticates an admin from the `admin` table (rows are created by `POST /clinic`) and returns a JWT `accessToken` with `role: "admin"`.

- Auth required: **No**
- Validation middleware: `loginAdminValidator`
- Controller method: `AuthController.handlePostAdminLogin`

#### Request

**Headers**

- `Content-Type: application/json`

**Body** (JSON)

| Field | Type | Notes |
|---|---|---|
| `email` | string | Required, RFC email |
| `password` | string | Required, plaintext; compared to stored bcrypt hash |

Example:

```json
{
  "email": "owner@westpark.example",
  "password": "your-password-here"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "b1c2d3e4-5678-90ab-cdef-1234567890ab",
      "email": "owner@westpark.example",
      "name": "Owner Name",
      "role": "admin",
      "clinId": "f7e6d5c4-3b2a-1098-7654-3210abcdef00"
    }
  }
}
```

The JWT payload includes `{ "email", "role": "admin", "_id" }` and is signed with `JWT_SECRET`.

#### Error Responses

- `400 Bad Request`: validation errors
- `401 Unauthorized`: invalid email or password (same message for both)
- `500 Internal Server Error`: `JWT_SECRET` not configured

### `POST /auth/clerk/login`

Authenticates a clerk from the `clerk` table (rows are created by `POST /clerk`) and returns a JWT `accessToken` with `role: "clerk"`.

- Auth required: **No**
- Validation middleware: `loginClerkValidator`
- Controller method: `AuthController.handlePostClerkLogin`

#### Request

**Headers**

- `Content-Type: application/json`

**Body** (JSON)

| Field | Type | Notes |
|---|---|---|
| `email` | string | Required, RFC email |
| `password` | string | Required, plaintext; compared to stored bcrypt hash |

Example:

```json
{
  "email": "clerk@westpark.example",
  "password": "your-password-here"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c1c2c3c4-5678-90ab-cdef-1234567890ab",
      "email": "clerk@westpark.example",
      "name": "Front Desk",
      "role": "clerk",
      "clinId": "f7e6d5c4-3b2a-1098-7654-3210abcdef00"
    }
  }
}
```

The JWT payload includes `{ "email", "role": "clerk", "_id" }` and is signed with `JWT_SECRET`.

#### Error Responses

- `400 Bad Request`: validation errors
- `401 Unauthorized`: invalid email or password (same message for both)
- `500 Internal Server Error`: `JWT_SECRET` not configured

### `POST /auth/logout`

Stateless logout. Clears the optional auth cookie (`JWT_COOKIE_NAME`, default `access_token`). Bearer tokens are client-managed and cannot be revoked here without a server-side denylist; client should also discard the token locally.

- Auth required: **No** (idempotent)
- Validation middleware: none
- Controller method: `AuthController.handlePostLogout`

#### Success Response

Status: `200 OK`

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Logged out",
  "data": { "loggedOut": true }
}
```

### `GET /auth/me`

Returns the JWT subject (claims) attached by `extractJWT`. Useful to verify a token and inspect the active role.

- Auth required: **Yes**
- Validation middleware: none
- Controller method: `AuthController.handleGetMe`

#### Success Response

Status: `200 OK`

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OK",
  "data": {
    "_id": "850d3196-6182-4a0e-ab6c-947aa950321c",
    "email": "ibrahimrefaeei@gmail.com",
    "role": "superAdmin"
  }
}
```

#### Error Responses

- `401 Unauthorized`: missing/invalid/expired token
- `500 Internal Server Error`: `JWT_SECRET` not configured

---

## Health

### `GET /health`

Liveness probe. No database check. No authentication.

Optional query: `detail` = `0` or `1`.

**Example success:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OK",
  "data": {
    "status": "up",
    "timestamp": "2026-05-04T12:00:00.000Z"
  }
}
```

### `GET /health/ready`

Readiness probe; runs `SELECT 1` against PostgreSQL. No authentication.

Optional query: `verbose` = `true` or `false`.

**Example success:** same envelope as liveness, with `database: "up"` in `data`.

**Example failure (503):** database unreachable — `status: "error"`, `statusCode: 503`.

---

## Clerk

### `POST /clerk`

Creates a `clerk` row and optional `clerk_location` association rows. Password is bcrypt-hashed in the controller before persistence.

- Auth required: **Yes**
- Allowed roles: `superAdmin`, `admin`
- Authorization middleware: `requireSuperAdminOrAdmin`
- Validation middleware: `createClerkValidator`
- Controller method: `ClerkController.handlePostClerk`

**Business rules**

- `superAdmin` may create a clerk for any existing `clinId`.
- `admin` may only create a clerk when `clinId` equals their own `admin.clin_id` (admins without a clinic cannot create clerks).
- Each entry in `locationIds` (if provided) must appear in `clinic_location` for the same `clinId`.

#### Request

**Headers**

- `Authorization: Bearer <token>` or HTTP-only JWT cookie configured via `JWT_COOKIE_NAME`
- `Content-Type: application/json`

**Body** (JSON)

| Field | Type | Notes |
|---|---|---|
| `email` | string | Required; unique across `clerk` |
| `password` | string | Required; 8–256 characters; stored as bcrypt hash |
| `name` | string | Required; max 255 |
| `waNum` | string | Required; `8–15` digits, optional leading `+` (matches DB check constraint) |
| `clinId` | string (UUID) | Required; FK to `clinic.id` |
| `locationIds` | string[] (UUID) | Optional; each must be linked to `clinId` in `clinic_location` |

Example:

```json
{
  "email": "clerk@westpark.example",
  "password": "your-password-here",
  "name": "Front Desk",
  "waNum": "+201012345678",
  "clinId": "f7e6d5c4-3b2a-1098-7654-3210abcdef00",
  "locationIds": ["a0a0a0a0-1111-2222-3333-444444444444"]
}
```

#### Success Response

Status: `201 Created`

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Clerk created",
  "data": {
    "id": "c1c2c3c4-5678-90ab-cdef-1234567890ab",
    "clinId": "f7e6d5c4-3b2a-1098-7654-3210abcdef00",
    "email": "clerk@westpark.example",
    "name": "Front Desk",
    "waNum": "+201012345678",
    "locationIds": ["a0a0a0a0-1111-2222-3333-444444444444"],
    "createdAt": "2026-05-13T12:00:00.000Z",
    "updatedAt": "2026-05-13T12:00:00.000Z"
  }
}
```

#### Error Responses

- `400 Bad Request`: validation failure, invalid `locationIds` for the clinic, or FK violation from bad references
- `401 Unauthorized`: missing/invalid token
- `403 Forbidden`: admin caller not scoped to the requested clinic, or disallowed role
- `404 Not Found`: clinic does not exist
- `409 Conflict`: duplicate clerk email

---

## Advertisement

Marketing payloads: one `advertisement` row links to one clinic and one consultant, with **many** schedules (`advertisement_schedule`) and **many** locations (`advertisement_location`). Public GET responses **aggregate** consultant profile, images, clinic, locations (with clerks at each location for that clinic), and schedule rows in one JSON tree.

**R2 / images (frontend):** Stored URLs in the database often point at Cloudflare R2 endpoints that are **not** suitable for direct browser use (private bucket, CORS, or non-public URLs). For **`GET /advertisement`** and **`GET /advertisement/:id`** only, the API **rewrites** `clinic.logo` and each `consultant.images[].imageUrl` to absolute URLs on **this same API host**: `GET /media/r2?key=<url-encoded object key>`. The browser loads pixels through your backend, which streams the object from R2 with server credentials. Optional env **`PUBLIC_ASSET_BASE_URL`** (no trailing slash) overrides the host used in those links when the API is behind a reverse proxy and `Host` / `X-Forwarded-*` do not match the public API URL.

### `GET /media/r2`

Streams one object from the configured R2 bucket. **Public** (no JWT). Only keys under `consultants/` or `clinic-logos/` are allowed.

- Auth required: **No**
- Rate limit: `advertisementPublicReadLimiter` (same relaxed ceiling as advertisement reads; global limiter skips this path)
- Query: `key` (required) — object key, e.g. `consultants/slug/1715-uuid.jpg`
- Response: raw bytes, `Content-Type` and `Cache-Control` from R2

Example: `GET https://<api-host>/media/r2?key=consultants%2Fprof-dr-example%2F1715000000000-abc.jpg`

### `GET /advertisement`

Returns **non-expired** advertisements (`expiration > now()`), ordered by soonest `expiration` first. **Higher per-IP rate limit** than the global API default.

- Auth required: **No**
- Rate limit: `advertisementPublicReadLimiter` (`ADVERTISEMENT_PUBLIC_RATE_LIMIT_MAX`, default `8000` / 15 min / IP)
- Validation: `listAdvertisementPublicValidator` (query)
- Controller: `AdvertisementController.handleGetAdvertisementsPublic`

**Query**

| Param | Type | Notes |
|---|---|---|
| `clinicId` | UUID | Optional filter |
| `limit` | int | Optional, default `20`, max `50` |
| `offset` | int | Optional, default `0` |

**Success** `200 OK` — `data.advertisements` is an array of full aggregate objects (same shape as `GET /advertisement/:id`).

### `GET /advertisement/:id`

Single **non-expired** advertisement aggregate, or `404` if missing/expired.

- Auth required: **No**
- Rate limit: `advertisementPublicReadLimiter`
- Validation: `getAdvertisementByIdValidator` (`id` UUID)
- Controller: `AdvertisementController.handleGetAdvertisementByIdPublic`

**Aggregate shape** (abbreviated; see implementation types in `src/advertisement/advertisement.interface.ts`):

- Top-level: `id`, `engTitle`, `arTitle`, `engExcerpt`, `arExcerpt`, `expiration` (ISO-8601)
- `consultant`: id, names, specialities, excerpts, bios, positions, quals, recognition, publications, `images[]` (`imageUrl`, `altText`)
- `clinic`: id, titles, excerpts, `logo`, `logoAltText`, `alphaCode`
- `locations[]`: per linked location — id, coordinates, addresses, `clerks[]` (`clerkId`, `waNum`) for clerks at that **location** whose `clerk.clin_id` matches the advertisement clinic
- `schedules[]`: `scheduleId`, nested `location` snapshot, `date`, `start`, `finish` (ISO instants for start/finish)

### `POST /advertisement`

Creates `advertisement` plus junction rows. Validates consultant–clinic link, clinic locations, consultant locations, and that every schedule belongs to the same clinic/consultant and each schedule’s `locationId` is listed in `locationIds`. **`expiration` must be in the future.**

- Auth required: **Yes** (`superAdmin`, `admin`)
- Middleware: `extractJWT`, `requireSuperAdminOrAdmin`, `createAdvertisementValidator`
- Controller: `AdvertisementController.handlePostAdvertisement`
- **Admin** may only use `clinId` equal to their `admin.clin_id`.

**Body** (JSON)

| Field | Type | Notes |
|---|---|---|
| `clinId` | UUID | FK `clinic` |
| `consultantId` | UUID | FK `consultant` |
| `scheduleIds` | UUID[] | Each row in `schedule` must match this clinic + consultant; each schedule’s `location_id` must appear in `locationIds` |
| `locationIds` | UUID[] | Each must exist in `clinic_location` and `consultant_location` for this pair |
| `engTitle`, `arTitle` | string | max 255 |
| `engExcerpt`, `arExcerpt` | string | required |
| `expiration` | string | ISO-8601 datetime, must be strictly in the future |

**Success** `201 Created` — `data: { "id": "<new advertisement uuid>" }`

#### Error responses (create)

- `400`: validation, bad schedule/location linkage, expired `expiration`, or FK violation
- `401` / `403`: auth / clinic scope
- `404`: clinic not found

---

## Consultant

### `POST /consultant`

Creates a consultant row in PostgreSQL and one-or-more `consultant_image` rows for uploaded image URLs. Password is bcrypt-hashed in the controller layer before persistence.

- Auth required: **Yes**
- Allowed roles: `superAdmin`, `admin`
- Authorization middleware: `requireSuperAdminOrAdmin`
- Validation middleware: `createConsultantValidator`
- Controller method: `ConsultantController.handlePostConsultant`

#### Request

**Headers**

- `Authorization: Bearer <token>` or HTTP-only JWT cookie configured via `JWT_COOKIE_NAME`
- `Content-Type: multipart/form-data`

**Body** (`multipart/form-data`)

| Field | Type | Notes |
|---|---|---|
| `email` | string | Required, RFC email |
| `password` | string | Required, plaintext; stored hashed (never returned). Min length 8. |
| `engName`, `arName` | string | Required, max 255 |
| `waNum` | string | Required, 8–20 digits with optional leading `+` |
| `images` | file[] | Required, one or more image files in multipart field name `images`; each file is uploaded to R2 under `consultants/...` and persisted in `consultant_image` |
| `engSubSpeciality`, `arSubSpeciality` | string \| null | Optional |
| `engSpeciality`, `arSpeciality` | string | Required, max 255 |
| `engExcerpt`, `arExcerpt`, `engBriefBio`, `arBriefBio` | string | Required |
| `avgPt` | integer | Required; must be greater than 0 and divisible by `5` (matches DB check) |
| `verification` | boolean \| null | Optional |

Example form-data fields:

- `email`: `consultant@example.org`
- `password`: `changeMeNOW1`
- `engName`: `Dr. Jane Doe`
- `arName`: `د. جان دو`
- `waNum`: `+15551234567`
- `images`: *(file #1, type image/jpeg)*
- `images`: *(file #2, type image/png)*
- `engSubSpeciality`: `Neurocritical care`
- `engSpeciality`: `Neurology`
- `arSpeciality`: `أعصاب`
- `engExcerpt`: `Board-certified neurologist.`
- `arExcerpt`: `اختصاصي أعصاب.`
- `engBriefBio`: `Longer English biography text.`
- `arBriefBio`: `نص سيرة عربي أطول.`
- `avgPt`: `30`
- `verification`: `false`

#### Success Response

Status: `201 Created`

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Consultant created",
  "data": {
    "id": "b1c2d3e4-5678-90ab-cdef-1234567890ab",
    "email": "consultant@example.org",
    "engName": "Dr. Jane Doe",
    "arName": "د. جان دو",
    "waNum": "+15551234567",
    "images": [
      "https://<public-r2-domain>/consultants/consultant-example-org/1714975200000-abc123.jpg",
      "https://<public-r2-domain>/consultants/consultant-example-org/1714975209999-def456.png"
    ],
    "engSubSpeciality": "Neurocritical care",
    "arSubSpeciality": null,
    "engSpeciality": "Neurology",
    "arSpeciality": "أعصاب",
    "engExcerpt": "Board-certified neurologist.",
    "arExcerpt": "اختصاصي أعصاب.",
    "engBriefBio": "Longer English biography text.",
    "arBriefBio": "نص سيرة عربي أطول.",
    "avgPt": 30,
    "verification": false,
    "createdAt": "2026-05-06T12:00:00.000Z",
    "updatedAt": "2026-05-06T12:00:00.000Z"
  }
}
```

`password` is never included in responses.

#### Error Responses

- `400 Bad Request`: validation errors (express-validator issue array on `error`)
- `401 Unauthorized`: missing or invalid JWT
- `403 Forbidden`: caller is not `superAdmin`
- `409 Conflict`: duplicate email (unique constraint)

### `POST /consultant/location`

Inserts one row into `consultant_location` so a consultant can work at an additional location. **`superAdmin` or `admin`** (`requireSuperAdminOrAdmin`).

Rules:

- **admin**: must have `admin.clin_id` set; scope is that clinic only (`body.clinicId` is ignored).
- **superAdmin**: clinic is inferred from `clinic_location` for `locationId`. If the location is linked to **more than one** clinic, send **`clinicId`** in the body to choose which clinic to scope the check to.
- The consultant must already be linked to the resolved clinic (`consultant_clinic`).
- The location must belong to that clinic (`clinic_location`).

- Auth required: **Yes**
- Allowed roles: **`superAdmin`, `admin`**
- Middleware: `extractJWT`, `requireSuperAdminOrAdmin`, `linkConsultantLocationValidator`
- Controller: `ConsultantController.handlePostConsultantLocationLink`

#### Request

**Headers**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body** (JSON)

| Field | Type | Notes |
|---|---|---|
| `consultantId` | UUID | Existing consultant |
| `locationId` | UUID | Must be linked to the resolved clinic |
| `clinicId` | UUID | Optional for **superAdmin**; **required** when `locationId` appears in `clinic_location` for more than one clinic. Ignored for **admin**. |

#### Success

`201 Created` — `data`: `{ "consultantId", "locationId", "createdAt" }`

#### Errors

- `400`: validation, FK (unknown consultant/location), ambiguous superAdmin scope (missing `clinicId`), or invalid `clinicId` for the location
- `401`: missing/invalid JWT
- `403`: not `superAdmin`/`admin`, admin has no clinic, or consultant not linked to the target clinic
- `409`: link already exists

---

## Clinic

### `POST /clinic`

Creates a clinic row **and its owning admin** in a single atomic database transaction. The logo file is uploaded to R2 under `clinic-logos/<slug>/...` and the resulting URL is persisted in `clinic.logo`. The supplied admin password is bcrypt-hashed in the controller before persistence.

The transaction sequence is:

1. Insert the admin row with `clin_id = NULL`.
2. Insert the clinic row with `admin_id = <new admin id>` and the uploaded logo URL.
3. Update the admin row to set `clin_id = <new clinic id>`.

This mirrors the circular `admin.clin_id ↔ clinic.admin_id` relationship without leaving partial state on failure (the transaction rolls back). After this call, the new admin can sign in via `POST /auth/admin/login`.

- Auth required: **Yes**
- Allowed roles: `superAdmin`
- Authorization middleware: `requireSuperAdmin`
- Validation middleware: `createClinicValidator`
- Controller method: `ClinicController.handlePostClinic`

#### Request

**Headers**

- `Authorization: Bearer <token>` or HTTP-only JWT cookie configured via `JWT_COOKIE_NAME`
- `Content-Type: multipart/form-data` (Postman/clients set this automatically with the boundary)

**Body** (`multipart/form-data`)

| Field | Type | Notes |
|---|---|---|
| `alphaCode` | string | Required, max 20, uppercase letters/digits/`-`/`_` only; must be unique |
| `engTitle`, `arTitle` | string | Required, max 255 |
| `engExcerpt`, `arExcerpt` | string | Required |
| `logoAltText` | string | Required, max 255; accessibility alt text for the clinic logo |
| `logo` | file | Required, single file in field `logo`; must be PNG (`image/png`) or SVG (`image/svg+xml`); max 2 MB; stored in R2 and persisted as URL |
| `adminEmail` | string | Required, RFC email; will become the new admin's login email (case-insensitive via `citext`) |
| `adminName` | string | Required, max 255 |
| `adminPassword` | string | Required, 8–256 chars; stored as bcrypt hash, never returned |
| `adminWaNum` | string | Required, 8–15 digits with optional leading `+` |

Example form-data fields:

- `engTitle`: `Westpark Clinic`
- `arTitle`: `عيادة ويستبارك`
- `engExcerpt`: `Multi-specialty clinic in Giza.`
- `arExcerpt`: `عيادة متعددة التخصصات في الجيزة.`
- `logo`: *(file, type `image/png` or `image/svg+xml`)*
- `adminEmail`: `owner@westpark.example`
- `adminName`: `Owner Name`
- `adminPassword`: `changeMeNOW1`
- `adminWaNum`: `+201001234567`

#### Success Response

Status: `201 Created`

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Clinic created",
  "data": {
    "id": "f7e6d5c4-3b2a-1098-7654-3210abcdef00",
    "adminId": "b1c2d3e4-5678-90ab-cdef-1234567890ab",
    "engTitle": "Westpark Clinic",
    "arTitle": "عيادة ويستبارك",
    "engExcerpt": "Multi-specialty clinic in Giza.",
    "arExcerpt": "عيادة متعددة التخصصات في الجيزة.",
    "alphaCode": "WPC",
    "logo": "https://<public-r2-domain>/clinic-logos/westpark-clinic/1714975200000-abc123.png",
    "logoAltText": "Westpark Clinic logo",
    "createdAt": "2026-05-08T19:00:01.123Z",
    "updatedAt": "2026-05-08T19:00:01.123Z",
    "admin": {
      "id": "b1c2d3e4-5678-90ab-cdef-1234567890ab",
      "email": "owner@westpark.example",
      "name": "Owner Name",
      "waNum": "+201001234567",
      "clinId": "f7e6d5c4-3b2a-1098-7654-3210abcdef00",
      "createdAt": "2026-05-08T19:00:01.000Z",
      "updatedAt": "2026-05-08T19:00:01.123Z"
    }
  }
}
```

The admin's `password` hash is never returned.

#### Error Responses

- `400 Bad Request`:
  - validation errors (express-validator issue array on `error`)
  - missing or non-image `logo` (PNG/SVG required)
- `401 Unauthorized`: missing or invalid JWT
- `403 Forbidden`: caller is not `superAdmin`
- `409 Conflict`: an admin with `adminEmail` already exists

---

### `POST /clinic/location`

Creates a new location row and links it to the specified clinic in `clinic_location` — both in a single atomic transaction.

- Auth required: **Yes**
- Allowed roles: `superAdmin`, `admin`
- Authorization middleware: `requireSuperAdminOrAdmin`
- Extra rule: an `admin` caller may only add a location to their own clinic; a `superAdmin` may add to any clinic.
- Validation middleware: `postClinicLocationValidator`
- Controller method: `ClinicLocationController.handlePostClinicLocation`

#### Request

**Headers**

- `Authorization: Bearer <token>` or HTTP-only JWT cookie
- `Content-Type: application/json`

**Body** (`application/json`)

| Field | Type | Notes |
|---|---|---|
| `clinicId` | string | Required, UUID of an existing clinic |
| `long` | number | Required, -180 to 180 |
| `lat` | number | Required, -90 to 90 |
| `engAddress` | string | Required |
| `arAddress` | string | Required |

#### Success Response

Status: `201 Created`

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Location linked to clinic",
  "data": {
    "clinicId": "f7e6d5c4-3b2a-1098-7654-3210abcdef00",
    "location": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "long": 31.2357,
      "lat": 30.0444,
      "engAddress": "123 Main Street, Giza",
      "arAddress": "١٢٣ شارع الرئيسي، الجيزة",
      "createdAt": "2026-05-13T10:00:00.000Z",
      "updatedAt": "2026-05-13T10:00:00.000Z"
    },
    "createdAt": "2026-05-13T10:00:00.000Z"
  }
}
```

#### Error Responses

- `400 Bad Request`: validation errors
- `401 Unauthorized`: missing or invalid JWT
- `403 Forbidden`: caller is not `superAdmin` or `admin`, or `admin` does not own this clinic
- `404 Not Found`: clinic not found

---

### `POST /clinic/consultant`

Inserts a row into `consultant_clinic` to link an existing consultant to an existing clinic.

- Auth required: **Yes**
- Allowed roles: `superAdmin`, `admin`
- Authorization middleware: `requireSuperAdminOrAdmin`
- Extra rule: an `admin` caller may only link consultants to their own clinic; a `superAdmin` may link to any clinic.
- Validation middleware: `postClinicConsultantValidator`
- Controller method: `ClinicConsultantController.handlePostClinicConsultant`

#### Request

**Headers**

- `Authorization: Bearer <token>` or HTTP-only JWT cookie
- `Content-Type: application/json`

**Body** (`application/json`)

| Field | Type | Notes |
|---|---|---|
| `clinicId` | string | Required, UUID of an existing clinic |
| `consultantId` | string | Required, UUID of an existing consultant |

#### Success Response

Status: `201 Created`

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Consultant linked to clinic",
  "data": {
    "clinicId": "f7e6d5c4-3b2a-1098-7654-3210abcdef00",
    "consultantId": "b1c2d3e4-5678-90ab-cdef-1234567890ab",
    "createdAt": "2026-05-13T10:00:00.000Z"
  }
}
```

#### Error Responses

- `400 Bad Request`: validation errors
- `401 Unauthorized`: missing or invalid JWT
- `403 Forbidden`: caller is not `superAdmin` or `admin`, or `admin` does not own this clinic
- `404 Not Found`: clinic not found, or consultant not found
- `409 Conflict`: consultant is already linked to this clinic

---

## Schedule

### `POST /schedule`

Creates a new schedule entry linking a clinic, location, and consultant for a specific date and time window.

- Auth required: **Yes**
- Allowed roles: `superAdmin`, `admin`
- Authorization middleware: `requireSuperAdminOrAdmin`
- Extra rule: an `admin` caller may only create a schedule for their own clinic; a `superAdmin` may create for any clinic.
- Validation middleware: `createScheduleValidator`
- Controller method: `ScheduleController.handlePostSchedule`

#### Request

**Headers**

- `Authorization: Bearer <token>` or HTTP-only JWT cookie
- `Content-Type: application/json`

**Body** (`application/json`)

| Field | Type | Notes |
|---|---|---|
| `clinId` | string | Required, UUID of an existing clinic |
| `locationId` | string | Required, UUID of an existing location |
| `consultantId` | string | Required, UUID of an existing consultant |
| `date` | string | Required, ISO 8601 date (`YYYY-MM-DD`) |
| `start` | string | Required, ISO 8601 datetime **with explicit timezone** — must end with `Z` (UTC) or an offset such as `+03:00` or `+0300`. **Do not** send a bare `2026-05-20T09:00:00` without `Z` or offset; behavior is ambiguous and was a common source of wrong times. |
| `finish` | string | Same rules as `start`; must be strictly after `start` as instants in time. |

**Examples (Cairo 09:00 → use offset or convert to UTC):**

- `2026-05-20T09:00:00+03:00` — 9:00 in UTC+3  
- `2026-05-20T06:00:00Z` — same instant as 09:00 Cairo  

**Response:** `start`, `finish`, `createdAt`, and `updatedAt` are returned as **UTC ISO strings** (ending in `Z`) so clients always see one consistent interpretation.

#### Success Response

Status: `201 Created`

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Schedule created",
  "data": {
    "id": "c1d2e3f4-0000-0000-0000-000000000001",
    "clinId": "f7e6d5c4-3b2a-1098-7654-3210abcdef00",
    "locationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "consultantId": "b1c2d3e4-5678-90ab-cdef-1234567890ab",
    "date": "2026-05-20",
    "start": "2026-05-20T09:00:00.000Z",
    "finish": "2026-05-20T17:00:00.000Z",
    "createdAt": "2026-05-13T10:00:00.000Z",
    "updatedAt": "2026-05-13T10:00:00.000Z"
  }
}
```

#### Error Responses

- `400 Bad Request`: validation errors (including missing timezone on `start`/`finish`), invalid datetimes, or `finish` is not after `start`
- `401 Unauthorized`: missing or invalid JWT
- `403 Forbidden`: caller is not `superAdmin` or `admin`, or `admin` does not own the clinic
- `404 Not Found`: clinic, location, or consultant not found

---

## Endpoint Template (Use For Every New API)

Copy this block and fill all fields for each new endpoint.

### `<METHOD /path>`

Short purpose statement.

- Auth required: `Yes/No`
- Allowed roles: `<role list or N/A>`
- Validation middleware: `<validator names>`
- Controller method: `<controller.methodName>`

#### Request

**Path params**

```json
{
  "id": "string"
}
```

**Query params**

```json
{
  "page": 1,
  "limit": 20
}
```

**Headers**

- `Authorization: Bearer <token>` (if required)
- `Content-Type: application/json`

**Body**

```json
{
  "field": "value"
}
```

#### Success Response

Status: `200 OK` (or `201 Created`, etc.)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Operation completed",
  "data": {}
}
```

#### Error Responses

- `400 Bad Request`: validation errors
- `401 Unauthorized`: missing or invalid token
- `403 Forbidden`: insufficient role
- `404 Not Found`: resource missing
- `500 Internal Server Error`: unexpected failure

#### Notes

- Business rules:
- Side effects:
- Idempotency:

---

## Authentication Requirements Summary

| Endpoint        | Auth required |
|----------------|---------------|
| `GET /`        | No            |
| `GET /health`  | No            |
| `GET /health/ready` | No       |
| `POST /auth/superAdmin/login` | No |
| `POST /auth/admin/login` | No |
| `POST /auth/clerk/login` | No |
| `POST /auth/logout` | No |
| `GET /auth/me` | Yes |
| `POST /clerk` | Yes (superAdmin, admin) |
| `GET /advertisement` | No (public read; higher rate limit) |
| `GET /advertisement/:id` | No (public read; higher rate limit) |
| `GET /media/r2` | No (public image proxy; higher rate limit) |
| `POST /advertisement` | Yes (superAdmin, admin) |
| `POST /consultant` | Yes (superAdmin, admin) |
| `POST /consultant/location` | Yes (superAdmin, admin) |
| `POST /clinic` | Yes (superAdmin) |
| `POST /clinic/location` | Yes (superAdmin, admin) |
| `POST /clinic/consultant` | Yes (superAdmin, admin) |

Protected routes should use `extractJWT` and role middleware from `src/middleware/` as described in `.cursorrules`.

## Planned Endpoints Backlog

Use this section to track upcoming API surfaces before implementation.

| Module | Endpoint | Method | Auth | Status | Notes |
|---|---|---|---|---|---|
| `<module>` | `/example` | `GET` | Yes | Planned | `<purpose>` |

## Documentation Update Checklist

- [ ] New endpoint added with full request/response examples
- [ ] Auth requirements table updated
- [ ] Validation rules documented
- [ ] Error responses documented
- [ ] Breaking changes called out with migration notes
- [ ] Related DB impact reflected in `DB_DOCUMENTATION.md`
