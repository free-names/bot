/* src/diff.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import type { Pull } from "./github.ts";

// Splits a poll result into PRs to announce and tracked PRs that just closed
export function diffPulls(
  recent: Pull[],
  lastSeen: number,
  trackedNumbers: string[],
) {
  const opened = recent
    .filter((pull) => pull.number > lastSeen && pull.state === "open")
    .sort((first, second) => first.number - second.number);

  const finished = recent.filter((pull) =>
    pull.state === "closed" && trackedNumbers.includes(String(pull.number))
  );

  const newest = Math.max(
    lastSeen,
    ...recent.map((pull) => pull.number),
  );

  return {
    opened,
    finished,
    newest,
  };
}
