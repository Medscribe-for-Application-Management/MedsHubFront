import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { buildAdvertisementJsonLd } from "@/components/seo/advertisement-jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  isAdvertisementRouteSegment,
  publicAdSegment,
} from "@/lib/ad-public-path";
import {
  getAdvertisementByPublicSegment,
  isAdvertisementExpired,
  listAdvertisements,
} from "@/lib/api/advertisements";
import {
  AD_PAGE_LANG_QUERY,
  hrefForAdWithLocale,
  parseAdPageLocaleFromRequestSearchParams,
  queryStringWithExplicitDefaultLang,
  serializeSearchParamsForRedirect,
} from "@/lib/ad-page-locale";
import { adShareMetadataCopy } from "@/lib/ad-share-metadata";
import { advertisementDetailRevalidateSeconds, getEnv } from "@/lib/env";
import {
  clipForOpenGraphText,
  OG_DESCRIPTION_MAX_CHARS,
  OG_TITLE_MAX_CHARS,
} from "@/lib/og-text";
import {
  proxyAdvertisementMediaUrls,
} from "@/lib/media-browser-proxy";
import { AdContent } from "./AdContent";

/** ISR for static ad pages so `generateMetadata` refetches after API/DB changes. */
export const revalidate = advertisementDetailRevalidateSeconds();

interface PageProps {
  params: Promise<{ urlPath: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams(): Promise<{ urlPath: string }[]> {
  const ads = await listAdvertisements({ limit: 50, offset: 0 });
  return ads.map((ad) => ({ urlPath: publicAdSegment(ad) }));
}

export async function generateMetadata(
  props: PageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const { urlPath: rawSegment } = await props.params;
  const urlPath = decodeURIComponent(rawSegment);
  if (!isAdvertisementRouteSegment(urlPath)) {
    return {
      title: "Promotion unavailable",
      robots: { index: false, follow: false },
    };
  }

  let ad = null;
  try {
    ad = await getAdvertisementByPublicSegment(urlPath);
  } catch {
    return {
      title: "Promotion unavailable",
      robots: { index: false, follow: false },
    };
  }

  if (!ad || isAdvertisementExpired(ad)) {
    return {
      title: "Promotion unavailable",
      robots: { index: false, follow: false },
    };
  }

  const { siteUrl, apiBaseUrl } = getEnv();
  const adMedia = proxyAdvertisementMediaUrls(ad, apiBaseUrl);
  const publicPath = publicAdSegment(adMedia);
  const url = `${siteUrl.replace(/\/+$/, "")}/ads/${publicPath}`;
  const urlLangEn = `${url}?${AD_PAGE_LANG_QUERY}=en`;
  const urlLangAr = `${url}?${AD_PAGE_LANG_QUERY}=ar`;

  const locale = parseAdPageLocaleFromRequestSearchParams(searchParams);
  const copy = adShareMetadataCopy(adMedia, locale);
  const canonicalUrl = locale === "ar" ? urlLangAr : urlLangEn;

  const titleBase = `${copy.primaryTitle} | ${copy.clinicName}`;
  const titleDocument =
    titleBase.length > 60
      ? `${copy.primaryTitle}`.slice(0, 57).trimEnd() + "…"
      : titleBase;
  const metaDescription = clipForOpenGraphText(
    copy.excerpt,
    OG_DESCRIPTION_MAX_CHARS,
  );
  const ogTitle = clipForOpenGraphText(titleBase, OG_TITLE_MAX_CHARS);
  const hero = adMedia.consultant.images?.[0];
  const heroAlt = hero?.altText ?? copy.heroAltFallback;
  const siteBase = siteUrl.replace(/\/+$/, "");
  const heroOgUrl =
    hero?.imageUrl != null && hero.imageUrl.length > 0
      ? `${siteBase}/api/ad-hero/${encodeURIComponent(publicPath)}`
      : undefined;

  return {
    title: titleDocument,
    description: metaDescription,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: urlLangEn,
        ar: urlLangAr,
      },
    },
    openGraph: {
      title: ogTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: copy.clinicName,
      type: "website",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_EG"],
      images: heroOgUrl
        ? [
            {
              url: heroOgUrl,
              alt: heroAlt,
              type: "image/jpeg",
            },
          ]
        : undefined,
    },
    twitter: {
      card: heroOgUrl ? "summary_large_image" : "summary",
      title: ogTitle,
      description: metaDescription,
      images: heroOgUrl ? [heroOgUrl] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function AdPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const { urlPath: rawSegment } = await props.params;
  const urlPath = decodeURIComponent(rawSegment);
  if (!isAdvertisementRouteSegment(urlPath)) {
    notFound();
  }

  let ad = null;
  try {
    ad = await getAdvertisementByPublicSegment(urlPath);
  } catch {
    notFound();
  }

  if (!ad || isAdvertisementExpired(ad)) {
    notFound();
  }

  const canonicalSegment = publicAdSegment(ad);
  if (canonicalSegment !== urlPath) {
    const qs = serializeSearchParamsForRedirect(searchParams);
    permanentRedirect(`/ads/${canonicalSegment}${qs}`);
  }

  const { apiBaseUrl } = getEnv();
  const adMedia = proxyAdvertisementMediaUrls(ad, apiBaseUrl);

  const explicitLangQs = queryStringWithExplicitDefaultLang(searchParams);
  if (explicitLangQs !== null) {
    permanentRedirect(
      `/ads/${publicAdSegment(adMedia)}?${explicitLangQs}`,
    );
  }

  const localeTag = parseAdPageLocaleFromRequestSearchParams(searchParams);
  const pagePath = hrefForAdWithLocale(publicAdSegment(adMedia), localeTag);
  const graphs = buildAdvertisementJsonLd(adMedia, pagePath);

  return (
    <>
      {graphs.map((g, i) => (
        <JsonLd key={`graph-${i}`} id={`ad-jsonld-${i}`} data={g} />
      ))}
      <Suspense fallback={null}>
        <AdContent ad={adMedia} />
      </Suspense>
    </>
  );
}
