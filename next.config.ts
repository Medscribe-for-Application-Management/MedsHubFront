import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { normalizeAbsoluteUrl } from "./src/lib/normalize-absolute-url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function apiBaseUrlForImages(): string {
  const fromEnv = process.env.API_BASE_URL?.trim();
  if (fromEnv) return normalizeAbsoluteUrl(fromEnv);
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Set API_BASE_URL before running next build so next/image can allow your API host.",
    );
  }
  return "http://localhost:3000";
}

function buildRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  let url: URL;
  try {
    url = new URL(apiBaseUrlForImages());
  } catch {
    return [];
  }
  const protocol = url.protocol.replace(":", "") as "http" | "https";
  const port =
    url.port === ""
      ? undefined
      : url.port;

  return [
    {
      protocol,
      hostname: url.hostname,
      ...(port ? { port } : {}),
      pathname: "/media/**",
    },
  ];
}

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: buildRemotePatterns(),
    /** `/_libelus-media/*?key=…` is same-origin but not `public/`; allow for `next/image`. */
    localPatterns: [
      {
        pathname: "/_libelus-media/**",
      },
    ],
  },
  /**
   * Browser loads `/_libelus-media/*` from the Next origin; we fetch `API_BASE_URL/media/*`
   * server-side. Avoids CORP / NotSameOrigin when the API sets restrictive cross-origin headers.
   */
  async rewrites() {
    const base = apiBaseUrlForImages();
    return [
      {
        source: "/_libelus-media/:path*",
        destination: `${base}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
