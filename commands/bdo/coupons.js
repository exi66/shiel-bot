const { Command } = require('@sapphire/framework');

class CouponsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('coupones')
        .setDescription('Вывести доступные купоны')
    );
  }

  async chatInputRun(interaction) {

    const coupons = global.coupons;
    if (!coupons || coupons.length < 1) return await interaction.reply({ content: 'Нет доступных купонов!', ephemeral: false, fetchReply: true, components: [] });

    let codes = coupons.map(e => '```' + e + '```').join('\n');
    await interaction.reply({
      embeds: [{
        color: 3092790,
        title: 'Купоны',
        url: 'https://orbit-games.com/',
        timestamp: new Date(),
        description: codes
      }],
      ephemeral: false, 
      fetchReply: true, 
    });
  }
}

module.exports = {
  CouponsCommand
};