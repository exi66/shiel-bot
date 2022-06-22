const { printError } = require("./functions.js");
const { market } = require("./data/bundles.js");
const { Client, Collection, Intents, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

async function createListers(client) {
    client.on("interactionCreate", async interaction => {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);

        if (!command) return;
    
        try {
            await command.execute(client, interaction);
        } catch (e) {
            printError(error_here, e.message);
            await interaction.reply({ content: "Непредвиденная ошибка!" });
        }
    });
    client.on("interactionCreate", async interaction => {
        try {
            if (!interaction.isButton()) return;
            if (interaction.customId === "cancel") {
                return await interaction.update({ content: "Команда отменена пользователем!", components: [] });
            } else if (interaction.customId === "clear_all") {                                                                                  
                const category = interaction.message.components[0].components[0].custom_id.split("-")[0] || null;
                if (!category) return await interaction.update({ content: "Категории не существует!", components: [] });
                let user = client.myusers.get(interaction.user.id);
                if (!user) user = client.createUser(interaction.user.id);
                let user_category = user.items.find(e => e.category === category);
                if (!user_category) return await interaction.reply({ content: "У вас эта категория и так пуста!", ephemeral: true });
                user_category.items = [];
                client.saveUser(interaction.user.id);
                return await interaction.update({ content: "Категория очищена!", components: [] });
            }
        } catch (e) { printError(error_here, "button listener error: "+e.message) }
    });
    client.on("interactionCreate", async interaction => {
        try {
            if (!interaction.isSelectMenu()) return;
            if (interaction.customId === "category") {
                let local_items = JSON.parse(JSON.stringify(market.find(e => e.value === interaction.values[0])));
                if (!local_items) return await interaction.update({ content: "Категории не существует!", components: [] });

                let user = client.myusers.get(interaction.user.id), flag = false;
                if (user) {
                    let search_category = user.items.find(e => e.category === interaction.values[0]);
                    if (search_category) {
                        local_items.items.forEach(e => {
                            if(search_category.items.map(a => a.value).includes(e.value)) flag = e.default = true;
                        });
                    }
                }
                const select_menu = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setMinValues(1)
                        .setCustomId(interaction.values[0]+"-items")
                        .setPlaceholder("Ничего не выбрано")
                        .addOptions(local_items.items),                     
                );
                const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('cancel')
                        .setLabel('Отмена')
                        .setStyle('SECONDARY'), 
                    new MessageButton()
                        .setCustomId('clear_all')
                        .setLabel('Очистить')
                        .setStyle('DANGER')
                        .setDisabled(!flag),
                );
                return await interaction.update({ content: "Выберите предметы", components: [select_menu, buttons] });
            } else if (interaction.customId.includes("items")) {
                const category = interaction.customId.split("-")[0],
                local_items = JSON.parse(JSON.stringify(market.find(e => e.value === category))),
                user_items = [];

                if (!local_items) return await interaction.update({ content: "Категории не существует!", components: [] });

                local_items.items.forEach(e => {
                    if (interaction.values.includes(e.value)) user_items.push(e);
                });

                let user = client.myusers.get(interaction.user.id);
                if (!user) user = client.createUser(interaction.user.id);

                let user_category = user.items.find(e => e.category === category);
                if (user_category) user_category.items = user_items;
                else user.items.push({ category: category, items: user_items });

                client.saveUser(interaction.user.id);

                const embed = new MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Ваш список отслеживания") //e.label || "ID:`"+e.split("-")[0]+"` LVL:`"+e.split("-")[1]+"`").join("\n")
                .setDescription(user.items.map(e => {
                    e.items.length > 0 ? e.items.map(a => a.label || "ID:`"+a.value.split("-")[0]+" `LVL:`"+a.value.split("-")[1]+"`").join("\n") : "";
                }).join("\n"));
                return interaction.update({content: "Список обновлен!", embeds: [embed], components: []});
            }
        } catch (e) { printError(error_here, "select menu listener error: "+e.message) }
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
        return Array.from(client.myusers.filter(u => {
            let all_items = [];
            u.items.forEach(a => a.items.forEach(b => all_items.push(b)));
            return (all_items.map(e => e.value).includes(item_id) && u.queue_alerts);
        }).keys());
    };
    client.getCouponsUsers = (flag) => {
        //if (client.cfg.debug) return [client.cfg.root];
        return Array.from(client.myusers.filter(u => u.coupons_alerts === flag).keys());
    };
    client.createUser = (id) => {
        client.myusers.set(id, { items: [], coupons_alerts: false, queue_alerts: true });
        return client.myusers.get(id);
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
