const { isMessageInstance } = require('@sapphire/discord.js-utilities');
const { Command } = require('@sapphire/framework');

class PingCommand extends Command {
  constructor(context, options) {
    super(context, { 
      ...options
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('ping').setDescription('Проверить работоспособность')
    );
  }

  async chatInputRun(interaction) {
    const msg = await interaction.reply({ content: `Ping?`, ephemeral: true, fetchReply: true });

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(`Pong 🏓! (Задержка бота: ${diff}ms. Задержка API: ${ping}ms.)`);
    }

    return interaction.editReply('Не удалось выполнить команду :(');
  }
}

module.exports = {
  PingCommand
};
