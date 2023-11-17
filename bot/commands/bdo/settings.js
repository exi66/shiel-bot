const crypto = require("crypto");
const { Command } = require("@sapphire/framework");
const {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const { categories } = require("../../src/bundles.js");
const { where } = require("sequelize");

class WantCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName("settings").setDescription("Настроить работу приложения")
    );
  }

  async chatInputRun(interaction) {
    await interaction.reply({
      content: "Выполнение...",
      ephemeral: true,
      fetchReply: true,
    });

    const User = global.db.users;
    const Link = global.db.links;
    let user = await User.findOne({
      where: {
        discord_id: interaction.user.id,
      },
    });
    if (!user) {
      user = await User.create({
        discord_id: interaction.user.id,
      });
    }

    await Link.destroy({
      where: {
        user_id: user.id,
      },
    });

    const buf1 = Buffer.from(interaction.user.id, "utf8");
    const buf2 = Buffer.from(new Date().toISOString(), "utf8");
    const buf3 = Buffer.from(global.config.token, "utf8");
    const bufResult = buf1.map(
      (b) =>
        b ^
        buf2[Math.floor(Math.random() * buf2.length)] ^
        buf3[Math.floor(Math.random() * buf3.length)]
    );
    const linkHash = bufResult.toString("hex");
    const expired = new Date(new Date().getTime() + 10 * 60000);

    await Link.create({
      user_id: user.id,
      link: linkHash,
      expired_at: expired.getTime(),
    });

    await interaction.followUp({
      content: `Вы можете настроить свои уведомления по [это ссылке](${
        global.config.hostname
      }${linkHash})\r\nСсылка истечет через <t:${Math.floor(
        expired.getTime() / 1000
      )}:R>`,
      ephemeral: true,
      fetchReply: true,
    });
  }
}

module.exports = {
  WantCommand,
};
