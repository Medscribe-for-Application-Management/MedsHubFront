/**
 * Premium temp_visit ad page design tokens (Tailwind class fragments).
 * Styling only — use when `ad.adType === "temp_visit"`.
 */

const gradientCta =
  "bg-gradient-to-br from-[#0F766E] via-[#0D9488] to-[#0d8c84]";

/** Full-page backdrop: mist → crisp white → cool aqua basin */
const gradMain =
  "bg-[linear-gradient(180deg,#eaf2f7_0%,#f9fbfc_24%,#ffffff_52%,#f3fafb_78%,#e2f6f9_100%)]";

/** One canvas for hero + booking brick (no seam between tiers). */
const gradBandHeroCta =
  "bg-[linear-gradient(180deg,#ffffff_0%,#f7fafb_12%,#edf4f9_26%,#e2eef4_42%,#e3f5f8_54%,#ebf9fa_68%,#f4fbfc_84%,#fafefe_100%)]";

/** Lead copy: pearl white with barely-there cyan floor */
const gradBandContent =
  "bg-[linear-gradient(180deg,#fdfefe_0%,#ffffff_45%,#f7fbfc_100%)]";

/** Bios: airy slate veil back toward aqua */
const gradBandAbout =
  "bg-[linear-gradient(180deg,#ffffff_0%,#f4f9fb_42%,#ebf6f9_100%)]";

/** Footer strip: understated cool graphite depth */
const gradBandFooter =
  "bg-[linear-gradient(180deg,#f2f9fa_0%,#eaf0f8_52%,#e2eaf3_100%)]";

const shadowCard =
  "shadow-[0_16px_48px_-20px_rgba(15,23,42,0.11)]";
const shadowSoft = "shadow-[0_6px_24px_-8px_rgba(15,23,42,0.07)]";

