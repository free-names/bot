/* src/diff.test.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import { assertEquals } from "@std/assert";
import { diffPulls } from "./diff.ts";
import type { Pull } from "./github.ts";

function fakePull(
  number: number,
  state: Pull["state"],
): Pull {
  return {
    number,
    state,
    title: `PR ${number}`,
    html_url: "",
    draft: false,
    merged_at: null,
    created_at: "2026-11-19T00:00:00Z",
    user: {
      login: "someone",
      avatar_url: "",
    },
  };
}

Deno.test("announces only new open PRs, oldest first", () => {
  const recent = [
    fakePull(12, "open"),
    fakePull(11, "open"),
    fakePull(10, "closed"),
    fakePull(9, "open"),
  ];

  const result = diffPulls(recent, 9, []);

  assertEquals(
    result.opened.map((pull) => pull.number),
    [11, 12],
  );
  assertEquals(result.newest, 12);
});

Deno.test("finds tracked PRs that closed", () => {
  const recent = [
    fakePull(8, "closed"),
    fakePull(7, "closed"),
    fakePull(6, "open"),
  ];

  const result = diffPulls(recent, 8, ["7", "6"]);

  assertEquals(
    result.finished.map((pull) => pull.number),
    [7],
  );
  assertEquals(result.opened, []);
  assertEquals(result.newest, 8);
});
