# bdo-market-wait-list

## Описание

Бот для мониторинга очереди аукциона и купонов в игре Black Desert Online.  
Сurrently develops only for russian-language region.

## Запуск

1. Создайте `app.config.js` по аналогии с `app.config.js.example`
2. В `/src/js/Api.js` смените **hostname** на корректный
3. Запустите

```
npm i && npm run build && npm run start
```

## Используемые ресурсы

Все купоны берутся с [Orbit-games](https://orbit-games.com/).

## Установка на сервере

Все манипуляции осуществляются в личных сообщениях с ботом. Чтобы это, в принципе, было возможно, необходимо иметь с ботом как минимум один общий сервер, на котором должны стоять настройки приватности, позволяющие писать Вам в личные сообщения.

### Настройка

Все команды реализованы в slash commands, максимально просто и подробно расписаны. Ниже продублирован весь функционал:

- `/queue` - возвращает текущую очередь аукциона (бот проверяет ее по умолчанию каждые 5 минут)
- `/coupons` - возврает доступные купоны в случае;
- `/settings` - управляет настройками приложения посредством веб-службы;
