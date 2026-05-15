/**
 * Premium temp_visit ad page design tokens (Tailwind class fragments).
 * Styling only — use when `ad.adType === "temp_visit"`.
 */

const gradientCta = "bg-gradient-to-r from-[#0F766E] to-[#0D9488]";
const shadowCard =
  "shadow-[0_12px_40px_-12px_rgba(15,23,42,0.08)]";
const shadowSoft = "shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)]";

export const TV_PREMIUM = {
  main:
    "min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-[#F0F9FF] text-[#0F172A] font-normal antialiased",

  pageBleed: "-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8",

  bandIntro:
    "bg-gradient-to-br from-white via-[#F8FAFC] to-[#F0F9FF] py-8 sm:py-10",
  bandCta:
    "bg-gradient-to-b from-[#F0F9FF] via-[#ECFEFF]/60 to-white py-8 sm:py-12",
  bandContent: "bg-white py-10 sm:py-12 shadow-[inset_0_1px_0_0_rgba(226,232,240,0.8)]",
  bandAbout:
    "bg-gradient-to-b from-white via-[#F8FAFC] to-[#F0F9FF]/40 py-10 sm:py-14",
  bandFooter:
    "bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0]/30 border-t border-slate-200/80 py-8 sm:py-10",

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
    "bg-gradient-to-b from-white/90 to-[#F0F9FF]/80 ring-1 ring-[#CCFBF1]/50",
  sectionMuted:
    "bg-white/70 ring-1 ring-slate-200/50 backdrop-blur-[2px]",

  availabilitySection:
    `mb-5 overflow-hidden rounded-xl ${shadowSoft} ring-1 ring-[#CCFBF1]/40`,
  availabilityInner: "relative px-5 py-4 sm:px-6 sm:py-5",

  card: `rounded-2xl bg-white/95 ${shadowCard} ring-1 ring-slate-200/60 backdrop-blur-[2px]`,
  cardMuted: `rounded-2xl bg-white/80 ${shadowSoft} ring-1 ring-slate-200/50`,

  cta: `${gradientCta} text-white font-semibold transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]`,

  ctaIcon: `inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${gradientCta} text-white ${shadowSoft} transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]`,

  chip:
    "inline-flex rounded-lg bg-[#ECFDF5] px-3 py-1.5 text-sm font-semibold text-[#115E59] ring-1 ring-[#99F6E4]/50 transition-colors duration-200 hover:bg-[#D1FAE5]",

  link: "text-sm font-semibold text-[#0F766E] underline decoration-[#99F6E4] decoration-2 underline-offset-[3px] transition-colors duration-200 hover:text-[#115E59] hover:decoration-[#5EEAD4]",

  labelEyebrow:
    "text-xs font-semibold uppercase tracking-[0.12em] text-[#334155]",

  labelEyebrowSm:
    "text-[10px] font-medium uppercase tracking-[0.14em] text-[#64748B]",

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
    "text-lg font-semibold leading-snug tracking-tight text-[#0F172A] sm:text-xl",

  availabilityFallback:
    "text-sm font-normal leading-relaxed text-[#475569]",

  phoneDisplay:
    "text-2xl font-bold tabular-nums tracking-tight text-[#0F172A] sm:text-3xl",

  locationTitle: "text-base font-semibold leading-snug text-[#0F172A]",

  mapEmbed:
    "aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#F8FAFC] ring-1 ring-slate-200/70",

  hero: `relative aspect-[1200/630] w-full overflow-hidden rounded-xl bg-[#F8FAFC] ring-1 ring-slate-200/70 ${shadowCard}`,

  contentImage: `relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F8FAFC] ring-1 ring-slate-200/70 ${shadowSoft}`,

  langToggleWrap: `inline-flex rounded-full bg-white p-1 ${shadowSoft} ring-1 ring-slate-200/80`,
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
