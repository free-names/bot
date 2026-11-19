/* src/log.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

// No timestamps here: svlogd -tt adds them in deploy/log/run

function describe(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export const log = {
  info(message: string) {
    console.log(`INFO  ${message}`);
  },

  warn(message: string, error?: unknown) {
    const reason = error === undefined ? "" : `: ${describe(error)}`;
    console.warn(`WARN  ${message}${reason}`);
  },

  // Full stack, since errors here are bugs or outages worth digging into
  error(message: string, error?: unknown) {
    console.error(`ERROR ${message}`);

    if (error !== undefined) {
      console.error(error instanceof Error ? error.stack : error);
    }
  },
};

// For setup problems: one clear line, no stack trace, then stop
export function fail(message: string): never {
  console.error(`FATAL ${message}`);
  Deno.exit(1);
}
