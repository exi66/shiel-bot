import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { EMBED_COLOR } from '../lib/constants.js';
import { getQueueState } from '../lib/worker.js';

export class QueueCommand extends Command {
  constructor(context, options) {
    super(context, { ...options });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('queue').setDescription('Вывести текущую очередь аукциона')
    );
  }

  chatInputRun(interaction) {
    const queue = getQueueState();
    if (!queue.items || queue.items.length < 1) {
      return interaction.reply({ content: 'Очередь аукциона пуста.' });
    }

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle('Очередь аукциона')
      .addFields(
        {
          name: 'Ур.',
          value: queue.items.map((e) => e.lvl).join('\n'),
          inline: true,
        },
        {
          name: 'Название',
          value: queue.items.map((e) => e.name).join('\n'),
          inline: true,
        },
        {
          name: 'Время размещения',
          value: queue.items.map((e) => `<t:${(e.time / 1000).toFixed(0)}:R>`).join('\n'),
          inline: true,
        }
      )
      .setTimestamp(queue.lastUpdate ? new Date(queue.lastUpdate) : null);

    return interaction.reply({ embeds: [embed] });
  }
}
