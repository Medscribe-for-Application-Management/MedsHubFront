"use client";

import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import type { AdPageLocale } from "@/lib/ad-page-locale";
import type {
  AdvertisementAggregate,
  ConsultantImage,
} from "@/lib/api/advertisement-schema";
import { computeTempVisitAvailabilityRange } from "@/lib/availability-from-schedules";
import { LIBELUS_MEDIA_PROXY_PREFIX } from "@/lib/media-browser-proxy";
import { TV_PREMIUM } from "@/lib/temp-visit-premium-styles";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

function joinClasses(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

function TempVisitRuleH({
  weight = "thin",
  className,
}: {
  weight?: "thin" | "medium" | "thick" | "accent" | "contentBand";
  className?: string;
}) {
  const weights = {
    thin: TV_PREMIUM.ruleHThin,
    medium: TV_PREMIUM.ruleHMedium,
    thick: TV_PREMIUM.ruleHThick,
    accent: TV_PREMIUM.ruleHAccent,
    contentBand: TV_PREMIUM.ruleHContentBand,
  } as const;
  return (
    <div
      role="separator"
      aria-hidden
      className={joinClasses(weights[weight], className)}
    />
  );
}

function TempVisitRuleV({
  weight = "thin",
  className,
}: {
  weight?: "thin" | "medium" | "thick";
  className?: string;
}) {
  const weights = {
    thin: TV_PREMIUM.ruleVThin,
    medium: TV_PREMIUM.ruleVMedium,
    thick: TV_PREMIUM.ruleVThick,
  } as const;
  return (
    <div
      role="separator"
      aria-hidden
      className={joinClasses(weights[weight], className)}
    />
  );
}

interface AdContentProps {
  ad: AdvertisementAggregate;
  locale: AdPageLocale;
  engHref: string;
  arHref: string;
}

const UI = {
  en: {
    consultant: "Consultant",
    clinic: "Clinic",
    locations: "Locations",
    /** temp_visit map block title (singular) */
    tempVisitLocationHeading: "Location",
    sessions: "Upcoming sessions",
    scheduleEmpty:
      "Schedule details will be published here when available.",
    whatsappConsultant: "Contact consultant on WhatsApp",
    whatsappConsultantCta: "WhatsApp consultant",
    openMaps: "Open in Google Maps",
    receptionWa: "Reception WhatsApp",
    message: "Message",
    offerValid: "Offer valid until",
    validUntil: "Valid until",
    allAds: "All active advertisements",
    clinicFallback: "Clinic",
    langGroup: "Page language",
    switchToEn: "Show English content",
    switchToAr: "عرض المحتوى بالعربية",
    heroImageFallback: "Consultant",
    clinicLogoFallback: "Clinic logo",
    availabilityHeading:
      "Availability of Preparatory Consultations for the Expert Visit",
    availabilityFrom: "From",
    availabilityTo: "to",
    tempVisitAvailabilityFallback:
      "Visit dates are not available yet; session details may appear below when published.",
    bookConsultationCta:
      "Book your consultation now via phone or WhatsApp",
    bookingSectionAriaTitle: "Booking and contact",
    bookingContactEyebrow: "Phone & WhatsApp",
    callConsultant: "Call now",
    callConsultantAria: "Call consultant by phone",
    tempVisitFooter:
      "Meds-Hub — A digital hosting service for consultants and clinics. Developed by Medscribe for Application Management. All rights reserved.",
  },
  ar: {
    consultant: "الاستشاري",
    clinic: "العيادة",
    locations: "المواقع",
    tempVisitLocationHeading: "الموقع",
    sessions: "الجلسات القادمة",
    scheduleEmpty: "ستُعرض تفاصيل المواعيد هنا عند توفرها.",
    whatsappConsultant: "تواصل مع الاستشاري عبر واتساب",
    whatsappConsultantCta: "واتساب الاستشاري",
    openMaps: "افتح في خرائط جوجل",
    receptionWa: "واتساب الاستقبال",
    message: "مراسلة",
    offerValid: "العرض سارٍ حتى",
    validUntil: "سارٍ حتى",
    allAds: "جميع الإعلانات النشطة",
    clinicFallback: "عيادة",
    langGroup: "لغة الصفحة",
    switchToEn: "Show English content",
    switchToAr: "عرض المحتوى بالعربية",
    heroImageFallback: "الاستشاري",
    clinicLogoFallback: "شعار العيادة",
    availabilityHeading: "مواعيد الاستشارات التحضيرية المتاحة",
    availabilityFrom: "من",
    availabilityTo: "إلى",
    tempVisitAvailabilityFallback:
      "تواريخ الزيارة غير متاحة بعد؛ قد تظهر تفاصيل المواعيد أدناه عند نشرها.",
    bookConsultationCta: "احجز استشارتك الآن عبر الهاتف أو واتساب",
    bookingSectionAriaTitle: "الحجز والتواصل",
    bookingContactEyebrow: "الهاتف وواتساب",
    callConsultant: "اتصل الآن",
    callConsultantAria: "اتصل بالاستشاري هاتفياً",
    tempVisitFooter:
      "Meds-Hub — خدمة استضافة رقمية للاستشاريين والعيادات. مطوّرة من ميدسكرايب لإدارة التطبيقات. جميع الحقوق محفوظة.",
  },
} as const;

type AdUiStrings = (typeof UI)[AdPageLocale];

function waLink(num: string): string {
  const digits = num.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

function telLink(num: string): string {
  const digits = num.replace(/\D/g, "");
  return digits ? `tel:+${digits}` : "#";
}

/** Local display: drop leading country 20 (e.g. 2010… → 010…). Call/WhatsApp links unchanged. */
function buildGoogleMapsHref(
  lat: number | undefined,
  lng: number | undefined,
  address?: string,
): string | null {
  if (
    lat != null &&
    lng != null &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  return null;
}

function buildGoogleMapsEmbedSrc(
  lat: number | undefined,
  lng: number | undefined,
  address?: string,
): string | null {
  if (
    lat != null &&
    lng != null &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
  ) {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  }
  if (address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`;
  }
  return null;
}

function LocationMapEmbed({
  lat,
  lng,
  address,
  title,
  openMapsLabel,
}: {
  lat?: number;
  lng?: number;
  address?: string;
  title: string;
  openMapsLabel: string;
}) {
  const embedSrc = buildGoogleMapsEmbedSrc(lat, lng, address);
  const mapsHref = buildGoogleMapsHref(lat, lng, address);
  if (!embedSrc) return null;

  return (
    <div className="mt-4">
      <div className={TV_PREMIUM.mapEmbed}>
        <iframe
          title={title}
          src={embedSrc}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      {mapsHref ? (
        <a
          className={joinClasses("mt-3 inline-flex", TV_PREMIUM.link)}
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={openMapsLabel}
        >
          {openMapsLabel}
        </a>
      ) : null}
    </div>
  );
}

function formatPhoneDisplay(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed;

  if (digits.startsWith("20") && digits.length >= 11) {
    return `0${digits.slice(2)}`;
  }

  return trimmed;
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ConsultantImagesGallery({
  images,
  defaultAlt,
  variant,
}: {
  images: ConsultantImage[];
  defaultAlt: string;
  variant: "premium" | "default";
}) {
  const items = images
    .map((img) => ({
      url: text(img.imageUrl),
      alt: text(img.altText) ?? defaultAlt,
    }))
    .filter((item): item is { url: string; alt: string } => Boolean(item.url));

  if (items.length === 0) return null;

  const premium = variant === "premium";

  return (
    <div
      className={joinClasses(
        "mt-8",
        items.length > 1 ? "grid gap-4 sm:grid-cols-2" : undefined,
      )}
    >
      {items.map((item, index) => (
        <figure
          key={`${item.url}-${index}`}
          className={
            premium
              ? TV_PREMIUM.contentImage
              : "relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl bg-zinc-100 shadow-sm dark:bg-zinc-900"
          }
        >
          <Image
            src={item.url}
            alt={item.alt}
            fill
            className="object-cover"
            sizes={
              items.length > 1
                ? "(max-width: 640px) 50vw, 432px"
                : "(max-width: 896px) 100vw, 896px"
            }
            priority={index === 0}
            unoptimized={shouldUnoptimizeApiMedia(item.url)}
          />
        </figure>
      ))}
    </div>
  );
}

function pickOgHeroImage(
  ad: AdvertisementAggregate,
  isAr: boolean,
): string | undefined {
  const primary = isAr ? text(ad.ogArabicImage) : text(ad.ogEngImage);
  const secondary = isAr ? text(ad.ogEngImage) : text(ad.ogArabicImage);
  return primary ?? secondary;
}

/** Consultant `waNum`, else first reception clerk number on any location. */
function resolveBookingContact(ad: AdvertisementAggregate): {
  display: string | undefined;
  phoneHref: string | null;
  waHref: string | null;
} {
  const consultant = text(ad.consultant.waNum);
  if (consultant) {
    return {
      display: formatPhoneDisplay(consultant),
      phoneHref: telLink(consultant),
      waHref: waLink(consultant),
    };
  }
  for (const loc of ad.locations) {
    for (const clerk of loc.clerks) {
      const num = text(clerk.waNum);
      if (num) {
        return {
          display: formatPhoneDisplay(num),
          phoneHref: telLink(num),
          waHref: waLink(num),
        };
      }
    }
  }
  return { display: undefined, phoneHref: null, waHref: null };
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

const toggleBtnClass =
  "rounded-full px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600";
const toggleActiveClass =
  "bg-white text-teal-800 shadow dark:bg-zinc-800 dark:text-teal-300";
const toggleInactiveClass =
  "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

function AdLanguageToggle(props: {
  locale: AdPageLocale;
  engHref: string;
  arHref: string;
  labels: AdUiStrings;
  variant?: "default" | "premium";
}) {
  const { locale, engHref, arHref, labels, variant = "default" } = props;
  const premium = variant === "premium";

  return (
    <div
      className={
        premium
          ? TV_PREMIUM.langToggleWrap
          : "inline-flex rounded-full border border-zinc-200 bg-zinc-100 p-0.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
      }
      role="group"
      aria-label={labels.langGroup}
    >
      <Link
        href={engHref}
        scroll={false}
        className={joinClasses(
          premium ? TV_PREMIUM.langToggleBtn : toggleBtnClass,
          locale === "en"
            ? premium
              ? TV_PREMIUM.langToggleActive
              : toggleActiveClass
            : premium
              ? TV_PREMIUM.langToggleInactive
              : toggleInactiveClass,
        )}
        aria-current={locale === "en" ? "page" : undefined}
        aria-label={labels.switchToEn}
      >
        EN
      </Link>
      <Link
        href={arHref}
        scroll={false}
        className={joinClasses(
          premium ? TV_PREMIUM.langToggleBtn : toggleBtnClass,
          locale === "ar"
            ? premium
              ? TV_PREMIUM.langToggleActive
              : toggleActiveClass
            : premium
              ? TV_PREMIUM.langToggleInactive
              : toggleInactiveClass,
        )}
        aria-current={locale === "ar" ? "page" : undefined}
        lang="ar"
        aria-label={labels.switchToAr}
      >
        AR
      </Link>
    </div>
  );
}

interface TempVisitAvailabilityBookingProps {
  ad: AdvertisementAggregate;
  t: AdUiStrings;
  isAr: boolean;
  arFont: React.CSSProperties;
  bookingPhone: string | undefined;
  bookingPhoneHref: string | null;
  bookingWaHref: string | null;
  availabilityRange: ReturnType<typeof computeTempVisitAvailabilityRange>;
}

function TempVisitAvailabilityBooking({
  ad,
  t,
  isAr,
  arFont,
  bookingPhone,
  bookingPhoneHref,
  bookingWaHref,
  availabilityRange,
}: TempVisitAvailabilityBookingProps) {
  const hasBookingContact = Boolean(bookingPhone);
  const clinicTitle = isAr
    ? text(ad.clinic.arTitle)
    : text(ad.clinic.engTitle);
  const clinicLogoAlt =
    text(ad.clinic.logoAltText) ?? clinicTitle ?? t.clinicLogoFallback;
  const bookingCopy = text(
    isAr ? ad.arAdditionalInfo : ad.engAdditionalInfo,
  );

  const hasLocations = ad.locations.length > 0;

  const hasClinicUnderAvail =
    hasLocations && Boolean(clinicTitle || ad.clinic.logo);

  const availPlacement = hasClinicUnderAvail
    ? TV_PREMIUM.tempVisitBrickAvailabilityPlacementWithClinic
    : TV_PREMIUM.tempVisitBrickAvailabilityPlacementSolo;
  const bookingPlacement = hasClinicUnderAvail
    ? TV_PREMIUM.tempVisitBrickBookingPlacementWithClinic
    : TV_PREMIUM.tempVisitBrickBookingPlacementSolo;
  const locationsGridOrder = hasClinicUnderAvail
    ? TV_PREMIUM.tempVisitBrickOrderLocationsBelowClinic
    : TV_PREMIUM.tempVisitBrickOrderLocations;

  return (
    <div className={TV_PREMIUM.tempVisitBrickGrid}>
      {hasClinicUnderAvail ? (
        <div
          className={joinClasses(
            TV_PREMIUM.availabilitySection,
            TV_PREMIUM.sectionWash,
            TV_PREMIUM.tempVisitBrickClinicStripPlacement,
          )}
          role="group"
          aria-label={clinicTitle ?? clinicLogoAlt}
        >
          <div className={TV_PREMIUM.tempVisitBrickClinicRow}>
            {ad.clinic.logo ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80">
                <Image
                  src={ad.clinic.logo}
                  alt={clinicLogoAlt}
                  fill
                  sizes="56px"
                  className="object-contain p-1.5"
                  unoptimized={shouldUnoptimizeApiMedia(ad.clinic.logo)}
                />
              </div>
            ) : null}
            {clinicTitle ? (
              <h3
                className={TV_PREMIUM.tempVisitBrickClinicTitle}
                style={isAr ? arFont : undefined}
              >
                {clinicTitle}
              </h3>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        className={joinClasses(
          TV_PREMIUM.tempVisitBrickAvailabilityCol,
          availPlacement,
        )}
      >
        <section
          className={joinClasses(
            TV_PREMIUM.availabilitySection,
            TV_PREMIUM.sectionWash,
            TV_PREMIUM.tempVisitBrickStackSlot,
          )}
          aria-labelledby="availability-heading"
        >
          <div className={TV_PREMIUM.availabilityInner}>
            <h2
              id="availability-heading"
              className={TV_PREMIUM.availabilityCardHeading}
              style={isAr ? arFont : undefined}
            >
              {t.availabilityHeading}
            </h2>
            <TempVisitRuleH
              weight="accent"
              className={joinClasses(TV_PREMIUM.spacerTight, "max-w-[12rem]")}
            />
            {availabilityRange ? (
              <p
                className={joinClasses("mt-2", TV_PREMIUM.availabilityDate)}
                dir="ltr"
                style={isAr ? { textAlign: "end" } : undefined}
              >
                {availabilityRange.rangeLabel}
              </p>
            ) : (
              <p
                className={joinClasses(
                  "mt-2 max-w-xl",
                  TV_PREMIUM.availabilityFallback,
                )}
                style={isAr ? arFont : undefined}
              >
                {t.tempVisitAvailabilityFallback}
              </p>
            )}
          </div>
        </section>
      </div>

      <section
        aria-labelledby="booking-cta-heading"
        className={joinClasses(
          TV_PREMIUM.tempVisitBrickCardInset,
          TV_PREMIUM.compactGap,
          "flex flex-col",
          TV_PREMIUM.card,
          TV_PREMIUM.tempVisitBrickMain,
          bookingPlacement,
          "md:border-s md:border-[#0F172A]/12",
        )}
      >
        {bookingCopy ? (
          <>
            <h2 id="booking-cta-heading" className="sr-only">
              {t.bookingSectionAriaTitle}
            </h2>
            <div className="relative border-s-[3px] border-[#14B8A6]/90 ps-4 sm:ps-5">
              <p
                className={joinClasses(TV_PREMIUM.bookingLead, "whitespace-pre-wrap")}
                style={isAr ? arFont : undefined}
                lang={isAr ? "ar" : "en"}
              >
                {bookingCopy}
              </p>
            </div>
          </>
        ) : (
          <h2
            id="booking-cta-heading"
            className={TV_PREMIUM.h2}
            style={isAr ? arFont : undefined}
          >
            {t.bookConsultationCta}
          </h2>
        )}

        {hasBookingContact ? (
          <>
            <TempVisitRuleH
              weight="medium"
              className={joinClasses(TV_PREMIUM.spacerBlock, "w-full")}
            />
            <div className={TV_PREMIUM.bookingContactPanel}>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
              <p
                className={joinClasses(
                  TV_PREMIUM.phoneDisplay,
                  "min-w-0 break-all sm:break-normal",
                )}
                dir="ltr"
              >
                {bookingPhone}
              </p>
              <TempVisitRuleV
                weight="medium"
                className="hidden sm:mx-1 sm:block"
              />
              <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                {bookingPhoneHref ? (
                  <a
                    className={TV_PREMIUM.ctaIcon}
                    href={bookingPhoneHref}
                    aria-label={t.callConsultantAria}
                  >
                    <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                ) : null}
                {bookingWaHref ? (
                  <a
                    className={TV_PREMIUM.ctaIcon}
                    href={bookingWaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.whatsappConsultant}
                  >
                    <WhatsAppIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
          </>
        ) : null}
      </section>

      {hasLocations ? (
        <section
          aria-labelledby="visit-locations-heading"
          className={joinClasses(
            TV_PREMIUM.tempVisitBrickCardInset,
            TV_PREMIUM.card,
            TV_PREMIUM.tempVisitBrickLocationsFull,
            locationsGridOrder,
          )}
        >
          <h2
            id="visit-locations-heading"
            className={TV_PREMIUM.tempVisitLocationsHeading}
            style={isAr ? arFont : undefined}
          >
            {t.tempVisitLocationHeading}
          </h2>
          <div
            className={joinClasses(
              "mt-4 rounded-xl p-4 sm:p-5",
              TV_PREMIUM.sectionMuted,
            )}
          >
            <ul className="space-y-6">
              {ad.locations.map((loc, locIdx) => {
                const address = isAr
                  ? text(loc.arAddress)
                  : text(loc.engAddress);
                const mapTitle = address ?? clinicTitle ?? t.openMaps;
                return (
                  <li key={loc.id} className={locIdx > 0 ? "pt-6" : undefined}>
                    {locIdx > 0 ? (
                      <TempVisitRuleH
                        weight="medium"
                        className={joinClasses(TV_PREMIUM.spacerTight, "mb-6")}
                      />
                    ) : null}
                    {address ? (
                      <p
                        className={TV_PREMIUM.locationTitle}
                        style={isAr ? arFont : undefined}
                      >
                        {address}
                      </p>
                    ) : null}
                    <LocationMapEmbed
                      lat={loc.lat}
                      lng={loc.long}
                      address={address}
                      title={mapTitle}
                      openMapsLabel={t.openMaps}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}

interface TempVisitBodyProps {
  ad: AdvertisementAggregate;
  t: AdUiStrings;
  isAr: boolean;
  arFont: React.CSSProperties;
  consultantName: string | undefined;
  consultantSpec: string | undefined;
  consultantBio: string | undefined;
  clinicTitle: string | undefined;
  clinicExcerpt: string | undefined;
  logoAlt: string;
}

function TempVisitAdBody({
  ad,
  t,
  isAr,
  arFont,
  consultantName,
  consultantSpec,
  consultantBio,
  clinicTitle,
  clinicExcerpt,
  logoAlt,
}: TempVisitBodyProps) {
  return (
    <>
      <article
        className={joinClasses(
          "mb-5 w-full min-w-0 sm:mb-6",
          TV_PREMIUM.tempVisitBrickCardInset,
          TV_PREMIUM.cardMuted,
        )}
      >
        <p
          className={TV_PREMIUM.labelAccent}
          style={isAr ? arFont : undefined}
        >
          {t.consultant}
        </p>
        <TempVisitRuleH
          weight="accent"
          className={joinClasses(TV_PREMIUM.spacerTight, "max-w-[8rem]")}
        />
        {consultantName ? (
          <h3
            className={joinClasses("mt-2", TV_PREMIUM.h3)}
            style={isAr ? arFont : undefined}
          >
            {consultantName}
          </h3>
        ) : null}
        {consultantSpec ? (
          <>
            <TempVisitRuleH
              weight="thin"
              className={joinClasses(TV_PREMIUM.spacerTight, "max-w-full")}
            />
            <p
              className={joinClasses("mt-2", TV_PREMIUM.bodyEmphasis)}
              style={isAr ? arFont : undefined}
            >
              {consultantSpec}
            </p>
          </>
        ) : null}
        {consultantBio ? (
          <p
            className={joinClasses("mt-4", TV_PREMIUM.bodySm)}
            style={isAr ? arFont : undefined}
          >
            {consultantBio}
          </p>
        ) : null}
      </article>

      {(clinicTitle || clinicExcerpt || ad.clinic.logo) && (
        <>
          <section
            aria-labelledby="clinic-heading-tv"
            className={joinClasses(
              "mb-12 w-full min-w-0",
              TV_PREMIUM.tempVisitBrickCardInset,
              TV_PREMIUM.card,
            )}
          >
          <h2
            id="clinic-heading-tv"
            className={TV_PREMIUM.h2}
            style={isAr ? arFont : undefined}
          >
            {t.clinic}
          </h2>
          <TempVisitRuleH weight="thin" className={TV_PREMIUM.spacerTight} />
          <div className="mt-4 flex gap-5">
            {ad.clinic.logo ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F8FAFC] ring-1 ring-slate-100">
                <Image
                  src={ad.clinic.logo}
                  alt={logoAlt}
                  fill
                  sizes="56px"
                  className="object-contain p-1.5"
                  unoptimized={shouldUnoptimizeApiMedia(ad.clinic.logo)}
                />
              </div>
            ) : null}
            <div>
              {clinicTitle ? (
                <h3
                  className={TV_PREMIUM.h3Sub}
                  style={isAr ? arFont : undefined}
                >
                  {clinicTitle}
                </h3>
              ) : null}
              {clinicExcerpt ? (
                <p
                  className={joinClasses("mt-2", TV_PREMIUM.bodySm)}
                  style={isAr ? arFont : undefined}
                >
                  {clinicExcerpt}
                </p>
              ) : null}
            </div>
          </div>
        </section>
        </>
      )}
    </>
  );
}

export function AdContent({ ad, locale, engHref, arHref }: AdContentProps) {
  const t = UI[locale];
  const isAr = locale === "ar";
  const dateLocale = isAr ? "ar-EG" : "en-GB";

  const hero = ad.consultant.images?.[0];

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

  const isTempVisit = ad.adType === "temp_visit";

  const ogHeroUrl = isTempVisit ? pickOgHeroImage(ad, isAr) : undefined;
  const ogHeroAlt =
    (isAr ? text(ad.ogArabicTitle) : text(ad.ogEngTitle)) ??
    title ??
    consultantName ??
    t.heroImageFallback;
  const bookingContact = resolveBookingContact(ad);
  const consultantWa = ad.consultant.waNum
    ? waLink(String(ad.consultant.waNum))
    : null;

  const availabilityRange = isTempVisit
    ? computeTempVisitAvailabilityRange(ad.schedules, dateLocale, {
        from: t.availabilityFrom,
        to: t.availabilityTo,
      })
    : null;

  const showOgHero = isTempVisit && Boolean(ogHeroUrl);

  const mainClassName = joinClasses(
    "mx-auto min-h-screen max-w-4xl px-4 sm:px-6 lg:px-8",
    isTempVisit && "temp-visit-ad-page scheme-light",
    isTempVisit ? TV_PREMIUM.main : "bg-white py-10",
    isTempVisit && !isAr && montserrat.className,
  );
  const pageLang = isAr ? "ar" : "en";
  const pageDir = isAr ? "rtl" : "ltr";

  return (
    <>
    <main
      className={mainClassName}
      lang={pageLang}
      dir={pageDir}
    >
      {isTempVisit ? (
        <div
          className={joinClasses(
            TV_PREMIUM.pageBleed,
            TV_PREMIUM.bandHeroCta,
          )}
        >
          <div className={TV_PREMIUM.bandHeroCtaIntroPad}>
            <div
              className="mb-6 flex flex-wrap items-center justify-end gap-3"
              dir="ltr"
            >
              <AdLanguageToggle
                locale={locale}
                engHref={engHref}
                arHref={arHref}
                labels={t}
                variant="premium"
              />
            </div>
            {showOgHero && ogHeroUrl ? (
              <div className={TV_PREMIUM.hero}>
                <Image
                  src={ogHeroUrl}
                  alt={ogHeroAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                  unoptimized={shouldUnoptimizeApiMedia(ogHeroUrl)}
                />
              </div>
            ) : null}
          </div>
          <div className={TV_PREMIUM.bandHeroCtaBrickPad}>
            <TempVisitAvailabilityBooking
              ad={ad}
              t={t}
              isAr={isAr}
              arFont={arFont}
              bookingPhone={bookingContact.display}
              bookingPhoneHref={bookingContact.phoneHref}
              bookingWaHref={bookingContact.waHref}
              availabilityRange={availabilityRange}
            />
          </div>
        </div>
      ) : (
        <div className="mb-8 flex flex-wrap items-center justify-end gap-3" dir="ltr">
          <AdLanguageToggle
            locale={locale}
            engHref={engHref}
            arHref={arHref}
            labels={t}
            variant="default"
          />
        </div>
      )}

      <div
        className={
          isTempVisit
            ? joinClasses(TV_PREMIUM.pageBleed, TV_PREMIUM.bandContent)
            : undefined
        }
      >
      {isTempVisit ? (
        <div className={TV_PREMIUM.contentBandRuleWrap}>
          <TempVisitRuleH weight="contentBand" />
        </div>
      ) : null}
      <header
        className={
          isTempVisit
            ? joinClasses(
                "w-full min-w-0",
                TV_PREMIUM.header,
                TV_PREMIUM.tempVisitBandTextPadX,
              )
            : "mb-10 border-b border-zinc-200 pb-8 dark:border-zinc-800"
        }
      >
        <p
          className={
            isTempVisit
              ? TV_PREMIUM.labelAccent
              : "text-sm font-medium uppercase tracking-wide text-teal-700 dark:text-teal-400"
          }
          style={isAr ? arFont : undefined}
        >
          {ad.clinic.alphaCode ?? t.clinicFallback}
        </p>
        {title ? (
          <h1
            className={
              isTempVisit
                ? joinClasses("mt-3", TV_PREMIUM.h1)
                : "mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50"
            }
            style={isAr ? arFont : undefined}
          >
            {title}
          </h1>
        ) : null}
        {excerpt ? (
          <p
            className={
              isTempVisit
                ? joinClasses("mt-5 max-w-3xl", TV_PREMIUM.bodyLead)
                : "mt-4 max-w-3xl text-lg text-zinc-600 dark:text-zinc-300"
            }
            style={isAr ? arFont : undefined}
          >
            {excerpt}
          </p>
        ) : null}
        <ConsultantImagesGallery
          images={ad.consultant.images ?? []}
          defaultAlt={heroAlt}
          variant={isTempVisit ? "premium" : "default"}
        />
      </header>
      </div>

      {isTempVisit ? (
        <div className={joinClasses(TV_PREMIUM.pageBleed, TV_PREMIUM.bandAbout)}>
          <TempVisitAdBody
            ad={ad}
            t={t}
            isAr={isAr}
            arFont={arFont}
            consultantName={consultantName}
            consultantSpec={consultantSpec}
            consultantBio={consultantBio}
            clinicTitle={clinicTitle}
            clinicExcerpt={clinicExcerpt}
            logoAlt={logoAlt}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <section aria-labelledby="consultant-heading" className="space-y-6">
              <h2
                id="consultant-heading"
                className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
              >
                {t.consultant}
              </h2>
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
                          <p style={isAr ? arFont : undefined}>
                            {schedAddress}
                          </p>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      {!isTempVisit ? (
        <footer className="mt-14 border-t border-zinc-200 pt-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p style={isAr ? arFont : undefined}>
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
      ) : null}
    </main>
    {isTempVisit ? (
      <footer
        className={joinClasses(
          TV_PREMIUM.bandFooter,
          !isAr && montserrat.className,
        )}
        lang={pageLang}
        dir={pageDir}
      >
        <div className={TV_PREMIUM.footerInner}>
          <p
            className={TV_PREMIUM.footerCopy}
            style={isAr ? arFont : undefined}
          >
            {t.tempVisitFooter}
          </p>
        </div>
      </footer>
    ) : null}
    </>
  );
}
