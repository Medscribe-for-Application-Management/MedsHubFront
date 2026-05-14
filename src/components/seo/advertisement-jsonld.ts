import type { AdvertisementAggregate } from "@/lib/api/advertisement-schema";
import { getEnv } from "@/lib/env";

function pickAddress(loc: AdvertisementAggregate["locations"][number]): string {
  return loc.engAddress || loc.arAddress || "";
}

export function buildAdvertisementJsonLd(
  ad: AdvertisementAggregate,
  pagePath: string,
): Record<string, unknown>[] {
  const { siteUrl } = getEnv();
  const pageUrl = `${siteUrl}${pagePath}`;

  const consultantName = `${ad.consultant.engName}`.trim();
  const clinicName = ad.clinic.engTitle;

  const images =
    ad.consultant.images?.map((img) => img.imageUrl).filter(Boolean) ?? [];

  const sameAs: string[] = [];
  if (ad.consultant.waNum) {
    const digits = ad.consultant.waNum.replace(/\D/g, "");
    if (digits) sameAs.push(`https://wa.me/${digits}`);
  }

  const spec =
    ad.consultant.engSpeciality ?? ad.consultant.arSpeciality ?? undefined;
  const physician: Record<string, unknown> = {
    "@type": "Physician",
    "@id": `${pageUrl}#physician`,
    name: consultantName,
    ...(spec ? { medicalSpecialty: spec } : {}),
    image: images.length ? images : undefined,
    worksFor: { "@id": `${pageUrl}#clinic` },
    ...(sameAs.length ? { sameAs } : {}),
  };

  const addresses = ad.locations
    .map((loc) => {
      const line = pickAddress(loc);
      if (!line) return null;
      return {
        "@type": "PostalAddress" as const,
        streetAddress: line,
      };
    })
    .filter(Boolean);

  const medicalClinic: Record<string, unknown> = {
    "@type": "MedicalClinic",
    "@id": `${pageUrl}#clinic`,
    name: clinicName,
    url: pageUrl,
    ...(ad.clinic.logo ? { image: ad.clinic.logo } : {}),
    ...(addresses.length
      ? { address: addresses.length === 1 ? addresses[0] : addresses }
      : {}),
  };

  const breadcrumbs: Record<string, unknown> = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Advertisements",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: consultantName,
        item: pageUrl,
      },
    ],
  };

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: ad.engTitle,
    description: ad.engExcerpt,
    inLanguage: ["en", "ar"],
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Clinic advertisements",
      url: siteUrl,
    },
    about: { "@id": `${pageUrl}#physician` },
    mainEntity: { "@id": `${pageUrl}#physician` },
  };

  return [
    { "@context": "https://schema.org", ...webPage },
    { "@context": "https://schema.org", ...medicalClinic },
    { "@context": "https://schema.org", ...physician },
    { "@context": "https://schema.org", ...breadcrumbs },
  ];
}
