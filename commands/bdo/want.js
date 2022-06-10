const { Client, Interaction } = require("discord.js");
const { printError } = require("../../functions.js");
const { market } = require("../../data/bundles.js");
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require("discord.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = {
    name: "want",
    description: "Добавить товар для отслеживания на аукционе",
    options: [
        {
            name: "presets",
            description: "Добавить/изменить отслеживание по популярным пресетам",
            type: 1,
        },
        {
            name: "list",
            description: "Посмотреть свои отслеживемые товары",
            type: 1,
        },
        {
            name: "clear",
            description: "Очистить весь список",
            type: 1,
        },
        {
            name: "alerts",
            description: "Влючить/отключить уведомления о желаемых товарах. По умолчанию включено",
            type: 1,
        },
        {
            name: "add",
            description: "Добавить свой предмет для отслеживания",
            type: 1,
            options: [
                {
                    name: "name",
                    description: "Название предмета. Понятное вам, потому что через него происходят все манипуляции",
                    type: 3,
                    required: true,
                },
                {
                    name: "id",
                    description: "ID предмета",
                    type: 4,
                    required: true,
                },
                {
                    name: "enchant",
                    description: "Уровень усиления",
                    type: 4,
                    required: true,
                },                
            ],
        },
        {
            name: "rm",
            description: "Удалить предмет из отслеживаемых",
            type: 1,
        },
    ],
    /**
    * @param {Client} client
    * @param {Interaction} interaction
    */
    execute: async (client, interaction) => {
        try {
            if (interaction.options.getSubcommand() === "clear") {
                let usr = client.myusers.get(interaction.user.id);
                if (!usr) return await interaction.reply({content: "Ваш список и так пуст!"});
                usr.categories = [];
                usr.items = [];
                client.saveUser(interaction.user.id);
                return await interaction.reply({ content: "Список отслеживаемых товаров очищен!"});
            } else if (interaction.options.getSubcommand() === "list") {
                let usr = client.myusers.get(interaction.user.id);
                if (!usr || usr.items.length < 1) return await interaction.reply({content: "Ваш список пуст!"});
                let embed = new MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Ваш список отслеживания")
                .setDescription(usr.items.map(e => e.label || "ID:`"+e.value.split("-")[0]+"` LVL:`"+e.value.split("-")[1]+"`").join("\n"));
                return await interaction.reply({embeds: [embed]});
            } else if (interaction.options.getSubcommand() === "presets") {
                //console.log(interaction);
                let list = [], local_market = market.map(obj => ({...obj}));
                const usr = client.myusers.get(interaction.user.id);
                local_market.forEach((e) => {
                    if (usr) {
                        e.default = usr.categories.includes(e.value);
                    }
                    list.push(e);
                })
                const items = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setMinValues(0)
                        .setCustomId("want")
                        .setPlaceholder("Ничего не выбрано")
                        .addOptions(list),                       
                );
                return await interaction.reply({ content: "Выберите предметы", components: [items] });
            } else if (interaction.options.getSubcommand() === "add") {
                let item = {
                    label: interaction.options.get("name").value,
                    value: interaction.options.get("id").value+"-"+interaction.options.get("enchant").value,
                }
                let usr = client.myusers.get(interaction.user.id);
                if (!usr) {
                    client.createUser(interaction.user.id);
                    usr = client.myusers.get(interaction.user.id);
                }
                usr.items.push(item);
                client.saveUser(interaction.user.id);
                let embed = new MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Ваш список отслеживания")
                .setDescription(usr.items.map(e => e.label || "ID:`"+e.value.split("-")[0]+"` LVL:`"+e.value.split("-")[1]+"`").join("\n"));
                return await interaction.reply({ content: "Список обновлен!", embeds: [embed] });
            } else if (interaction.options.getSubcommand() === "rm") {
                const usr = client.myusers.get(interaction.user.id).items.length > 25 ? client.myusers.get(interaction.user.id).items.slice(0, 25) : client.myusers.get(interaction.user.id).items;
                const items = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId("delete")
                        .setMaxValues(1)
                        .setPlaceholder("Ничего не выбрано")
                        .addOptions(usr),                       
                );
                return await interaction.reply({ content: "Выберите предмет, который хотите удалить из отслеживания", components: [items] });
            } else if (interaction.options.getSubcommand() === "alerts") {
                let usr = client.myusers.get(interaction.user.id);
                if (!usr) {
                    client.createUser(interaction.user.id);
                    usr = client.myusers.get(interaction.user.id);
                }
                usr.queue_alerts = !usr.queue_alerts;
                client.saveUser(interaction.user.id);
                return await interaction.reply({content: `Информирование о поступлении теперь ${usr.queue_alerts ? "выполняется" : "не выполняется" }`});
            }
        } catch (e) {
            printError(error_here, e.message);
        }
    },
};