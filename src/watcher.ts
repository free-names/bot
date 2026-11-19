/* src/watcher.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import type { Client } from "discord.js";
import { config } from "./config.ts";
import { diffPulls } from "./diff.ts";
import { type Pull, recentPulls } from "./github.ts";
import { pullMessage } from "./pullMessage.ts";
import {
  type MessageRef,
  optedInUsers,
  pulls,
  repoState,
} from "./store.ts";

async function announce(client: Client, repo: string, pull: Pull) {
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
      console.warn(`Could not DM ${userId}:`, error);
    }
  }

  repoState(repo).open[pull.number] = {
    messages: refs,
  };
}

export async function editEverywhere(
  client: Client,
  repo: string,
  pull: Pull,
  refs: MessageRef[],
) {
  const payload = pullMessage(repo, pull);

  for (const ref of refs) {
    try {
      const channel = await client.channels.fetch(ref.channelId);

      if (channel?.isTextBased()) {
        await channel.messages.edit(ref.messageId, payload);
      }
    } catch (error) {
      console.warn(`Could not edit ${ref.messageId}:`, error);
    }
  }
}

async function pollRepo(client: Client, repo: string) {
  const state = repoState(repo);
  const recent = await recentPulls(repo);
  const firstRun = state.lastSeen === 0;

  const { opened, finished, newest } = diffPulls(
    recent,
    state.lastSeen,
    Object.keys(state.open),
  );

  // First run only records where we are, so old PRs are not spammed
  if (!firstRun) {
    for (const pull of opened) {
      await announce(client, repo, pull);
    }
  }

  // shortcut: a reopened PR is not re-tracked, add that if reopening is common
  for (const pull of finished) {
    await editEverywhere(
      client,
      repo,
      pull,
      state.open[pull.number].messages,
    );

    delete state.open[pull.number];
  }

  state.lastSeen = newest;
  await pulls.save();
}

export function startWatcher(client: Client) {
  const tick = async () => {
    for (const repo of Object.keys(config.domains)) {
      try {
        await pollRepo(client, repo);
      } catch (error) {
        console.error(`Polling ${repo} failed:`, error);
      }
    }

    setTimeout(tick, config.pollSeconds * 1000);
  };

  tick();
}
