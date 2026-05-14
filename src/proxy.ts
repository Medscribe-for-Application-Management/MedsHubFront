import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isLibelusDebugEnabled,
  isLibelusDebugVerbose,
  previewHeaderValue,
} from "@/lib/instrumentation/debug-libelus";

/** Mirrors `next/dist/client/components/app-router-headers` (stable names). */
const RSC_RELATED_HEADERS = [
  "rsc",
  "next-router-state-tree",
  "next-router-prefetch",
  "next-router-segment-prefetch",
  "next-hmr-refresh",
  "next-url",
  "next-action",
  "x-nextjs-stale-time",
  "x-nextjs-request-id",
] as const;

function collectRscHeaders(request: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of RSC_RELATED_HEADERS) {
    const v = request.headers.get(key);
    if (v != null && v !== "") {
      const max = isLibelusDebugVerbose() ? 8000 : 800;
      out[key] = previewHeaderValue(v, max) ?? v;
    }
  }
  return out;
}

function tryParseRouterStateTree(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return "(not JSON — likely encoded / binary-ish)";
  }
}

export function proxy(request: NextRequest) {
  if (!isLibelusDebugEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/ads/")) {
    return NextResponse.next();
  }

  const rscHeaders = collectRscHeaders(request);
  const stateTree = request.headers.get("next-router-state-tree");

  console.log("[Libelus proxy]", {
    when: new Date().toISOString(),
    method: request.method,
    pathname,
    url: request.url,
    searchParams: Object.fromEntries(request.nextUrl.searchParams),
    rscHeaders,
    routerStateTreeJsonAttempt: tryParseRouterStateTree(stateTree),
    userAgent: previewHeaderValue(request.headers.get("user-agent"), 200),
    referer: request.headers.get("referer"),
  });

  return NextResponse.next();
}

export const config = {
  matcher: ["/ads/:path*"],
};
