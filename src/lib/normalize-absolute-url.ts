/**
 * Ensures a string is usable as an absolute URL (fetch, Next rewrites, `new URL()`).
 * Accepts `api.example.com`, `api.example.com/path`, `http://...`, `https://...`.
 */
export function normalizeAbsoluteUrl(raw: string): string {
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
