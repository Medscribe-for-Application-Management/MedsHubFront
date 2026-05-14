"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { AdvertisementAggregate } from "@/lib/api/advertisement-schema";
import { LIBELUS_MEDIA_PROXY_PREFIX } from "@/lib/media-browser-proxy";

export type AdPageLocale = "en" | "ar";

interface AdContentProps {
  ad: AdvertisementAggregate;
}

const UI = {
  en: {
    consultant: "Consultant",
    clinic: "Clinic",
    locations: "Locations",
    sessions: "Upcoming sessions",
    scheduleEmpty:
      "Schedule details will be published here when available.",
    whatsappConsultant: "Contact consultant on WhatsApp",
    whatsappConsultantCta: "WhatsApp consultant",
    openMaps: "Open in Google Maps",
    receptionWa: "Reception WhatsApp",
    message: "Message",
    offerValid: "Offer valid until",
    allAds: "All active advertisements",
    clinicFallback: "Clinic",
    langGroup: "Page language",
    switchToEn: "Show English content",
    switchToAr: "عرض المحتوى بالعربية",
    heroImageFallback: "Consultant",
    clinicLogoFallback: "Clinic logo",
  },
  ar: {
    consultant: "الاستشاري",
    clinic: "العيادة",
    locations: "المواقع",
    sessions: "الجلسات القادمة",
    scheduleEmpty: "ستُعرض تفاصيل المواعيد هنا عند توفرها.",
    whatsappConsultant: "تواصل مع الاستشاري عبر واتساب",
    whatsappConsultantCta: "واتساب الاستشاري",
    openMaps: "افتح في خرائط جوجل",
    receptionWa: "واتساب الاستقبال",
    message: "مراسلة",
    offerValid: "العرض سارٍ حتى",
    allAds: "جميع الإعلانات النشطة",
    clinicFallback: "عيادة",
    langGroup: "لغة الصفحة",
    switchToEn: "Show English content",
    switchToAr: "عرض المحتوى بالعربية",
    heroImageFallback: "الاستشاري",
    clinicLogoFallback: "شعار العيادة",
  },
} as const;

type AdUiStrings = (typeof UI)[AdPageLocale];

