const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');

class ClearButton extends InteractionHandler {
  constructor(ctx, options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    });
  }

  parse(interaction) {
    if (!interaction.customId.includes('clear')) return this.none();
    return this.some();
  }

  async run(interaction) {
    const cat = interaction.customId.split('-')[1];

    const user = global.users.get(interaction.user.id);
    if (!user) return;
    user.items = user.items.filter(e => e.category != cat);
    global.saveUser(interaction.user.id);

    await interaction.update({
      content: `Категория очищена!`,
      components: [],
    });
  }
}

module.exports = {
  ClearButton
};
