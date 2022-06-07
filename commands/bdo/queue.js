const { Client, Interaction } = require("discord.js");
const { printError } = require("../../functions.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = {
    name: "queue",
    description: "Возвращает текущую очередь аукциона",
    /**
     * @param {Client} client
     * @param {Interaction} interaction
     */
    execute: async (client, interaction) => {
        try {
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
        } catch (e) {
            printError(error_here, e.message);
        }
    },
};