// User-Agent браузера для запросов к сайтам, которые режут «ботов».
export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Таймаут внешних HTTP-запросов (got по умолчанию ждёт бесконечно).
export const REQUEST_TIMEOUT_MS = 15_000;
