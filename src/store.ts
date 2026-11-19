/* src/store.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import { loadJp } from "./config.ts";

export type MessageRef = {
  channelId: string;
  messageId: string;
};

export type TrackedPull = {
  messages: MessageRef[];
};

export type RepoState = {
  open: Record<string, TrackedPull>;
};

// [users] section: userId -> true when opted into DMs
export const prefs = await loadJp("data/prefs.jp", true);

// One section per domain, e.g. [meowed-at.me]
export const pulls = await loadJp("data/pulls.jp", true);

export function wantsDms(userId: string) {
  return prefs.section("users", { create: true })[userId] === true;
}

export async function setDms(userId: string, enabled: boolean) {
  const users = prefs.section("users", { create: true });

  if (enabled) {
    users[userId] = true;
  } else {
    delete users[userId];
  }

  await prefs.save();
}

export function optedInUsers() {
  return Object.keys(prefs.section("users", { create: true }));
}

export function repoState(repo: string): RepoState {
  const section = pulls.section(repo, { create: true });

  section.open ??= {};

  return section as RepoState;
}

export async function trackMessage(
  repo: string,
  number: number,
  ref: MessageRef,
) {
  const state = repoState(repo);
  const tracked = state.open[number] ??= { messages: [] };

  tracked.messages.push(ref);
  await pulls.save();
}
