import type { MetadataRoute } from "next";
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

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...ads.map((ad) => ({
      url: `${siteUrl}/ads/${ad.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];

  return entries;
}
