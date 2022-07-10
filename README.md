# bdo-market-wait-list
## Discord.js bot for scraping black desert market queue and coupons
  Сurrently develops only for russian-language region

## Запуск
  Для запуска необходимо создат в корне репозитория `config.json` со структорой, аналогичной `config-example.json` и заполнить все поля.

## Используемые ресурсы
  Все купоны берутся с [Orbit-games](https://orbit-games.com/).

## Установка на сервере
  У бота отсутствуют какие-либо команды для работы на сервере. Все манипуляции осуществляются в личных сообщениях с ботом. Чтобы это, в принципе, было возможно, необходимо иметь с ботом как минимум один общий сервер, на котором должны стоять настройки приватности, позволяющие писать Вам в личные сообщения.

### BDO
  Все команды реализованы в slash commands, максимально просто и подробно расписаны. Ниже продублирован весь функционал:
 - `/инфо` - возвращает информацию о боте  
 - `/аукцион очередь` - возвращает текущую очередь аукциона (бот проверяет ее по умолчанию каждые 5 минут)  
 - `/купоны [ список | уведомления ]` - возврает доступные купоны в случае `список`; включает/выключает уведомления о появлении новых в случае `уведомления`  
 - `/аукцион [ отслеживать | лист | уведомления | очистить ]` - возврает отслеживаемые предметы в случае `лист`; включает/выключает уведомления о регистрации в случае `уведомления`; `отслеживать` позволяет удобно создать необходимое отслеживание; `очистить` очищает список отслеживаемых предметов   

  
