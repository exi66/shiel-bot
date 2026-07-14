import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Command } from '@sapphire/framework';
import { config } from '@shiel/shared';
import { EMBED_COLOR } from '../lib/constants.js';

export class AboutCommand extends Command {
  constructor(context, options) {
    super(context, { ...options });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('about').setDescription('Информация о проекте')
    );
  }

  chatInputRun(interaction) {
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Git').setStyle(ButtonStyle.Link).setURL(config.links.git)
    );
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle('О проекте')
      .setDescription(
        'Discord.js бот для отслеживания регистрации редких предметов на аукционе игры Black Desert Online. Поддерживает только русскоговорящий регион.'
      );
    return interaction.reply({ embeds: [embed], components: [buttons] });
  }
}
