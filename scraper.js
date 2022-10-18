const { printError } = require("./functions.js");
const request = require("request-promise-native");

const where = __filename.slice(__dirname.length + 1);
const error_here = where + "/error";
const log_here = where + "/log";

const default_timeout = 5 * 60 * 1000;

module.exports = (client) => {
  return run(client); 
}

async function run(client) {
  let start_timer = new Date();
  try {
    if (client.cfg.coupons) {
      try {
        let body = await request({
          method: "GET",
          url: "https://orbit-games.com/",
          headers: {
            "User-Agent": "bdo-market-wait-list https://github.com/exi66/bdo-market-wait-list"
          }
        });
        if (body !== "" && body != null) {
          let div = body.match(/<div\s+id="text-15".*?>[\S\s]*?<\/div>/gi);
          if (!div) throw new Error({ message: "div with coupones not found, need to edit regex" });
          let search = div[0].match(/[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}?(-[a-zA-Z0-9]{4})?/gm) || [];
          let all_coupones_list = [], new_coupones_list = [], coupons_list = client.getCoupons();
          for (let c of search) {
            if (!all_coupones_list.includes(c.toUpperCase())) all_coupones_list.push(c.toUpperCase());
            if (!coupons_list.includes(c.toUpperCase())) new_coupones_list.push(c.toUpperCase());
          }
          if (new_coupones_list.length > 0) {
            client.setCoupons(all_coupones_list);

            let codes = new_coupones_list.map(e => "```" + e + "```").join("\n");
            let local_users = client.getCouponsUsers(true);
            for (let usr of local_users) {
              let local_user = await client.users.fetch(usr);
              if (local_user) local_user.send({
                embeds: [{
                  color: "#2f3136",
                  title: "Купоны",
                  url: "https://orbit-games.com/",
                  timestamp: new Date(),
                  description: codes
                }]
              });
            }
          }
        }
      } catch (e) { printError(error_here, "coupones error: " + e.message) }
    }
    if (client.cfg.queue) {
      try {
        const RU = client.cfg.regions.find(e => e.name === "ru");
        if (RU) {
          let body = await request({
            method: "POST",
            url: RU.url + "Home/GetWorldMarketWaitList",
            headers: {
              "content-type": "application/json",
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "cookie": RU.cookie,
              "referer": RU.url,
              "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36"
            }
          });
          if (body !== "" && body != null) {
            const data = JSON.parse(body)._waitList || [];
            const items = data.map(e => ({ id: e.mainKey, lvl: e.chooseKey, price: e._pricePerOne, time: e._waitEndTime, name: e.name, value: e.mainKey + "-" + e.chooseKey, unique: "" + e.mainKey + e.chooseKey + e._waitEndTime })) || [];
            const old_items = client.getQueue().items || [];
            let new_items = [], loc = [];
            if (old_items.length > 0) {
              loc = old_items.map(a => a.unique);
              items.forEach(e => {
                if (!loc.includes(e.unique)) new_items.push(e);
              });
            } else new_items = items;
            if (new_items.length > 0) {
              for (let item of new_items) {
                client.getUsers(item.value).forEach(async (e) => {
                  let local_user = await client.users.fetch(e);
                  if (local_user) local_user.send({
                    content: `<@${e}>, лот «**${lvl_to_string(item.lvl)} ${item.name}**» зарегистрирован на аукционе за ${item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}. Время размещения <t:${(item.time / 1000).toFixed(0)}:R>`
                  });
                });
              }
            }
            client.setQueue({
              lastUpdate: new Date(),
              items: items,
            });
          }
        }
      } catch (e) { printError(error_here, "market error: " + e.message) }
    }
  } catch (e) {
    printError(error_here, "general try-catch error, " + e.message);
  }
  let run_timer = new Date().getTime() - start_timer.getTime();
  let next_check_time = new Date().getTime() + Math.max(0, default_timeout - run_timer);
  client.user.setActivity("следующая проверка в " + new Date(next_check_time).toLocaleTimeString('ru-RU'), { type: 'PLAYING' });
  return setTimeout(run, client, client.cfg.debug ? Math.max(0, default_timeout - run_timer) / 30 : Math.max(0, default_timeout - run_timer));
}

function lvl_to_string(lvl) {
  if (lvl === 16 || lvl === 1) return "I:";
  if (lvl === 17 || lvl === 2) return "II:";
  if (lvl === 18 || lvl === 3) return "III:";
  if (lvl === 19 || lvl === 4) return "IV:";
  if (lvl === 20 || lvl === 5) return "V:";
  return "";
}
