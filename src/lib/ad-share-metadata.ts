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
}

/** Title, description, and related strings for `<meta>` / Open Graph by page language. */
export function adShareMetadataCopy(
  ad: AdvertisementAggregate,
  locale: AdPageLocale,
): AdShareMetadataCopy {
  if (locale === "ar") {
    return {
      primaryTitle: trimText(ad.arTitle) ?? ad.engTitle,
      clinicName: trimText(ad.clinic.arTitle) ?? ad.clinic.engTitle,
      excerpt: trimText(ad.arExcerpt) ?? ad.engExcerpt,
      heroAltFallback: trimText(ad.consultant.arName) ?? ad.consultant.engName,
    };
  }
  return {
    primaryTitle: trimText(ad.engTitle) ?? ad.engTitle,
    clinicName: trimText(ad.clinic.engTitle) ?? ad.clinic.engTitle,
    excerpt: trimText(ad.engExcerpt) ?? ad.engExcerpt,
    heroAltFallback: trimText(ad.consultant.engName) ?? ad.consultant.engName,
  };
}
