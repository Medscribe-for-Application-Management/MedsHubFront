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

/**
 * Responsive type (clamp): smooth between phone and tablet widths — keeps the
 * 5-column brick legible without jumps at sm/md. vw tracks viewport; rem caps readability.
 */
const fzAvailTitle =
  "text-[clamp(0.6875rem,0.42rem_+_1.35vw,0.8125rem)]";
const fzAvailDate =
  "text-[clamp(0.8125rem,0.62rem_+_1.05vw,1.125rem)]";
const fzAvailFallback =
  "text-[clamp(0.75rem,0.62rem_+_0.65vw,0.875rem)]";
const fzBrickClinicTitle =
  "text-[clamp(0.8125rem,0.54rem_+_1.35vw,1.125rem)]";
const fzBookingLead =
  "text-[clamp(0.8125rem,0.72rem_+_0.5vw,1.0625rem)]";
const fzBookingH =
  "text-[clamp(1.0625rem,0.86rem_+_1vw,1.25rem)]";
const fzPhone =
  "text-[clamp(1rem,0.78rem_+_1.35vw,1.5rem)]";
const fzEyebrowSm =
  "text-[clamp(0.6875rem,0.58rem_+_0.35vw,0.75rem)]";
const fzLocationsH =
  "text-[clamp(1rem,0.82rem_+_0.85vw,1.125rem)]";
const fzLocationLine =
  "text-[clamp(0.875rem,0.78rem_+_0.4vw,1rem)]";
const fzH1 =
  "text-[clamp(1.5rem,1.05rem_+_2.4vw,2.25rem)]";
const fzBodyLead =
  "text-[clamp(1rem,0.92rem_+_0.35vw,1.125rem)]";
const fzH3Bio =
  "text-[clamp(1.25rem,1.02rem_+_1.1vw,1.875rem)]";
/** Secondary section titles (e.g. clinic card) — mirrors former text-lg → sm:text-xl. */
const fzH3Sub =
  "text-[clamp(1.125rem,1.03rem_+_0.5vw,1.3125rem)]";
const fzBodySmFluid =
  "text-[clamp(0.8125rem,0.76rem_+_0.25vw,0.875rem)]";
const fzBodyEmphasisFluid =
  "text-[clamp(0.875rem,0.8rem_+_0.35vw,1rem)]";
