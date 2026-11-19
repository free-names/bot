/* src/commands/check.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { card, colors } from "../card.ts";
import { getRepoJson, getReservedNames } from "../github.ts";
import { isReserved, validSubdomain } from "../subdomain.ts";
import { domainOption, subdomainOption } from "./domainOption.ts";

export const data = new SlashCommandBuilder()
  .setName("check")
  .setDescription("Check if a subdomain is free")
  .addStringOption(domainOption)
  .addStringOption(subdomainOption);

export async function execute(interaction: ChatInputCommandInteraction) {
  const domain = interaction.options.getString("domain", true);
  const subdomain = interaction.options.getString("subdomain", true)
    .trim()
    .toLowerCase();
  const fullName = `${subdomain}.${domain}`;

  if (!validSubdomain(subdomain)) {
    await interaction.reply(
      card(
        `**${fullName}** isn't a valid name. Use letters, numbers, dots and single hyphens.`,
        {
          color: colors.red,
          ephemeral: true,
        },
      ),
    );
    return;
  }

  // Two GitHub calls can pass Discord's 3 second reply limit
  await interaction.deferReply();

  const [file, reservedNames] = await Promise.all([
    getRepoJson(domain, `domains/${subdomain}.json`),
    getReservedNames(domain),
  ]);

  if (file) {
    const owner = (file as { owner?: { username?: string } }).owner?.username;

    await interaction.editReply(
      card(
        `❌ **${fullName}** is taken${owner ? ` by **${owner}**` : ""}.`,
        { color: colors.red },
      ),
    );
    return;
  }

  if (isReserved(subdomain, reservedNames)) {
    await interaction.editReply(
      card(`🔒 **${fullName}** is reserved.`, { color: colors.yellow }),
    );
    return;
  }

  const singleNote = subdomain.length === 1
    ? "\n-# Each user can only register one single-character subdomain."
    : "";

  await interaction.editReply(
    card(`✅ **${fullName}** is free!${singleNote}`, { color: colors.green }),
  );
}
