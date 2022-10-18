const { Client, Interaction } = require("discord.js");
const { printError } = require("../../functions.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where + "/error";
const log_here = where + "/log";

module.exports = {
  name: "купоны",
  description: "Возвращает доступные купоны",
  options: [
    {
      name: "список",
      description: "Посмотреть весь список",
      type: 1,
    },
    {
      name: "уведомления",
      description: "Влючить/отключить уведомления о новых купонах. По умолчанию отключено",
      type: 1,
    },
  ],
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    try {
      if (interaction.options.getSubcommand() === "список") {
        let coupons_list = client.getCoupons();
        if (coupons_list.length < 1) return await interaction.reply({ content: "Нет доступных на данный момент купонов." });
        await interaction.reply({
          embeds: [{
            color: "#2f3136",
            title: "Купоны",
            url: "https://orbit-games.com/",
            timestamp: new Date(),
            description: coupons_list.map(e => "```" + e + "```").join("\n")
          }]
        });
      } else if (interaction.options.getSubcommand() === "уведомления") {
        let usr = client.myusers.get(interaction.user.id);
        if (!usr) {
          client.createUser(interaction.user.id);
          usr = client.myusers.get(interaction.user.id);
        }
        usr.coupons_alerts = !usr.coupons_alerts;
        client.saveUser(interaction.user.id);
        return await interaction.reply({ content: `Информирование о купонах теперь ${usr.coupons_alerts ? "выполняется" : "не выполняется"}` });
      }
    } catch (e) {
      printError(error_here, e.message);
    }
  },
};