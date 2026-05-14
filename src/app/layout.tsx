import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { normalizeAbsoluteUrl } from "@/lib/normalize-absolute-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
});

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const defaultSiteUrl = rawSiteUrl
  ? normalizeAbsoluteUrl(rawSiteUrl)
  : "http://localhost:5173";

export const metadata: Metadata = {
  metadataBase: new URL(defaultSiteUrl.replace(/\/+$/, "")),
  title: {
    default: "Clinic advertisements",
    template: "%s · Libelus ClinHub",
  },
  description:
    "Public landing pages for consultant advertisements at partner clinics.",
  openGraph: {
    type: "website",
    siteName: "Libelus ClinHub",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoArabic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
