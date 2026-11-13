import { test } from "node:test";
import assert from "node:assert/strict";
import { itemMatches, levelMatches, transform } from "../src/catalog.js";

const item = (over) => ({
  name: "Предмет",
  main_category: 1,
  sub_category: 1,
  main_key: 1,
  grade: 3,
  img: "Icon/A.webp",
  sub_items: [],
  ...over,
});

test("itemMatches: низкий грейд отсекается", () => {
  assert.equal(itemMatches(item({ grade: 2 })), false);
  assert.equal(itemMatches(item({ grade: 3 })), true);
});

test("itemMatches: категория 15 без подкатегорий 5/6", () => {
  assert.equal(itemMatches(item({ main_category: 15, sub_category: 1 })), true);
  assert.equal(
    itemMatches(item({ main_category: 15, sub_category: 5 })),
    false,
  );
  assert.equal(
    itemMatches(
      item({ main_category: 15, sub_category: 5, name: "Кольцо Лабрескас" }),
    ),
    true,
  );
});

test("levelMatches: оружие только +20, категория 20 от 4", () => {
  assert.equal(levelMatches(item({ main_category: 1 }), 20), true);
  assert.equal(levelMatches(item({ main_category: 1 }), 19), false);
  assert.equal(levelMatches(item({ main_category: 20 }), 4), true);
  assert.equal(levelMatches(item({ main_category: 20 }), 3), false);
  assert.equal(
    levelMatches(item({ main_category: 2, name: "Меч Черной Звезды" }), 19),
    true,
  );
});

test("transform: разворачивает уровни, фильтрует и сортирует", () => {
  const result = transform([
    item({
      main_key: 2,
      sub_items: [{ sub_key: 19 }, { sub_key: 20 }],
    }),
    item({
      main_key: 1,
      main_category: 20,
      sub_items: [{ sub_key: 3 }, { sub_key: 5 }, { sub_key: 4 }],
    }),
    item({ main_key: 3, grade: 1, sub_items: [{ sub_key: 20 }] }),
  ]);

  assert.deepEqual(
    result.map((r) => [r.id, r.enhancement_level]),
    [
      [2, 20],
      [1, 4],
      [1, 5],
    ],
  );
  assert.equal(result[0].icon, "icon/a.webp");
});
