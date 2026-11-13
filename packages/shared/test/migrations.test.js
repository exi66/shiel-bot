import { test } from "node:test";
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { migrate, migrations } from "../src/db/migrations.js";

test("migrate: чистая БД доходит до последней версии и повторно не падает", () => {
  const db = new Database(":memory:");
  migrate(db);
  assert.equal(db.pragma("user_version", { simple: true }), migrations.length);
  migrate(db);
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    )
    .all()
    .map((t) => /** @type {{ name: string }} */ (t).name);
  assert.ok(["items", "links", "users"].every((t) => tables.includes(t)));
  db.close();
});

test("migrate: существующая БД без user_version принимается", () => {
  const db = new Database(":memory:");
  db.exec(migrations[0]);
  migrate(db);
  assert.equal(db.pragma("user_version", { simple: true }), migrations.length);
  db.close();
});

test("migrate: версия новее кода -> ошибка", () => {
  const db = new Database(":memory:");
  db.pragma(`user_version = ${migrations.length + 1}`);
  assert.throws(() => migrate(db), /newer than this code/);
  db.close();
});
