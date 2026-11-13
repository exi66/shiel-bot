import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newCoupons,
  newLots,
  parseCoupons,
  parseWaitList,
  toUnixSeconds,
} from "../src/lib/market.js";

test("parseCoupons: берёт только коды 12/16 символов, без дублей", () => {
  const html = `
    <p><strong>ABCDEF123456</strong></p>
    <p><strong><em>abcdef123456</em></strong></p>
    <p><strong>ABCD1234EFGH5678</strong></p>
    <p><strong>Внимание!</strong></p>
    <p><strong>SHORT1</strong></p>
    <p><strong>WITH!BANG123</strong></p>`;
  assert.deepEqual(parseCoupons(html), [
    "ABCDEF123456",
    "ABCD1234EFGH5678",
    "WITH!BANG123",
  ]);
});

test("newCoupons: возвращает только новые коды", () => {
  assert.deepEqual(newCoupons(["A", "B"], ["B", "C", "D"]), ["C", "D"]);
  assert.deepEqual(newCoupons(["A"], ["A"]), []);
});

test("parseWaitList: маппинг и пустой ответ", () => {
  assert.deepEqual(parseWaitList(null), []);
  assert.deepEqual(parseWaitList({}), []);

  const [lot] = parseWaitList({
    _waitList: [
      {
        mainKey: 10,
        chooseKey: 20,
        _pricePerOne: 1000,
        _waitEndTime: 1700000000000,
        name: "Меч",
      },
    ],
  });
  assert.deepEqual(lot, {
    id: 10,
    lvl: 20,
    price: 1000,
    time: 1700000000000,
    name: "Меч",
    unique: "10-20-1700000000000",
  });
});

test("parseWaitList: unique не склеивает разные лоты", () => {
  const lots = parseWaitList({
    _waitList: [
      { mainKey: 1, chooseKey: 12, _waitEndTime: 3 },
      { mainKey: 11, chooseKey: 2, _waitEndTime: 3 },
    ],
  });
  assert.notEqual(lots[0].unique, lots[1].unique);
});

test("newLots: возвращает только новые лоты", () => {
  const a = { unique: "a" };
  const b = { unique: "b" };
  const c = { unique: "c" };
  assert.deepEqual(newLots([a, b], [b, c]), [c]);
});

test("toUnixSeconds", () => {
  assert.equal(toUnixSeconds(1700000000999), 1700000000);
});
