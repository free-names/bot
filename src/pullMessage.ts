/* src/pullMessage.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import { EmbedBuilder } from "discord.js";
import type { Pull } from "./github.ts";

function status(pull: Pull) {
  if (pull.merged_at) {
    return {
      label: "Merged",
      color: 0x8957e5,
    };
  }

  if (pull.state === "closed") {
    return {
      label: "Closed",
      color: 0xda3633,
    };
  }

  if (pull.draft) {
    return {
      label: "Draft",
      color: 0x6e7681,
    };
  }

  return {
    label: "Open",
    color: 0x238636,
  };
}

export function pullMessage(repo: string, pull: Pull) {
  const { label, color } = status(pull);

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`#${pull.number} ${pull.title}`.slice(0, 256))
    .setURL(pull.html_url)
    .setAuthor({
      name: pull.user.login,
      iconURL: pull.user.avatar_url,
    })
    .addFields(
      {
        name: "Domain",
        value: repo,
        inline: true,
      },
      {
        name: "Status",
        value: label,
        inline: true,
      },
    )
    .setTimestamp(new Date(pull.created_at));

  return {
    embeds: [embed],
  };
}
