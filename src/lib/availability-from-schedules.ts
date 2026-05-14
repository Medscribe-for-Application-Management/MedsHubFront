import type { Schedule } from "@/lib/api/advertisement-schema";

export interface TempVisitAvailabilityRange {
  /** Local calendar start day for `<time dateTime>`. */
  fromDate: string;
  /** Local calendar end day for `<time dateTime>`. */
  toDate: string;
  /** Long date in the given locale (e.g. "2 March 2026"). */
  fromLabel: string;
  /** Long date in the given locale. */
  toLabel: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local YYYY-MM-DD from an instant. */
function localIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Earliest schedule `start` and latest schedule `finish`, formatted as calendar dates.
 * Returns `null` if there are no parseable timestamps.
 */
export function computeTempVisitAvailabilityRange(
  schedules: Schedule[],
  locale: string,
): TempVisitAvailabilityRange | null {
  let minStart = Infinity;
  let maxFinish = -Infinity;

  for (const s of schedules) {
    const startMs = Date.parse(String(s.start));
    const finishMs = Date.parse(String(s.finish));
    if (!Number.isNaN(startMs) && startMs < minStart) {
      minStart = startMs;
    }
    if (!Number.isNaN(finishMs) && finishMs > maxFinish) {
      maxFinish = finishMs;
    }
  }

  if (minStart === Infinity || maxFinish === -Infinity) {
    return null;
  }

  const from = new Date(minStart);
  const to = new Date(maxFinish);
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    fromDate: localIsoDate(from),
    toDate: localIsoDate(to),
    fromLabel: formatter.format(from),
    toLabel: formatter.format(to),
  };
}
