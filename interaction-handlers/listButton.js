const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { EmbedBuilder } = require('discord.js');

class ListButton extends InteractionHandler {
  constructor(ctx, options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    });
  }

  parse(interaction) {
    if (interaction.customId != 'list') return this.none();
    return this.some();
  }

  async run(interaction) {

    const list = global.users.get(interaction.user.id).items;
    if (list.length < 1) return await interaction.update({
      content: `Ваш список предметов пуст!`,
      components: [],
    });
    let localItems = JSON.parse(JSON.stringify(list)), pages = [], length = 20;
    while (localItems.length) pages.push(localItems.splice(0, length));
    const paginatedMessage = new PaginatedMessage({
      template: new EmbedBuilder()
        .setColor(2829617)
    });
    for (let page of pages) {
      paginatedMessage
        .addPageEmbed((embed) =>
          embed
            .setDescription(page.map(e => e.label).join('\n'))
            .setTitle('Ваш список отслеживания')
        )
    }

    await interaction.update({
      content: `Ваш список предметов`,
      components: [],
    });
    await paginatedMessage.run(interaction, interaction.user);
  }
}

module.exports = {
  ListButton
};