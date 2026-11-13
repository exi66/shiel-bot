import { test } from "node:test";
import assert from "node:assert/strict";
import { parseItems } from "../src/items.js";

test("parseItems: корректный список, дубли убираются", () => {
  assert.deepEqual(
    parseItems([
      { id: 1, lvl: 20 },
      { id: 1, lvl: 20 },
      { id: 2, lvl: 0, extra: true },
    ]),
    [
      { id: 1, lvl: 20 },
      { id: 2, lvl: 0 },
    ],
  );
  assert.deepEqual(parseItems([]), []);
});

test("parseItems: некорректный вход -> null", () => {
  assert.equal(parseItems(undefined), null);
  assert.equal(parseItems({ id: 1, lvl: 1 }), null);
  assert.equal(parseItems([null]), null);
  assert.equal(parseItems([{ id: "1", lvl: 1 }]), null);
  assert.equal(parseItems([{ id: 1 }]), null);
  assert.equal(parseItems([{ id: 1.5, lvl: 1 }]), null);
  assert.equal(parseItems([{ id: -1, lvl: 1 }]), null);
});

test("parseItems: лимит длины", () => {
  const many = Array.from({ length: 3 }, (_, i) => ({ id: i, lvl: 0 }));
  assert.equal(parseItems(many, 2), null);
  assert.equal(parseItems(many, 3).length, 3);
});
