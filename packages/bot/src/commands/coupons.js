import { Command } from "@sapphire/framework";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { EmbedBuilder } from "discord.js";
import { config } from "@shiel/shared";
import { EMBED_COLOR } from "../lib/constants.js";
import { getCouponsState } from "../lib/worker.js";

// Купонов на страницу. С запасом под лимит описания эмбеда (4096 символов).
const PAGE_SIZE = 20;

export class CouponsCommand extends Command {
  constructor(context, options) {
    super(context, { ...options });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName("coupons").setDescription("Вывести доступные купоны"),
    );
  }

  chatInputRun(interaction) {
    const coupons = getCouponsState();
    if (!coupons || coupons.length < 1) {
      return interaction.reply({ content: "Нет доступных купонов!" });
    }

    const paginated = new PaginatedMessage({
      template: new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("Купоны")
        .setURL(config.market.couponsUrl),
    });

    for (let i = 0; i < coupons.length; i += PAGE_SIZE) {
      const chunk = coupons.slice(i, i + PAGE_SIZE);
      paginated.addPageEmbed((embed) =>
        embed.setDescription(chunk.map((e) => "```" + e + "```").join("\n")),
      );
    }

    return paginated.run(interaction, interaction.user);
  }
}
