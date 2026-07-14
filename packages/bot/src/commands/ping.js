import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";
import { MessageFlags } from "discord.js";

export class PingCommand extends Command {
  constructor(context, options) {
    super(context, { ...options });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName("ping").setDescription("Проверить работоспособность"),
    );
  }

  async chatInputRun(interaction) {
    const callbackResponse = await interaction.reply({
      content: "Ping?",
      flags: [MessageFlags.Ephemeral],
      withResponse: true,
    });
    const msg = callbackResponse.resource?.message;

    if (msg && isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      return interaction.editReply(`Pong 🏓! Задержка: ${diff}ms.`);
    }

    return interaction.editReply("Не удалось выполнить команду :(");
  }
}