function waLink(num: string): string {
  const digits = num.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

function formatInstant(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** Non-empty trimmed string, or `undefined` (do not fall back to the other language). */
function text(s: string | null | undefined): string | undefined {
  const t = String(s ?? "").trim();
  return t.length > 0 ? t : undefined;
}

function joinSpec(
  a: string | null | undefined,
  b: string | null | undefined,
): string | undefined {
  const p = [text(a), text(b)].filter(Boolean) as string[];
  return p.length > 0 ? p.join(" · ") : undefined;
}

/**
 * Same-origin `/_libelus-media/*` can use the optimizer; still unoptimize SVG in `key=`.
 * Direct `http://localhost:3000/...` URLs stay unoptimized (optimizer / CORP quirks).
 */
function shouldUnoptimizeApiMedia(src: string): boolean {
  if (src.startsWith(LIBELUS_MEDIA_PROXY_PREFIX)) {
    try {
      const u = new URL(src, "http://placeholder.local");
      const key = u.searchParams.get("key") ?? "";
      if (key && /\.svg$/i.test(decodeURIComponent(key))) return true;
    } catch {
      /* noop */
    }
    return false;
  }
  if (/\.svg(?:$|[?#&]|%2F)/i.test(src)) return true;
  try {
    const u = new URL(src);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      return true;
    }
    const key = u.searchParams.get("key");
    if (key) {
      const decoded = decodeURIComponent(key);
      if (/\.svg$/i.test(decoded)) return true;
    }
  } catch {
    return /\.svg/i.test(src);
  }
  return false;
}

function AdLanguageToggle(props: {
  locale: AdPageLocale;
  onLocaleChange: (next: AdPageLocale) => void;
  labels: AdUiStrings;
}) {
  const { locale, onLocaleChange, labels } = props;

  return (
    <div
      className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 p-0.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
      role="group"
      aria-label={labels.langGroup}
    >
      <button
        type="button"
        className={`rounded-full px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
          locale === "en"
            ? "bg-white text-teal-800 shadow dark:bg-zinc-800 dark:text-teal-300"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
        aria-pressed={locale === "en"}
        onClick={() => onLocaleChange("en")}
        aria-label={labels.switchToEn}
      >
        EN
      </button>
      <button
        type="button"
        className={`rounded-full px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
          locale === "ar"
            ? "bg-white text-teal-800 shadow dark:bg-zinc-800 dark:text-teal-300"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
        aria-pressed={locale === "ar"}
        onClick={() => onLocaleChange("ar")}
        lang="ar"
        aria-label={labels.switchToAr}
      >
        AR
      </button>
    </div>
  );
}

export function AdContent({ ad }: AdContentProps) {
  const [locale, setLocale] = useState<AdPageLocale>("en");
  const onLocaleChange = useCallback((next: AdPageLocale) => {
    setLocale(next);
  }, []);

  const t = UI[locale];
  const isAr = locale === "ar";
  const dateLocale = isAr ? "ar-EG" : "en-GB";

  const hero = ad.consultant.images?.[0];
  const consultantWa = ad.consultant.waNum
    ? waLink(ad.consultant.waNum)
    : null;

  const title = isAr ? text(ad.arTitle) : text(ad.engTitle);
  const excerpt = isAr ? text(ad.arExcerpt) : text(ad.engExcerpt);

  const consultantName = isAr
    ? text(ad.consultant.arName)
    : text(ad.consultant.engName);
  const consultantSpec = isAr
    ? joinSpec(ad.consultant.arSpeciality, ad.consultant.arSubSpeciality)
    : joinSpec(ad.consultant.engSpeciality, ad.consultant.engSubSpeciality);
  const consultantBio = isAr
    ? text(ad.consultant.arBriefBio)
    : text(ad.consultant.engBriefBio);

  const clinicTitle = isAr ? text(ad.clinic.arTitle) : text(ad.clinic.engTitle);
  const clinicExcerpt = isAr
    ? text(ad.clinic.arExcerpt)
    : text(ad.clinic.engExcerpt);

  const heroAlt =
    text(hero?.altText) ??
    (isAr ? text(ad.consultant.arName) : text(ad.consultant.engName)) ??
    t.heroImageFallback;

  const logoAlt =
    text(ad.clinic.logoAltText) ??
    (isAr ? text(ad.clinic.arTitle) : text(ad.clinic.engTitle)) ??
    t.clinicLogoFallback;

  const arFont = { fontFamily: "var(--font-noto-arabic), system-ui" } as const;

  return (
    <main
      className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6 lg:px-8"
      lang={isAr ? "ar" : "en"}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3" dir="ltr">
        <AdLanguageToggle
          locale={locale}
          onLocaleChange={onLocaleChange}
          labels={t}
        />
      </div>

      <header className="mb-10 border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700 dark:text-teal-400">
          {ad.clinic.alphaCode ?? t.clinicFallback}
        </p>
        {title ? (
          <h1
            className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50"
            style={isAr ? arFont : undefined}
          >
            {title}
          </h1>
        ) : null}
        {excerpt ? (
          <p
            className="mt-4 max-w-3xl text-lg text-zinc-600 dark:text-zinc-300"
            style={isAr ? arFont : undefined}
          >
            {excerpt}
          </p>
        ) : null}
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section aria-labelledby="consultant-heading" className="space-y-6">
          <h2
            id="consultant-heading"
            className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {t.consultant}
          </h2>
          {hero?.imageUrl ? (
            <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl bg-zinc-100 shadow-sm dark:bg-zinc-900">
              <Image
                src={hero.imageUrl}
                alt={heroAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
                priority
                unoptimized={shouldUnoptimizeApiMedia(hero.imageUrl)}
              />
            </div>
          ) : null}
          <div>
            {consultantName ? (
              <h3
                className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50"
                style={isAr ? arFont : undefined}
              >
                {consultantName}
              </h3>
            ) : null}
            {consultantSpec ? (
              <p
                className="mt-2 text-zinc-600 dark:text-zinc-300"
                style={isAr ? arFont : undefined}
              >
                {consultantSpec}
              </p>
            ) : null}
          </div>
          {consultantBio ? (
            <div className="space-y-3 text-zinc-700 dark:text-zinc-200">
              <p style={isAr ? arFont : undefined}>{consultantBio}</p>
            </div>
          ) : null}
          {consultantWa ? (
            <a
              className="inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              href={consultantWa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.whatsappConsultant}
            >
              {t.whatsappConsultantCta}
            </a>
          ) : null}
        </section>

        <aside className="space-y-8">
          <section aria-labelledby="clinic-heading">
            <h2
              id="clinic-heading"
              className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
            >
              {t.clinic}
            </h2>
            <div className="mt-4 flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              {ad.clinic.logo ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={ad.clinic.logo}
                    alt={logoAlt}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                    unoptimized={shouldUnoptimizeApiMedia(ad.clinic.logo)}
                  />
                </div>
              ) : null}
              <div>
                {clinicTitle ? (
                  <h3
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
                    style={isAr ? arFont : undefined}
                  >
                    {clinicTitle}
                  </h3>
                ) : null}
                {clinicExcerpt ? (
                  <p
                    className="mt-2 text-sm text-zinc-600 dark:text-zinc-300"
                    style={isAr ? arFont : undefined}
                  >
                    {clinicExcerpt}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section aria-labelledby="locations-heading">
            <h2
              id="locations-heading"
              className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
            >
              {t.locations}
            </h2>
            <ul className="mt-4 space-y-4">
              {ad.locations.map((loc) => {
                const address = isAr
                  ? text(loc.arAddress)
                  : text(loc.engAddress);
                return (
                  <li
                    key={loc.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
                  >
                    {address ? (
                      <p
                        className="font-medium text-zinc-900 dark:text-zinc-50"
                        style={isAr ? arFont : undefined}
                      >
                        {address}
                      </p>
                    ) : null}
                    {loc.lat != null && loc.long != null ? (
                      <a
                        className="mt-2 inline-block text-sm font-medium text-teal-700 underline-offset-4 hover:underline dark:text-teal-400"
                        href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.long}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t.openMaps}
                      >
                        {t.openMaps}
                      </a>
                    ) : null}
                    {loc.clerks.length > 0 ? (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {t.receptionWa}
                        </p>
                        <ul className="mt-1 flex flex-wrap gap-2">
                          {loc.clerks.map((c, idx) => (
                            <li key={`${loc.id}-clerk-${idx}`}>
                              <a
                                className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-teal-800 shadow-sm ring-1 ring-zinc-200 hover:bg-teal-50 dark:bg-zinc-950 dark:text-teal-300 dark:ring-zinc-700"
                                href={waLink(c.waNum)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t.receptionWa}
                              >
                                {t.message}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>

      <section
        aria-labelledby="schedule-heading"
        className="mt-14 border-t border-zinc-200 pt-10 dark:border-zinc-800"
      >
        <h2
          id="schedule-heading"
          className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {t.sessions}
        </h2>
        {ad.schedules.length === 0 ? (
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            {t.scheduleEmpty}
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {ad.schedules.map((s) => {
              const loc = s.location;
              const schedAddress =
                loc &&
                (isAr ? text(loc.arAddress) : text(loc.engAddress));
              return (
                <li
                  key={s.scheduleId}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">
                    {s.date}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                    {formatInstant(s.start, dateLocale)} –{" "}
                    {formatInstant(s.finish, dateLocale)}
                  </p>
                  {schedAddress ? (
                    <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <p style={isAr ? arFont : undefined}>{schedAddress}</p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="mt-14 border-t border-zinc-200 pt-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <p>
          {t.offerValid}{" "}
          <time dateTime={ad.expiration}>
            {formatInstant(ad.expiration, dateLocale)}
          </time>
          .
        </p>
        <p className="mt-4">
          <Link
            href="/"
            className="font-medium text-teal-700 hover:underline dark:text-teal-400"
          >
            {t.allAds}
          </Link>
        </p>
      </footer>
    </main>
  );
}
