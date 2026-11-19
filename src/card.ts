/* src/card.ts
 * MIT Licence — (c) 2026-Present meowed-at.me, (c) 2026 is-a.dev
 */

import { ContainerBuilder, MessageFlags } from "discord.js";

export const colors = {
  green: 0x238636,
  red: 0xda3633,
  purple: 0x8957e5,
  grey: 0x6e7681,
  yellow: 0xd29922,
};

// Payload for a Components v2 message with one container
export function v2(container: ContainerBuilder, ephemeral = false) {
  return {
    components: [container],
    flags: MessageFlags.IsComponentsV2 |
      (ephemeral ? MessageFlags.Ephemeral : 0),
  };
}

// A container holding one block of markdown (up to 4000 characters)
export function card(
  text: string,
  options: {
    color?: number;
    ephemeral?: boolean;
  } = {},
) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents((display) => display.setContent(text));

  if (options.color !== undefined) {
    container.setAccentColor(options.color);
  }

  return v2(container, options.ephemeral);
}
