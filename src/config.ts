/* src/config.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import { JPConfig } from "jpcl-lang";
import { fail } from "./log.ts";

// Loads a .jp file, or stops with a readable reason instead of a stack trace
export async function loadJp(path: string, missingOk = false) {
  try {
    return await JPConfig.load(path, { missingOk });
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") {
      fail(
        `${path} not found. Copy data/config.example.jp to ${path} and fill it in.`,
      );
    }

    // jpcl errors already point at the line and column
    fail(`${path} could not be read:\n${(error as Error).message}`);
  }
}

const file = await loadJp("data/config.jp");

function need(path: string) {
  const value = file.getPath(path);

  if (value === undefined || value === null || value === "") {
    fail(`data/config.jp is missing ${path}. See data/config.example.jp.`);
  }

  return value;
}

function env(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    fail(`${name} is missing from .env. See .env.example.`);
  }

  return value;
}

const domains = need("github.domains");

if (typeof domains !== "object" || Array.isArray(domains)) {
  fail(
    'github.domains in data/config.jp must be a map like { "is-a.wiki": "is-a-wiki" }.',
  );
}

// IDs go through String() so unquoted snowflakes (parsed as bigint) still work
export const config = {
  discordToken: env("DISCORD_TOKEN"),
  githubToken: env("GITHUB_TOKEN"),
  org: String(need("github.org")),
  // domain -> repo name, since a repo can't always be named after its domain
  domains: Object.fromEntries(
    Object.entries(domains as Record<string, unknown>)
      .map(([domain, repo]) => [domain, String(repo)]),
  ) as Record<string, string>,
  webhookPort: Number(file.getPath("webhook.port", 8787)),
  // GitHub webhook secret, checked against every request's signature
  webhookSecret: String(need("webhook.secret")),
  guildId: String(need("discord.guildId")),
  dmRoleId: String(need("discord.dmRoleId")),
};
