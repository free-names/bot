/* src/signature.test.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import { assertEquals } from "@std/assert";
import { verifySignature } from "./signature.ts";

// Example from GitHub's webhook docs
const secret = "It's a Secret to Everybody";
const body = "Hello, World!";
const header =
  "sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17";

Deno.test("accepts GitHub's signature", async () => {
  assertEquals(await verifySignature(secret, body, header), true);
});

Deno.test("rejects a changed body", async () => {
  assertEquals(await verifySignature(secret, "Hello, World?", header), false);
});

Deno.test("rejects the wrong secret", async () => {
  assertEquals(await verifySignature("nope", body, header), false);
});

Deno.test("rejects missing or malformed headers", async () => {
  assertEquals(await verifySignature(secret, body, null), false);
  assertEquals(await verifySignature(secret, body, "sha1=abc"), false);
  assertEquals(await verifySignature(secret, body, "sha256=zz"), false);
});
