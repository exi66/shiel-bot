const { Client, Interaction } = require("discord.js");
const { printError } = require("../../functions.js");

const where = __filename.slice(__dirname.length + 1);
const error_here = where+"/error";
const log_here = where+"/log";

module.exports = {
  name: "ping",
  description: "Возвращает задержку API",
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    try {
      const mesg = await interaction.reply({ content: "Pinging....", fetchReply: true });
      await interaction.editReply({ content: `🏓 Pong!\nWebsocket Latency: \`${client.ws.ping}ms\`` });
    } catch (e) {
      printError(error_here, e.message);
    }
  },
};