import { Precondition } from '@sapphire/framework';
import { config } from '@shiel/shared/config';

export class OwnerOnlyPrecondition extends Precondition {
  constructor(context, options) {
    super(context, { ...options, name: 'ownerOnly' });
  }

  chatInputRun(interaction) {
    return this.checkOwner(interaction.user.id);
  }

  messageRun(message) {
    return this.checkOwner(message.author.id);
  }

  contextMenuRun(interaction) {
    return this.checkOwner(interaction.user.id);
  }

  checkOwner(userId) {
    return config.discord.owners.includes(userId)
      ? this.ok()
      : this.error({ message: 'Эта команда доступна только владельцу бота.' });
  }
}
