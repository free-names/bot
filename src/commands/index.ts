/* src/commands/index.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import * as dms from "./dms.ts";
import * as pr from "./pr.ts";

// Add new command files here
export const commands = new Map(
  [dms, pr].map((command) => [command.data.name, command]),
);
