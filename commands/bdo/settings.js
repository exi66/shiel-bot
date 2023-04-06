const { Command } = require('@sapphire/framework');
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { categories } = require('../../src/bundles.js');

class WantCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('settings')
        .setDescription('Настроить отслеживание товаров')
    );
  }

  async chatInputRun(interaction) {

    const user = global.users.get(interaction.user.id);
    if (!user) {
      global.users.set(interaction.user.id, {
        items: [],
        notifications: {
          coupones: true,
          queue: true,
        }
      });
      global.saveUser(interaction.user.id);
    }

    const selectMenu = new ActionRowBuilder()
      .setComponents(
        new StringSelectMenuBuilder()
          .setCustomId('category')
          .setPlaceholder('Ничего не выбрано')
          .addOptions(categories)
          .setMaxValues(1)
      );

    const cancelButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('list')
          .setLabel('Список')
          .setStyle(1)
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('Отмена')
          .setStyle(2)
      );

    await interaction.reply({ content: `Выберите категорию`, ephemeral: true, fetchReply: true, components: [selectMenu, cancelButton] });
  }
}

module.exports = {
  WantCommand
};
