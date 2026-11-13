// Миграции схемы. Номер версии хранится в PRAGMA user_version.
// Правило: существующие шаги не менять, только дописывать новые в конец.
export const migrations = [
  // 1 — исходная схема
  `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    discordId     TEXT    NOT NULL UNIQUE,
    notifyCoupons INTEGER NOT NULL DEFAULT 0,
    notifyQueue   INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS links (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    userId    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token     TEXT    NOT NULL UNIQUE,
    expiredAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS items (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    itemId INTEGER NOT NULL,
    lvl    INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_items_lookup ON items(itemId, lvl);
  CREATE INDEX IF NOT EXISTS idx_links_expired ON links(expiredAt);
  `,
];

export function migrate(db) {
  const current = db.pragma("user_version", { simple: true });
  if (current > migrations.length) {
    throw new Error(
      `[db] schema version ${current} is newer than this code (${migrations.length})`,
    );
  }
  for (let v = current; v < migrations.length; v++) {
    db.transaction(() => {
      db.exec(migrations[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}
