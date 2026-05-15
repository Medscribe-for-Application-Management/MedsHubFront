import type { AdvertisementAggregate } from "@/lib/api/advertisement-schema";
import type { AdPageLocale } from "@/lib/ad-page-locale";

function trimText(s: string | null | undefined): string | undefined {
  const t = String(s ?? "").trim();
  return t.length > 0 ? t : undefined;
}

export interface AdShareMetadataCopy {
  primaryTitle: string;
  clinicName: string;
  excerpt: string;
  heroAltFallback: string;
  /** Proxied OG image URL when set; otherwise caller uses static `/api/og/...` hero fallback. */
  ogImage: string | undefined;
}

/** Title, description, and OG image for `<meta>` / Open Graph (OG fields first, then body copy). */
export function adShareMetadataCopy(
  ad: AdvertisementAggregate,
  locale: AdPageLocale,
): AdShareMetadataCopy {
  if (locale === "ar") {
    return {
      primaryTitle:
        trimText(ad.ogArabicTitle) ??
        trimText(ad.arTitle) ??
        ad.engTitle,
      clinicName: trimText(ad.clinic.arTitle) ?? ad.clinic.engTitle,
      excerpt:
        trimText(ad.ogArabicDescription) ??
        trimText(ad.arExcerpt) ??
        ad.engExcerpt,
      heroAltFallback: trimText(ad.consultant.arName) ?? ad.consultant.engName,
      ogImage: trimText(ad.ogArabicImage),
    };
  }
  return {
    primaryTitle:
      trimText(ad.ogEngTitle) ?? trimText(ad.engTitle) ?? ad.engTitle,
    clinicName: trimText(ad.clinic.engTitle) ?? ad.clinic.engTitle,
    excerpt:
      trimText(ad.ogEngDescription) ??
      trimText(ad.engExcerpt) ??
      ad.engExcerpt,
    heroAltFallback: trimText(ad.consultant.engName) ?? ad.consultant.engName,
    ogImage: trimText(ad.ogEngImage),
  };
}
