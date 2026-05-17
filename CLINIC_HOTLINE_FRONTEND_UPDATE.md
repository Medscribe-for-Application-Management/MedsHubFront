# Clinic hotline — frontend update

Summary for marketing UIs that consume **`GET /advertisement`** and **`GET /advertisement/:segment`**.

| API field | Postgres column | Table |
|-----------|-----------------|-------|
| `clinic.hotline` | `hotline` | `clinic` |

## What changed

The **`clinic`** table has a new nullable column **`hotline`** (`varchar(32)`). Public advertisement responses now include it on the nested **`clinic`** object.

- **Type:** `string | null`
- **Meaning:** Optional clinic hotline (e.g. short code or phone number) for display on marketing pages.
- **When null:** Clinic has no hotline configured; do not render a hotline block (or hide the control).

## Where it appears

Both public read endpoints return the same aggregate shape:

| Endpoint | Path in JSON |
|----------|----------------|
| `GET /advertisement` | `data.advertisements[].clinic.hotline` |
| `GET /advertisement/:segment` | `data.clinic.hotline` (single object under `data`, same bundle shape as list items) |

**Not** returned on `POST /advertisement` or `PATCH /advertisement/:id` — those only manage advertisement fields. New clinics created via `POST /clinic` get **`hotline: null`** until the value is set in the database.

## Example

For clinic id `af22279d-9653-4d5d-9ef3-df19b35d5bb6`, the API returns:

```json
"clinic": {
  "clinicId": "af22279d-9653-4d5d-9ef3-df19b35d5bb6",
  "engTitle": "...",
  "arTitle": "...",
  "engExcerpt": "...",
  "arExcerpt": "...",
  "logo": "https://<api-host>/media/r2?key=...",
  "logoAltText": "...",
  "alphaCode": "...",
  "hotline": "16010"
}
```

All other clinics keep **`"hotline": null`** until updated.

## TypeScript

```ts
interface AdvertisementClinicSnapshot {
  clinicId: string;
  engTitle: string;
  arTitle: string;
  engExcerpt: string;
  arExcerpt: string;
  logo: string;
  logoAltText: string;
  alphaCode: string;
  hotline: string | null;
}
```

## Frontend checklist

- [ ] Extend advertisement `clinic` types with `hotline: string | null`.
- [ ] Render hotline (e.g. `tel:` link or dial UI) only when `clinic.hotline` is non-null.
- [ ] Do not assume every clinic has a hotline.
- [ ] Backend deploy: run **`npm run db:migrate`** (`AddClinicHotline1747800000000`) in each environment before relying on the field.

## Related

- **`API_DOCUMENTATION.md`** — Advertisement → aggregate `clinic` shape; Clinic → `POST /clinic` response includes `hotline`
- **`src/advertisement/advertisement.interface.ts`** — `IAdvertisementPublicClinicSnapshot`
