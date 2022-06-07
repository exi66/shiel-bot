const { printError } = require("./functions.js");
const { Client, Collection, Intents, MessageEmbed } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

const rare_items = [
        {
            label: "V: Основное оружие Черной звезды",
            value: "pen_bs_mainhand",
            items: [
                { label: "V: Меч Черной звезды", value: "715001-20" }, { label: "V: Лук Черной звезды", value: "715003-20" },
                { label: "V: Талисман Черной звезды", value: "715005-20" }, { label: "V: Топор Черной звезды", value: "715007-20" },
                { label: "V: Клинок Черной звезды", value: "715009-20" }, { label: "V: Катана Черной звезды", value: "715011-20" },
                { label: "V: Посох Черной звезды", value: "715013-20" }, { label: "V: Крейг-мессер Черной звезды", value: "715016-20" },
                { label: "V: Боевые перчатки Черной звезды", value: "715017-20" }, { label: "V: Маятник Черной звезды", value: "715019-20" },
                { label: "V: Арбалет Черной звезды", value: "715021-20" }, { label: "V: Флоранг Черной звезды", value: "718616-20" },
                { label: "V: Секира Черной звезды", value: "690563-20" }, { label: "V: Шамшир Черной звезды", value: "692045-20" },
                { label: "V: Моргенштерн Черной звезды", value: "730564-20" }, { label: "V: Каив Черной звезды", value: "732313-20" },
                { label: "V: Сэренака Черной звезды", value: "733063-20" }, { label: "V: Слэйер Черной звезды", value: "73546-20" }
            ]
        },
        {
            label: "V: Доп. оружие Черной звезды",
            value: "pen_bs_offhand",
            items: [
                { label: "V: Щит Черной звезды", value: "735001-20" }, { label: "V: Кинжал Черной звезды", value: "735002-20" }, 
                { label: "V: Амулет Черной звезды", value: "735003-20" }, { label: "V: Темляк Черной звезды", value: "735004-20" }, 
                { label: "V: Брелок Черной звезды", value: "735005-20" }, { label: "V: Роговой лук Черной звезды", value: "735006-20" }, 
                { label: "V: Кунай Черной звезды", value: "735007-20" }, { label: "V: Сюрикен Черной звезды", value: "735008-20" }, 
                { label: "V: Браслеты Черной звезды", value: "735009-20" }, { label: "V: Древний меч Черной звезды", value: "735010-20" }, 
                { label: "V: Гарпун Черной звезды", value: "735011-20" }, { label: "V: Витклар Черной звезды", value: "735012-20" }, 
                { label: "V: Халади Черной звезды", value: "735013-20" }, { label: "V: Кратум Черной звезды", value: "735014-20" }, 
                { label: "V: Марека Черной звезды", value: "735015-20" }, { label: "V: Шард Черной звезды", value: "735016-20" }
            ]
        },
        {
            label: "V: Проб. оружие Черной звезды",
            value: "pen_bs_awakening",
            items: [
                { label: "V: Боевые наручи Черной звезды", value: "731114-20" }, { label: "V: Клинки асуров Черной звезды", value: "731109-20" }, 
                { label: "V: Клинки крови Черной звезды", value: "731117-20" }, { label: "V: Копье Черной звезды", value: "731106-20" }, 
                { label: "V: Коса Черной звезды", value: "731102-20" }, { label: "V: Ведиант Черной звезды", value: "731113-20" }, 
                { label: "V: Великий лук Черной звезды", value: "731116-20" }, { label: "V: Глефа Черной звезды", value: "731107-20" }, 
                { label: "V: Двуручный меч Черной звезды", value: "731101-20" }, { label: "V: Змеиное копье Черной звезды", value: "731108-20" }, 
                { label: "V: Ручная пушка Черной звезды", value: "731103-20" }, { label: "V: Стихийный клинок Черной звезды", value: "731104-20" }, 
                { label: "V: Сферы природы Черной звезды", value: "731111-20" }, { label: "V: Сферы стихий Черной звезды", value: "731112-20" }, 
                { label: "V: Цестус Черной звезды", value: "731115-20" }, { label: "V: Чакрам Черной звезды", value: "731110-20" }, 
                { label: "V: Чанбон Черной звезды", value: "731105-20" }, { label: "V: Йордун Черной звезды", value: "731118-20" }, 
                { label: "V: Двойная глефа Черной звезды", value: "731119-20" }, { label: "V: Стинг Черной звезды", value: "731120-20" }, 
                { label: "V: Кибелиус Черной звезды", value: "731121-20" }, { label: "V: Патрака Черной звезды", value: "731122-20" }
            ]
        },
        {
            label: "III: Доспехи Мертвого бога",
            value: "tri_god_armor",
            items: [
                { label: "III: Доспехи Мертвого бога", value: "719898-3" }
            ]
        },
        {
            label: "IV: Доспехи Мертвого бога",
            value: "tet_god_armor",
            items: [
                { label: "IV: Доспехи Мертвого бога", value: "719898-4" }
            ]
        },
        {
            label: "V: Доспехи Мертвого бога",
            value: "pen_god_armor",
            items: [
                { label: "V: Доспехи Мертвого бога", value: "719898-5" }
            ]
        },
        {
            label: "III: Шлем Лабрескас",
            value: "tri_god_helmet",
            items: [
                { label: "III: Шлем Лабрескас", value: "719897-3" }
            ]
        },
        {
            label: "IV: Шлем Лабрескас",
            value: "tet_god_helmet",
            items: [
                { label: "IV: Шлем Лабрескас", value: "719897-4" }
            ]
        },
        {
            label: "V: Шлем Лабрескас",
            value: "pen_god_helmet",
            items: [
                { label: "V: Шлем Лабрескас", value: "719897-5" }
            ]
        },
        {
            label: "IV: Пояс Деборики",
            value: "tet_deborika_belt",
            items: [
                { label: "IV: Пояс Деборики", value: "12276-4" }
            ]
        }, 
        {
            label: "V: Пояс Деборики",
            value: "pen_deborika_belt",
            items: [
                { label: "V: Пояс Деборики", value: "12276-5" }
            ]
        },
        {
            label: "IV: Ожерелье Деборики",
            value: "tet_deborika_necklace",
            items: [
                { label: "IV: Ожерелье Деборики", value: "11653-4" }
            ]
        }, 
        {
            label: "V: Ожерелье Деборики",
            value: "pen_deborika_necklace",
            items: [
                { label: "V: Ожерелье Деборики", value: "11653-5" }
            ]
        },
        {
            label: "V: Бижутерия Маноса",
            value: "pen_manos",
            items: [
                { label: "V: Ожерелье Маноса", value: "705509-5" }, { label: "V: Пояс Маноса", value: "705512-5" },
                { label: "V: Серьги Маноса", value: "705510-5" }, { label: "V: Кольцо Маноса", value: "705511-5" }
            ]
        },        
]

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

            let usr = client.myusers.get(interaction.user.id);
            if (!usr) {
                client.createUser(interaction.user.id);
                usr = client.myusers.get(interaction.user.id);
            }
            usr.categories = interaction.values;
            usr.items = item_list;

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
        if (client.cfg.debug) return [client.cfg.root];
        return Array.from(client.myusers.filter(u => u.items.map(e => e.value).includes(item_id)).keys());
    };
    client.getCouponsUsers = (flag) => {
        if (client.cfg.debug) return [client.cfg.root];
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
        let queue_list = [];
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
