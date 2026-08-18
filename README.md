# АРИЯ — сайт-визитка

Одностраничник студии: Next.js 16 + React Three Fiber, RU (`/`) + EN (`/en`),
3D-сцена знака ///, прелоадер, маскот Призма (`/prisma`, 404).

## Команды

```bash
npm run dev        # дев-сервер на :3000
npm run build      # прод-сборка (output: standalone)
```

Боевой запуск без Vercel (VPS):

```bash
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
PORT=3000 node .next/standalone/server.js
```

## Переменные окружения

Скопируй `.env.example` → `.env.local` (локально) или задай в панели Vercel:

- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — заявки с формы в тг-бота
  (пока не заданы, форма честно говорит «проснётся вместе с контактами»);
- `NEXT_PUBLIC_SITE_URL` — боевой домен (canonical, OG, sitemap, robots).

## Деплой на Vercel

```bash
npx vercel        # первый раз: логин + привязка проекта
npx vercel --prod
```

Домен подключается в панели Vercel → Domains; после подключения впиши его
в `NEXT_PUBLIC_SITE_URL` и переделплой.

## Контент-слоты

- Кейсы: `src/components/Site.tsx` (постеры) — материалы в `src/lib/dict.ts`;
- Контакты: `contacts` в `src/lib/dict.ts` (tg, email);
- Wordmark футера: `src/components/art/FooterWordmark.tsx` (сверить с вектором лого).

Полное ТЗ — `../PROMPT.md`, дизайн-бриф — `../design-brief.html`.

## Lighthouse (mobile, прод-сборка, 17.08.2026)

Performance 94 · Accessibility 96 · Best Practices 100 · SEO 100.
LCP ≈ 3.1s — осознанная цена прелоадера на каждом заходе (решение заказчика):
текст хиро появляется после вайпа. FCP 0.8s, TBT 10ms, CLS 0.
