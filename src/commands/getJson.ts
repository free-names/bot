/* src/commands/getJson.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { card, colors } from "../card.ts";
import { config } from "../config.ts";
import { getRepoJson } from "../github.ts";
import { validSubdomain } from "../subdomain.ts";
import { domainOption, subdomainOption } from "./domainOption.ts";

export const data = new SlashCommandBuilder()
  .setName("get-json")
  .setDescription("Show a subdomain's JSON file")
  .addStringOption(domainOption)
  .addStringOption(subdomainOption);

export async function execute(interaction: ChatInputCommandInteraction) {
  const domain = interaction.options.getString("domain", true);
  const subdomain = interaction.options.getString("subdomain", true)
    .trim()
    .toLowerCase();
  const fullName = `${subdomain}.${domain}`;

  // Also stops path tricks like "../package" reaching the GitHub API
  if (!validSubdomain(subdomain)) {
    await interaction.reply(
      card(`**${fullName}** isn't a valid name.`, {
        color: colors.red,
        ephemeral: true,
      }),
    );
    return;
  }

  const path = `domains/${subdomain}.json`;
  const file = await getRepoJson(domain, path);

  if (!file) {
    await interaction.reply(
      card(
        `**${fullName}** isn't registered. Try \`/check\` to see if it's free.`,
        {
          color: colors.grey,
          ephemeral: true,
        },
      ),
    );
    return;
  }

  const url =
    `https://github.com/${config.org}/${config.domains[domain]}/blob/main/${path}`;

  // Text displays hold 4000 characters, leave room for the heading
  const json = JSON.stringify(file, null, 2).slice(0, 3800);

  await interaction.reply(
    card(
      [
        `### [${fullName}](${url})`,
        "```json",
        json,
        "```",
      ].join("\n"),
      { color: colors.green },
    ),
  );
}
