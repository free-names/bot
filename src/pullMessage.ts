/* src/pullMessage.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import { ContainerBuilder, SectionBuilder } from "discord.js";
import { colors, v2 } from "./card.ts";
import type { Pull } from "./github.ts";

function status(pull: Pull) {
  if (pull.merged_at) {
    return {
      label: "Merged",
      color: colors.purple,
    };
  }

  if (pull.state === "closed") {
    return {
      label: "Closed",
      color: colors.red,
    };
  }

  if (pull.draft) {
    return {
      label: "Draft",
      color: colors.grey,
    };
  }

  return {
    label: "Open",
    color: colors.green,
  };
}

export function pullMessage(repo: string, pull: Pull) {
  const { label, color } = status(pull);
  const opened = Math.floor(new Date(pull.created_at).getTime() / 1000);

  const section = new SectionBuilder()
    .addTextDisplayComponents((display) =>
      display.setContent(
        [
          `### [#${pull.number} ${pull.title}](${pull.html_url})`.slice(0, 300),
          `**Domain:** ${repo}`,
          `**Status:** ${label}`,
          `-# by ${pull.user.login}, opened <t:${opened}:R>`,
        ].join("\n"),
      )
    )
    .setThumbnailAccessory((thumbnail) =>
      thumbnail.setURL(pull.user.avatar_url)
    );

  const container = new ContainerBuilder()
    .setAccentColor(color)
    .addSectionComponents(section);

  return v2(container);
}