export const TV_PREMIUM = {
  main:
    `${gradMain} min-h-screen text-[#0F172A] font-normal antialiased`,

  pageBleed: "-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8",

  bandHeroCta: gradBandHeroCta,
  /** Spacing strips inside bandHeroCta (background on parent only). */
  bandHeroCtaIntroPad: "pt-8 sm:pt-10 pb-4 sm:pb-5",
  bandHeroCtaBrickPad: "pt-5 sm:pt-6 pb-5 sm:pb-6",
  bandContent:
    `${gradBandContent} pt-5 sm:pt-6 pb-5 sm:pb-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.92),inset_0_-1px_0_0_rgba(203,213,225,0.45)]`,
  bandAbout:
    `${gradBandAbout} pt-5 sm:pt-6 pb-10 sm:pb-14`,
  bandFooter:
    `${gradBandFooter} border-t border-slate-200/70 py-8 sm:py-10`,

  textPrimary: "text-[#0F172A]",
  textSecondary: "text-[#475569]",
  textTertiary: "text-[#64748B]",
  textAccent: "text-[#0F766E]",
  textAccentStrong: "text-[#115E59]",

  gradientCta,
  gradientText:
    "bg-gradient-to-r from-[#0F766E] to-[#0D9488] bg-clip-text text-transparent",

  shadowCard,
  shadowSoft,

  sectionWash:
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,251,253,0.95)_52%,rgba(228,246,246,0.88)_100%)] ring-1 ring-[#a7f3d0]/40",
  sectionMuted:
    "bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(248,250,252,0.88)_52%,rgba(236,253,253,0.55)_100%)] ring-1 ring-slate-200/55 backdrop-blur-[3px]",

  availabilitySection:
    `mb-5 overflow-hidden rounded-xl ${shadowSoft} ring-1 ring-teal-200/55 md:mb-0`,
  availabilityInner:
    "relative flex flex-col px-4 py-3.5 sm:px-5 sm:py-4 md:flex md:min-h-0 md:flex-1 md:flex-col md:justify-center",

  /** Fills half of the stacked column on md+ when paired (see AdContent). */
  tempVisitBrickStackSlot: "flex flex-col md:flex-1 md:min-h-0",

  tempVisitBrickClinicRow:
    "flex min-h-0 w-full flex-1 items-center gap-4 px-4 py-3.5 sm:px-5 sm:py-4",

  /** temp_visit CTA band: masonry-style tiles on md+ (see AdContent). */
  tempVisitBrickGrid:
    "w-full min-w-0 flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-x-5 md:gap-y-5 md:items-stretch",
  tempVisitBrickAvailability:
    "order-1 flex w-full min-w-0 min-h-0 flex-col gap-4 md:col-span-5 md:h-full",

  /** Tighter inset for booking / locations tiles in temp_visit CTA brick. */
  tempVisitBrickCardInset: "p-4 sm:p-5 md:p-6",

  /** Extra horizontal inset inside pageBleed so title/gallery align with brick card body copy. */
  tempVisitBandTextPadX: "px-4 sm:px-5 md:px-6",

  /** Locations card title (temp_visit): readable vs faint labelEyebrowSm. */
  tempVisitLocationsHeading:
    "text-base font-bold tracking-tight text-[#0F172A] sm:text-lg",

  compactGap: "gap-4 md:gap-5",
  tempVisitBrickMain: "w-full min-w-0 md:col-span-7 md:h-full md:min-h-0",

  tempVisitBrickOrderBooking: "order-2",
  tempVisitBrickOrderLocations: "order-3",
  /** Full-width row below availability + booking (tablet/desktop). */
  tempVisitBrickLocationsFull: "w-full min-w-0 md:col-span-12 md:self-start md:min-h-0",

  card: `rounded-2xl bg-[linear-gradient(165deg,rgba(255,255,255,0.99)_0%,rgba(250,253,253,0.96)_100%)] ${shadowCard} ring-1 ring-slate-200/55 backdrop-blur-[3px]`,
  cardMuted: `rounded-2xl bg-[linear-gradient(155deg,rgba(255,255,255,0.94)_0%,rgba(244,251,251,0.9)_100%)] ${shadowSoft} ring-1 ring-slate-200/45`,

  cta: `${gradientCta} text-white font-semibold transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]`,

  ctaIcon: `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${gradientCta} text-white ${shadowSoft} transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]`,

  chip:
    "inline-flex rounded-lg bg-[linear-gradient(145deg,#ecfdf5_0%,#dcfce8_55%,#ccfbf1_100%)] px-3 py-1.5 text-sm font-semibold text-[#115E59] ring-1 ring-[#6ee7b7]/55 transition-colors duration-200 hover:bg-[linear-gradient(145deg,#d1fae5_0%,#ccfbf1_60%,#bbf7f0_100%)]",

  link: "text-sm font-semibold text-[#0F766E] underline decoration-[#99F6E4] decoration-2 underline-offset-[3px] transition-colors duration-200 hover:text-[#115E59] hover:decoration-[#5EEAD4]",

  labelEyebrow:
    "text-xs font-semibold uppercase tracking-[0.12em] text-[#334155]",

  labelEyebrowSm:
    "text-[10px] font-medium uppercase tracking-[0.14em] text-[#64748B]",

  /** Long availability title (sentence case EN / RTL AR). */
  availabilityCardHeading:
    "text-[11px] font-semibold leading-snug tracking-normal text-[#64748B] sm:text-[13px]",

  labelAccent:
    "text-xs font-semibold uppercase tracking-[0.12em] text-[#0F766E]",

  h1: "text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl",
  h2: "text-xl font-bold tracking-tight text-[#0F172A]",
  h3: "text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl",
  h3Sub: "text-lg font-bold tracking-tight text-[#0F172A]",

  body: "text-base font-normal leading-[1.7] text-[#475569]",
  bodyLead: "text-lg font-normal leading-[1.65] text-[#475569]",
  bodySm: "text-sm font-normal leading-[1.65] text-[#475569]",

  bodyEmphasis: "text-base font-medium leading-[1.65] text-[#334155]",

  availabilityDate:
    "text-base font-semibold leading-snug tracking-tight text-[#0F172A] sm:text-lg",

  availabilityFallback:
    "text-sm font-normal leading-relaxed text-[#475569]",

  phoneDisplay:
    "text-xl font-bold tabular-nums tracking-tight text-[#0F172A] sm:text-2xl",

  bookingLead:
    "text-base font-normal leading-relaxed text-[#334155] sm:text-[1.05rem] sm:leading-[1.65]",

  bookingContactPanel:
    "rounded-xl bg-[linear-gradient(135deg,rgba(236,253,245,0.95)_0%,#ffffff_48%,rgba(240,251,251,0.92)_100%)] p-3.5 sm:p-4 ring-1 ring-[#86efac]/55 shadow-[0_8px_28px_-14px_rgba(13,148,136,0.14)]",

  locationTitle: "text-base font-semibold leading-snug text-[#0F172A]",

  mapEmbed:
    "aspect-[16/10] w-full overflow-hidden rounded-xl bg-[linear-gradient(180deg,#f1f9fa_0%,#e8f4f6_100%)] ring-1 ring-slate-200/60",

  hero: `relative aspect-[1200/630] w-full overflow-hidden rounded-xl bg-[linear-gradient(160deg,#e8f3f7_0%,#dfeef3_45%,#d4e8ee_100%)] ring-1 ring-slate-200/50 ${shadowCard}`,

  contentImage: `relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[linear-gradient(155deg,#f0f7f9_0%,#e5f2f5_100%)] ring-1 ring-slate-200/55 ${shadowSoft}`,

  langToggleWrap: `inline-flex rounded-full bg-[linear-gradient(180deg,#ffffff_0%,#f3fbfb_100%)] p-1 ${shadowSoft} ring-1 ring-[#ccefe8]/75`,
  langToggleBtn:
    "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]",
  langToggleActive: `${gradientCta} text-white shadow-sm`,
  langToggleInactive: "text-[#475569] hover:text-[#0F172A]",

  header: "border-b border-slate-200/60 pb-10",
  footer: "text-sm leading-relaxed text-[#64748B]",
  footerLink:
    "font-semibold text-[#0F766E] underline-offset-4 transition-colors duration-200 hover:text-[#115E59] hover:underline",

  scheduleAccent: `hidden w-1 shrink-0 self-stretch rounded-full ${gradientCta} sm:block`,
  scheduleDate: "text-sm font-bold text-[#0F172A]",
  scheduleMeta: "text-sm font-medium text-[#475569]",
} as const;
