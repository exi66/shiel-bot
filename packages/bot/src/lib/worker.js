import crypto from "node:crypto";
import https from "node:https";
import cron from "node-cron";
import got from "got";
import { ActivityType, EmbedBuilder } from "discord.js";
import { config } from "@shiel/shared/config";
import * as db from "@shiel/shared/db";
import { BROWSER_USER_AGENT, REQUEST_TIMEOUT_MS } from "@shiel/shared/http";
import { createLogger } from "@shiel/shared/logger";
import { EMBED_COLOR } from "./constants.js";
import { formatPrice } from "./utils.js";
import {
  newCoupons,
  newLots,
  parseCoupons,
  parseWaitList,
  toUnixSeconds,
} from "./market.js";
import { sendDirect } from "./notify.js";

const couponsLog = createLogger("coupons worker");
const marketLog = createLogger("market worker");

// Некоторые эндпоинты BDO используют legacy TLS-рукопожатие.
const httpsAgent = new https.Agent({
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

// Состояние между итерациями. null — первая итерация ещё не прошла:
// в ней только запоминаем текущий снимок, без уведомлений (иначе после
// каждого рестарта всем прилетали бы уже известные купоны/лоты).
let coupons = null;
let queue = { lastUpdate: null, items: null };

let task = null;

export function startWorkers(client) {
  task = cron.schedule("* * * * *", () => run(client));
  run(client);
}

export function stopWorkers() {
  task?.stop();
  task = null;
}

// Текущее состояние очереди аукциона (для команды /queue).
export function getQueueState() {
  return { lastUpdate: queue.lastUpdate, items: queue.items ?? [] };
}

// Текущий список купонов (для команды /coupons).
export function getCouponsState() {
  return coupons ?? [];
}

// Не даёт запустить новую итерацию, пока предыдущая не завершилась
// (иначе при медленном ответе две итерации видят один и тот же «старый»
// снимок и шлют дубли).
function exclusive(fn) {
  let running = false;
  return async (...args) => {
    if (running) return;
    running = true;
    try {
      await fn(...args);
    } finally {
      running = false;
    }
  };
}

function run(client) {
  const nextCheck = new Date(Date.now() + 60 * 1000).toLocaleTimeString(
    "ru-RU",
  );
  client.user.setPresence({
    activities: [
      { name: `проверка аукциона в ${nextCheck}`, type: ActivityType.Playing },
    ],
  });

  if (config.services.coupons) checkCoupons(client);
  if (config.services.queue) checkQueue(client);
}

const checkCoupons = exclusive(async () => {
  try {
    const html = await got
      .get(config.market.couponsUrl, {
        headers: { "user-agent": config.links.git || BROWSER_USER_AGENT },
        timeout: { request: REQUEST_TIMEOUT_MS },
      })
      .text();

    const codes = parseCoupons(html);

    if (coupons !== null) {
      const fresh = newCoupons(coupons, codes);
      if (fresh.length > 0) {
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setTitle("Купоны")
          .setURL(config.market.couponsUrl)
          .setTimestamp(new Date())
          .setDescription(fresh.map((c) => "```" + c + "```").join("\n"));

        await sendDirect(db.getCouponSubscribers(), { embeds: [embed] });
      }
    }

    coupons = codes;
  } catch (e) {
    couponsLog.error(e);
  }
});

const checkQueue = exclusive(async () => {
  try {
    const res = await got.post(
      new URL("Home/GetWorldMarketWaitList", config.market.url),
      {
        json: {},
        agent: { https: httpsAgent },
        timeout: { request: REQUEST_TIMEOUT_MS },
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          cookie: config.market.cookie,
          referer: config.market.url,
          "user-agent": BROWSER_USER_AGENT,
        },
      },
    );

    // Во время техработ трейд-сайт редиректит запрос на HTML-страницу
    // обслуживания (/Maintenance/WebMaintanace) — она не парсится как JSON.
    let body;
    try {
      body = JSON.parse(res.body);
    } catch {
      marketLog.warn("маркет недоступен (техобслуживание), пропускаю итерацию");
      return;
    }

    const items = parseWaitList(body);

    if (queue.items !== null) {
      for (const item of newLots(queue.items, items)) {
        const userIds = db.getItemSubscribers(item.id, item.lvl);
        await sendDirect(userIds, (user) => ({
          content:
            `${user}, лот «**${item.name}**» зарегистрирован ` +
            `на аукционе за ${formatPrice(item.price)}. ` +
            `Время размещения <t:${toUnixSeconds(item.time)}:R>`,
        }));
      }
    }

    queue = { lastUpdate: new Date(), items };
  } catch (e) {
    marketLog.error(e);
  }
});
