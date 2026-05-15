import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { buildAdvertisementJsonLd } from "@/components/seo/advertisement-jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  isAdvertisementRouteSegment,
  publicAdSegment,
} from "@/lib/ad-public-path";
import {
  adPageLocaleFromRouteSegment,
  hrefForAdWithLocale,
  isAdPageRouteLocale,
  type AdPageRouteLocale,
} from "@/lib/ad-page-locale";
import {
  getAdvertisementByPublicSegment,
  isAdvertisementPubliclyHosted,
  listAdvertisements,
} from "@/lib/api/advertisements";
import { adShareMetadataCopy } from "@/lib/ad-share-metadata";
import { getEnv } from "@/lib/env";
import { hasPublicOgAsset, staticAdOgImageUrl } from "@/lib/ad-og-image";
import { proxyAdvertisementMediaUrls } from "@/lib/media-browser-proxy";
import {
  clipForOpenGraphText,
  OG_AD_DESCRIPTION_MAX_CHARS,
  OG_AD_TITLE_MAX_CHARS,
} from "@/lib/og-text";
import { AdContent } from "./AdContent";

/**
 * ISR for static ad pages (`generateMetadata`). Next.js 16 requires this to be a
 * numeric literal (not a function call / env expression). Keep in sync with
 * `ADVERTISEMENT_DETAIL_FALLBACK_REVALIDATE` in `@/lib/env`.
 */
export const revalidate = 120;

interface PageProps {
  params: Promise<{ urlPath: string; locale: string }>;
}

export async function generateStaticParams(): Promise<
  { urlPath: string; locale: AdPageRouteLocale }[]
> {
  const ads = await listAdvertisements({ limit: 50, offset: 0 });
  return ads.filter(isAdvertisementPubliclyHosted).flatMap((ad) => {
    const urlPath = publicAdSegment(ad);
    return [
      { urlPath, locale: "eng" as const },
      { urlPath, locale: "ar" as const },
    ];
  });
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { urlPath: rawSegment, locale: rawLocale } = await props.params;
  const urlPath = decodeURIComponent(rawSegment);
  const routeLocale = rawLocale.toLowerCase();

  if (!isAdvertisementRouteSegment(urlPath) || !isAdPageRouteLocale(routeLocale)) {
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

  if (!ad || !isAdvertisementPubliclyHosted(ad)) {
    return {
      title: "Promotion unavailable",
      robots: { index: false, follow: false },
    };
  }

  const { siteUrl, apiBaseUrl } = getEnv();
  const adMedia = proxyAdvertisementMediaUrls(ad, apiBaseUrl);
  const publicPath = publicAdSegment(adMedia);
  const siteBase = siteUrl.replace(/\/+$/, "");
  const urlEng = `${siteBase}${hrefForAdWithLocale(publicPath, "eng")}`;
  const urlAr = `${siteBase}${hrefForAdWithLocale(publicPath, "ar")}`;
  const canonicalUrl = routeLocale === "ar" ? urlAr : urlEng;

  const contentLocale = adPageLocaleFromRouteSegment(routeLocale);
  const copy = adShareMetadataCopy(adMedia, contentLocale);

  const titleDocument = clipForOpenGraphText(
    copy.primaryTitle,
    OG_AD_TITLE_MAX_CHARS,
  );
  const metaDescription = clipForOpenGraphText(
    copy.excerpt,
    OG_AD_DESCRIPTION_MAX_CHARS,
  );
  const ogTitle = titleDocument;

  const hero = adMedia.consultant.images?.[0];
  const heroAlt = hero?.altText ?? copy.heroAltFallback;

  const routeLocaleTag = routeLocale as AdPageRouteLocale;
  const ogImageUrl = hasPublicOgAsset(publicPath, routeLocaleTag)
    ? staticAdOgImageUrl(siteUrl, publicPath, routeLocaleTag)
    : undefined;

  return {
    title: titleDocument,
    description: metaDescription,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: urlEng,
        ar: urlAr,
      },
    },
    openGraph: {
      title: ogTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: copy.clinicName,
      type: "website",
      locale: contentLocale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: contentLocale === "ar" ? ["en_US"] : ["ar_EG"],
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: heroAlt,
              type: "image/jpeg",
            },
          ]
        : undefined,
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title: ogTitle,
      description: metaDescription,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function AdLocalePage(props: PageProps) {
  const { urlPath: rawSegment, locale: rawLocale } = await props.params;
  const urlPath = decodeURIComponent(rawSegment);
  const routeLocale = rawLocale.toLowerCase();

  if (!isAdvertisementRouteSegment(urlPath)) {
    notFound();
  }
  if (!isAdPageRouteLocale(routeLocale)) {
    notFound();
  }

  let ad = null;
  try {
    ad = await getAdvertisementByPublicSegment(urlPath);
  } catch {
    notFound();
  }

  if (!ad || !isAdvertisementPubliclyHosted(ad)) {
    notFound();
  }

  const canonicalSegment = publicAdSegment(ad);
  if (canonicalSegment !== urlPath) {
    permanentRedirect(
      `/ads/${canonicalSegment}/${routeLocale}`,
    );
  }

  const { apiBaseUrl } = getEnv();
  const adMedia = proxyAdvertisementMediaUrls(ad, apiBaseUrl);
  const publicPath = publicAdSegment(adMedia);
  const contentLocale = adPageLocaleFromRouteSegment(routeLocale);
  const pagePath = hrefForAdWithLocale(publicPath, routeLocale);
  const graphs = buildAdvertisementJsonLd(adMedia, pagePath);

  return (
    <>
      {graphs.map((g, i) => (
        <JsonLd key={`graph-${i}`} id={`ad-jsonld-${i}`} data={g} />
      ))}
      <AdContent
        ad={adMedia}
        locale={contentLocale}
        engHref={hrefForAdWithLocale(publicPath, "eng")}
        arHref={hrefForAdWithLocale(publicPath, "ar")}
      />
    </>
  );
}
