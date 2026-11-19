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

async function github<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${config.githubToken}`,
      "User-Agent": "free-names-bot",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

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
  try {
    return await github<Pull>(
      `/repos/${config.org}/${config.domains[domain]}/pulls/${number}`,
    );
  } catch (error) {
    if (String(error).includes("GitHub 404")) return null;
    throw error;
  }
}
