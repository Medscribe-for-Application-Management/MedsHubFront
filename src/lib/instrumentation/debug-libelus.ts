/**
 * Instrumentation for RSC/router headers and advertisement API parsing.
 *
 * - **Development:** enabled by default (middleware + fetch logs). Set `DEBUG_LIBELUS=0` to silence.
 * - **Production:** set `DEBUG_LIBELUS=1` or `verbose` to enable (avoid in prod unless needed).
 */
export function isLibelusDebugEnabled(): boolean {
  if (process.env.DEBUG_LIBELUS === "0") return false;
  if (
    process.env.DEBUG_LIBELUS === "1" ||
    process.env.DEBUG_LIBELUS === "verbose"
  ) {
    return true;
  }
  return process.env.NODE_ENV === "development";
}

export function isLibelusDebugVerbose(): boolean {
  return process.env.DEBUG_LIBELUS === "verbose";
}

export function libelusDebugLog(...args: unknown[]): void {
  if (!isLibelusDebugEnabled()) return;
  console.log("[Libelus]", ...args);
}

export function previewHeaderValue(
  value: string | null,
  maxLen: number,
): string | null {
  if (value == null) return null;
  if (value.length <= maxLen) return value;
  return `${value.slice(0, maxLen)}…(total ${value.length} chars)`;
}
