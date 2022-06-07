const { printError } = require("./functions.js");
const request = require("request-promise-native");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = (client) => {
    return setInterval(async function() {
        try {
            client.user.setActivity("next check in "+new Date(new Date().getTime()+5*60*1000).toTimeString().split(' ')[0], { type: 'PLAYING' });
            if (client.cfg.coupons) {	
                let body = await request({
                    method: "GET",
                    url: "https://orbit-games.com/",
                    headers: {
                        "User-Agent": "BDO-Umaru-bot https://github.com/exi66/BDO-Umaru-bot"
                    }
                });
                if (body !== "" && body != null) {	
                    let div = body.match(/<div\s+id="text-15".*?>[\S\s]*?<\/div>/gi);
                    let search = div[0].match(/\(?[a-zA-Z0-9]{4}\)?-?[a-zA-Z0-9]{4}?-?[a-zA-Z0-9]{4}-?[a-zA-Z0-9]{4}/gm);
                    if (!search) return printError(error_here, "div with coupones not found, need to edit regex");
                    let all_coupones_list = [], new_coupones_list = [], coupons_list = client.getCoupons();
                    for (let c of search) {
                        if (!all_coupones_list.includes(c.toUpperCase())) all_coupones_list.push(c.toUpperCase());
                        if (!coupons_list.includes(c.toUpperCase())) new_coupones_list.push(c.toUpperCase());
                    }							
                    if (new_coupones_list.length > 0) {
                        let codes = new_coupones_list.map(e => "```" + e + "````").join("\n");
                        let local_users = client.getCouponsUsers(true);
                        for (let usr of local_users) {						
                            try {
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
                            } catch (e) {
                                printError(error_here, "cannot send new coupones, "+e.message);
                            }
                        }							
                    }
                    client.setCoupons(all_coupones_list);
                }
            }
            if (client.cfg.queue) {	
                const RU = client.cfg.regions.find(e => e.name === "ru");
                if (RU) {
                    let body = await request({
                        method: "POST",
                        url: RU.url+"Home/GetWorldMarketWaitList",
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
                        const items = data.map(e => ({ id: e.mainKey, lvl: e.chooseKey, price: e._pricePerOne, time: e._waitEndTime, name: e.name, value: e.mainKey+"-"+e.chooseKey, unique: ""+e.mainKey+e.chooseKey+e._waitEndTime })) || [];
                        const old_items = client.getQueue().items.map(a => a.unique);
                        let new_items = [];
                        items.forEach(e => {
                            if (!old_items.includes(e.unique)) new_items.push(e);
                        });
                        if (new_items.length > 0) {
                            for (let item of items) {		
                                client.getUsers(item.value).forEach(async (e) => {
                                    try {
                                        let local_user = await client.users.fetch(e);
                                        if (local_user) local_user.send({ content: `<@${e}>, **${item.name}** зарегестрирован на аукционе за ${item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}. Время размещения <t:${(item.time/1000).toFixed(0)}:R>`});
                                    } catch (e) {
                                        printError(error_here, "cannot send queue, "+e.message);
                                    }
                                });
                            }
                        }
                        client.setQueue({
                            lastUpdate: new Date(),
                            items: items,
                        });							
                    }
                }
            }
        } catch (e) {
            printError(error_here, "general try-catch error, "+e.message);
        }
    }, client.cfg.debug ? 10*1000 : 5*60*1000);        
}
