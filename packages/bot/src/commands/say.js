import { Command, container } from '@sapphire/framework';
import { db } from '@shiel/shared';

export class SayCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'say',
      aliases: ['s'],
      description: 'Написать всем пользователям бота',
      preconditions: ['ownerOnly'],
    });
  }

  // Только messageRun и никакого registerApplicationCommands —
  // команда не регистрируется как slash, доступна лишь по префиксу владельцу.
  async messageRun(message, args) {
    const text = await args.rest('string');
    const { client } = container;

    for (const userId of db.getAllUserIds()) {
      const user = await client.users.fetch(userId).catch(() => null);
      if (!user) continue;
      await user.send({ content: text.replace('@user', `<@${userId}>`) }).catch(() => null);
    }

    await message.react('✅').catch(() => null);
  }
}
