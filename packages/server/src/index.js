import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { config, validateServerConfig } from "@shiel/shared/config";
import {
  checkLink,
  updateItems,
  updateSettings,
  closeDb,
} from "@shiel/shared/db";
import { parseItems } from "@shiel/shared/items";
import { createLogger } from "@shiel/shared/logger";
import { loadCatalog } from "./catalog.js";

const log = createLogger("server");

// Падаем сразу, если нет необходимых данных сервера.
validateServerConfig();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// Каталог предметов загружаем при старте.
// Если источник недоступен — откатываемся на fixtures/market.json (сырой формат API);
// пустым остаётся, только если и локального файла нет.
let itemsCatalog = [];
let catalogKeys = new Set();
loadCatalog()
  .then((data) => {
    itemsCatalog = data;
    catalogKeys = new Set(data.map((e) => `${e.id}-${e.enhancement_level}`));
    log.info(`catalog loaded: ${data.length} items`);
  })
  .catch((e) => log.error("catalog error:", e.message));

const notFound = (res) =>
  res.status(404).json({ error: "link not found or expired" });
const badRequest = (res, error) => res.status(400).json({ error });

// ---- API (общая БД с ботом) ----
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: config.nodeEnv });
});

// Каталог предметов
app.get("/api/items", (_req, res) => {
  res.json(itemsCatalog);
});

// Данные страницы настроек по токену ссылки
app.get("/api/user/:token", (req, res) => {
  const data = checkLink(req.params.token);
  if (!data) return notFound(res);
  res.json(data);
});

// Заменить список отслеживаемых предметов
app.put("/api/user/:token/items", (req, res) => {
  const items = parseItems(req.body?.items);
  if (!items) return badRequest(res, "invalid items");

  // Пока каталог не загружен, проверку по нему пропускаем.
  if (catalogKeys.size > 0) {
    const unknown = items.some((i) => !catalogKeys.has(`${i.id}-${i.lvl}`));
    if (unknown) return badRequest(res, "unknown item");
  }

  if (!updateItems(req.params.token, items)) return notFound(res);
  res.json({ ok: true });
});

// Обновить флаги уведомлений: { notifyCoupons?: boolean, notifyQueue?: boolean }
app.patch("/api/user/:token/settings", (req, res) => {
  const body = req.body ?? {};
  const patch = {};
  for (const key of ["notifyCoupons", "notifyQueue"]) {
    if (key in body) {
      if (typeof body[key] !== "boolean") {
        return badRequest(res, `${key} must be boolean`);
      }
      patch[key] = body[key];
    }
  }

  const user = updateSettings(req.params.token, patch);
  if (!user) return notFound(res);
  res.json({ ok: true, user });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "not found" });
});

// ---- Хостинг React-билда (@shiel/web) ----
const webDist = path.resolve(__dirname, "..", "..", "web", "dist");
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
} else {
  log.warn("web/dist not found — run: pnpm build:web");
}

// Единый обработчик ошибок: без стектрейсов наружу.
app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") {
    return badRequest(res, "invalid json");
  }
  log.error(err);
  res.status(err.status ?? 500).json({ error: "internal error" });
});

const server = app.listen(config.server.port, () => {
  log.info(`listening at http://localhost:${config.server.port}`);
});

function shutdown(signal) {
  log.info(`${signal} received, shutting down`);
  server.close(() => {
    closeDb();
    process.exit(0);
  });
  // Не ждём бесконечно висящие keep-alive соединения.
  setTimeout(() => {
    closeDb();
    process.exit(0);
  }, 5000).unref();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
