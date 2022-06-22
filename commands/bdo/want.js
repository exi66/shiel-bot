const { Client, Interaction } = require("discord.js");
const { printError } = require("../../functions.js");
const { market } = require("../../data/bundles.js");
const { MessageActionRow, MessageSelectMenu, MessageEmbed, MessageButton } = require("discord.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = {
    name: "аукцион",
    description: "Добавить товар для отслеживания на аукционе",
    options: [
        {
            name: "отслеживать",
            description: "Добавить/изменить отслеживание по популярным пресетам",
            type: 1,
        },
        {
            name: "список",
            description: "Посмотреть свои отслеживемые товары",
            type: 1,
        },
        {
            name: "очистить",
            description: "Очистить весь список",
            type: 1,
        },
        {
            name: "очередь",
            description: "Возвращает текущую очередь аукциона",
            type: 1,
        },
        {
            name: "уведомления",
            description: "Влючить/отключить уведомления о желаемых товарах. По умолчанию включено",
            type: 1,
        }
    ],
    /**
    * @param {Client} client
    * @param {Interaction} interaction
    */
    execute: async (client, interaction) => {
        try {
            if (interaction.options.getSubcommand() === "очистить") {
                let user = client.myusers.get(interaction.user.id);
                if (!user) return await interaction.reply({content: "Ваш список и так пуст!"});
                user.items = [];
                client.saveUser(interaction.user.id);
                return await interaction.reply({ content: "Список отслеживаемых товаров очищен!"});
            } else if (interaction.options.getSubcommand() === "список") {
                let user = client.myusers.get(interaction.user.id);
                if (!user || user.items.length < 1) return await interaction.reply({content: "Ваш список пуст!"});
                let local_names = [];
                user.items.map(e => e.items.map(a => local_names.push(a.label || "ID:`"+a.value.split("-")[0]+" `LVL:`"+a.value.split("-")[1]+"`")));
                const embed = new MessageEmbed()
                .setColor("#2f3136")
                .setTitle("Ваш список отслеживания")
                .setDescription(local_names.join("\n"));
                return await interaction.reply({embeds: [embed]});
            } else if (interaction.options.getSubcommand() === "отслеживать") {
                const local_market = market.map(e => ({...e}));
                const select_menu = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId("category")
                        .setPlaceholder("Ничего не выбрано")
                        .addOptions(local_market),                       
                );
                const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('cancel')
                        .setLabel('Отмена')
                        .setStyle('SECONDARY'),  
                );
                return await interaction.reply({ content: "Выберите категорию", components: [select_menu, buttons] });
            } else if (interaction.options.getSubcommand() === "уведомления") {
                let user = client.myusers.get(interaction.user.id);
                if (!user) {
                    client.createUser(interaction.user.id);
                    user = client.myusers.get(interaction.user.id);
                }
                user.queue_alerts = !user.queue_alerts;
                client.saveUser(interaction.user.id);
                return await interaction.reply({content: `Информирование о поступлении теперь ${user.queue_alerts ? "выполняется" : "не выполняется" }`});
            } else if (interaction.options.getSubcommand() === "очередь") {
                let queue_list = client.getQueue();
                if (!queue_list.items) return await interaction.reply({ content: "Очередь аукциона пуста."});
                if (queue_list.items.length < 1) return await interaction.reply({ content: "Очередь аукциона пуста."});
                await interaction.reply({ embeds: [{
                    color: "#2f3136",
                    title: "Очередь аукциона",
                    timestamp: new Date(queue_list.lastUpdate),
                    fields: [
                        { name: "Ур.", value: queue_list.items.map(e => e.lvl).join("\n"), inline: true},
                        { name: "Название", value: queue_list.items.map(e => e.name).join("\n"), inline: true},
                        { name: "Время размещения", value: queue_list.items.map(e => `<t:${(e.time/1000).toFixed(0)}:R>`).join("\n"), inline: true}
                    ]
                }]});
            }
        } catch (e) {
            printError(error_here, e.message);
        }
    },
};