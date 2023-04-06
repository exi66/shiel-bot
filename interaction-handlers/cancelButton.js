const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');

class CancelButton extends InteractionHandler {
  constructor(ctx, options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    });
  }

  parse(interaction) {
    if (interaction.customId !== 'cancel') return this.none();
    return this.some();
  }

  async run(interaction) {
    await interaction.update({
      content: `Команда отменена пользователем!`,
      components: [],
    });
  }
}

module.exports = {
  CancelButton
};
