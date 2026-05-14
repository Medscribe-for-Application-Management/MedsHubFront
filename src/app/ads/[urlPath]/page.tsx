import type { Metadata } from "next";
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
} from "@/lib/api/advertisements";
import { getEnv } from "@/lib/env";
import {
  absoluteSiteMediaUrl,
  proxyAdvertisementMediaUrls,
} from "@/lib/media-browser-proxy";
import { AdContent } from "./AdContent";

interface PageProps {
  params: Promise<{ urlPath: string }>;
}

export async function generateMetadata(
  props: PageProps,
): Promise<Metadata> {
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
  const titleBase = `${adMedia.engTitle} | ${adMedia.clinic.engTitle}`;
  const title =
    titleBase.length > 60
      ? `${adMedia.engTitle}`.slice(0, 57).trimEnd() + "…"
      : titleBase;
  const description =
    adMedia.engExcerpt.length > 155
      ? `${adMedia.engExcerpt.slice(0, 152).trimEnd()}…`
      : adMedia.engExcerpt;
  const hero = adMedia.consultant.images?.[0];
  const heroAlt = hero?.altText ?? adMedia.consultant.engName;
  const heroOgUrl =
    hero?.imageUrl != null && hero.imageUrl.length > 0
      ? hero.imageUrl.startsWith("http")
        ? absoluteSiteMediaUrl(hero.imageUrl, apiBaseUrl, siteUrl)
        : `${siteUrl.replace(/\/+$/, "")}${hero.imageUrl}`
      : undefined;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
      languages: {
        en: url,
        ar: url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: adMedia.clinic.engTitle,
      type: "website",
      locale: "en_US",
      alternateLocale: ["ar_EG"],
      images: heroOgUrl
        ? [{ url: heroOgUrl, width: 1200, height: 630, alt: heroAlt }]
        : undefined,
    },
    twitter: {
      card: heroOgUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: heroOgUrl ? [heroOgUrl] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function AdPage(props: PageProps) {
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
    permanentRedirect(`/ads/${canonicalSegment}`);
  }

  const { apiBaseUrl } = getEnv();
  const adMedia = proxyAdvertisementMediaUrls(ad, apiBaseUrl);

  const pagePath = `/ads/${publicAdSegment(adMedia)}`;
  const graphs = buildAdvertisementJsonLd(adMedia, pagePath);

  return (
    <>
      {graphs.map((g, i) => (
        <JsonLd key={`graph-${i}`} id={`ad-jsonld-${i}`} data={g} />
      ))}
      <AdContent ad={adMedia} />
    </>
  );
}
