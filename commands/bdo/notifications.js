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
        .setName('notifications')
        .setDescription('Выключить/отключить уведомления')
        .addSubcommand(subcommand =>
          subcommand
            .setName('coupones')
            .setDescription('Выключить/отключить уведомления о купонах')
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('queue')
            .setDescription('Выключить/отключить уведомления аукциона'))
    );
  }

  async chatInputRun(interaction) {

    const user = global.users.get(interaction.user.id);
    if (!user) return await interaction.reply({ content: 'Ваш профиль не создан. Для создания используйте комманду `/settings`' });

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'coupones') {
      let n = JSON.parse(JSON.stringify(user.notifications));
      user.notifications = {
        coupones: !n.coupones,
        queue: n.queue
      }
      global.saveUser(interaction.user.id);
      await interaction.reply({ content: `Уведомления о купонах теперь ${user.notifications.coupones ? 'включены' : 'выключены'}!` });
    } else if (subcommand === 'queue') {
      let n = JSON.parse(JSON.stringify(user.notifications));
      user.notifications = {
        coupones: !n.coupones,
        queue: n.queue
      }
      global.saveUser(interaction.user.id);
      await interaction.reply({ content: `Уведомления аукциона теперь ${user.notifications.queue ? 'включены' : 'выключены'}!` });
    }
  }
}

module.exports = {
  QueueCommand
};