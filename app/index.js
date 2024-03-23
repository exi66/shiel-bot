require(__dirname + '/server.js')
const cron = require(__dirname + '/cron.js')
const { SapphireClient } = require('@sapphire/framework')
const { GatewayIntentBits, Partials, ActivityType } = require('discord.js')
const { discord } = require(__dirname + '/../app.config.js')

global.coupones = null
global.queue = { lastUpdate: new Date(), items: [] }

const client = new SapphireClient({
  defaultPrefix: discord.prefix,
  caseInsensitivePrefixes: true,
  caseInsensitiveCommands: true,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping
  ],
  partials: [Partials.Channel],
  loadMessageCommandListeners: true,
  presence: {
    activities: [{ name: '/settings', type: ActivityType.Playing }],
    status: 'online'
  }
})

async function main() {
  await client.login(discord.token)
  cron(client)
}

main()
