import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from '../config.js';

// Каталог под файл БД должен существовать
fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const db = new Database(config.databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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
`);
