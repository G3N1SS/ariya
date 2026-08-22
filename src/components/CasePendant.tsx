"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const PendantScene = dynamic(() => import("./three/PendantScene"), {
  ssr: false,
});

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// точка, где золотая нить входит в канвас: x цепочки внутри 3D-сцены
// (group x=0.55 мира) в пикселях канваса 170×300 при fov 30 / z 9.6
const RAIL_W = 170;
const RAIL_H = 300;
const CHAIN_X = 118;

// Призма-хрусталь кейса ковчега. Широкий экран — спуск по цепочке (С2):
// нить вдоль правого поля, скролл разматывает цепь от люстры до CTA.
// Узкий десктоп или reduced-motion — статичная подвеска в шапке.
export default function CasePendant() {
  const [mode, setMode] = useState<"off" | "static" | "rail">("off");
  const wrap = useRef<HTMLDivElement>(null);
  const tiltbox = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pick = () => {
      if (innerWidth < 900) return "off";
      if (matchMedia("(prefers-reduced-motion: reduce)").matches)
        return innerWidth >= 900 ? "static" : "off";
      return innerWidth >= 1240 ? "rail" : "static";
    };
    const idle = window.setTimeout(() => setMode(pick()), 250);
    const onResize = () => setMode(pick());
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (mode !== "rail") return;
    let raf = 0;
    let cur = 96;
    let prev = cur;
    let tilt = 0;
    let lastT = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const w = wrap.current;
      const tb = tiltbox.current;
      const ln = line.current;
      if (!w || !tb || !ln) return;
      const maxY = document.documentElement.scrollHeight - innerHeight;
      const p = maxY > 0 ? clamp(scrollY / maxY, 0, 1) : 0;
      // рельса: от «под люстрой» до нижней трети экрана у CTA
      const target = lerp(96, innerHeight - RAIL_H - 60, p);
      cur = lerp(cur, target, 1 - Math.pow(0.001, dt));
      w.style.transform = `translate3d(0, ${cur}px, 0)`;
      // наклон от ускорения — кристалл «чувствует» спуск телом
      const vel = (cur - prev) / Math.max(dt, 0.001);
      prev = cur;
      tilt = lerp(tilt, clamp(-vel * 0.009, -5, 5), 1 - Math.pow(0.005, dt));
      tb.style.transform = `rotate(${tilt.toFixed(2)}deg)`;
      // нить размотана до входа цепочки в канвас
      ln.style.height = cur + 88 + "px";
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  if (mode === "off") return null;
  if (mode === "static")
    return (
      <div className="nk-pendant" aria-hidden="true">
        <PendantScene />
      </div>
    );
  return (
    <>
      <div className="nk-rail-line" ref={line} aria-hidden="true" />
      <div className="nk-pendant-rail" ref={wrap} aria-hidden="true">
        <div className="nk-tiltbox" ref={tiltbox}>
          <PendantScene />
        </div>
      </div>
    </>
  );
}
