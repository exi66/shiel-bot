const { Command } = require('@sapphire/framework')
const { createLink } = require(__dirname + '/../../db.js')
const { MessageFlags } = require('discord.js')

class WantCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options
    })
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('settings').setDescription('Настроить работу приложения')
    )
  }

  async chatInputRun(interaction) {
    await interaction.reply({
      content: 'Выполнение...',
      flags: [MessageFlags.Ephemeral],
      withResponse: true
    })

    const result = await createLink(interaction.user.id)

    await interaction.editReply({
      content: `Вы можете настроить свои уведомления по [это ссылке](${
        result.link
      })\r\nСсылка истечет через <t:${Math.floor(result.expired.getTime() / 1000)}:R>`,
      flags: [MessageFlags.Ephemeral],
      withResponse: true
    })

    setTimeout(() => {
      interaction.deleteReply()
    }, 1000 * 10 * 60)
  }
}

module.exports = {
  WantCommand
}
