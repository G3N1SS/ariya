import { NextResponse } from "next/server";

// Заявки с формы → Telegram-бот студии.
// Пока TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы, ручка честно отвечает 503,
// а форма на клиенте показывает «форма проснётся вместе с контактами».

const seen = new Map<string, number[]>();

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const name = String(data.name ?? "").trim().slice(0, 100);
  const contact = String(data.contact ?? "").trim().slice(0, 200);
  const about = String(data.about ?? "").trim().slice(0, 2000);
  const honeypot = String(data.website ?? "");

  // боты заполняют скрытое поле — отвечаем «ок» и выбрасываем
  if (honeypot) return NextResponse.json({ ok: true });
  if (!contact || !about)
    return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat)
    return NextResponse.json({ ok: false, configured: false }, { status: 503 });

  // простейший рейт-лимит: 5 заявок в минуту с адреса
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const recent = (seen.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 5)
    return NextResponse.json({ ok: false }, { status: 429 });
  recent.push(now);
  seen.set(ip, recent);

  const text = [
    "Новая заявка — сайт АРИЯ",
    "",
    `Имя: ${name || "—"}`,
    `Контакт: ${contact}`,
    "",
    about,
  ].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text }),
  });

  if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 });
  return NextResponse.json({ ok: true });
}
