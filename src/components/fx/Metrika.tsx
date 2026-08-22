"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Яндекс.Метрика: включается только когда задан NEXT_PUBLIC_YM_ID.
// Счётчик + SPA-хиты по смене маршрута + две цели:
//  tg_click  — клик по любой ссылке на t.me (хедер, хиро, кейсы, футер)
//  lead_sent — форма успешно отправлена (слушаем ariya:lead-sent из LeadForm)
const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID ?? "");

type YmFn = (id: number, method: string, ...args: unknown[]) => void;
declare global {
  interface Window {
    ym?: YmFn;
  }
}

export default function Metrika() {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (!YM_ID || loaded.current) return;
    loaded.current = true;

    const s = document.createElement("script");
    s.src = "https://mc.yandex.ru/metrika/tag.js";
    s.async = true;
    document.head.appendChild(s);
    const w = window as Window & { ym?: YmFn & { a?: unknown[]; l?: number } };
    w.ym =
      w.ym ||
      Object.assign(
        ((...args: unknown[]) => {
          (w.ym as YmFn & { a: unknown[] }).a.push(args);
        }) as unknown as YmFn,
        { a: [] as unknown[], l: Date.now() }
      );
    w.ym(YM_ID, "init", {
      defer: true,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
    });

    const onTg = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href*='t.me']");
      if (a) window.ym?.(YM_ID, "reachGoal", "tg_click");
    };
    const onLead = () => window.ym?.(YM_ID, "reachGoal", "lead_sent");
    document.addEventListener("click", onTg, { capture: true });
    window.addEventListener("ariya:lead-sent", onLead);
    return () => {
      document.removeEventListener("click", onTg, { capture: true });
      window.removeEventListener("ariya:lead-sent", onLead);
    };
  }, []);

  // SPA-навигация: каждый переход — отдельный просмотр
  useEffect(() => {
    if (!YM_ID || !loaded.current) return;
    window.ym?.(YM_ID, "hit", pathname);
  }, [pathname]);

  return null;
}
