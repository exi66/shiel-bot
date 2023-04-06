const { container, Command } = require('@sapphire/framework');

class SayCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'say',
      aliases: ['s'],
      description: 'Написать всем пользователям бота',
      preconditions: ['ownerOnly']
    });
  }

  async messageRun(message, args) {
    const text = await args.rest('string');

    const { client } = container;

    let usersList = Array.from(global.users.keys());
    for (let user of usersList) {
      let localUser = await client.users.fetch(user);
      if (localUser) localUser.send({ content: text.replace('@user', `<@${user}>`) });
    }
  }
}

module.exports = {
  SayCommand
};
