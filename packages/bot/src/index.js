import {
  SapphireClient,
  ApplicationCommandRegistries,
  RegisterBehavior,
} from "@sapphire/framework";
import { GatewayIntentBits, Partials, ActivityType } from "discord.js";
import { config, validateBotConfig } from "@shiel/shared/config";
import { closeDb } from "@shiel/shared/db";
import { createLogger } from "@shiel/shared/logger";
import { stopWorkers } from "./lib/worker.js";

const log = createLogger("bot");

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

async function shutdown(signal) {
  log.info(`${signal} received, shutting down`);
  stopWorkers();
  await client.destroy().catch(() => null);
  closeDb();
  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

client.login(config.discord.token);
