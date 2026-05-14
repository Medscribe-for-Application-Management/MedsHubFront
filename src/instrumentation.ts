import { isLibelusDebugEnabled } from "@/lib/instrumentation/debug-libelus";

/**
 * Runs once per server process (Node). Edge proxy cannot import this file.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register(): Promise<void> {
  if (!isLibelusDebugEnabled()) return;

  console.log("[Libelus instrumentation] register()", {
    when: new Date().toISOString(),
    NODE_ENV: process.env.NODE_ENV,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    DEBUG_LIBELUS: process.env.DEBUG_LIBELUS,
  });
}
