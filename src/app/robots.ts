import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";

/** Explicit allow rules for link-preview and indexing crawlers (see Facebook Sharing Debugger guidance). */
const SOCIAL_AND_INDEX_BOTS = [
  "facebookexternalhit",
  "Facebot",
  "WhatsApp",
  "LinkedInBot",
  "Twitterbot",
  "Slackbot",
  "Discordbot",
  "Pinterestbot",
  "TelegramBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = getEnv();
  return {
    rules: [
      ...SOCIAL_AND_INDEX_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/" as const,
      })),
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
