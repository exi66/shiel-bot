import crypto from "node:crypto";
import https from "node:https";
import cron from "node-cron";
import got from "got";
import { ActivityType, EmbedBuilder } from "discord.js";
import { config, db } from "@shiel/shared";
import { EMBED_COLOR, DEFAULT_USER_AGENT } from "./constants.js";
import { formatPrice } from "./utils.js";

// Некоторые эндпоинты BDO используют legacy TLS-рукопожатие.
const httpsAgent = new https.Agent({
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

// Состояние между итерациями (раньше жило в global.*)
let coupons = null;
let queue = { lastUpdate: null, items: [] };

export function startWorkers(client) {
  cron.schedule("* * * * *", () => run(client));
}

// Текущее состояние очереди аукциона (для команды /queue).
export function getQueueState() {
  return queue;
}

// Текущий список купонов (для команды /coupons).
export function getCouponsState() {
  return coupons;
}

async function run(client) {
  const nextCheck = new Date(Date.now() + 60 * 1000).toLocaleTimeString(
    "ru-RU",
  );
  client.user.setPresence({
    activities: [
      { name: `проверка аукциона в ${nextCheck}`, type: ActivityType.Playing },
    ],
  });

  if (config.services.coupons) getCoupons(client);
  if (config.services.queue) getQueue(client);
}

async function getCoupons(client) {
  try {
    if (!config.market.couponsUrl) return;

    const html = await got
      .get(config.market.couponsUrl, {
        headers: {
          "user-agent": config.links.git || DEFAULT_USER_AGENT,
        },
      })
      .text();

    // Коды лежат в <strong>КОД</strong>; купон — латиница+цифры (+возможен «!»), ровно 12 или 16 символов.
    const found = [];
    for (const m of html.matchAll(/<strong>([\s\S]*?)<\/strong>/gi)) {
      const code = m[1]
        .replace(/<[^>]+>/g, "")
        .trim()
        .toUpperCase();
      if (/^(?:[A-Z0-9!]{12}|[A-Z0-9!]{16})$/.test(code)) found.push(code);
    }
    const codes = [...new Set(found)];

    // Первая итерация после старта — только запоминаем базовый список, без уведомлений.
    if (coupons === null) {
      coupons = codes;
      return;
    }

    const fresh = codes.filter((c) => !coupons.includes(c));
    if (fresh.length > 0) {
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("Купоны")
        .setURL(config.market.couponsUrl)
        .setTimestamp(new Date())
        .setDescription(fresh.map((c) => "```" + c + "```").join("\n"));

      for (const userId of db.getCouponSubscribers()) {
        const user = await client.users.fetch(userId).catch(() => null);
        if (user) await user.send({ embeds: [embed] }).catch(() => null);
      }
    }

    coupons = codes;
  } catch (e) {
    console.error(`[${new Date().toISOString()}] coupons worker error: `, e);
  }
}

async function getQueue(client) {
  try {
    if (!config.market.url || !config.market.cookie) return;

    const res = await got.post(
      config.market.url + "Home/GetWorldMarketWaitList",
      {
        json: {},
        agent: { https: httpsAgent },
        headers: {
          "content-type": "application/json",
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          cookie: config.market.cookie,
          referer: config.market.url,
          "user-agent": DEFAULT_USER_AGENT,
        },
      },
    );

    // Во время техработ трейд-сайт редиректит запрос на HTML-страницу
    // обслуживания (/Maintenance/WebMaintanace) — она не парсится как JSON.
    let body;
    try {
      body = JSON.parse(res.body);
    } catch {
      console.warn(
        `[${new Date().toISOString()}] market worker: маркет недоступен (техобслуживание), пропускаю итерацию`,
      );
      return;
    }

    const data = body?._waitList ?? [];
    const items = data.map((e) => ({
      id: e.mainKey,
      lvl: e.chooseKey,
      price: e._pricePerOne,
      time: e._waitEndTime,
      name: e.name,
      unique: "" + e.mainKey + e.chooseKey + e._waitEndTime,
    }));

    const oldUniques = new Set(queue.items.map((a) => a.unique));
    const newItems = items.filter((e) => !oldUniques.has(e.unique));

    for (const item of newItems) {
      const userIds = db.getItemSubscribers(item.id, item.lvl);
      for (const userId of userIds) {
        const user = await client.users.fetch(userId).catch(() => null);
        if (!user) continue;

        await user
          .send({
            content:
              `${user}, лот «**${item.name}**» зарегистрирован ` +
              `на аукционе за ${formatPrice(item.price)}. ` +
              `Время размещения <t:${(item.time / 1000).toFixed(0)}:R>`,
          })
          .catch(() => null);
      }
    }

    queue = { lastUpdate: new Date(), items };
  } catch (e) {
    console.error(`[${new Date().toISOString()}] market worker error: `, e);
  }
}
