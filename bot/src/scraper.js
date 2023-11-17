const { lvlToString } = require("./functions.js");
const axios = require("axios");
const crypto = require("crypto");
const https = require("https");
const { ActivityType } = require("discord.js");

axios.defaults.httpsAgent = new https.Agent({
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

const DEFAULT_TIMEOUT = 60 * 1000;

let client = {};

module.exports = (__client) => {
  client = __client;
  return run;
};

async function run() {
  const startTime = new Date().getTime();
  client.user.setPresence({
    activities: [
      {
        name: `проверка аукциона в ${new Date(
          startTime + DEFAULT_TIMEOUT
        ).toLocaleTimeString("ru-RU")}`,
        type: ActivityType.Playing,
      },
    ],
  });
  if (global.config.coupons) getCoupones();
  if (global.config.queue) getQueue();
  //const runningTime = DEFAULT_TIMEOUT - (new Date().getTime() - startTime);
  //setTimeout(run, Math.max(0, runningTime));
}

async function getCoupones() {
  try {
    const res = await axios.get("https://orbit-games.com/", {
      headers: {
        "User-Agent":
          "bdo-market-wait-list https://github.com/exi66/bdo-market-wait-list",
      },
    });
    if (res.status === 200 && res.data) {
      let div = res.data.match(
        /(?<=(<div\s+id="text-15".*?>))(.*)(?=(<\/div>))/gi
      );
      if (!div) throw "div with coupones not found, need to edit regex";
      div[0] = div[0].replace(/(<([^>]+)>)/gi, "");
      let search =
        div[0].match(
          /[a-zA-Z0-9!]{4}-[a-zA-Z0-9!]{4}-[a-zA-Z0-9]{4}?(-[a-zA-Z0-9!]{4})?/gm
        ) || [];
      if (global.coupones === null) {
        global.coupones = search;
        return;
      }
      let allCouponesList = [],
        newCouponesList = [];
      for (let c of search) {
        if (!allCouponesList.includes(c.toUpperCase()))
          allCouponesList.push(c.toUpperCase());
        if (!global.coupones.includes(c.toUpperCase()))
          newCouponesList.push(c.toUpperCase());
      }
      if (newCouponesList.length > 0) {
        global.coupones = allCouponesList;

        let codes = newCouponesList.map((e) => "```" + e + "```").join("\n");
        const User = global.db.users;
        let usersList = await User.findAll({
          where: {
            notification_coupones: true,
          },
        });
        for (let user of usersList) {
          let localUser = await client.users.fetch(user.discord_id);
          if (localUser)
            localUser.send({
              embeds: [
                {
                  color: 2829617,
                  title: "Купоны",
                  url: "https://orbit-games.com/",
                  timestamp: new Date(),
                  description: codes,
                },
              ],
            });
        }
      }
    }
  } catch (e) {
    console.error("coupones error: " + e);
  }
}

async function getQueue() {
  try {
    const market = global.config.region;
    if (market.url && market.cookie) {
      const res = await axios.post(
        market.url + "Home/GetWorldMarketWaitList",
        {},
        {
          headers: {
            "content-type": "application/json",
            accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            cookie: market.cookie,
            referer: market.url,
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36",
          },
        }
      );
      if (res.status === 200 && res.data) {
        const data = res.data._waitList || [];
        const items = data.map((e) => ({
          id: e.mainKey,
          lvl: e.chooseKey,
          price: e._pricePerOne,
          time: e._waitEndTime,
          name: e.name,
          value: e.mainKey + "-" + e.chooseKey,
          unique: "" + e.mainKey + e.chooseKey + e._waitEndTime,
        }));
        const oldItems = global.queue.items || [];
        let newItems = [];
        if (oldItems.length > 0) {
          items.forEach((e) => {
            if (!oldItems.map((a) => a.unique).includes(e.unique))
              newItems.push(e);
          });
        } else newItems = items;
        if (newItems.length > 0) {
          for (let item of newItems) {
            const User = global.db.users;
            let usersList = await User.findAll({
              where: {
                notification_queue: true,
              },
            });
            usersList = usersList.filter((e) => e.items.includes(item.value));
            for (let user of usersList) {
              let localUser = await client.users.fetch(user);
              if (localUser)
                localUser.send({
                  content: `${localUser}, лот «**${lvlToString(item.lvl)} ${
                    item.name
                  }**» зарегистрирован на аукционе за ${item.price
                    .toString()
                    .replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )}. Время размещения <t:${(item.time / 1000).toFixed(
                    0
                  )}:R>`,
                });
            }
          }
        }
        global.queue = {
          lastUpdate: new Date(),
          items: items,
        };
      }
    }
  } catch (e) {
    console.error("market error: " + e.message);
  }
}
