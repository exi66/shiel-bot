const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { EmbedBuilder } = require('discord.js');
const { items } = require('../src/bundles.js');

class AllButton extends InteractionHandler {
  constructor(ctx, options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    });
  }

  parse(interaction) {
    if (!interaction.customId.includes('all')) return this.none();
    return this.some();
  }

  async run(interaction) {
    const cat = interaction.customId.split('_')[1];

    const user = global.users.get(interaction.user.id);
    if (!user) return;
    user.items = user.items.filter(e => e.category != cat).concat(items.filter(e => e.category == cat));
    global.saveUser(interaction.user.id);

    let localItems = JSON.parse(JSON.stringify(global.users.get(interaction.user.id).items)), pages = [], length = 20;
    while (localItems.length) pages.push(localItems.splice(0, length));
    const paginatedMessage = new PaginatedMessage({
      template: new EmbedBuilder()
        .setColor('2f3136')
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
      content: `Ваш список предметов обновлен!`,
      components: [],
    });
    await paginatedMessage.run(interaction, interaction.user);
  }
}

module.exports = {
  AllButton
};