import type { Schedule } from "@/lib/api/advertisement-schema";

export interface TempVisitAvailabilityRange {
  /** Local calendar start day for `<time dateTime>`. */
  fromDate: string;
  /** Local calendar end day for `<time dateTime>`. */
  toDate: string;
  /**
   * e.g. `From 15th to 22nd, March - 2026` (same month)
   * or `From 15th March to 22nd April - 2026` (cross-month).
   */
  rangeLabel: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local YYYY-MM-DD from an instant. */
function localIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Parse API `schedule.date` (ISO date, usually `YYYY-MM-DD`) as a **calendar** day in
 * local time. Avoids using `finish` UTC instants which often land on the next local
 * calendar day (common “+1 day” bug on visit windows).
 */
function parseScheduleCalendarDay(raw: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(raw ?? "").trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) {
    return null;
  }
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
}

function englishOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatDayWithSuffix(d: Date, locale: string): string {
  const day = d.getDate();
  if (locale.startsWith("ar")) {
    return new Intl.NumberFormat(locale).format(day);
  }
  return `${day}${englishOrdinalSuffix(day)}`;
}

function formatAlphabeticMonth(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(d);
}

function formatYear(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { year: "numeric" }).format(d);
}

export interface TempVisitAvailabilityLabels {
  from: string;
  to: string;
}

/**
 * `From 15th to 22nd, March - 2026` when both dates share a month;
 * `From 15th March to 22nd April - 2026` when months differ.
 */
export function formatTempVisitAvailabilityLine(
  from: Date,
  to: Date,
  locale: string,
  labels: TempVisitAvailabilityLabels,
): string {
  const fromDay = formatDayWithSuffix(from, locale);
  const toDay = formatDayWithSuffix(to, locale);
  const year = formatYear(to, locale);
  const sameMonth =
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth();

  if (sameMonth) {
    const month = formatAlphabeticMonth(from, locale);
    return `${labels.from} ${fromDay} ${labels.to} ${toDay}, ${month} - ${year}`;
  }

  const fromMonth = formatAlphabeticMonth(from, locale);
  const toMonth = formatAlphabeticMonth(to, locale);
  return `${labels.from} ${fromDay} ${fromMonth} ${labels.to} ${toDay} ${toMonth} - ${year}`;
}

/**
 * Earliest and latest **calendar** `schedule.date` when present (recommended).
 * Falls back to earliest `start` and latest `finish` only if no `date` parses.
 */
export function computeTempVisitAvailabilityRange(
  schedules: Schedule[],
  locale: string,
  labels: TempVisitAvailabilityLabels,
): TempVisitAvailabilityRange | null {
  let minCal: Date | null = null;
  let maxCal: Date | null = null;

  for (const s of schedules) {
    const day = parseScheduleCalendarDay(String(s.date));
    if (!day) continue;
    const t = day.getTime();
    if (!minCal || t < minCal.getTime()) minCal = day;
    if (!maxCal || t > maxCal.getTime()) maxCal = day;
  }

  if (minCal && maxCal) {
    return {
      fromDate: localIsoDate(minCal),
      toDate: localIsoDate(maxCal),
      rangeLabel: formatTempVisitAvailabilityLine(minCal, maxCal, locale, labels),
    };
  }

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

  return {
    fromDate: localIsoDate(from),
    toDate: localIsoDate(to),
    rangeLabel: formatTempVisitAvailabilityLine(from, to, locale, labels),
  };
}
