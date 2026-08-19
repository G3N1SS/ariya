"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const PrismaScene = dynamic(() => import("./three/PrismaScene"), {
  ssr: false,
});

export type CaseGuideT = {
  greet: string;
  shots: string;
  task: string;
  built: string;
  flow: string;
  eras: string;
  stack: string;
  cta: string;
  sent: string;
};

const BUBBLE_MS = 4600;
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// пролёт по кейсу, как у логотипа на главной: мизансцены-вейпоинты у секций,
// маскот скользит между ними по скроллу и, паркуясь, объясняет что да как;
// у ленты-диорамы ныряет в неё (сжимается в точку — там его ждёт джампер)
type WpDef = {
  sel: string | null;
  side: "l" | "r" | "c";
  s: number;
  key: keyof CaseGuideT | null;
  frac: number; // на какой доле вьюпорта секция, когда маскот припаркован
};
const WPS: WpDef[] = [
  { sel: null, side: "r", s: 1, key: "greet", frac: 0 },
  { sel: '[data-cg="shots"]', side: "l", s: 0.74, key: "shots", frac: 0.3 },
  { sel: '[data-cg="task"]', side: "r", s: 0.76, key: "task", frac: 0.34 },
  { sel: '[data-cg="built"]', side: "l", s: 0.74, key: "built", frac: 0.3 },
  { sel: '[data-cg="flow"]', side: "r", s: 0.76, key: "flow", frac: 0.32 },
  { sel: ".case-strip", side: "c", s: 0.03, key: null, frac: 0.46 },
  { sel: '[data-cg="eras"]', side: "r", s: 0.76, key: "eras", frac: 0.3 },
  { sel: '[data-cg="stack"]', side: "l", s: 0.74, key: "stack", frac: 0.36 },
  { sel: '[data-cg="cta"]', side: "r", s: 0.72, key: "cta", frac: 0.52 },
];

