import fs from "node:fs";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Корень монорепо: packages/shared/src -> ../../..
const rootDir = path.resolve(__dirname, "..", "..", "..");

loadEnv({ path: path.join(rootDir, ".env") });

// Ссылка на репозиторий берётся из корневого package.json (поле repository).
function readGitUrl() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(rootDir, "package.json"), "utf8"),
    );
    const repo = pkg.repository;
    const url = typeof repo === "string" ? repo : repo?.url;
    if (!url) return "";
    return url.replace(/^git\+/, "").replace(/\.git$/, "");
  } catch {
    return "";
  }
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env variable: ${name}`);
  return value;
}

function bool(value, fallback = false) {
  if (value == null) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function list(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  // БД (общая для бота и сервера)
  databasePath: path.resolve(
    rootDir,
    process.env.DATABASE_PATH ?? "./data/app.db",
  ),

  // Discord bot
  discord: {
    token: process.env.DISCORD_TOKEN ?? "",
    clientId: process.env.DISCORD_CLIENT_ID ?? "",
    owners: list(process.env.DISCORD_OWNERS),
    prefix: process.env.DISCORD_PREFIX ?? "!",
  },

  // Express server
  server: {
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? "",
  },

  // Воркеры / сервисы
  services: {
    coupons: bool(process.env.SERVICE_COUPONS),
    queue: bool(process.env.SERVICE_QUEUE),
  },

  // BDO market
  market: {
    url: process.env.MARKET_URL ?? "",
    cookie: process.env.MARKET_COOKIE ?? "",
    couponsUrl: process.env.COUPONS_URL ?? "",
  },

  // Внешние ссылки
  links: {
    git: readGitUrl(),
  },

  required,
};

function assert(cond, message) {
  if (!cond) throw new Error(`[config] ${message}`);
}

// Проверка окружения для бота (и его воркеров). Бросает, если данных не хватает.
export function validateBotConfig() {
  assert(config.discord.token, "DISCORD_TOKEN is required to start the bot");

  // Воркеры поднимаются только если для них есть все данные.
  if (config.services.coupons) {
    assert(config.market.couponsUrl, "SERVICE_COUPONS=true requires COUPONS_URL");
  }
  if (config.services.queue) {
    assert(config.market.url, "SERVICE_QUEUE=true requires MARKET_URL");
    assert(config.market.cookie, "SERVICE_QUEUE=true requires MARKET_COOKIE");
  }
}

// Проверка окружения для Express-сервера.
export function validateServerConfig() {
  assert(
    config.server.host,
    "HOST is required for the server (used in settings links)",
  );
}

export default config;
