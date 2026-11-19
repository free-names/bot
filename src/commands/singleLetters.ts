/* src/commands/singleLetters.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { card, colors } from "../card.ts";
import { getReservedNames, listRepoFiles } from "../github.ts";
import { singleLetters } from "../subdomain.ts";
import { domainOption } from "./domainOption.ts";

export const data = new SlashCommandBuilder()
  .setName("single-letters")
  .setDescription("Show which single-character subdomains are free")
  .addStringOption(domainOption);

function codes(characters: string[]) {
  return characters.length
    ? characters.map((character) => `\`${character}\``).join(" ")
    : "none";
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const domain = interaction.options.getString("domain", true);

  // Two GitHub calls can pass Discord's 3 second reply limit
  await interaction.deferReply();

  const [fileNames, reservedNames] = await Promise.all([
    listRepoFiles(domain, "domains"),
    getReservedNames(domain),
  ]);

  const { free, taken, reserved } = singleLetters(fileNames, reservedNames);

  await interaction.editReply(
    card(
      [
        `### Single characters on ${domain}`,
        `**Free (${free.length}):** ${codes(free)}`,
        `**Taken (${taken.length}):** ${codes(taken)}`,
        `**Reserved (${reserved.length}):** ${codes(reserved)}`,
        "-# Each user can only register one single-character subdomain.",
      ].join("\n"),
      { color: colors.green },
    ),
  );
}
