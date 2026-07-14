import {
  SapphireClient,
  ApplicationCommandRegistries,
  RegisterBehavior,
} from "@sapphire/framework";
import { GatewayIntentBits, Partials, ActivityType } from "discord.js";
import { config, validateBotConfig } from "@shiel/shared/config";

// Падаем сразу, если нет необходимых данных (токен, данные включённых воркеров).
validateBotConfig();

// При старте перезаписываем набор slash-команд целиком:
// старые (которых больше нет) удаляются, актуальные регистрируются — кэш обновляется сразу.
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

const client = new SapphireClient({
  defaultPrefix: config.discord.prefix,
  caseInsensitivePrefixes: true,
  caseInsensitiveCommands: true,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
  ],
  partials: [Partials.Channel],
  loadMessageCommandListeners: true,
  presence: {
    activities: [{ name: "/settings", type: ActivityType.Playing }],
    status: "online",
  },
});

client.login(config.discord.token);
