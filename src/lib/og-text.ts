/** Facebook / X guidance: long strings are still ellipsized in UI; keep OG tags in a practical range. */
export const OG_TITLE_MAX_CHARS = 95;
export const OG_DESCRIPTION_MAX_CHARS = 155;

export function clipForOpenGraphText(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  const slice = t.slice(0, maxChars - 1).trimEnd();
  return slice.length > 0 ? `${slice}…` : "…";
}
