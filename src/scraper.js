const { lvlToString } = require('./functions.js');
const axios = require('axios');

const default_timeout = 5 * 60 * 1000;

let client = {};

module.exports = (__client) => {
  client = __client;
  run();
}

async function run() {
  const start_time = new Date().getTime();
  try {
    if (global.config.coupons) {
      try {
        const res = await axios.get('https://orbit-games.com/', {
          headers: {
            'User-Agent': 'bdo-market-wait-list https://github.com/exi66/bdo-market-wait-list'
          }
        });
        if (res.status === 200 && res.data) {
          const body = res.data;
          let div = body.match(/<div\s+id="text-15".*?>[\S\s]*?<\/div>/gi);
          if (!div) throw 'div with coupones not found, need to edit regex';
          let search = div[0].match(/[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}?(-[a-zA-Z0-9]{4})?/gm) || [];
          let allCouponesList = [], newCouponesList = [], couponesList = global.coupones;
          for (let c of search) {
            if (!allCouponesList.includes(c.toUpperCase())) allCouponesList.push(c.toUpperCase());
            if (!couponesList.includes(c.toUpperCase())) newCouponesList.push(c.toUpperCase());
          }
          if (newCouponesList.length > 0) {
            global.coupones = allCouponesList;

            let codes = newCouponesList.map(e => '```' + e + '```').join('\n');
            let usersList = Array.from(global.users.filter(e => e.notifications.coupones).keys());
            for (let user of usersList) {
              let localUser = await client.users.fetch(user);
              if (localUser) localUser.send({
                embeds: [{
                  color: 3092790,
                  title: 'Купоны',
                  url: 'https://orbit-games.com/',
                  timestamp: new Date(),
                  description: codes
                }]
              });
            }
          }
        }
      } catch (e) { console.error('coupones error: ' + e) }
    }
    if (global.config.queue) {
      try {
        const RU = global.config.regions.find(e => e.name === 'ru');
        if (RU) {
          const res = await axios.post(RU.url + 'Home/GetWorldMarketWaitList', {}, {
            headers: {
              'content-type': 'application/json',
              'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
              'cookie': RU.cookie,
              'referer': RU.url,
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36'
            }
          });
          if (res.status === 200 && res.data) {
            const body = res.data;
            const data = body._waitList || [];
            const items = data.map(e => ({
              id: e.mainKey,
              lvl: e.chooseKey,
              price: e._pricePerOne,
              time: e._waitEndTime,
              name: e.name,
              value: e.mainKey + '-' + e.chooseKey,
              unique: '' + e.mainKey + e.chooseKey + e._waitEndTime
            }));
            const old_items = global.queue.items || [];
            let newItems = [], loc = [];
            if (old_items.length > 0) {
              loc = old_items.map(a => a.unique);
              items.forEach(e => {
                if (!loc.includes(e.unique)) newItems.push(e);
              });
            } else newItems = items;
            if (newItems.length > 0) {
              for (let item of newItems) {
                let users = Array.from(global.users.filter(e => e.items.map(a => a.value).includes(item.value) && e.notifications.queue).keys());
                for (let user of users) {
                  let localUser = await client.users.fetch(user);
                  if (localUser) localUser.send({
                    content: `<@${e}>, лот «**${lvlToString(item.lvl)} ${item.name}**» зарегистрирован на аукционе за ${item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}. Время размещения <t:${(item.time / 1000).toFixed(0)}:R>`
                  });
                };
              }
            }
            global.queue = {
              lastUpdate: new Date(),
              items: items,
            };
          }
        }
      } catch (e) { console.error('market error: ' + e.message) }
    }
  } catch (e) {
    console.error('general try-catch error, ' + e.message);
  }
  const running_time = default_timeout - (new Date().getTime() - start_time);
  setTimeout(run, Math.max(0, running_time));
}
