const { Command } = require('@sapphire/framework')
const { EmbedBuilder } = require('discord.js')

class CouponesCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options
    })
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('coupones').setDescription('Вывести доступные купоны')
    )
  }

  async chatInputRun(interaction) {
    const coupones = global.coupones
    if (!coupones || coupones.length < 1) {
      return await interaction.reply({
        content: 'Нет доступных купонов!',
        ephemeral: false,
        fetchReply: true
      })
    }

    const embed = new EmbedBuilder()
      .setColor(3092790)
      .setTitle('Купоны')
      .setURL('https://orbit-games.com/')
      .setDescription(coupones.map((e) => '```' + e + '```').join('\n'))
    await interaction.reply({
      embeds: [embed],
      ephemeral: false,
      fetchReply: true
    })
  }
}

module.exports = {
  CouponesCommand
}