const fzLabelAccent =
  "text-[clamp(0.6875rem,0.58rem_+_0.35vw,0.75rem)]";

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
    `overflow-hidden rounded-xl ${shadowSoft} ring-1 ring-teal-200/55 mb-0`,
  availabilityInner:
    "relative flex min-h-0 flex-1 flex-col justify-center px-3 py-3 sm:px-5 sm:py-4",

  /** Fills half of the stacked column when clinic + availability share a cell. */
  tempVisitBrickStackSlot: "flex min-h-0 flex-1 flex-col",

  tempVisitBrickClinicRow:
    "flex min-h-0 w-full min-w-0 shrink-0 items-center gap-3 sm:gap-4 px-3 py-3 sm:px-5 sm:py-4",

  /** temp_visit CTA band: 12-col brick at all breakpoints (mobile + md+). */
  tempVisitBrickGrid:
    "grid w-full min-h-0 grid-cols-12 items-stretch gap-x-3 gap-y-4 sm:gap-x-5 sm:gap-y-5",
  /** Left column shell (grid spans are composed in JSX for clinic strip breakouts). */
  tempVisitBrickAvailabilityCol:
    "flex min-h-0 h-full w-full min-w-0 flex-col gap-3 sm:gap-4",

  /** Full-width clinic strip on phones; narrows with availability column from md+. */
  tempVisitBrickClinicStripPlacement:
    "order-1 col-span-12 row-start-1 min-w-0 md:col-span-5",

  /** Availability under clinic (row 2 on mobile) / below clinic on desktop. */
  tempVisitBrickAvailabilityPlacementWithClinic:
    "order-2 col-span-5 row-start-2 md:col-span-5 md:row-start-2",

  /** Availability only: shares top row with booking. */
  tempVisitBrickAvailabilityPlacementSolo:
    "order-1 col-span-5 md:col-span-5",

  /** Booking shares row with availability on mobile when clinic is full-width above. */
  tempVisitBrickBookingPlacementWithClinic:
    "order-3 col-span-7 row-start-2 md:col-span-7 md:row-start-1 md:row-span-2",

  /** Booking beside availability when there is no clinic strip. */
  tempVisitBrickBookingPlacementSolo: "order-2 col-span-7",

  /** Tighter inset for booking / locations tiles in temp_visit CTA brick. */
  tempVisitBrickCardInset: "p-3 sm:p-4 md:p-6",

  /** Extra horizontal inset inside pageBleed so title/gallery align with brick card body copy. */
  tempVisitBandTextPadX: "px-3 sm:px-5 md:px-6",

  /** Locations card title (temp_visit): readable vs faint labelEyebrowSm. */
  tempVisitLocationsHeading: `font-bold leading-tight tracking-tight text-[#0F172A] ${fzLocationsH}`,

  /** Narrow-column clinic name in hero CTA brick (not full-width clinic card). */
  tempVisitBrickClinicTitle: `min-w-0 flex-1 break-words font-bold leading-snug tracking-tight text-[#0F172A] ${fzBrickClinicTitle}`,

  compactGap: "gap-3 sm:gap-4 lg:gap-5",
  tempVisitBrickMain: "flex h-full min-h-0 w-full min-w-0 flex-col",

  /** Locations row sits after clinic + booking + avail; order shifts when clinic strip is its own grid cell. */
  tempVisitBrickOrderLocations: "order-3",
  tempVisitBrickOrderLocationsBelowClinic: "order-4",
  /** Full-width row below availability + booking */
  tempVisitBrickLocationsFull:
    "col-span-12 w-full min-h-0 min-w-0 self-start",

  card: `rounded-2xl bg-[linear-gradient(165deg,rgba(255,255,255,0.99)_0%,rgba(250,253,253,0.96)_100%)] ${shadowCard} ring-1 ring-slate-200/55 backdrop-blur-[3px]`,
  cardMuted: `rounded-2xl bg-[linear-gradient(155deg,rgba(255,255,255,0.94)_0%,rgba(244,251,251,0.9)_100%)] ${shadowSoft} ring-1 ring-slate-200/45`,

  cta: `${gradientCta} text-white font-semibold transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]`,

  ctaIcon: `inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${gradientCta} text-white ${shadowSoft} transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]`,

  chip:
    "inline-flex rounded-lg bg-[linear-gradient(145deg,#ecfdf5_0%,#dcfce8_55%,#ccfbf1_100%)] px-3 py-1.5 text-sm font-semibold text-[#115E59] ring-1 ring-[#6ee7b7]/55 transition-colors duration-200 hover:bg-[linear-gradient(145deg,#d1fae5_0%,#ccfbf1_60%,#bbf7f0_100%)]",

  link: "text-sm font-semibold text-[#0F766E] underline decoration-[#99F6E4] decoration-2 underline-offset-[3px] transition-colors duration-200 hover:text-[#115E59] hover:decoration-[#5EEAD4]",

  labelEyebrow:
    "text-xs font-semibold uppercase tracking-[0.12em] text-[#334155]",

  labelEyebrowSm: `font-medium uppercase tracking-[0.14em] text-[#64748B] ${fzEyebrowSm}`,

  /** Long availability title (sentence case EN / RTL AR). */
  availabilityCardHeading: `font-semibold leading-snug tracking-normal text-[#64748B] ${fzAvailTitle}`,

  labelAccent: `font-semibold uppercase tracking-[0.12em] text-[#0F766E] ${fzLabelAccent}`,

  h1: `font-extrabold tracking-tight text-[#0F172A] leading-[1.24] ${fzH1}`,
  h2: `font-bold tracking-tight text-[#0F172A] leading-snug ${fzBookingH}`,
  h3: `font-bold tracking-tight text-[#0F172A] leading-snug ${fzH3Bio}`,
  h3Sub: `font-bold tracking-tight text-[#0F172A] leading-snug ${fzH3Sub}`,

  body: "text-base font-normal leading-[1.7] text-[#475569]",
  bodyLead: `font-normal leading-[1.65] text-[#475569] ${fzBodyLead}`,

  bodySm: `font-normal leading-[1.65] text-[#475569] ${fzBodySmFluid}`,

  bodyEmphasis: `font-medium leading-[1.65] text-[#334155] ${fzBodyEmphasisFluid}`,

  availabilityDate: `font-semibold leading-snug tracking-tight text-[#0F172A] ${fzAvailDate}`,

  availabilityFallback: `font-normal leading-relaxed text-[#475569] ${fzAvailFallback}`,

  phoneDisplay: `font-bold tabular-nums tracking-tight text-[#0F172A] ${fzPhone}`,

  bookingLead: `font-normal leading-relaxed text-[#334155] ${fzBookingLead}`,

  bookingContactPanel:
    "rounded-xl bg-[linear-gradient(135deg,rgba(236,253,245,0.95)_0%,#ffffff_48%,rgba(240,251,251,0.92)_100%)] p-3 sm:p-3.5 md:p-4 ring-1 ring-[#86efac]/55 shadow-[0_8px_28px_-14px_rgba(13,148,136,0.14)]",

  locationTitle: `font-semibold leading-snug text-[#0F172A] ${fzLocationLine}`,

  mapEmbed:
    "aspect-[16/10] w-full overflow-hidden rounded-xl bg-[linear-gradient(180deg,#f1f9fa_0%,#e8f4f6_100%)] ring-1 ring-slate-200/60",

  hero: `relative aspect-[1200/630] w-full overflow-hidden rounded-xl bg-[linear-gradient(160deg,#e8f3f7_0%,#dfeef3_45%,#d4e8ee_100%)] ring-1 ring-slate-200/50 ${shadowCard}`,

  contentImage: `relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[linear-gradient(155deg,#f0f7f9_0%,#e5f2f5_100%)] ring-1 ring-slate-200/55 ${shadowSoft}`,

  langToggleWrap: `inline-flex rounded-full bg-[linear-gradient(180deg,#ffffff_0%,#f3fbfb_100%)] p-1 ${shadowSoft} ring-1 ring-[#ccefe8]/75`,
  langToggleBtn:
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] sm:px-4 sm:py-2 sm:text-sm",
  langToggleActive: `${gradientCta} text-white shadow-sm`,
  langToggleInactive: "text-[#475569] hover:text-[#0F172A]",

  header: "border-b border-slate-200/60 pb-6 sm:pb-8 md:pb-10",
  footer: "text-sm leading-relaxed text-[#64748B]",
  footerLink:
    "font-semibold text-[#0F766E] underline-offset-4 transition-colors duration-200 hover:text-[#115E59] hover:underline",

  scheduleAccent: `hidden w-1 shrink-0 self-stretch rounded-full ${gradientCta} sm:block`,
  scheduleDate: "text-sm font-bold text-[#0F172A]",
  scheduleMeta: "text-sm font-medium text-[#475569]",
} as const;
