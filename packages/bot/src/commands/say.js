import { Command } from "@sapphire/framework";
import * as db from "@shiel/shared/db";
import { sendDirect } from "../lib/notify.js";

export class SayCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "say",
      aliases: ["s"],
      description: "Написать всем пользователям бота",
      preconditions: ["ownerOnly"],
    });
  }

  // Только messageRun и никакого registerApplicationCommands —
  // команда не регистрируется как slash, доступна лишь по префиксу владельцу.
  // В тексте каждое «@user» заменяется на упоминание получателя.
  async messageRun(message, args) {
    const text = await args.rest("string");

    const sent = await sendDirect(db.getAllUserIds(), (user) => ({
      content: text.replaceAll("@user", `${user}`),
    }));

    await message.reply(`Отправлено: ${sent}`).catch(() => null);
  }
}
