/* src/github.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import { config } from "./config.ts";

export type Pull = {
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  draft: boolean;
  merged_at: string | null;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
};

// Returns null on 404. raw = file contents (parsed as JSON) instead of metadata
async function github<T>(path: string, raw = false): Promise<T | null> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      "Accept": raw
        ? "application/vnd.github.raw+json"
        : "application/vnd.github+json",
      "Authorization": `Bearer ${config.githubToken}`,
      "User-Agent": "free-names-bot",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (response.status === 404) {
    await response.body?.cancel();
    return null;
  }

  if (!response.ok) {
    const hint = response.status === 401
      ? " (check GITHUB_TOKEN in .env)"
      : response.status === 403 || response.status === 429
      ? " (rate limited, or GITHUB_TOKEN lacks access)"
      : "";

    throw new Error(`GitHub ${response.status} on ${path}${hint}`);
  }

  return await response.json();
}

// Returns null when the PR does not exist
export async function getPull(domain: string, number: number) {
  return await github<Pull>(
    `/repos/${config.org}/${config.domains[domain]}/pulls/${number}`,
  );
}

// A JSON file from a domain repo, e.g. "domains/ari.json". Null if missing
export async function getRepoJson(domain: string, path: string) {
  return await github<unknown>(
    `/repos/${config.org}/${config.domains[domain]}/contents/${path}`,
    true,
  );
}

// The repo's json/reserved.json, empty if missing or malformed
export async function getReservedNames(domain: string) {
  const names = await getRepoJson(domain, "json/reserved.json");

  return Array.isArray(names) ? names.map(String) : [];
}

// shortcut: the contents API lists at most 1000 files, switch to the git trees API past that
export async function listRepoFiles(domain: string, folder: string) {
  const files = await github<{ name: string }[]>(
    `/repos/${config.org}/${config.domains[domain]}/contents/${folder}`,
  );

  return (files ?? []).map((file) => file.name);
}
