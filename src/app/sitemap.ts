import type { MetadataRoute } from "next";
import { hrefForAdWithLocale } from "@/lib/ad-page-locale";
import { publicAdSegment } from "@/lib/ad-public-path";
import { listAdvertisements } from "@/lib/api/advertisements";
import { getEnv } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl } = getEnv();
  let ads: Awaited<ReturnType<typeof listAdvertisements>> = [];
  try {
    ads = await listAdvertisements({ limit: 50, offset: 0 });
  } catch {
    ads = [];
  }

  const siteBase = siteUrl.replace(/\/+$/, "");

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteBase}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...ads.flatMap((ad) => {
      const segment = publicAdSegment(ad);
      return (["eng", "ar"] as const).map((locale) => ({
        url: `${siteBase}${hrefForAdWithLocale(segment, locale)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }));
    }),
  ];

  return entries;
}
