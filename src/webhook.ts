/* src/webhook.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import type { Client } from "discord.js";
import { config } from "./config.ts";
import type { Pull } from "./github.ts";
import { log } from "./log.ts";
import { announce, editEverywhere } from "./notify.ts";
import { verifySignature } from "./signature.ts";
import { pulls, repoState } from "./store.ts";

type PullRequestEvent = {
  action: string;
  pull_request: Pull;
  repository: {
    name: string;
    full_name: string;
    owner: {
      login: string;
    };
  };
};

function domainFor(repository: PullRequestEvent["repository"]) {
  if (repository.owner.login.toLowerCase() !== config.org.toLowerCase()) {
    return undefined;
  }

  return Object.keys(config.domains).find((domain) =>
    config.domains[domain] === repository.name
  );
}

async function handlePullEvent(client: Client, event: PullRequestEvent) {
  const domain = domainFor(event.repository);
  const pull = event.pull_request;

  if (!domain) {
    log.info(
      `Ignoring ${event.repository.full_name} #${pull.number}: not in github.domains`,
    );
    return;
  }

  if (event.action === "opened") {
    await announce(client, domain, pull);
    return;
  }

  const state = repoState(domain);
  const tracked = state.open[pull.number];

  // shortcut: a reopened PR is not re-tracked, add that if reopening is common
  if (!tracked) return;

  // Any change (title, draft, close, merge) refreshes every message
  await editEverywhere(client, domain, pull, tracked.messages, event.action);

  if (event.action === "closed") {
    delete state.open[pull.number];
    await pulls.save();
  }
}

export function startWebhook(client: Client) {
  // One event at a time, so "opened" is always handled before "closed"
  let queue = Promise.resolve();

  Deno.serve(
    {
      port: config.webhookPort,
      onListen: ({ port }) => log.info(`Webhook listening on port ${port}`),
    },
    async (request) => {
      if (request.method !== "POST") {
        return new Response("Not found", { status: 404 });
      }

      const body = await request.text();

      const valid = await verifySignature(
        config.webhookSecret,
        body,
        request.headers.get("X-Hub-Signature-256"),
      );

      if (!valid) {
        log.warn("Webhook rejected: bad or missing signature");
        return new Response("Bad signature", { status: 401 });
      }

      const eventName = request.headers.get("X-GitHub-Event");

      if (eventName === "ping") {
        log.info("Webhook ping from GitHub, signature OK");
        return new Response("pong");
      }

      if (eventName !== "pull_request") {
        return new Response("Ignored", { status: 202 });
      }

      const event = JSON.parse(body) as PullRequestEvent;

      log.info(
        `Webhook: ${event.repository.full_name} #${event.pull_request.number} ${event.action}`,
      );

      // Reply now, GitHub gives up after 10 seconds
      queue = queue
        .then(() => handlePullEvent(client, event))
        .catch((error) => log.error("Webhook event failed", error));

      return new Response("Accepted", { status: 202 });
    },
  );
}
