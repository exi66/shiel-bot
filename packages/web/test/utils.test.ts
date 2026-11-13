import { test } from "node:test";
import assert from "node:assert/strict";
import { declOfNum } from "../src/lib/utils.ts";

const forms: [string, string, string] = ["предмет", "предмета", "предметов"];

test("declOfNum", () => {
  const cases: [number, string][] = [
    [0, "предметов"],
    [1, "предмет"],
    [2, "предмета"],
    [4, "предмета"],
    [5, "предметов"],
    [11, "предметов"],
    [12, "предметов"],
    [14, "предметов"],
    [21, "предмет"],
    [22, "предмета"],
    [101, "предмет"],
    [111, "предметов"],
  ];
  for (const [n, expected] of cases) {
    assert.equal(declOfNum(n, forms), expected, `n=${n}`);
  }
});
