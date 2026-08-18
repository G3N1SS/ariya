"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { onProgress, track } from "@/lib/loadProgress";
import { can3d } from "@/lib/capable";

const TAN22 = Math.tan((22 * Math.PI) / 180);
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export default function Preloader() {
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const bwLRef = useRef<HTMLDivElement>(null);
  const bwRRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLElement>(null);
  const cntRef = useRef<HTMLSpanElement>(null);

  useIso(() => {
    const doc = document.documentElement;
    doc.classList.add("js");
    const root = rootRef.current;
    if (!root) return;

    const finishInstant = () => {
      doc.classList.remove("is-loading");
      doc.classList.add("is-loaded");
      window.dispatchEvent(new Event("ariya:loaded"));
      // узел принадлежит React — снимаем через состояние, не руками
      setGone(true);
    };

    // лоадер — часть спектакля: показывается на каждом заходе (решение заказчика);
    // единственное исключение — reduced-motion
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishInstant();
      return;
    }

    doc.classList.add("is-loading");

    // полный прогон лоадера всегда начинает историю с хиро
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    // реальные сигналы загрузки
    const fontsDone = track();
    if (document.fonts?.ready) document.fonts.ready.then(fontsDone);
    else fontsDone();
    const loadDone = track();
    if (document.readyState === "complete") loadDone();
    else window.addEventListener("load", loadDone, { once: true });

    // сцену ждём только на десктопе: мобильные монтируют 3D после загрузки
    // в idle — лоадер там не должен держать людей ради компиляции шейдеров
    let sceneTimer = 0;
    if (can3d() && matchMedia("(pointer: fine)").matches) {
      const sceneDone = track();
      sceneTimer = window.setTimeout(sceneDone, 6000);
      window.addEventListener(
        "ariya:scene-ready",
        () => {
          window.clearTimeout(sceneTimer);
          sceneDone();
        },
        { once: true }
      );
    }

    let real = 0;
    const offProgress = onProgress((p) => {
      real = p;
    });

    const mark = markRef.current!;
    const bwL = bwLRef.current!;
    const bwR = bwRRef.current!;
    const mid = midRef.current!;
    const cnt = cntRef.current!;

    // боковые слэши едут вдоль оси знака (−22°): левый сверху, правый снизу
    const place = (prog: number) => {
      const D = innerHeight * 0.75;
      const eL = 1 - easeInOutCubic(clamp01(prog * 1.08));
      const eR = 1 - easeInOutCubic(clamp01((prog - 0.07) * 1.08));
      bwL.style.transform = `translate(${eL * D * TAN22}px, ${-eL * D}px)`;
      bwR.style.transform = `translate(${-eR * D * TAN22}px, ${eR * D}px)`;
    };

    let raf = 0;
    let t0 = 0;
    let v = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      offProgress();
      mark.classList.add("settle");
      window.setTimeout(() => {
        root.classList.add("done");
        doc.classList.remove("is-loading");
        doc.classList.add("is-loaded");
        window.dispatchEvent(new Event("ariya:loaded"));
        window.setTimeout(() => setGone(true), 950);
      }, 420);
    };

    const tick = (now: number) => {
      if (!t0) t0 = now;
      const t = now - t0;
      // плавное насыщение + честный прогресс: не финишируем раньше реальной загрузки
      const ramp = 1 - Math.exp(-t / 700);
      let target = real < 1 ? Math.min(ramp, 0.92) : ramp;
      if (real >= 1 && t > 1400) target = 1;

      v += (target - v) * 0.075;
      if (target === 1 && v > 0.995) v = 1;

      place(v);
      mid.style.opacity =
        v < 1 ? String(0.72 + 0.28 * Math.abs(Math.sin(now / 420))) : "1";
      cnt.innerHTML = `<b>//</b> ${String(Math.floor(v * 100)).padStart(3, "0")}`;

      if (v < 1) raf = requestAnimationFrame(tick);
      else finish();
    };

    place(0);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(sceneTimer);
      offProgress();
    };
  }, []);

  if (gone) return null;

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <div className="pl-mark" ref={markRef}>
        <div className="pl-bw" ref={bwLRef}>
          <i className="pl-bar side" />
        </div>
        <div className="pl-bw">
          <i className="pl-bar mid" ref={midRef} />
        </div>
        <div className="pl-bw" ref={bwRRef}>
          <i className="pl-bar side" />
        </div>
      </div>
      <span className="pl-cnt" ref={cntRef}>
        <b>{"//"}</b> 000
      </span>
    </div>
  );
}
