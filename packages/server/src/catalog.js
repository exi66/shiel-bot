import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import got from "got";
import { BROWSER_USER_AGENT, REQUEST_TIMEOUT_MS } from "@shiel/shared/http";
import { createLogger } from "@shiel/shared/logger";

const log = createLogger("catalog");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Локальная копия сырого ответа API (в том же формате) — фолбек на случай 403/недоступности.
const FALLBACK_PATH = path.join(__dirname, "..", "fixtures", "market.json");
const SOURCE_URL =
  "https://api.garmoth.com/api/market-alerts/market?region=ru&lang=ru";

const CATS_LVL20 = [1, 5, 10]; // категории, где нужен только +20
const SPECIAL_15 = ["лабрескас", "мертвого бога", "перчатки тана", "атора"];

const nameOf = (e) => e.name?.toLowerCase() ?? "";

// Подходит ли сам предмет (грубый предфильтр по категории/имени).
export function itemMatches(e) {
  const name = nameOf(e);
  const cat = e.main_category;
  return (
    e.grade > 2 &&
    (CATS_LVL20.includes(cat) ||
      cat === 20 ||
      name.includes("черной звезды") ||
      (cat === 15 && e.sub_category !== 5 && e.sub_category !== 6) ||
      (cat === 15 && SPECIAL_15.some((s) => name.includes(s))))
  );
}

// Подходит ли конкретный уровень заточки предмета.
export function levelMatches(e, lvl) {
  const name = nameOf(e);
  const cat = e.main_category;
  return (
    (CATS_LVL20.includes(cat) && lvl === 20) ||
    (cat === 15 && lvl === 20) ||
    (cat === 20 && lvl >= 4) ||
    (name.includes("черной звезды") && lvl > 18) ||
    (cat === 15 && SPECIAL_15.some((s) => name.includes(s)))
  );
}

// Разворачиваем отобранные предметы по уровням заточки в плоский список.
export function transform(items) {
  const final = [];
  for (const e of items) {
    if (!itemMatches(e)) continue;
    for (const b of e.sub_items) {
      if (!levelMatches(e, b.sub_key)) continue;
      final.push({
        id: e.main_key,
        enhancement_level: b.sub_key,
        market_main_category: e.main_category,
        market_sub_category: e.sub_category,
        name: e.name,
        icon: e.img.toLowerCase(),
        grade: e.grade,
      });
    }
  }

  final.sort(
    (a, b) =>
      a.market_main_category - b.market_main_category ||
      a.market_sub_category - b.market_sub_category ||
      a.id - b.id ||
      a.enhancement_level - b.enhancement_level,
  );

  return final;
}

// Читает локальную сырую копию каталога (fixtures/market.json, формат ответа API).
function readLocalSource() {
  try {
    return JSON.parse(fs.readFileSync(FALLBACK_PATH, "utf8"));
  } catch {
    return null;
  }
}

// Тянет свежий каталог из garmoth и возвращает отфильтрованный список.
// Если источник недоступен — берёт локальный market.json и прогоняет через тот же transform().
export async function loadCatalog() {
  try {
    const json = await got
      .get(SOURCE_URL, {
        headers: { "user-agent": BROWSER_USER_AGENT },
        timeout: { request: REQUEST_TIMEOUT_MS },
      })
      .json();
    return transform(json.items);
  } catch (e) {
    const local = readLocalSource();
    if (local?.items) {
      const edited = transform(local.items);
      log.warn(
        `источник недоступен (${e.message}), использую локальный market.json (${edited.length} шт.)`,
      );
      return edited;
    }
    throw e;
  }
}
