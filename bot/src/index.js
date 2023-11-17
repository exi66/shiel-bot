const { Op } = require("sequelize");
const { SapphireClient } = require("@sapphire/framework");
const {
  GatewayIntentBits,
  Collection,
  Partials,
  ActivityType,
} = require("discord.js");
const fs = require("fs-extra");
const CronJob = require("cron").CronJob;

global.db = require("./db.js");
global.coupones = null;
global.queue = { lastUpdate: new Date(), items: [] };
global.config = require("./config");

const client = new SapphireClient({
  defaultPrefix: global.config.prefix,
  caseInsensitivePrefixes: true,
  caseInsensitiveCommands: true,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
  ],
  partials: [Partials.Channel],
  loadMessageCommandListeners: true,
  presence: {
    activities: [{ name: `/settings`, type: ActivityType.Playing }],
    status: "online",
  },
});

async function main() {
  await client.login(global.config.token);
  const scraper = require("./scraper.js")(client);
  new CronJob(
    "0 * * * * *",
    function () {
      scraper();
      const Link = global.db.links;
      Link.destroy({
        where: {
          expired_id: {
            [Op.lte]: new Date(),
          },
        },
      });
    },
    null,
    true
  );
}

main();
