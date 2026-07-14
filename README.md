<div align="center" width="100%">
  <img src="./docs/shiel-bot.webp" width="128" alt="" />
</div>

# shiel-bot

Дискорд бот для мониторинга очереди аукциона и купонов в игре Black Desert Online. Позволяет вам получать уведомления в дискорде когда осуществляется регистрация товара, на который вы подписались, а так же при публикации новых купонов.

## Используемые ресурсы

- Купоны берутся с [orbit-games](https://orbit-games.com/black-desert/vse-kupony-bdo/)
- Каталог предметов берётся с [garmoth](https://garmoth.com/)

## Структура

```
packages/
  shared/   общий конфиг (.env) + БД better-sqlite3
  bot/      Discord-бот на @sapphire/framework (js)
  server/   Express API + хостинг React-билда (js)
  web/      React + Vite + shadcn (ts)
```

Все настройки — в одном корневом `.env` (см. `.env.example`), читаются через `@shiel/shared/config`.
БД одна на всех — `@shiel/shared/db`.

## Старт

```bash
pnpm install
cp .env.example .env   # заполнить DISCORD_TOKEN и т.д.

pnpm dev:server   # http://localhost:3000
pnpm dev:web      # http://localhost:5173 (проксирует /api на сервер)
pnpm dev:bot      # Discord-бот
```

## Прод

```bash
pnpm build:web    # собирает web/dist
pnpm start:server # сервер отдаёт web/dist + API
pnpm start:bot
```

## Работа с ботом

Все манипуляции осуществляются в личных сообщениях с ботом. Чтобы это, в принципе, было возможно, необходимо иметь с ботом как минимум один общий сервер, на котором должны стоять настройки приватности, позволяющие писать Вам в личные сообщения.

### Настройка

Все команды реализованы в slash commands, максимально просто и подробно расписаны. Ниже продублирован весь функционал:

- `/queue` - возвращает текущую очередь аукциона (бот проверяет ее по умолчанию каждую минуту)
- `/coupons` - возвращает доступные купоны
- `/settings` - управляет настройками приложения посредством веб-службы
