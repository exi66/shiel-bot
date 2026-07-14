import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";
import { config } from "@shiel/shared";
import { EMBED_COLOR } from "../lib/constants.js";
import { getCouponsState } from "../lib/worker.js";

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

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("Купоны")
      .setURL(config.market.couponsUrl)
      .setDescription(coupons.map((e) => "```" + e + "```").join("\n"));

    return interaction.reply({ embeds: [embed] });
  }
}
