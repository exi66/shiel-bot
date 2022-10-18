const { Client, Interaction, MessageActionRow, MessageEmbed, MessageButton } = require("discord.js");
const { printError } = require("../../functions.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where + "/error";
const log_here = where + "/log";

module.exports = {
  name: "инфо",
  description: "Информация о боте",
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    try {
      const buttons = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('GitHub')
            .setStyle('LINK')
            .setURL("https://github.com/exi66/bdo-market-wait-list"),
          new MessageButton()
            .setLabel('Telegram')
            .setStyle('LINK')
            .setURL("https://t.me/exi666"),
          new MessageButton()
            .setLabel('Donate')
            .setStyle('LINK')
            .setURL("https://new.donatepay.ru/@exi"),
        );
      const embed = new MessageEmbed()
        .setColor("#2f3136")
        .setTitle("О проекте")
        .setDescription("Discord.js бот для отслеживания регистрации редких предметов на аукционе игры Black Desert Online. Поддерживает только русскоговорящий регион.");
      return interaction.reply({ embeds: [embed], components: [buttons] });
    } catch (e) {
      printError(error_here, e.message);
    }
  },
};