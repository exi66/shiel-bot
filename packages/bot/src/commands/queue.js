import { Command } from "@sapphire/framework";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { EmbedBuilder } from "discord.js";
import { EMBED_COLOR } from "../lib/constants.js";
import { getQueueState } from "../lib/worker.js";

// Позиций на страницу. Держим с запасом под лимит поля эмбеда (1024 символа).
const PAGE_SIZE = 10;

export class QueueCommand extends Command {
  constructor(context, options) {
    super(context, { ...options });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("queue")
        .setDescription("Вывести текущую очередь аукциона"),
    );
  }

  chatInputRun(interaction) {
    const queue = getQueueState();
    if (!queue.items || queue.items.length < 1) {
      return interaction.reply({ content: "Очередь аукциона пуста." });
    }

    const timestamp = queue.lastUpdate ? new Date(queue.lastUpdate) : null;
    const paginated = new PaginatedMessage({
      template: new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("Очередь аукциона")
        .setTimestamp(timestamp),
    });

    for (let i = 0; i < queue.items.length; i += PAGE_SIZE) {
      const chunk = queue.items.slice(i, i + PAGE_SIZE);
      paginated.addPageEmbed((embed) =>
        embed.addFields(
          {
            name: "Ур.",
            value: chunk.map((e) => String(e.lvl)).join("\n"),
            inline: true,
          },
          {
            name: "Название",
            value: chunk.map((e) => e.name).join("\n"),
            inline: true,
          },
          {
            name: "Время размещения",
            value: chunk
              .map((e) => `<t:${(e.time / 1000).toFixed(0)}:R>`)
              .join("\n"),
            inline: true,
          },
        ),
      );
    }

    return paginated.run(interaction, interaction.user);
  }
}
