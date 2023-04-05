const { SapphireClient } = require('@sapphire/framework');
const { GatewayIntentBits, Collection, Partials, ActivityType } = require('discord.js');
const fs = require('fs-extra');

global.users = new Collection();
global.saveUser = function (id = null) {
  if (id) {
    let data = global.users.get(id);
    fs.writeFile(__dirname + '/../storage/users/' + id + '.json', JSON.stringify(data), function (e) {
      if (e) return console.error(`cannot save user id=${id}, ${e.message}`);
    });
  } else {
    let users = Array.from(global.users.keys());
    for (let id of users) {
      let data = global.users.get(id);
      fs.writeFile(__dirname + '/../storage/users/' + id + '.json', JSON.stringify(data), function (e) {
        if (e) return console.error(`cannot save user id=${id}, ${e.message}`);
      });
    }
  }
}
global.coupones = [];
global.queue = {};
global.config = require('./config');

const client = new SapphireClient({
  caseInsensitiveCommands: true,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
  ],
  partials: [Partials.Channel],
  loadMessageCommandListeners: true
});

async function main() {
  handleUsers();
  await client.login(global.config.token);
  require('./scraper.js')(client);
}

function handleUsers() {

  const users = fs.readdirSync(__dirname + '/../storage/users/').filter(file => file.endsWith('.json'));

  for (let file of users) {
    let pull = require(`${__dirname}/../storage/users/${file}`);

    const id = file.replace('.json', '');
    if (id && (pull.notifications.coupones != undefined) && (pull.notifications.queue != undefined)) {
      global.users.set(id, pull);
    } else {
      continue;
    }
  }
  console.log('Total users: ' + Array.from(global.users.keys()).length);
}

main();