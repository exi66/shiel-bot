import crypto from "node:crypto";
import { db } from "./connection.js";
import { config } from "../config.js";

// Время жизни ссылки настройки — 10 минут
export const LINK_TTL_MS = 1000 * 60 * 10;

/**
 * Типы строк таблиц (better-sqlite3 по умолчанию отдаёт unknown).
 * @typedef {{ id: number, discordId: string, notifyCoupons: number, notifyQueue: number }} UserRow
 * @typedef {{ id: number, userId: number, token: string, expiredAt: number }} LinkRow
 * @typedef {{ itemId: number, lvl: number }} ItemRow
 * @typedef {{ discordId: string }} DiscordIdRow
 */
/**
 * @template R
 * @typedef {import("better-sqlite3").Statement<unknown[], R>} Query
 */

// --- prepared statements ---
const q = {
  userByDiscordId: /** @type {Query<UserRow>} */ (
    db.prepare("SELECT * FROM users WHERE discordId = ?")
  ),
  userById: /** @type {Query<UserRow>} */ (
    db.prepare("SELECT * FROM users WHERE id = ?")
  ),
  insertUser: db.prepare("INSERT INTO users (discordId) VALUES (?)"),

  linkByToken: /** @type {Query<LinkRow>} */ (
    db.prepare("SELECT * FROM links WHERE token = ?")
  ),
  insertLink: db.prepare(
    "INSERT INTO links (userId, token, expiredAt) VALUES (?, ?, ?)",
  ),
  deleteLinksByUser: db.prepare("DELETE FROM links WHERE userId = ?"),
  purgeExpired: db.prepare("DELETE FROM links WHERE expiredAt <= ?"),

  itemsByUser: /** @type {Query<ItemRow>} */ (
    db.prepare("SELECT itemId, lvl FROM items WHERE userId = ?")
  ),
  deleteItemsByUser: db.prepare("DELETE FROM items WHERE userId = ?"),
  insertItem: db.prepare(
    "INSERT INTO items (userId, itemId, lvl) VALUES (?, ?, ?)",
  ),

  allUsers: /** @type {Query<DiscordIdRow>} */ (
    db.prepare("SELECT discordId FROM users")
  ),
  couponSubscribers: /** @type {Query<DiscordIdRow>} */ (
    db.prepare("SELECT discordId FROM users WHERE notifyCoupons = 1")
  ),
  itemSubscribers: /** @type {Query<DiscordIdRow>} */ (
    db.prepare(`
    SELECT DISTINCT u.discordId
    FROM items i
    JOIN users u ON u.id = i.userId
    WHERE i.itemId = ? AND i.lvl = ? AND u.notifyQueue = 1
  `)
  ),
  setNotifyCoupons: db.prepare(
    "UPDATE users SET notifyCoupons = ? WHERE id = ?",
  ),
  setNotifyQueue: db.prepare("UPDATE users SET notifyQueue = ? WHERE id = ?"),
};

// --- внутренние хелперы ---

export function purgeExpiredLinks() {
  q.purgeExpired.run(Date.now());
}

function upsertUser(discordId) {
  let user = q.userByDiscordId.get(discordId);
  if (!user) {
    const info = q.insertUser.run(discordId);
    user = q.userById.get(Number(info.lastInsertRowid));
  }
  return user;
}

// Возвращает запись link, только если она существует и не истекла
function getValidLink(token) {
  const link = q.linkByToken.get(token);
  if (!link || link.expiredAt <= Date.now()) return null;
  return link;
}

function userSettings(user) {
  return {
    notifyCoupons: !!user.notifyCoupons,
    notifyQueue: !!user.notifyQueue,
  };
}

// --- публичный API ---

// Создаёт (или пересоздаёт) ссылку настройки для пользователя Discord
export function createLink(discordId) {
  purgeExpiredLinks();
  const user = upsertUser(discordId);
  q.deleteLinksByUser.run(user.id); // одна активная ссылка на пользователя

  const token = crypto.randomBytes(24).toString("hex");
  const expiredAt = Date.now() + LINK_TTL_MS;
  q.insertLink.run(user.id, token, expiredAt);

  return {
    token,
    url: new URL(`user/${token}`, config.server.host).toString(),
    expiredAt,
  };
}

// Данные для страницы настроек. null — токен не найден или истёк.
export function checkLink(token) {
  purgeExpiredLinks();
  const link = getValidLink(token);
  if (!link) return null;

  const user = q.userById.get(link.userId);
  const items = q.itemsByUser.all(user.id);

  return {
    link: { token, expiredAt: link.expiredAt },
    user: userSettings(user),
    items: items.map((i) => ({ id: i.itemId, lvl: i.lvl })),
  };
}

// Атомарно заменяет список отслеживаемых предметов пользователя.
// items должны быть заранее провалидированы (см. parseItems).
const replaceItems = db.transaction((userId, items) => {
  q.deleteItemsByUser.run(userId);
  for (const it of items) {
    q.insertItem.run(userId, it.id, it.lvl);
  }
});

export function updateItems(token, items) {
  const link = getValidLink(token);
  if (!link) return false;
  replaceItems(link.userId, items);
  return true;
}

// Частично обновляет флаги уведомлений ({ notifyCoupons?, notifyQueue? }).
// Возвращает актуальные настройки или null, если ссылка недействительна.
const applySettings = db.transaction((userId, patch) => {
  if (typeof patch.notifyCoupons === "boolean") {
    q.setNotifyCoupons.run(patch.notifyCoupons ? 1 : 0, userId);
  }
  if (typeof patch.notifyQueue === "boolean") {
    q.setNotifyQueue.run(patch.notifyQueue ? 1 : 0, userId);
  }
});

export function updateSettings(token, patch) {
  const link = getValidLink(token);
  if (!link) return null;
  applySettings(link.userId, patch);
  return userSettings(q.userById.get(link.userId));
}

// --- хелперы для воркеров бота ---

// discordId всех пользователей бота
export function getAllUserIds() {
  return q.allUsers.all().map((u) => u.discordId);
}

// discordId всех, кто подписан на купоны
export function getCouponSubscribers() {
  return q.couponSubscribers.all().map((u) => u.discordId);
}

// discordId подписчиков очереди, отслеживающих конкретный предмет+уровень
export function getItemSubscribers(itemId, lvl) {
  return q.itemSubscribers
    .all(Number(itemId), Number(lvl))
    .map((u) => u.discordId);
}

export function closeDb() {
  if (db.open) db.close();
}

export { db };
