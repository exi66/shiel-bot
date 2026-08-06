import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { config, validateServerConfig } from "@shiel/shared/config";
import {
  checkLink,
  updateItems,
  toggleCoupons,
  toggleQueue,
} from "@shiel/shared/db";
import { refreshCatalog } from "./catalog.js";

// Падаем сразу, если нет необходимых данных сервера.
validateServerConfig();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// Каталог предметов обновляем при старте (пишет data/items.json).
// Если источник недоступен — откатываемся на локальный market.json (сырой формат API);
// пустым остаётся, только если и локального файла нет.
let itemsCatalog = [];
refreshCatalog()
  .then((data) => {
    itemsCatalog = data;
    console.log(`Catalog has been updated: ${data.length} items`);
  })
  .catch((e) => console.error("Catalog error:", e.message));

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
  if (!data)
    return res.status(404).json({ error: "link not found or expired" });
  res.json(data);
});

// Заменить список отслеживаемых предметов
app.post("/api/user/:token/items", (req, res) => {
  const ok = updateItems(req.params.token, req.body?.items ?? []);
  if (!ok) return res.status(404).json({ error: "link not found or expired" });
  res.json({ ok: true });
});

// Переключить подписку на купоны
app.post("/api/user/:token/toggle-coupons", (req, res) => {
  const ok = toggleCoupons(req.params.token);
  if (!ok) return res.status(404).json({ error: "link not found or expired" });
  res.json({ ok: true });
});

// Переключить подписку на очередь
app.post("/api/user/:token/toggle-queue", (req, res) => {
  const ok = toggleQueue(req.params.token);
  if (!ok) return res.status(404).json({ error: "link not found or expired" });
  res.json({ ok: true });
});

// ---- Хостинг React-билда (@shiel/web) ----
const webDist = path.resolve(__dirname, "..", "..", "web", "dist");
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
} else {
  console.warn("web/dist not found — run: pnpm build:web");
}

app.listen(config.server.port, () => {
  console.log(`Server listening at http://localhost:${config.server.port}`);
});
