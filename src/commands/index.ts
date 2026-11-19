/* src/commands/index.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import * as check from "./check.ts";
import * as dms from "./dms.ts";
import * as getJson from "./getJson.ts";
import * as pr from "./pr.ts";
import * as singleLetters from "./singleLetters.ts";

// Add new command files here
export const commands = new Map(
  [
    check,
    dms,
    getJson,
    pr,
    singleLetters,
  ].map((command) => [command.data.name, command]),
);
