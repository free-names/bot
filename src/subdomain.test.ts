/* src/subdomain.test.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import { assertEquals } from "@std/assert";
import { isReserved, singleLetters, validSubdomain } from "./subdomain.ts";

Deno.test("accepts names the repos accept", () => {
  for (const name of ["a", "7", "ari", "my-site", "blog.ari", "_dmarc.ari"]) {
    assertEquals(validSubdomain(name), true, name);
  }
});

Deno.test("rejects names the repos reject", () => {
  for (
    const name of [
      "",
      "Ari",
      "-ari",
      "ari-",
      "a--b",
      "a..b",
      "../package",
      "a/b",
      "a b",
    ]
  ) {
    assertEquals(validSubdomain(name), false, name);
  }
});

Deno.test("reserved names and names nested under them", () => {
  const reservedNames = [
    "www",
    "m",
  ];

  assertEquals(isReserved("www", reservedNames), true);
  assertEquals(isReserved("ari.www", reservedNames), true);
  assertEquals(isReserved("wwwari", reservedNames), false);
  assertEquals(isReserved("ari", reservedNames), false);
});

Deno.test("splits single characters into taken, reserved and free", () => {
  const result = singleLetters(
    [
      "a.json",
      "ari.json",
      "j.json",
      "7.json",
    ],
    [
      "_",
      "m",
      "mail",
    ],
  );

  assertEquals(result.taken, ["a", "j", "7"]);
  assertEquals(result.reserved, ["m"]);
  assertEquals(result.free.length, 36 - 4);
  assertEquals(result.free.includes("b"), true);
  assertEquals(result.free.includes("0"), true);
});