export default function CaseGuide({ t }: { t: CaseGuideT }) {
  const [mounted, setMounted] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const bubText = useRef<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const bub = useRef<HTMLDivElement>(null);
  const lastLvl = useRef(-1);
  const timer = useRef(0);
  const said = useRef(new Set<string>());
  const pose = useRef({ x: 0, y: 0, s: 1, r: 0, side: "r" as "l" | "r" | "c" });

  // гид — десктопная роскошь, как и на главной
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || innerWidth < 900) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const idle = window.setTimeout(() => setMounted(true), 350);
    return () => window.clearTimeout(idle);
  }, []);

  const say = (key: string, text: string, once = true) => {
    if (once && said.current.has(key)) return;
    said.current.add(key);
    bubText.current = text;
    setBubble(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      bubText.current = null;
      setBubble(null);
    }, BUBBLE_MS);
  };

  useEffect(() => {
    if (!mounted) return;
    let W = clamp(innerWidth * 0.25, 214, 296);
    let H = W / 0.93;
    const w = wrap.current;
    if (w) {
      w.style.width = W + "px";
      w.style.height = H + "px";
    }

    // стопы вейпоинтов в координатах скролла
    let stops: { y: number; wp: WpDef; el: HTMLElement | null }[] = [];
    const build = () => {
      W = clamp(innerWidth * 0.25, 214, 296);
      H = W / 0.93;
      if (w) {
        w.style.width = W + "px";
        w.style.height = H + "px";
      }
      const maxY = document.documentElement.scrollHeight - innerHeight;
      stops = WPS.map((wp) => {
        let y = 0;
        const el = wp.sel
          ? document.querySelector<HTMLElement>(wp.sel)
          : null;
        if (el) {
          const r = el.getBoundingClientRect();
          y = clamp(r.top + scrollY - innerHeight * wp.frac, 0, maxY);
        }
        return { y, wp, el };
      });
      // хвост у конца страницы слипается на maxY (CTA-поза недостижима) —
      // разносим назад с минимальным зазором, затем чиним строгий рост
      const gap = innerHeight * 0.2;
      for (let i = stops.length - 2; i >= 0; i--)
        stops[i].y = Math.min(stops[i].y, stops[i + 1].y - gap);
      let prev = -1;
      for (const sp of stops) {
        sp.y = Math.max(sp.y, prev + 1, 0);
        prev = sp.y;
      }
    };

    // экранная точка парковки: у краёв колонки, на широких — в полях
    const parkX = (side: "l" | "r" | "c", s: number) => {
      if (side === "c") return innerWidth / 2;
      const margin = Math.max(0, (innerWidth - 880) / 2);
      const lx = Math.max((W * s) / 2 + 14, margin * 0.55 + 40);
      return side === "l" ? lx : innerWidth - lx;
    };
    const parkY = (i: number) => {
      // герой встречает у заголовка, остальные — на своей доле вьюпорта
      if (i === 0) return innerHeight * 0.36;
      return innerHeight * (0.42 + (i % 2) * 0.05);
    };

    let lastArrived = -1;
    let raf = 0;
    let lastT = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (!stops.length || !w) return;

      // сегмент скролла → целевая мизансцена
      const yq = scrollY;
      let i = 0;
      while (i < stops.length - 1 && yq >= stops[i + 1].y) i++;
      const a = stops[i];
      const b = stops[Math.min(i + 1, stops.length - 1)];
      const span = Math.max(1, b.y - a.y);
      const tt = a === b ? 0 : smooth(clamp((yq - a.y) / span, 0, 1));

      const ax = parkX(a.wp.side, a.wp.s);
      const bx = parkX(b.wp.side, b.wp.s);
      const tx = lerp(ax, bx, tt);
      const ty = lerp(parkY(i), parkY(Math.min(i + 1, stops.length - 1)), tt);
      const ts = lerp(a.wp.s, b.wp.s, tt);

      // плавность и крен по горизонтальной скорости — «полёт», не телепорт
      const k = 1 - Math.pow(0.002, dt);
      const p = pose.current;
      p.x = lerp(p.x, tx, k);
      p.y = lerp(p.y, ty, k);
      p.s = lerp(p.s, ts, k);
      p.r = lerp(p.r, clamp((tx - p.x) * 0.06, -16, 16), k);
      p.side = tt < 0.5 ? a.wp.side : b.wp.side;
      w.style.transform = `translate3d(${p.x - W / 2}px, ${
        p.y - H / 2
      }px, 0) rotate(${p.r}deg) scale(${p.s})`;

      // реплика мизансцены — при прибытии (и пока не нырнул в ленту)
      const arrived = tt < 0.18 ? i : tt > 0.82 ? Math.min(i + 1, stops.length - 1) : -1;
      if (arrived !== -1 && arrived !== lastArrived) {
        lastArrived = arrived;
        const key = stops[arrived].wp.key;
        if (key) say(key, t[key]);
      }
      // нырнул в ленту — реплика гаснет
      if (p.s < 0.15 && bubText.current) {
        bubText.current = null;
        setBubble(null);
      }

      // бабл летит рядом с маскотом СО СТОРОНЫ СВОБОДНОГО КРАЯ: маскот слева —
      // окно справа от него, маскот справа — слева; хвостик всегда к маскоту.
      // позиция обновляется каждый кадр ещё ДО появления текста — без мигания в (0,0)
      const bb = bub.current;
      if (bb) {
        const half = (W * p.s) / 2;
        const by = p.y - (H * p.s) * 0.42;
        if (p.side === "l") {
          bb.style.transform = `translate3d(${p.x + half + 16}px, ${by}px, 0)`;
          bb.style.borderRadius = "4px 14px 14px 14px";
        } else {
          bb.style.transform = `translate3d(${
            p.x - half - 16
          }px, ${by}px, 0) translateX(-100%)`;
          bb.style.borderRadius = "14px 4px 14px 14px";
        }
        const vis = !!bubText.current && p.s >= 0.15;
        bb.style.opacity = vis ? "1" : "0";
        bb.style.pointerEvents = vis ? "auto" : "none";
      }

      // антенна эпох: 3G → 6G по прогрессу скролла через секцию «Эпохи»
      const eras = stops.find((sp) => sp.wp.key === "eras")?.el;
      if (eras) {
        const r = eras.getBoundingClientRect();
        const ep = (innerHeight * 0.78 - r.top) / (r.height || 1);
        const lvl = Math.max(0, Math.min(3, Math.floor(ep * 4)));
        if (lvl !== lastLvl.current) {
          lastLvl.current = lvl;
          window.dispatchEvent(new CustomEvent("ariya:antenna", { detail: lvl }));
        }
      }
    };

    build();
    // стартуем из позы героя без пролёта через весь экран
    pose.current = {
      x: parkX("r", 1),
      y: innerHeight * 0.36,
      s: 1,
      r: 0,
      side: "r",
    };
    raf = requestAnimationFrame(tick);
    const rebuild = () => build();
    window.addEventListener("resize", rebuild);
    window.addEventListener("load", rebuild);
    const settle = window.setTimeout(rebuild, 1600);

    // клик по кнопке CTA — праздник; «поиграть» — сальто (идея №3 с доски)
    const cta = document.querySelector<HTMLElement>(".cp-cta .btn");
    const onCta = () => {
      window.dispatchEvent(new CustomEvent("ariya:emotion", { detail: "happy" }));
      say("sent", t.sent, false);
    };
    cta?.addEventListener("click", onCta);
    const play = document.querySelector<HTMLElement>(".cpage > .btn-primary");
    const onPlay = () =>
      window.dispatchEvent(new CustomEvent("ariya:emotion", { detail: "spin" }));
    play?.addEventListener("click", onPlay);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", rebuild);
      window.removeEventListener("load", rebuild);
      window.clearTimeout(settle);
      window.clearTimeout(timer.current);
      cta?.removeEventListener("click", onCta);
      play?.removeEventListener("click", onPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      <div className="cg-wrap" ref={wrap} aria-hidden="true">
        <div className="pg-canvas">
          <PrismaScene mode="guide" skin="nu" />
        </div>
      </div>
      <div
        className="pg-bubble cg-fly"
        ref={bub}
        aria-hidden="true"
        style={{ opacity: 0, pointerEvents: "none" }}
        onClick={() => {
          bubText.current = null;
          setBubble(null);
        }}
      >
        <span className="t">{"// prisma"}</span>
        {bubble}
      </div>
    </>
  );
}
