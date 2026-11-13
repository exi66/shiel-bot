// Чистые функции разбора ответов внешних источников — без I/O, легко тестируются.

// Купон — латиница+цифры (+возможен «!»), ровно 12 или 16 символов.
const COUPON_RE = /^(?:[A-Z0-9!]{12}|[A-Z0-9!]{16})$/;

// Коды лежат в <strong>КОД</strong>. Возвращает уникальные коды в порядке появления.
export function parseCoupons(html) {
  const found = new Set();
  for (const m of html.matchAll(/<strong>([\s\S]*?)<\/strong>/gi)) {
    const code = m[1]
      .replace(/<[^>]+>/g, "")
      .trim()
      .toUpperCase();
    if (COUPON_RE.test(code)) found.add(code);
  }
  return [...found];
}

// Коды из next, которых не было в prev.
export function newCoupons(prev, next) {
  const old = new Set(prev);
  return next.filter((c) => !old.has(c));
}

// Ответ GetWorldMarketWaitList -> плоский список лотов.
export function parseWaitList(body) {
  const data = body?._waitList ?? [];
  return data.map((e) => ({
    id: e.mainKey,
    lvl: e.chooseKey,
    price: e._pricePerOne,
    time: e._waitEndTime,
    name: e.name,
    unique: `${e.mainKey}-${e.chooseKey}-${e._waitEndTime}`,
  }));
}

// Лоты из next, которых не было в prev.
export function newLots(prev, next) {
  const old = new Set(prev.map((a) => a.unique));
  return next.filter((e) => !old.has(e.unique));
}

// Unix-время в секундах для Discord-тегов <t:...>.
export const toUnixSeconds = (ms) => Math.floor(ms / 1000);
