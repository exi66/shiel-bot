const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { items } = require('../src/bundles.js');

class CategorySelect extends InteractionHandler {
  constructor(ctx, options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.SelectMenu
    });
  }

  parse(interaction) {
    if (interaction.customId !== 'category') return this.none();
    return this.some();
  }

  async run(interaction) {

    const itemsInCategory = items.filter(e => e.category === interaction.values[0]).map(function (item) {
      let elem = {};
      const user = global.users.get(interaction.user.id);
      if (user) {
        elem.default = user.items.map(e => e.value).includes(item.value);
      }
      elem.label = item.label;
      elem.value = item.value;
      return elem;
    });

    const selectMenu = new ActionRowBuilder()
      .setComponents(
        new StringSelectMenuBuilder()
          .setCustomId('item_' + interaction.values[0])
          .setPlaceholder('Ничего не выбрано')
          .addOptions(itemsInCategory)
          .setMaxValues(itemsInCategory.length)
      );
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('all_' + interaction.values[0])
          .setLabel('Все')
          .setStyle(1)
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('clear_' + interaction.values[0])
          .setLabel('Очистить')
          .setStyle(4)
          .setDisabled(itemsInCategory.map(e => e.default).length > 0)
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('Отмена')
          .setStyle(2)
      );
    await interaction.update({
      content: `Выберите предметы`,
      components: [selectMenu, buttons],
    });
  }
}

module.exports = {
  CategorySelect
};