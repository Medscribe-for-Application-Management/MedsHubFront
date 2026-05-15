/**
 * Build-time: download ad OG images (or consultant hero fallback) into
 * `public/og-assets/{urlPath}/{eng|ar}.jpg` for same-origin share previews.
 *
 * Run via `npm run prebuild` before `next build`. Requires API_BASE_URL.
 * Never exposes API URLs in HTML — only /og-assets/... on the site domain.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_ROOT = path.join(ROOT, "public", "og-assets");

const ROUTE_LOCALES = ["eng", "ar"];

/** Match `src/lib/normalize-absolute-url.ts` (Vercel env may omit `https://`). */
function normalizeAbsoluteUrl(raw) {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed === "") {
    throw new Error("URL must not be empty");
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const hostPart = trimmed.split("/")[0]?.toLowerCase() ?? "";
  if (
    hostPart.startsWith("localhost") ||
    hostPart.startsWith("127.0.0.1") ||
    hostPart.startsWith("[::1]")
  ) {
    return `http://${trimmed}`;
  }
  return `https://${trimmed}`;
}

function trim(s) {
  const t = String(s ?? "").trim();
  return t.length > 0 ? t : undefined;
}

function normalizeSlug(ad) {
  const raw = trim(ad.urlPath) ?? trim(ad.url_path);
  return raw ? raw.toLowerCase() : null;
}

function dedicatedOgUrl(ad, routeLocale) {
  return routeLocale === "ar" ? trim(ad.ogArabicImage) : trim(ad.ogEngImage);
}

function heroUrl(ad) {
  return trim(ad.consultant?.images?.[0]?.imageUrl);
}

function candidates(ad, routeLocale) {
  const out = [];
  const og = dedicatedOgUrl(ad, routeLocale);
  if (og) out.push(og);
  const hero = heroUrl(ad);
  if (hero && !out.includes(hero)) out.push(hero);
  return out;
}

async function fetchFirstImage(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "image/*,*/*;q=0.8" },
      });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
      if (!ct.startsWith("image/")) continue;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      /* try next */
    }
  }
  return null;
}

async function writeOgJpeg(outFile, input) {
  const jpeg = await sharp(input)
    .rotate()
    .resize(1200, 630, {
      fit: "contain",
      position: "centre",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await fs.writeFile(outFile, jpeg);
}

async function listAdvertisements(apiBase) {
  const url = `${apiBase.replace(/\/+$/, "")}/advertisement?limit=50&offset=0`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET /advertisement failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const rows = json?.data?.advertisements;
  if (!Array.isArray(rows)) {
    throw new Error("Unexpected list shape from GET /advertisement");
  }
  return rows;
}

async function main() {
  const apiBaseRaw = process.env.API_BASE_URL?.trim();
  if (!apiBaseRaw) {
    console.error("[sync-ad-og-images] API_BASE_URL is required.");
    process.exit(1);
  }

  const apiBase = normalizeAbsoluteUrl(apiBaseRaw);
  if (!/^https?:\/\//i.test(apiBaseRaw)) {
    console.log(
      `[sync-ad-og-images] Normalized API_BASE_URL to ${apiBase}`,
    );
  }

  console.log("[sync-ad-og-images] Fetching active ads from API…");
  const ads = await listAdvertisements(apiBase);

  await fs.rm(OUT_ROOT, { recursive: true, force: true });
  await fs.mkdir(OUT_ROOT, { recursive: true });
  await fs.writeFile(path.join(OUT_ROOT, ".gitkeep"), "");

  let written = 0;
  let skipped = 0;

  for (const ad of ads) {
    const slug = normalizeSlug(ad);
    if (!slug) {
      skipped += 1;
      continue;
    }

    const adDir = path.join(OUT_ROOT, slug);
    await fs.mkdir(adDir, { recursive: true });

    for (const routeLocale of ROUTE_LOCALES) {
      const urls = candidates(ad, routeLocale);
      if (urls.length === 0) {
        skipped += 1;
        continue;
      }

      const buf = await fetchFirstImage(urls);
      if (buf == null) {
        console.warn(
          `[sync-ad-og-images] No image for ${slug}/${routeLocale} (tried ${urls.length} URL(s))`,
        );
        skipped += 1;
        continue;
      }

      const outFile = path.join(adDir, `${routeLocale}.jpg`);
      await writeOgJpeg(outFile, buf);
      written += 1;
      console.log(`[sync-ad-og-images] Wrote /og-assets/${slug}/${routeLocale}.jpg`);
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    apiBaseUrl: apiBase.replace(/\/+$/, ""),
    adCount: ads.length,
    filesWritten: written,
  };
  await fs.writeFile(
    path.join(OUT_ROOT, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(
    `[sync-ad-og-images] Done. ${written} file(s) written, ${skipped} skipped.`,
  );
}

main().catch((err) => {
  console.error("[sync-ad-og-images] Failed:", err);
  process.exit(1);
});
