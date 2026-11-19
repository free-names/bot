/* src/start.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import { commands } from "./commands/index.ts";
import { config } from "./config.ts";
import { startWatcher } from "./watcher.ts";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (readyClient) => {
  // Guild commands show up instantly, unlike global ones
  const guild = await readyClient.guilds.fetch(config.guildId);

  await guild.commands.set(
    [...commands.values()].map((command) => command.data.toJSON()),
  );

  console.log(`Logged in as ${readyClient.user.tag}`);
  startWatcher(readyClient);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`/${interaction.commandName} failed:`, error);

    const reply = {
      content: "Something broke running that command.",
      flags: MessageFlags.Ephemeral,
    } as const;

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

await client.login(config.discordToken);
