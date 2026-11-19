/* src/commands/dms.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import {
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "../config.ts";
import { log } from "../log.ts";
import { setDms } from "../store.ts";

export const data = new SlashCommandBuilder()
  .setName("dms")
  .setDescription("Get a DM when a new PR is opened")
  .addBooleanOption((option) =>
    option
      .setName("enabled")
      .setDescription("Turn PR DMs on or off")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const enabled = interaction.options.getBoolean("enabled", true);

  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Use this inside the server.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Turning DMs off is always allowed, turning them on needs the role
  if (enabled && !interaction.member.roles.cache.has(config.dmRoleId)) {
    await interaction.reply({
      content: `You need <@&${config.dmRoleId}> to get PR DMs.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await setDms(interaction.user.id, enabled);

  log.info(
    `${interaction.user.tag} turned PR DMs ${enabled ? "on" : "off"}`,
  );

  await interaction.reply({
    content: enabled
      ? "PR DMs are on. Make sure your DMs from this server are open."
      : "PR DMs are off.",
    flags: MessageFlags.Ephemeral,
  });
}
