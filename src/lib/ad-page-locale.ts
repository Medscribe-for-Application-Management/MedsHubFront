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
