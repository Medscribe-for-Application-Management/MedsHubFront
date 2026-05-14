export type AdPageLocale = "en" | "ar";

/** Query key used in `/ads/...` URLs for shareable language selection. */
export const AD_PAGE_LANG_QUERY = "lang" as const;

export function parseAdPageLocaleFromLangQueryValue(
  value: string | null,
): AdPageLocale {
  if (value === "ar") return "ar";
  if (value === "en") return "en";
  return "en";
}

/** Reads `lang` from Next.js `searchParams` (string or repeated keys). */
export function parseAdPageLocaleFromRequestSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AdPageLocale {
  const raw = searchParams[AD_PAGE_LANG_QUERY];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return parseAdPageLocaleFromLangQueryValue(value ?? null);
}

/**
 * Public ad path with explicit `lang` (for links and sitemap).
 * Segment must already be safe for a path (e.g. from {@link publicAdSegment}).
 */
export function hrefForAdWithLocale(
  adPathSegment: string,
  locale: AdPageLocale,
): string {
  return `/ads/${adPathSegment}?${AD_PAGE_LANG_QUERY}=${locale}`;
}

/**
 * When `lang` is present but not `en`/`ar`, returns a query string with `lang=en`
 * and other params preserved (caller may redirect to normalize).
 *
 * When `lang` is **omitted**, returns `null`: the page defaults to English (same as
 * `parseAdPageLocaleFromRequestSearchParams`) and avoids a redirect so crawlers get
 * a normal `200` HTML document instead of a redirect response shell.
 */
export function queryStringWithExplicitDefaultLang(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const raw = searchParams[AD_PAGE_LANG_QUERY];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "en" || value === "ar") return null;
  if (value === undefined || value === null || value === "") return null;

  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(searchParams)) {
    if (key === AD_PAGE_LANG_QUERY) continue;
    if (val === undefined) continue;
    if (Array.isArray(val)) {
      for (const v of val) {
        if (v !== undefined && v !== "") params.append(key, v);
      }
    } else if (val !== "") {
      params.set(key, val);
    }
  }
  params.set(AD_PAGE_LANG_QUERY, "en");
  return params.toString();
}

export function serializeSearchParamsForRedirect(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== "") params.append(key, v);
      }
    } else if (value !== "") {
      params.set(key, value);
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}
