export type Locale = "en" | "ru";

// Контакты появятся с материалами заказчика: TG-ссылка, почта, домен.
export const contacts = {
  tg: "#", // TODO: ссылка на Telegram
  email: "", // TODO: почта студии
};

export const dict = {
  en: {
    meta: {
      title: "ARIYA — digital product studio",
      description:
        "Apps, Telegram Mini Apps and websites that make money — not just exist.",
    },
    brand: "ARIYA",
    nav: [
      { label: "Services", href: "#services" },
      { label: "Work", href: "#work" },
      { label: "Process", href: "#process" },
      { label: "Contact", href: "#contact" },
    ],
    headerCta: "Message us",
    themeToggle: "Dark / light theme",
    localeSwitch: { label: "RU", href: "/" },
    greet: {
      morning: "good morning — coffee, brief, estimate in 1–2 days",
      day: "good afternoon — we can scope your task by tonight",
      evening: "good evening — prime time for bold ideas",
      night: "can’t sleep? the form works around the clock",
      habr: "hi, habr — our code is cleaner than our articles",
      tg: "from telegram? that’s where we live",
    },
    hero: {
      eyebrow: "Digital product studio",
      h1: ["Your product.", "Our performance."],
      sub: "We build apps, Telegram Mini Apps and websites that make money — not just exist. Three people, working worldwide, and you always talk to whoever writes the code.",
      ctaPrimary: "Tell us about your project",
      ctaSecondary: "See our work",
      ticker: "apps /// mini apps /// websites /// worldwide",
    },
    services: {
      idx: "// 01",
      title: "What we do",
      intro: "Three tracks, one bar: the product has to pay off.",
      items: [
        {
          name: "Mobile apps",
          text: "iOS and Android end to end: idea, design, store release, support. Built to live and grow — not die after launch.",
        },
        {
          name: "Telegram Mini Apps",
          text: "Sell where your customers already are. Stores, bookings, loyalty and internal tools right inside Telegram — no install needed. Weeks to launch, not months.",
        },
        {
          name: "Websites",
          text: "Fast, modern, impossible to mistake for a template. Want proof? You’re looking at it.",
        },
      ],
      plus: "+ bots, AI integrations, automation. If it’s digital — bring it over.",
      demo: {
        tg: {
          title: "ariya · mini app",
          hello: "a store right inside Telegram — nothing to install",
          btnCatalog: "catalog",
          btnPay: "checkout",
          catalogReply: "storefront, cart, search — all in the chat",
          payReply: "payments built in: cards, stars, crypto",
          paid: "✓ paid",
          reset: "once more",
        },
        web: {
          hint: "hover — see how it’s built",
          labels: ["nav / sticky", "hero / clamp()", "card / --radius", "grid 12"],
        },
      },
    },
    cases: {
      idx: "// 02",
      title: "Work",
      intro: "Talk is cheap. Here’s what we’ve shipped:",
      placeholderTitle: "Case materials are on the way",
      placeholderNote: "The poster layout is ready — the story lands here soon.",
      stampSoon: "soon",
      closing:
        "Want the same breakdown for your idea? Message us — we’ll show you what’s possible.",
    },
    why: {
      idx: "// 03",
      title: "Why ARIYA",
      lead: "Big studios sell process: managers, meetings, status decks. We sell outcomes. Three of us — each personally on the hook for the result.",
      bullets: [
        {
          name: "No broken telephone.",
          text: "Direct line to those who design and code.",
        },
        {
          name: "Small-team speed.",
          text: "Decisions in minutes, first results in days.",
        },
        {
          name: "A 2026 stack.",
          text: "The same tools behind the best products out there — including this site.",
        },
        {
          name: "Worldwide.",
          text: "Any timezone, English and Russian.",
        },
      ],
    },
    process: {
      idx: "// 04",
      title: "How it works",
      steps: [
        {
          name: "Talk",
          text: "A call or a chat — your pick. We dig into the task and tell you honestly what will fly and what won’t.",
        },
        {
          name: "Estimate",
          text: "An honest price range and timeline — fast and without surprises.",
        },
        {
          name: "Build",
          text: "Short iterations, weekly demos, no month-long silence.",
        },
        {
          name: "Launch & beyond",
          text: "Release, metrics, support. We don’t vanish after launch.",
        },
      ],
    },
    cta: {
      idx: "// 05",
      title: "Tell us what you want to build.",
      sub: "Telegram is fastest. Two sentences about the task — we’ll ask the rest.",
      ticker: "available for projects /// 2026 /// worldwide",
      pricing:
        "No “$X and up” price lists — they lie anyway. We look at the task and give you an honest range.",
      btnTg: "Message on Telegram",
      btnMail: "Email us",
      note: "// links go live as soon as contacts arrive",
      form: {
        hint: "// or assemble the brief right here — we’ll reply wherever suits you",
        name: "Name",
        contact: "Telegram or email",
        about: "Anything in your own words (optional)",
        send: "Send",
        sending: "Sending…",
        ok: "Got it. We’ll be in touch soon.",
        fail: "Didn’t go through. Telegram is the reliable way.",
        off: "The form wakes up with our contacts — Telegram is faster for now.",
        what: "what we’re building",
        feats: "what’s inside",
        stage: "where you are",
        products: ["mobile app", "tg mini app", "website", "bot"],
        features: ["auth", "payments", "admin panel", "push", "ai", "3d"],
        stages: ["just an idea", "have designs", "rebuild existing"],
        previewTitle: "new request",
        pProduct: "product",
        pFeats: "inside",
        pStage: "stage",
        pName: "name",
        pContact: "contact",
      },
    },
    footer: {
      brand: "ARIYA — digital product studio",
      rights: "© 2026",
      logLink: "// changelog",
      logHref: "/en/changelog",
    },
    changelog: {
      title: "Changelog",
      lead: "We run this site like a product: releases, dates, honest history.",
      back: "← back to site",
      backHref: "/en",
      releases: [
        {
          v: "1.5",
          date: "18.08.2026",
          items: [
            "dark theme — inky night: tokens, neon buttons, moonlit 3D",
            "theme toggle in the header + \u2318K command, choice remembered",
          ],
        },
        {
          v: "1.4",
          date: "17.08.2026",
          items: [
            "⌘K command palette",
            "Prisma the mascot moved in as a site guide",
            "brief builder with live telegram preview",
            "live demos inside service cards",
            "particle echo of the mark in the hero",
            "living hero typography, context greetings",
            "page-morph transitions, open metrics + this page",
          ],
        },
        {
          v: "1.3",
          date: "17.08.2026",
          items: [
            "lead form → telegram, SEO, custom 404 with Prisma",
            "Prisma got real 3D and an emotion system",
          ],
        },
        {
          v: "1.2",
          date: "16.08.2026",
          items: [
            "3D logo flies zigzag between scenes",
            "dolly-zoom parking into the footer wordmark",
          ],
        },
        {
          v: "1.1",
          date: "16.08.2026",
          items: [
            "preloader assembles the mark on every visit",
            "custom cursor, tickers, section art",
          ],
        },
        {
          v: "1.0",
          date: "15.08.2026",
          items: ["skeleton, design system, RU/EN, copy"],
        },
      ],
    },
    guide: {
      hello: "hey! I live here. click me — or press ⌘K",
      services: "everything here is buyable — and it actually runs",
      work: "cases are on their way. the layout is ready, as you can see",
      process: "estimate in 1–2 days. I keep an eye on these three",
      contact: "two sentences is enough — the form flies straight to our telegram",
      sent: "got it! the team is already reading. I checked",
    },
    ck: {
      aria: "Command palette",
      placeholder: "type a command or search…",
      empty: "// nothing — try different words",
      items: [
        { id: "services", label: "Go to: services", hint: "// 01" },
        { id: "work", label: "Go to: work", hint: "// 02" },
        { id: "process", label: "Go to: process", hint: "// 04" },
        { id: "contact", label: "Go to: contact", hint: "// 05" },
        { id: "lead", label: "Leave a request", hint: "form → telegram" },
        { id: "lang", label: "Переключить на русский", hint: "/" },
        { id: "prisma", label: "Call Prisma", hint: "mascot" },
        { id: "changelog", label: "Changelog", hint: "/en/changelog" },
        { id: "theme", label: "Toggle theme", hint: "dark / light" },
      ],
    },
    nf: {
      title: "Wrong click.",
      text: "This page doesn’t exist. Prisma is already out looking for it — meanwhile, head back home.",
      cta: "Back home",
      note: "// prisma is on it",
    },
  },
  ru: {
    meta: {
      title: "АРИЯ — студия цифровых продуктов",
      description:
        "Приложения, Telegram-миниаппы и сайты, которые зарабатывают, а не просто существуют.",
    },
    brand: "АРИЯ",
    nav: [
      { label: "Услуги", href: "#services" },
      { label: "Работы", href: "#work" },
      { label: "Процесс", href: "#process" },
      { label: "Контакт", href: "#contact" },
    ],
    headerCta: "Написать",
    themeToggle: "Тёмная / светлая тема",
    localeSwitch: { label: "EN", href: "/en" },
    greet: {
      morning: "доброе утро — кофе, бриф, оценка за 1–2 дня",
      day: "добрый день — успеем обсудить задачу до вечера",
      evening: "добрый вечер — самое время смелых идей",
      night: "не спится? форма работает круглосуточно",
      habr: "привет, хабр — код у нас чище статей",
      tg: "из телеграма? там и живём",
    },
    hero: {
      eyebrow: "Студия цифровых продуктов",
      h1: ["Ваш продукт.", "Наше исполнение."],
      sub: "Делаем приложения, Telegram-миниаппы и сайты, которые зарабатывают, а не просто существуют. Нас трое, работаем по всему миру — и вы всегда говорите с тем, кто пишет код.",
      ctaPrimary: "Обсудить задачу",
      ctaSecondary: "Смотреть работы",
      ticker: "приложения /// мини-аппы /// сайты /// worldwide",
    },
    services: {
      idx: "// 01",
      title: "Что делаем",
      intro: "Три направления, одна планка: продукт должен окупаться.",
      items: [
        {
          name: "Мобильные приложения",
          text: "iOS и Android под ключ: идея, дизайн, публикация в сторах, поддержка. Делаем так, чтобы приложение жило и росло, а не умерло после релиза.",
        },
        {
          name: "Telegram Mini Apps",
          text: "Продавайте там, где клиент уже сидит. Магазины, записи, лояльность, внутренние инструменты — прямо в Telegram, без установки. Запуск за недели, а не месяцы.",
        },
        {
          name: "Сайты",
          text: "Быстрые, современные, с дизайном, который не спутать с шаблоном. Хотите пример? Вы на нём.",
        },
      ],
      plus: "+ боты, ИИ-интеграции, автоматизация. Если задача цифровая — приносите, разберёмся.",
      demo: {
        tg: {
          title: "ariya · mini app",
          hello: "магазин прямо в Telegram — ничего не устанавливая",
          btnCatalog: "каталог",
          btnPay: "оплата",
          catalogReply: "витрина, корзина, поиск — всё в чате",
          payReply: "оплата встроена: карты, звёзды, крипта",
          paid: "✓ оплачено",
          reset: "ещё раз",
        },
        web: {
          hint: "наведи — покажу, как собрано",
          labels: ["nav / sticky", "hero / clamp()", "card / --radius", "grid 12"],
        },
      },
    },
    cases: {
      idx: "// 02",
      title: "Работы",
      intro: "Говорить можно что угодно. Вот что мы делали руками:",
      placeholderTitle: "Материалы кейса в пути",
      placeholderNote: "Постер свёрстан — история встанет сюда со дня на день.",
      stampSoon: "скоро",
      closing:
        "Хотите такой же разбор своей задачи — напишите, покажем, что можно сделать.",
    },
    why: {
      idx: "// 03",
      title: "Почему АРИЯ",
      lead: "Большие студии продают процессы: менеджеров, созвоны, отчёты. Мы продаём результат. Нас трое — и каждый отвечает за него лично.",
      bullets: [
        {
          name: "Без испорченного телефона.",
          text: "Вы говорите напрямую с теми, кто проектирует и пишет код.",
        },
        {
          name: "Скорость малой команды.",
          text: "Решения за минуты, первые результаты за дни.",
        },
        {
          name: "Стек 2026 года.",
          text: "Те же инструменты, на которых собраны лучшие продукты, — этот сайт тоже.",
        },
        {
          name: "Worldwide.",
          text: "Любой часовой пояс, русский и английский.",
        },
      ],
    },
    process: {
      idx: "// 04",
      title: "Как пойдёт работа",
      steps: [
        {
          name: "Разговор",
          text: "Созвон или переписка — как удобнее. Разбираем задачу и честно говорим, что взлетит, а что нет.",
        },
        {
          name: "Оценка",
          text: "Честная вилка по деньгам и срокам — быстро и без сюрпризов.",
        },
        {
          name: "Разработка",
          text: "Короткие итерации, демо каждую неделю, никакой тишины на месяц.",
        },
        {
          name: "Запуск — и дальше",
          text: "Публикация, метрики, поддержка. Не исчезаем после релиза.",
        },
      ],
    },
    cta: {
      idx: "// 05",
      title: "Расскажите, что хотите построить",
      sub: "Быстрее всего — Telegram. Опишите задачу в двух предложениях, остальное спросим сами.",
      ticker: "открыты к проектам /// 2026 /// worldwide",
      pricing:
        "Никаких прайсов «от…» — они всё равно врут. Смотрим задачу и называем честную вилку.",
      btnTg: "Написать в Telegram",
      btnMail: "Написать на почту",
      note: "// ссылки оживут, как только пришлёте контакты",
      form: {
        hint: "// или соберите бриф прямо здесь — ответим туда, куда удобнее вам",
        name: "Имя",
        contact: "Telegram или почта",
        about: "Что угодно своими словами (необязательно)",
        send: "Отправить",
        sending: "Отправляю…",
        ok: "Получили. Скоро ответим.",
        fail: "Не отправилось. Надёжнее всего — Telegram.",
        off: "Форма проснётся вместе с контактами — пока быстрее в Telegram.",
        what: "что делаем",
        feats: "что внутри",
        stage: "на какой вы стадии",
        products: ["приложение", "tg mini app", "сайт", "бот"],
        features: ["авторизация", "платежи", "админка", "пуши", "ии", "3d"],
        stages: ["только идея", "есть дизайн", "переделать существующее"],
        previewTitle: "новая заявка",
        pProduct: "продукт",
        pFeats: "начинка",
        pStage: "стадия",
        pName: "имя",
        pContact: "контакт",
      },
    },
    footer: {
      brand: "АРИЯ — студия цифровых продуктов",
      rights: "© 2026",
      logLink: "// история версий",
      logHref: "/changelog",
    },
    changelog: {
      title: "История версий",
      lead: "Сайт мы ведём как продукт: релизы, даты, честная история.",
      back: "← на сайт",
      backHref: "/",
      releases: [
        {
          v: "1.5",
          date: "18.08.2026",
          items: [
            "тёмная тема — чернильная ночь: токены, неоновые кнопки, лунный 3D",
            "тумблер в шапке + команда в \u2318K, выбор запоминается",
          ],
        },
        {
          v: "1.4",
          date: "17.08.2026",
          items: [
            "командная палитра ⌘K",
            "Призма переехала на сайт гидом",
            "конструктор брифа с живым превью для телеграма",
            "живые демо в карточках услуг",
            "поле частиц — эхо знака в хиро",
            "живая типографика, приветствия по контексту",
            "морф-переходы страниц, открытые метрики + эта страница",
          ],
        },
        {
          v: "1.3",
          date: "17.08.2026",
          items: [
            "форма → телеграм, SEO, свой 404 с Призмой",
            "Призма получила настоящий 3D и систему эмоций",
          ],
        },
        {
          v: "1.2",
          date: "16.08.2026",
          items: [
            "3D-лого летает зигзагом между сценами",
            "долли-зум-парковка в wordmark футера",
          ],
        },
        {
          v: "1.1",
          date: "16.08.2026",
          items: [
            "прелоадер собирает знак на каждом заходе",
            "свой курсор, бегущие строки, арт секций",
          ],
        },
        {
          v: "1.0",
          date: "15.08.2026",
          items: ["каркас, дизайн-система, RU/EN, тексты"],
        },
      ],
    },
    guide: {
      hello: "привет! я тут живу. тыкни меня — или жми ⌘K",
      services: "всё, что здесь, можно купить — и оно правда работает",
      work: "кейсы уже в пути. вёрстка готова, сам видишь",
      process: "оценка за 1–2 дня. я слежу за этими тремя",
      contact: "двух предложений хватит — форма летит прямо к нам в телеграм",
      sent: "заявка у нас! команда уже читает. я проверила",
    },
    ck: {
      aria: "Командная палитра",
      placeholder: "команда или поиск…",
      empty: "// пусто — попробуй иначе",
      items: [
        { id: "services", label: "Перейти: услуги", hint: "// 01" },
        { id: "work", label: "Перейти: работы", hint: "// 02" },
        { id: "process", label: "Перейти: процесс", hint: "// 04" },
        { id: "contact", label: "Перейти: контакт", hint: "// 05" },
        { id: "lead", label: "Оставить заявку", hint: "форма → телеграм" },
        { id: "lang", label: "Switch to English", hint: "/en" },
        { id: "prisma", label: "Позвать Призму", hint: "маскот" },
        { id: "changelog", label: "История версий", hint: "/changelog" },
        { id: "theme", label: "Переключить тему", hint: "тёмная / светлая" },
      ],
    },
    nf: {
      title: "Кликнули не туда.",
      text: "Такой страницы нет. Призма уже ищет, куда она делась, — а вы пока возвращайтесь на главную.",
      cta: "На главную",
      note: "// prisma ищет эту страницу",
    },
  },
} as const;

export type Dict = (typeof dict)["en"];
