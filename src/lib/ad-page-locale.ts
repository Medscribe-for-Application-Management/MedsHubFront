/** On-page content locale (body copy, UI strings). */
export type AdPageLocale = "en" | "ar";

/** URL path segment after `/ads/{urlPath}/`. */
export type AdPageRouteLocale = "eng" | "ar";

export const AD_PAGE_ROUTE_LOCALES = ["eng", "ar"] as const;

export function isAdPageRouteLocale(value: string): value is AdPageRouteLocale {
  return value === "eng" || value === "ar";
}

export function adPageLocaleFromRouteSegment(
  segment: AdPageRouteLocale,
): AdPageLocale {
  return segment === "ar" ? "ar" : "en";
}

export function adPageRouteLocaleFromContentLocale(
  locale: AdPageLocale,
): AdPageRouteLocale {
  return locale === "ar" ? "ar" : "eng";
}

/**
 * Public ad path with locale segment (for links, sitemap, canonical).
 * Segment must already be safe for a path (e.g. from {@link publicAdSegment}).
 */
export function hrefForAdWithLocale(
  adPathSegment: string,
  routeLocale: AdPageRouteLocale,
): string {
  return `/ads/${adPathSegment}/${routeLocale}`;
}

/** Sibling locale path for language toggle. */
export function alternateAdLocaleHref(
  adPathSegment: string,
  currentRouteLocale: AdPageRouteLocale,
): string {
  const next: AdPageRouteLocale = currentRouteLocale === "eng" ? "ar" : "eng";
  return hrefForAdWithLocale(adPathSegment, next);
}

/** @deprecated Legacy query key — only used by bare-slug redirect page. */
export const AD_PAGE_LANG_QUERY = "lang" as const;

export function legacyLangQueryToRouteLocale(
  value: string | null | undefined,
): AdPageRouteLocale {
  if (value === "ar") return "ar";
  return "eng";
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
