const cron = require('node-cron')
const axios = require('axios')
const crypto = require('crypto')
const https = require('https')
const { ActivityType, EmbedBuilder } = require('discord.js')
const { db } = require(__dirname + '/db.js')
const { service } = require(__dirname + '/../app.config.js')

axios.defaults.httpsAgent = new https.Agent({
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
})

module.exports = (client) => {
  cron.schedule('* * * * *', () => {
    run(client)
  })
}

function lvlToString(lvl) {
  if (lvl === 16 || lvl === 1) return 'I:'
  if (lvl === 17 || lvl === 2) return 'II:'
  if (lvl === 18 || lvl === 3) return 'III:'
  if (lvl === 19 || lvl === 4) return 'IV:'
  if (lvl === 20 || lvl === 5) return 'V:'
  if (lvl === 0) return ''
  return lvl
}

async function run(client) {
  client.user.setPresence({
    activities: [
      {
        name: `проверка аукциона в ${new Date(new Date().getTime() + 60 * 1000).toLocaleTimeString(
          'ru-RU'
        )}`,
        type: ActivityType.Playing
      }
    ]
  })
  if (service.coupons) getCoupones(client)
  if (service.queue) getQueue(client)
}

async function getCoupones(client) {
  try {
    const res = await axios.get('https://orbit-games.com/black-desert/vse-kupony-bdo/', {
      headers: {
        'User-Agent': 'bdo-market-wait-list https://github.com/exi66/shiel-bot'
      }
    })
    if (res.status === 200 && res.data) {
      const figures = res.data.match(
        /<figure\s+class="wp-block-table is-style-stripes">[\S\s]*?<\/figure>/gi
      )
      if (figures.length < 0) throw 'figures with coupones not found, need to edit regex or empty'
      const search = []
      for (const f of figures) {
        const c = f
          .replace(/(<([^>]+)>)/gi, '')
          .match(/[a-zA-Z0-9!]{4}-[a-zA-Z0-9!]{4}-[a-zA-Z0-9]{4}?(-[a-zA-Z0-9!]{4})?/gm)
        if (c[0]) {
          search.push(c[0])
        }
      }
      //Set coupones if this is first iteration after run app
      if (global.coupones === null) global.coupones = search.map((e) => e.toUpperCase())

      const newCoupones = search
        .map((e) => e.toUpperCase())
        .filter((e) => !global.coupones.includes(e))
      if (newCoupones.length > 0) {
        global.coupones = global.coupones.concat(newCoupones)
        const embed = new EmbedBuilder()
          .setColor(2829617)
          .setTitle('Купоны')
          .setURL('https://orbit-games.com/black-desert/vse-kupony-bdo/')
          .setTimestamp(new Date())
          .setDescription(newCoupones.map((e) => '```' + e + '```').join('\n'))
        const users = await db.User.findAll({
          where: {
            notifyCoupons: true
          }
        })
        for (const user of users) {
          const __user = await client.users.fetch(user.discordId)
          if (__user) localUser.send({ embeds: [embed] })
        }
      }
    }
  } catch (e) {
    console.error(`[${new Date().toISOString()}] coupones worker error: `, e)
  }
}

async function getQueue(client) {
  try {
    if (service.market.url && service.market.cookie) {
      const res = await axios.post(
        service.market.url + 'Home/GetWorldMarketWaitList',
        {},
        {
          headers: {
            'content-type': 'application/json',
            accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            cookie: service.market.cookie,
            referer: service.market.url,
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36'
          }
        }
      )
      if (res.status === 200 && res.data) {
        const data = res.data._waitList || []
        const items = data.map((e) => ({
          id: e.mainKey,
          lvl: e.chooseKey,
          price: e._pricePerOne,
          time: e._waitEndTime,
          name: e.name,
          value: e.mainKey + '-' + e.chooseKey,
          unique: '' + e.mainKey + e.chooseKey + e._waitEndTime
        }))
        const oldItems = global.queue.items || []
        const newItems = items.filter((e) => !oldItems.map((a) => a.unique).includes(e.unique))
        for (const item of newItems) {
          const items = await db.Item.findAll({
            where: {
              itemId: item.id,
              lvl: item.lvl
            },
            include: db.User
          })
          const users = [...new Set(items.map((e) => e.User.discordId))]
          for (const user of users) {
            const __user = await client.users.fetch(user)
            if (!__user) continue

            __user.send({
              content: `${__user}, лот «**${lvlToString(item.lvl)} ${
                item.name
              }**» зарегистрирован на аукционе за ${item.price
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}. Время размещения <t:${(
                item.time / 1000
              ).toFixed(0)}:R>`
            })
          }
        }
        global.queue = {
          lastUpdate: new Date(),
          items: items
        }
      }
    }
  } catch (e) {
    console.error(`[${new Date().toISOString()}] market worker error: `, e)
  }
}
