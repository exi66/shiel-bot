// Лимит отслеживаемых предметов на пользователя.
export const MAX_TRACKED_ITEMS = 500;

const isId = (v) => Number.isSafeInteger(v) && v >= 0;

// Проверяет и нормализует список предметов из запроса.
// Возвращает массив уникальных { id, lvl } или null, если вход некорректен.
export function parseItems(input, max = MAX_TRACKED_ITEMS) {
  if (!Array.isArray(input) || input.length > max) return null;

  const seen = new Set();
  const result = [];
  for (const it of input) {
    if (typeof it !== "object" || it === null) return null;
    const { id, lvl } = it;
    if (!isId(id) || !isId(lvl)) return null;

    const key = `${id}-${lvl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ id, lvl });
  }
  return result;
}
