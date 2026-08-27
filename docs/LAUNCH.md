# АРИЯ — запуск и эксплуатация

Операционный файл: деплой, переменные, бот заявок, чек-лист переезда на свой домен.
Секреты в git не храним: живые значения — в `site/.env.local` (локально) и в Vercel
(Settings → Environment Variables). Образец — `site/.env.local.example`.

## Прод

- Хостинг: Vercel, команда **koderiyo**, проект **ariya** (план Hobby)
- Репозиторий: `github.com/G3N1SS/ariya`, автодеплой из ветки `main`
- Прод-адрес: `https://<проект>.vercel.app` — до покупки домена (см. чек-лист переезда)

## Переменные окружения

| Имя | Тип в Vercel | Значение / где взять |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Config | Полный адрес прода со схемой. Сейчас — vercel-адрес, после переезда — свой домен. Влияет на canonical, hreflang, OG, sitemap |
| `TELEGRAM_BOT_TOKEN` | **Secret** | Токен бота **@AriyaTicketsBot**. Хранится в `site/.env.local` и Vercel. Восстановить: @BotFather → `/mybots` → бот → API Token |
| `TELEGRAM_CHAT_ID` | Config | `-1003463858692` — супергруппа «кодеры йоу» |
| `TELEGRAM_THREAD_ID` | Config | `1564` — тема «Заявки» в группе (без неё бот пишет в General) |
| `NEXT_PUBLIC_YM_ID` | Config | Номер счётчика Яндекс.Метрики. Пока не создан — метрика выключена кодом |

После любого изменения переменных: **Deployments → последний → ⋯ → Redeploy**
(env подхватывается только новым билдом).

## Бот заявок (лид-форма → Telegram)

- Цепочка: форма на сайте → `POST /api/lead` (honeypot, рейт-лимит 5/мин) →
  `sendMessage` в тему «Заявки». Без токена ручка отвечает 503, форма показывает
  «проснётся вместе с контактами».
- Проверка после деплоя/переезда:

```bash
curl -s -X POST https://АДРЕС/api/lead \
  -H 'content-type: application/json' \
  -d '{"name":"Тест","contact":"@test","about":"проверка формы"}'
# ожидание: {"ok":true} и сообщение в теме «Заявки»
```

- Если сменится группа/тема: написать в новой теме сообщение с упоминанием
  `@AriyaTicketsBot`, затем `https://api.telegram.org/bot<ТОКЕН>/getUpdates` —
  взять `chat.id` (с минусом) и `message_thread_id`.
- В группах у ботов privacy mode: бот не видит сообщения без упоминания.
  Отключается: @BotFather → Bot Settings → Group Privacy → Turn off
  (после — заново добавить бота в группу).

## Чек-лист: переезд на свой домен

1. Купить домен.
2. Vercel → проект ariya → **Domains** → Add → следовать DNS-инструкции
   (A/CNAME у регистратора; Vercel сам выпустит SSL).
3. Обновить `NEXT_PUBLIC_SITE_URL` на `https://новый-домен` → **Redeploy**.
4. Проверить: `https://домен/sitemap.xml` (ссылки на домен, не на vercel/localhost),
   OG-превью (шарилка в TG), `robots.txt`.
5. Метрика: в настройках счётчика добавить/сменить адрес сайта.
6. Vercel-адрес автоматически начнёт редиректить на домен (проверить).
7. Обновить ссылки на сайт во внешних профилях (TG-био, GitHub и т.д.).

## Чек-лист: Метрика (когда заведём)

1. metrika.yandex.ru → создать счётчик → номер в `NEXT_PUBLIC_YM_ID` (Vercel + Redeploy).
2. В интерфейсе Метрики создать цели типа «JavaScript-событие»:
   - `tg_click` — клик по любой ссылке на Telegram;
   - `lead_sent` — успешная отправка лид-формы.
3. Код уже готов (`src/components/fx/Metrika.tsx`): SPA-хиты и обе цели шлются сами.

## Осталось по запуску (статус на 24.08.2026)

- [x] Бот заявок: создан, локально проверен, тема «Заявки»
- [ ] Env в Vercel (три TELEGRAM_* + NEXT_PUBLIC_SITE_URL) + Redeploy + прод-тест формы
- [ ] Свой домен (чек-лист выше)
- [ ] Счётчик Метрики + цели
- [ ] Почта студии → `contacts.email` в `src/lib/dict.ts` (кнопка в CTA появится сама)
