import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import got from "got";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, "data", "items.json");
const SOURCE_URL =
  "https://api.garmoth.com/api/market-alerts/market?region=ru&lang=ru";

const CATS_LVL20 = [1, 5, 10]; // категории, где нужен только +20
const SPECIAL_15 = ["лабрескас", "мертвого бога", "перчатки тана", "атора"];

const nameOf = (e) => e.name?.toLowerCase() ?? "";

// Подходит ли сам предмет (грубый предфильтр по категории/имени).
function itemMatches(e) {
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
function levelMatches(e, lvl) {
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
function transform(items) {
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

  final.sort((a, b) => {
    if (a.market_main_category === b.market_main_category) {
      if (a.market_sub_category === b.market_sub_category) {
        if (a.id === b.id) return a.enhancement_level - b.enhancement_level;
        return a.id - b.id;
      }
      return a.market_sub_category - b.market_sub_category;
    }
    return a.market_main_category - b.market_main_category;
  });

  return final;
}

// Читает последний сохранённый каталог с диска (фолбек, когда источник недоступен).
function readLocalCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  } catch {
    return null;
  }
}

// Тянет свежий каталог из garmoth, пишет его в data/items.json и возвращает.
// Если источник недоступен — откатывается на локальный data/items.json (если он есть).
export async function refreshCatalog() {
  try {
    const json = await got
      .get(SOURCE_URL, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      })
      .json();
    const edited = transform(json.items);
    fs.mkdirSync(path.dirname(CATALOG_PATH), { recursive: true });
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(edited));
    return edited;
  } catch (e) {
    const local = readLocalCatalog();
    if (local) {
      console.warn(
        `[${new Date().toISOString()}] catalog: источник недоступен (${e.message}), ` +
          `использую локальный data/items.json (${local.length} шт.)`,
      );
      return local;
    }
    throw e;
  }
}
