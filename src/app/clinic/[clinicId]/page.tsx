import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listAdvertisements } from "@/lib/api/advertisements";
import { getEnv } from "@/lib/env";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PageProps {
  params: Promise<{ clinicId: string }>;
}

export async function generateMetadata(
  props: PageProps,
): Promise<Metadata> {
  const { clinicId } = await props.params;
  if (!UUID_REGEX.test(clinicId)) {
    return { title: "Clinic not found", robots: { index: false, follow: false } };
  }

  let ads: Awaited<ReturnType<typeof listAdvertisements>> = [];
  try {
    ads = await listAdvertisements({ clinicId, limit: 50, offset: 0 });
  } catch {
    return { title: "Clinic ads", robots: { index: false, follow: false } };
  }

  const clinicTitle = ads[0]?.clinic.engTitle ?? "Clinic";
  const { siteUrl } = getEnv();
  const url = `${siteUrl}/clinic/${clinicId}`;

  return {
    title: `${clinicTitle} · Advertisements`,
    description: `Active consultant advertisements at ${clinicTitle}.`,
    alternates: { canonical: url },
    robots: { index: ads.length > 0, follow: true },
  };
}

export default async function ClinicAdsPage(props: PageProps) {
  const { clinicId } = await props.params;
  if (!UUID_REGEX.test(clinicId)) {
    notFound();
  }

  let ads: Awaited<ReturnType<typeof listAdvertisements>> = [];
  try {
    ads = await listAdvertisements({ clinicId, limit: 50, offset: 0 });
  } catch {
    notFound();
  }

  const clinicName = ads[0]?.clinic.engTitle ?? "Clinic";

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {clinicName}
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">
        Advertisements filtered with{" "}
        <code className="rounded bg-zinc-100 px-1 text-sm dark:bg-zinc-800">
          GET /advertisement?clinicId=
        </code>
        .
      </p>
      {ads.length === 0 ? (
        <p className="mt-10 text-zinc-600 dark:text-zinc-300">
          No active advertisements for this clinic right now.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-zinc-200 dark:divide-zinc-800">
          {ads.map((ad) => (
            <li key={ad.id} className="py-6">
              <Link
                href={`/ads/${ad.id}`}
                className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              >
                <h2 className="text-xl font-semibold text-teal-800 group-hover:underline dark:text-teal-300">
                  {ad.engTitle}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {ad.consultant.engName}
                </p>
                <p className="mt-2 line-clamp-2 text-zinc-700 dark:text-zinc-200">
                  {ad.engExcerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-10">
        <Link
          href="/"
          className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
        >
          All advertisements
        </Link>
      </p>
    </main>
  );
}
