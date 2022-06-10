const { readdirSync } = require("fs");

module.exports = (client) => {
    const users = readdirSync(`./users/`).filter(file => file.endsWith(".json"));
    for (let file of users) {
        let pull = require(`../users/${file}`);

        if (pull.id && pull.items && (pull.coupons_alerts != undefined) && (pull.queue_alerts != undefined)) {
            client.myusers.set(pull.id, { items: pull.items, coupons_alerts: pull.coupons_alerts, queue_alerts: pull.queue_alerts });
        } else {
            continue;
        }
    }
    console.log("Total users: "+Array.from(client.myusers.keys()).length);
}