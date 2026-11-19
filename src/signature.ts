/* src/signature.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

const encoder = new TextEncoder();

// Checks GitHub's X-Hub-Signature-256 header ("sha256=<hex>") against the raw body
export async function verifySignature(
  secret: string,
  body: string,
  header: string | null,
) {
  const hex = header?.match(/^sha256=([0-9a-f]{64})$/)?.[1];
  if (!hex) return false;

  const signature = new Uint8Array(
    hex.match(/../g)!.map((pair) => parseInt(pair, 16)),
  );

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["verify"],
  );

  // subtle.verify compares in constant time
  return await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(body),
  );
}
