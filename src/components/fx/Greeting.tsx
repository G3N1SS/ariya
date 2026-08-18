"use client";

import { useEffect, useState } from "react";

type GreetT = {
  morning: string;
  day: string;
  evening: string;
  night: string;
  habr: string;
  tg: string;
};

// Первая строчка сайта знает контекст: время суток и откуда пришли.
// Считается на клиенте после маунта — без куки, трекеров и SSR-рассинхрона.
export default function Greeting({ t }: { t: GreetT }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const ref = document.referrer.toLowerCase();
    const utm = new URLSearchParams(location.search).get("utm_source") ?? "";
    let msg: string;
    if (ref.includes("habr")) msg = t.habr;
    else if (ref.includes("t.me") || /^(tg|telegram)$/i.test(utm)) msg = t.tg;
    else {
      const h = new Date().getHours();
      msg =
        h >= 5 && h < 12
          ? t.morning
          : h >= 12 && h < 17
            ? t.day
            : h >= 17 && h < 23
              ? t.evening
              : t.night;
    }
    setText(msg);
  }, [t]);

  if (!text) return null;
  return <span className="hero-greet">{`· ${text}`}</span>;
}
