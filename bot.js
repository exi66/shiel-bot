const { printError } = require("./functions.js");
const { rare_items } = require("./data/bundles.js");
const { Client, Collection, Intents, MessageEmbed } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

function arrayRemove(arr, value) { 
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

async function createListers(client) {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);

        if (!command) return;
    
        try {
            await command.execute(client, interaction);
        } catch (e) {
            printError(error_here, e.message);
            await interaction.reply({ content: 'Непредвиденная ошибка!' });
        }
    });
    client.on("interactionCreate", async interaction => {
        if (!interaction.isSelectMenu()) return;
        if (interaction.customId === "want") {

            let item_list = [];
            interaction.values.forEach(value => {
                rare_items.find(e => e.value === value).items.forEach(e => item_list.push(e));
            })

            let bundle_items = [];
            rare_items.forEach(e => e.items.forEach(a => bundle_items.push(a)));
            //console.log(bundle_items);

            let usr = client.myusers.get(interaction.user.id);
            if (!usr) {
                client.createUser(interaction.user.id);
                usr = client.myusers.get(interaction.user.id);
            }
            usr.categories = interaction.values;
            usr.items.forEach(e => { if(!bundle_items.map(a => a.value).includes(e.value)) item_list.push(e) });
            usr.items = item_list;

            let embed = new MessageEmbed()
            .setColor("#2f3136")
            .setTitle("Ваш список отслеживания")
            .setDescription(client.myusers.get(interaction.user.id).items.map(e => e.label || "ID:`"+e.value.split("-")[0]+"` LVL:`"+e.value.split("-")[1]+"`").join("\n"));
            client.saveUser(interaction.user.id);
            return interaction.update({content: "Список обновлен!", embeds: [embed], components: []});
        } else if (interaction.customId === "delete") {

            let item = interaction.values[0];
            let usr = client.myusers.get(interaction.user.id);
            if (!usr) {
                client.createUser(interaction.user.id);
                usr = client.myusers.get(interaction.user.id);
            }
            usr.items = usr.items.filter(e => e.value !== item);

            let embed = new MessageEmbed()
            .setColor("#2f3136")
            .setTitle("Ваш список отслеживания")
            .setDescription(client.myusers.get(interaction.user.id).items.map(e => e.label || "ID:`"+e.value.split("-")[0]+"` LVL:`"+e.value.split("-")[1]+"`").join("\n"));
            client.saveUser(interaction.user.id);
            return interaction.update({content: "Список обновлен!", embeds: [embed], components: []});
        }
    });
    client.on("ready", () => {
        printError(log_here, `${client.user.username} is now online!`);
        //removeDeletedGuilds(client);
    });
    client.on("guildCreate", guild => {
        printError(log_here, `joined a new guild: ${guild.name}`);
    });
    client.on("guildDelete", guild => {
        printError(log_here, `left a guild: ${guild.name}`);
    });
}

module.exports = (config) => {
    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    let {token, ...local_config} = config;
    client.cfg = local_config;
    client.commands = new Collection();
    client.aliases = new Collection();
    client.myusers = new Collection();
    client.categories = fs.readdirSync("./commands/");
    client.login(config.token);
    client.getUsers = (item_id) => {
        //if (client.cfg.debug) return [client.cfg.root];
        return Array.from(client.myusers.filter(u => u.items.map(e => e.value).includes(item_id)).keys());
    };
    client.getCouponsUsers = (flag) => {
        //if (client.cfg.debug) return [client.cfg.root];
        return Array.from(client.myusers.filter(u => u.coupons === flag).keys());
    };
    client.createUser = (id) => {
        let data = {};
        data.id = id;
        data.coupons_alerts = false;
        data.queue_alerts = true;
        data.categories = [];
        data.items = [];
        client.myusers.set(id, { categories: data.categories, items: data.items, coupons_alerts: data.coupons_alerts, queue_alerts: data.queue_alerts });
        return data;
    }
    client.saveUser = (id) => {
        let data = client.myusers.get(id) || client.createUser(id);
        data.id = id;
        fs.writeFile(client.cfg.users_folder+id+".json", JSON.stringify(data), function(e) {
            if (e) return printError(error_here, `cannot save user id=${id}, ${e.message}`);
        });
        return true;
    };
    client.getCoupons = () => {
        let coupons_list = [];
        try {
            coupons_list = JSON.parse(fs.readFileSync(client.cfg.coupons_folder, "utf8"));
        } catch (e) {
            printError(error_here, e.message);
        }
        return coupons_list;
    };   
    client.setCoupons = (array) => {
        fs.writeFile(client.cfg.coupons_folder, JSON.stringify(array, null, 4), function(e) {
            if (e) return printError(error_here, "cannot save all coupones, "+e.message);
        });
        return true;
    }; 
    client.getQueue = () => {
        let queue_list = {};
        try {
            queue_list = JSON.parse(fs.readFileSync(client.cfg.queue_folder, "utf8"));
        } catch (e) {
            printError(error_here, e.message);
        }
        return queue_list;
    };
    client.setQueue = (array) => {    
        fs.writeFile(client.cfg.queue_folder, JSON.stringify(array, null, 4), function(e) {
            if (e) return printError(error_here, "cannot save queue, "+e.message);
        });
        return true;
    }; 
    
    const rest = new REST({ version: '9' }).setToken(token);

    ["command", "user"].forEach(handler => {
        require(`./handlers/${handler}`)(client);
    });

    rest.put(
        Routes.applicationCommands(config.clientID),
        { body: client.commands },
    );
    createListers(client);
    return client;
}
