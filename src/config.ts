/* src/config.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import { JPConfig } from "jpcl-lang";

const file = await JPConfig.load("data/config.jp");

function need(path: string) {
  const value = file.getPath(path);

  if (value === undefined || value === null || value === "") {
    throw new Error(`data/config.jp is missing ${path}`);
  }

  return value;
}

function env(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`${name} is missing from .env`);
  }

  return value;
}

// IDs go through String() so unquoted snowflakes (parsed as bigint) still work
export const config = {
  discordToken: env("DISCORD_TOKEN"),
  githubToken: env("GITHUB_TOKEN"),
  org: String(need("github.org")),
  // domain -> repo name, since a repo can't always be named after its domain
  domains: Object.fromEntries(
    Object.entries(need("github.domains") as Record<string, unknown>)
      .map(([domain, repo]) => [domain, String(repo)]),
  ) as Record<string, string>,
  pollSeconds: Number(file.getPath("github.pollSeconds", 60)),
  guildId: String(need("discord.guildId")),
  channelId: String(need("discord.channelId")),
  dmRoleId: String(need("discord.dmRoleId")),
};
