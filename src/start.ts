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
import { fail, log } from "./log.ts";
import { startWebhook } from "./webhook.ts";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (readyClient) => {
  log.info(`Logged in as ${readyClient.user.tag}`);

  try {
    // Guild commands show up instantly, unlike global ones
    const guild = await readyClient.guilds.fetch(config.guildId);

    await guild.commands.set(
      [...commands.values()].map((command) => command.data.toJSON()),
    );

    log.info(
      `Registered ${commands.size} commands in ${guild.name}: ${
        [...commands.keys()].map((name) => `/${name}`).join(", ")
      }`,
    );
  } catch (error) {
    fail(
      `Could not register commands in guild ${config.guildId}. Check discord.guildId and that the bot is in that server: ${error}`,
    );
  }

  startWebhook(readyClient);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  log.info(`${interaction.user.tag} ran ${interaction.toString()}`);

  try {
    await command.execute(interaction);
  } catch (error) {
    log.error(`/${interaction.commandName} failed`, error);

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

client.on(Events.Warn, (message) => log.warn(`discord.js: ${message}`));
client.on(Events.Error, (error) => log.error("discord.js error", error));

log.info("Connecting to Discord...");

await client.login(config.discordToken).catch((error) =>
  fail(`Discord login failed. Check DISCORD_TOKEN in .env: ${error.message}`)
);
