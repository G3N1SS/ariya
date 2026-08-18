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
// за столько пикселей скролла большой Призма из шапки сжимается в угол
const SHRINK_D = 340;
// угловой размер — как у гида на главной (.pg-wrap)
const CORNER_W = 195;
const smooth = (x: number) => x * x * (3 - 2 * x);

// механика №8+№1: встречает большим в шапке кейса → сжимается в угол-гид →
// комментирует секции; антенна скина качает эпохи по мере скролла галереи
export default function CaseGuide({ t }: { t: CaseGuideT }) {
  const [mounted, setMounted] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const greet = useRef<HTMLDivElement>(null);
  const hero = useRef({ left: 0, top: 0, w: 260, h: 280 });
  const prog = useRef(0);
  const lastLvl = useRef(-1);
  const timer = useRef(0);
  const said = useRef(new Set<string>());

  // гид — десктопная роскошь, как и на главной
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || innerWidth < 900) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const idle = window.setTimeout(() => setMounted(true), 350);
    return () => window.clearTimeout(idle);
  }, []);

  const say = (key: string, text: string, once = true) => {
    // пока Призма большая в шапке, угловым репликам рано
    if (prog.current < 0.6) return;
    if (once && said.current.has(key)) return;
    said.current.add(key);
    setBubble(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBubble(null), BUBBLE_MS);
  };

  useEffect(() => {
    if (!mounted) return;
    const anchor = document.querySelector<HTMLElement>(".cp-pr-anchor");
    const erasEl = document.querySelector<HTMLElement>(".cp-eras");

    const place = () => {
      const w = wrap.current;
      if (!w) return;
      const hr = hero.current;
      const p = Math.min(1, Math.max(0, scrollY / SHRINK_D));
      prog.current = p;
      const e = smooth(p);
      const sCorner = CORNER_W / hr.w;
      const tx = hr.left + (innerWidth - CORNER_W - hr.left) * e;
      const heroTop = hr.top - scrollY;
      const cornerTop = innerHeight - hr.h * sCorner;
      const ty = heroTop + (cornerTop - heroTop) * e;
      const s = 1 + (sCorner - 1) * e;
      w.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;

      // приветствие живёт слева от большого Призмы и гаснет на сжатии
      const g = greet.current;
      if (g) {
        g.style.transform = `translate3d(${hr.left - 12}px, ${
          heroTop + hr.h * 0.22
        }px, 0) translateX(-100%)`;
        g.style.opacity = p < 0.18 ? "1" : "0";
      }

      // антенна эпох: 3G → 6G по прогрессу скролла через секцию «Эпохи»
      if (erasEl) {
        const r = erasEl.getBoundingClientRect();
        const ep = (innerHeight * 0.78 - r.top) / (r.height || 1);
        const lvl = Math.max(0, Math.min(3, Math.floor(ep * 4)));
        if (lvl !== lastLvl.current) {
          lastLvl.current = lvl;
          window.dispatchEvent(
            new CustomEvent("ariya:antenna", { detail: lvl })
          );
        }
      }
    };

    const measure = () => {
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      hero.current = {
        left: r.left + scrollX,
        top: r.top + scrollY,
        w: r.width,
        h: r.height,
      };
      const w = wrap.current;
      if (w) {
        w.style.width = r.width + "px";
        w.style.height = r.height + "px";
      }
      place();
    };

    measure();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    // реплики по секциям — по одной на визит
    const keys: (keyof CaseGuideT)[] = [
      "shots",
      "task",
      "built",
      "flow",
      "eras",
      "stack",
      "cta",
    ];
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const key = (en.target as HTMLElement).dataset.cg as
            | keyof CaseGuideT
            | undefined;
          if (key) say(key, t[key]);
        }
      },
      { threshold: 0.3 }
    );
    document.querySelectorAll("[data-cg]").forEach((el) => io.observe(el));

    // клик по кнопке CTA — праздник, как отправка заявки на главной
    const cta = document.querySelector<HTMLElement>(".cp-cta .btn");
    const onCta = () => {
      window.dispatchEvent(new CustomEvent("ariya:emotion", { detail: "happy" }));
      say("sent", t.sent, false);
    };
    cta?.addEventListener("click", onCta);

    // клик «поиграть» в шапке — сальто большого Призмы (идея №3 с доски)
    const play = document.querySelector<HTMLElement>(".cpage > .btn-primary");
    const onPlay = () =>
      window.dispatchEvent(new CustomEvent("ariya:emotion", { detail: "spin" }));
    play?.addEventListener("click", onPlay);

    // пока лента-диорама на экране, угловой гид прячется: Призма «в сцене»
    let stripIo: IntersectionObserver | undefined;
    const strip = document.querySelector(".case-strip");
    if (strip) {
      stripIo = new IntersectionObserver(
        (en) => {
          const on = en.some((e) => e.isIntersecting);
          const w = wrap.current;
          if (w) {
            w.style.opacity = on ? "0" : "1";
            w.style.transition = "opacity 0.4s";
          }
          if (on) setBubble(null);
        },
        { threshold: 0.25 }
      );
      stripIo.observe(strip);
    }

    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      window.clearTimeout(timer.current);
      io.disconnect();
      stripIo?.disconnect();
      cta?.removeEventListener("click", onCta);
      play?.removeEventListener("click", onPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      <div className="cg-greet pg-bubble" ref={greet} aria-hidden="true">
        <span className="t">{"// prisma"}</span>
        {t.greet}
      </div>
      <div className="cg-wrap" ref={wrap} aria-hidden="true">
        <div className="pg-canvas">
          <PrismaScene mode="guide" skin="nu" />
        </div>
      </div>
      {bubble && (
        <div
          className="pg-bubble cg-bub"
          aria-hidden="true"
          onClick={() => setBubble(null)}
        >
          <span className="t">{"// prisma"}</span>
          {bubble}
        </div>
      )}
    </>
  );
}
