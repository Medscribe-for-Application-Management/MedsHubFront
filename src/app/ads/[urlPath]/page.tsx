import { notFound, permanentRedirect } from "next/navigation";
import {
  AD_PAGE_LANG_QUERY,
  hrefForAdWithLocale,
  legacyLangQueryToRouteLocale,
} from "@/lib/ad-page-locale";
import { isAdvertisementRouteSegment } from "@/lib/ad-public-path";

interface PageProps {
  params: Promise<{ urlPath: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function redirectPathWithLocale(
  urlPath: string,
  routeLocale: "eng" | "ar",
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === AD_PAGE_LANG_QUERY) continue;
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== "") params.append(key, v);
      }
    } else if (value !== "") {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  const base = hrefForAdWithLocale(urlPath, routeLocale);
  return qs ? `${base}?${qs}` : base;
}

/** Bare `/ads/{urlPath}` and legacy `?lang=` → locale path (`/eng` or `/ar`). */
export default async function AdSlugRedirectPage(props: PageProps) {
  const { urlPath: rawSegment } = await props.params;
  const searchParams = await props.searchParams;
  const urlPath = decodeURIComponent(rawSegment);

  if (!isAdvertisementRouteSegment(urlPath)) {
    notFound();
  }

  const rawLang = searchParams[AD_PAGE_LANG_QUERY];
  const langValue = Array.isArray(rawLang) ? rawLang[0] : rawLang;
  const routeLocale = legacyLangQueryToRouteLocale(langValue);

  permanentRedirect(redirectPathWithLocale(urlPath, routeLocale, searchParams));
}
