import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-center dark:bg-zinc-950">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        This promotion is not available
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-600 dark:text-zinc-300">
        The link may be incorrect, or the advertisement may have ended. Please
        contact the clinic directly if you need assistance.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
      >
        View active advertisements
      </Link>
    </main>
  );
}
