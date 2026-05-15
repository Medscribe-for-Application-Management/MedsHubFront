# Advertisement API — frontend update

Summary of advertisement changes for marketing UIs. JSON uses **camelCase**; Postgres columns below.

| API field | Postgres column |
|-----------|----------------|
| `engAdditionalInfo` | `eng_additional_info` |
| `arAdditionalInfo` | `ar_additional_info` |

## What changed — bilingual additional copy

Single `additionalInfo` was replaced by:

- **`engAdditionalInfo`** — `string | null`
- **`arAdditionalInfo`** — `string | null`

Optional free-form text per locale (e.g. disclaimers, extra blocks, JSON-as-string).

**Reads:** **`GET /advertisement`** (`data.advertisements[]`) and **`GET /advertisement/:segment`** include both keys.

**Writes:** **`POST /advertisement`** and **`PATCH /advertisement/:id`** accept both.

**Clear:** Empty string `""` → stored `null` (PATCH/POST multipart text fields behave like other OG text fields).

**Migration:** Rows that previously had **`additional_info`** populated get that value copied to **`eng_additional_info`** only; **`ar_additional_info`** stays `null` until you set it.

## POST `/advertisement`

Optional on create alongside OG text / `isActive`:

| Field | JSON POST | multipart POST |
|--------|-----------|----------------|
| `engAdditionalInfo`, `arAdditionalInfo` | yes | yes |

## PATCH `/advertisement/:id`

`form-data` text fields **`engAdditionalInfo`**, **`arAdditionalInfo`** (optional).

You must send at least one of: images, OG text fields, these two blocks, or `isActive`.

**Response `data`** includes `engAdditionalInfo` and `arAdditionalInfo`.

### Postman (`form-data` keys)

- `engAdditionalInfo` — Text  
- `arAdditionalInfo` — Text  

(Plus existing OG / `isActive` keys as needed.)

## Public GET typings

```ts
engAdditionalInfo: string | null;
arAdditionalInfo: string | null;
```

## Frontend checklist

- [ ] Replace `additionalInfo` with `engAdditionalInfo` and `arAdditionalInfo` on types and forms.
- [ ] Show EN copy / AR copy (or RTL block) depending on locale.
- [ ] Run **`npm run db:migrate`** in each environment (`AdvertisementAdditionalInfoEngAr1747750000000`).

## Related

- **`API_DOCUMENTATION.md`** — Advertisement section  
- **`src/advertisement/advertisement.interface.ts`** — `IAdvertisementPublicBundle`, create/patch payloads
