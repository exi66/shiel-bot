const { Command } = require('@sapphire/framework');

class QueueCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('queue')
        .setDescription('Вывести текущую очередь аукциона')
    );
  }

  async chatInputRun(interaction) {

    const queue = global.queue;
    if (!queue.items || queue.items.length < 1) return await interaction.reply({ content: 'Очередь аукциона пуста.', ephemeral: false, fetchReply: true, components: [] });

    await interaction.reply({
      embeds: [{
        color: 2829617,
        title: 'Очередь аукциона',
        timestamp: new Date(queue.lastUpdate),
        fields: [
          { name: 'Ур.', value: queue.items.map(e => e.lvl).join('\n'), inline: true },
          { name: 'Название', value: queue.items.map(e => e.name).join('\n'), inline: true },
          { name: 'Время размещения', value: queue.items.map(e => `<t:${(e.time / 1000).toFixed(0)}:R>`).join('\n'), inline: true }
        ]
      }],
      ephemeral: false, 
      fetchReply: true, 
    });
  }
}

module.exports = {
  QueueCommand
};