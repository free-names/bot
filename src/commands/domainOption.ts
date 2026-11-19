/* src/commands/domainOption.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import type { SlashCommandStringOption } from "discord.js";
import { config } from "../config.ts";

// The required "domain" dropdown shared by every command
export function domainOption(option: SlashCommandStringOption) {
  return option
    .setName("domain")
    .setDescription("Which domain")
    .setRequired(true)
    .addChoices(
      // Discord allows at most 25 choices
      ...Object.keys(config.domains).slice(0, 25).map((domain) => ({
        name: domain,
        value: domain,
      })),
    );
}

// The required "subdomain" text box, e.g. "ari" for ari.meowed-at.me
export function subdomainOption(option: SlashCommandStringOption) {
  return option
    .setName("subdomain")
    .setDescription("Subdomain name, e.g. ari")
    .setMaxLength(200)
    .setRequired(true);
}
