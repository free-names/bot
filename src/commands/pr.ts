/* src/commands/pr.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "../config.ts";
import { getPull } from "../github.ts";
import { pullMessage } from "../pullMessage.ts";
import { trackMessage } from "../store.ts";

export const data = new SlashCommandBuilder()
  .setName("pr")
  .setDescription("Show a pull request for one of the domains")
  .addIntegerOption((option) =>
    option
      .setName("number")
      .setDescription("PR number")
      .setMinValue(1)
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("domain")
      .setDescription("Which domain")
      .setRequired(true)
      .addChoices(
        // Discord allows at most 25 choices
        ...Object.keys(config.domains).slice(0, 25).map((domain) => ({
          name: domain,
          value: domain,
        })),
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const number = interaction.options.getInteger("number", true);
  const domain = interaction.options.getString("domain", true);

  const pull = await getPull(domain, number);

  if (!pull) {
    await interaction.reply({
      content: `No PR #${number} in ${config.org}/${config.domains[domain]}.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const response = await interaction.reply({
    ...pullMessage(domain, pull),
    withResponse: true,
  });

  const message = response.resource?.message;

  // Open PRs get this reply edited too when they close
  if (message && pull.state === "open") {
    await trackMessage(domain, pull.number, {
      channelId: message.channelId,
      messageId: message.id,
    });
  }
}
