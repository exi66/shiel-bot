const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js')
const { Command } = require('@sapphire/framework')

class AboutCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options
    })
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('about').setDescription('Информация о проекте')
    )
  }

  async chatInputRun(interaction) {
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('GitHub')
        .setStyle(5)
        .setURL('https://github.com/exi66/bdo-market-wait-list'),
      new ButtonBuilder().setLabel('Telegram').setStyle(5).setURL('https://t.me/exi666')
    )
    const embed = new EmbedBuilder()
      .setColor(2829617)
      .setTitle('О проекте')
      .setDescription(
        'Discord.js бот для отслеживания регистрации редких предметов на аукционе игры Black Desert Online. Поддерживает только русскоговорящий регион.'
      )
    return interaction.reply({ embeds: [embed], components: [buttons] })
  }
}

module.exports = {
  AboutCommand
}
