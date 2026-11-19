/* src/notify.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import type { Client } from "discord.js";
import { config } from "./config.ts";
import type { Pull } from "./github.ts";
import { log } from "./log.ts";
import { pullMessage } from "./pullMessage.ts";
import {
  type MessageRef,
  optedInUsers,
  pulls,
  repoState,
} from "./store.ts";

export async function announce(client: Client, repo: string, pull: Pull) {
  const payload = pullMessage(repo, pull);
  const refs: MessageRef[] = [];
  const guild = await client.guilds.fetch(config.guildId);

  for (const userId of optedInUsers()) {
    try {
      // Re-check the role so people who lost it stop getting DMs
      const member = await guild.members.fetch(userId);
      if (!member.roles.cache.has(config.dmRoleId)) continue;

      const message = await member.send(payload);

      refs.push({
        channelId: message.channelId,
        messageId: message.id,
      });
    } catch (error) {
      log.warn(`${repo} #${pull.number}: could not DM user ${userId}`, error);
    }
  }

  repoState(repo).open[pull.number] = {
    messages: refs,
  };

  await pulls.save();

  log.info(
    `${repo} #${pull.number} opened by ${pull.user.login}, DMed ${refs.length} people`,
  );
}

export async function editEverywhere(
  client: Client,
  repo: string,
  pull: Pull,
  refs: MessageRef[],
  action: string,
) {
  const payload = pullMessage(repo, pull);
  let edited = 0;

  for (const ref of refs) {
    try {
      const channel = await client.channels.fetch(ref.channelId);

      if (channel?.isTextBased()) {
        await channel.messages.edit(ref.messageId, payload);
        edited++;
      }
    } catch (error) {
      log.warn(
        `${repo} #${pull.number}: could not edit message ${ref.messageId}`,
        error,
      );
    }
  }

  const outcome = action === "closed"
    ? (pull.merged_at ? "merged" : "closed")
    : action;

  log.info(
    `${repo} #${pull.number} ${outcome}, edited ${edited}/${refs.length} messages`,
  );
}
