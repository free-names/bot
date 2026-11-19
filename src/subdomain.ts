/* src/subdomain.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

// Same rules as the domain repos' tests/json.test.js: lowercase labels, no "--"
const labelPattern = /^[_a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function validSubdomain(name: string) {
  return name.length <= 200 &&
    !name.includes("--") &&
    name.split(".").every((label) => labelPattern.test(label));
}

// Reserved itself, or nested under a reserved name ("x.www")
export function isReserved(name: string, reservedNames: string[]) {
  return reservedNames.includes(name) ||
    reservedNames.some((reserved) => name.endsWith(`.${reserved}`));
}

// Every one-character name the hostname rule allows ("_" is always reserved)
const characters = [..."abcdefghijklmnopqrstuvwxyz0123456789"];

// fileNames: the domains/ folder, e.g. ["a.json", "ari.json"]
export function singleLetters(fileNames: string[], reservedNames: string[]) {
  const registered = new Set(
    fileNames.map((name) => name.replace(/\.json$/, "")),
  );

  const taken = characters.filter((character) => registered.has(character));
  const reserved = characters.filter((character) =>
    !registered.has(character) && reservedNames.includes(character)
  );
  const free = characters.filter((character) =>
    !registered.has(character) && !reservedNames.includes(character)
  );

  return {
    free,
    taken,
    reserved,
  };
}
