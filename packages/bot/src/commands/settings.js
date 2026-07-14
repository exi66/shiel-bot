import { Command } from "@sapphire/framework";
import { MessageFlags } from "discord.js";
import { db } from "@shiel/shared";

export class SettingsCommand extends Command {
  constructor(context, options) {
    super(context, { ...options });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName("settings").setDescription("Настроить работу приложения"),
    );
  }

  async chatInputRun(interaction) {
    await interaction.reply({
      content: "Выполнение...",
      flags: [MessageFlags.Ephemeral],
    });

    const result = db.createLink(interaction.user.id);

    await interaction.editReply({
      content:
        `Вы можете настроить свои уведомления по [этой ссылке](${result.url})\r\n` +
        `Ссылка истечёт через <t:${Math.floor(result.expiredAt / 1000)}:R>`,
    });

    // Удаляем эфемерный ответ по истечении срока ссылки.
    setTimeout(() => {
      interaction.deleteReply().catch(() => null);
    }, db.LINK_TTL_MS);
  }
}
