import Link from "next/link";
import { listAdvertisements } from "@/lib/api/advertisements";
import { getEnv } from "@/lib/env";

export default async function HomePage() {
  const ads = await listAdvertisements({ limit: 50, offset: 0 });
  const { siteUrl } = getEnv();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Active advertisements
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-300">
        Shareable landing pages for consultants. Public URLs use{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800">
          /ads/&lt;id&gt;
        </code>
        . Site URL for metadata:{" "}
        <span className="font-mono text-sm">{siteUrl}</span>
      </p>
      <ul className="mt-10 divide-y divide-zinc-200 dark:divide-zinc-800">
        {ads.length === 0 ? (
          <li className="py-6 text-zinc-600 dark:text-zinc-300">
            No active advertisements. When the API returns items on{" "}
            <code className="rounded bg-zinc-100 px-1 text-sm dark:bg-zinc-800">
              GET /advertisement
            </code>
            , they will appear here.
          </li>
        ) : (
          ads.map((ad) => (
            <li key={ad.id} className="py-6">
              <Link
                href={`/ads/${ad.id}`}
                className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              >
                <h2 className="text-xl font-semibold text-teal-800 group-hover:underline dark:text-teal-300">
                  {ad.engTitle}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {ad.clinic.engTitle} · {ad.consultant.engName}
                </p>
                <p className="mt-2 line-clamp-2 text-zinc-700 dark:text-zinc-200">
                  {ad.engExcerpt}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
