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
  vign1: string;
  vign2: string;
};

const BUBBLE_MS = 4600;
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// пролёт-презентация (идеи №4+№6 с доски): маскот летит по сценам и продаёт —
// прожектором (вуаль + пятно света выхватывают кадры/пункты/кнопку) и
// виньетками-декорациями в полях, которые оживают при его приземлении
type WpDef = {
  sel: string | null;
  side: "l" | "r" | "v" | "c";
  s: number;
  key: keyof CaseGuideT | null;
  frac: number;
  scene?: "spotseq" | "spot" | "vign1" | "vign2" | "dive";
  spotSel?: string;
};
const WPS: WpDef[] = [
  { sel: null, side: "r", s: 1, key: "greet", frac: 0 },
  { sel: '[data-cg="shots"]', side: "l", s: 0.72, key: "shots", frac: 0.3, scene: "spotseq", spotSel: '[data-cg="shots"] figure img' },
  { sel: '[data-cg="task"]', side: "v", s: 0.74, key: "task", frac: 0.34, scene: "vign1" },
  { sel: '[data-cg="built"]', side: "l", s: 0.72, key: "built", frac: 0.3, scene: "spotseq", spotSel: '[data-cg="built"] li' },
  { sel: '[data-cg="flow"]', side: "v", s: 0.74, key: "flow", frac: 0.32, scene: "vign2" },
  { sel: ".case-strip", side: "c", s: 0.03, key: null, frac: 0.46, scene: "dive" },
  { sel: '[data-cg="eras"]', side: "r", s: 0.74, key: "eras", frac: 0.3, scene: "spotseq", spotSel: '[data-cg="eras"] figure img' },
  { sel: '[data-cg="stack"]', side: "l", s: 0.72, key: "stack", frac: 0.36 },
  { sel: '[data-cg="cta"]', side: "r", s: 0.72, key: "cta", frac: 0.52, scene: "spot", spotSel: ".cp-cta .btn" },
];

export default function CaseGuide({ t }: { t: CaseGuideT }) {
  const [mounted, setMounted] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [vignTops, setVignTops] = useState<{ v1: number; v2: number } | null>(null);
  const bubText = useRef<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const bub = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const said = useRef(new Set<string>());
  const pose = useRef({ x: 0, y: 0, s: 1, r: 0, side: "r" as WpDef["side"] });
  // прожектор: цель, сглаженное пятно и плавная вуаль
  const spotEl = useRef<HTMLElement | null>(null);
  const veilOn = useRef(false);
  const veilO = useRef(0);
  const spot = useRef({ x: 0, y: 0, r: 80 });
  const sceneTimers = useRef<number[]>([]);

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
        const el = wp.sel ? document.querySelector<HTMLElement>(wp.sel) : null;
        if (el) {
          const r = el.getBoundingClientRect();
          y = clamp(r.top + scrollY - innerHeight * wp.frac, 0, maxY);
        }
        return { y, wp, el };
      });
      // хвост у конца страницы слипается на maxY — разносим назад и чиним рост
      const gap = innerHeight * 0.2;
      for (let i = stops.length - 2; i >= 0; i--)
        stops[i].y = Math.min(stops[i].y, stops[i + 1].y - gap);
      let prev = -1;
      for (const sp of stops) {
        sp.y = Math.max(sp.y, prev + 1, 0);
        prev = sp.y;
      }
      // виньетки прижаты к своим секциям, но НИЖЕ точки парковки маскота —
      // иначе он приземляется прямо на декорацию и закрывает её собой
      const task = document.querySelector<HTMLElement>('[data-cg="task"]');
      const flow = document.querySelector<HTMLElement>('[data-cg="flow"]');
      if (task && flow)
        setVignTops({ v1: task.offsetTop + 156, v2: flow.offsetTop + 156 });
    };

    const vignVisible = () => innerWidth >= 1160;
    const parkX = (side: WpDef["side"], s: number) => {
      if (side === "c") return innerWidth / 2;
      const margin = Math.max(0, (innerWidth - 880) / 2);
      if (side === "v" && vignVisible())
        return Math.min(innerWidth - (W * s) / 2 - 10, (innerWidth + 880) / 2 + 96);
      const lx = Math.max((W * s) / 2 + 14, margin * 0.55 + 40);
      return side === "l" ? lx : innerWidth - lx;
    };
    const parkY = (i: number) => {
      if (i === 0) return innerHeight * 0.36;
      return innerHeight * (0.42 + (i % 2) * 0.05);
    };

    // ── сцены-перформансы: прожектор и оживающие виньетки ──
    const cancelScene = () => {
      sceneTimers.current.forEach(clearTimeout);
      sceneTimers.current = [];
      veilOn.current = false;
      spotEl.current = null;
    };
    const startScene = (i: number) => {
      const { wp } = stops[i];
      if (!wp.scene || wp.scene === "dive") return;
      const sceneKey = "scene:" + i;
      if (said.current.has(sceneKey)) return;
      said.current.add(sceneKey);
      if (wp.scene === "vign1" || wp.scene === "vign2") {
        document
          .querySelector(wp.scene === "vign1" ? ".cg-v1" : ".cg-v2")
          ?.classList.add("alive");
        return;
      }
      const els = wp.spotSel
        ? [...document.querySelectorAll<HTMLElement>(wp.spotSel)]
        : [];
      if (!els.length) return;
      veilOn.current = true;
      const STEP = wp.scene === "spot" ? 2400 : 1000;
      els.forEach((el, k) => {
        sceneTimers.current.push(
          window.setTimeout(() => {
            spotEl.current = el;
            // у «Эпох» прожектор и антенна идут в ногу: кадр = уровень сети
            if (wp.key === "eras")
              window.dispatchEvent(
                new CustomEvent("ariya:antenna", { detail: Math.min(3, k) })
              );
          }, k * STEP)
        );
      });
      sceneTimers.current.push(
        window.setTimeout(() => {
          veilOn.current = false;
          spotEl.current = null;
        }, els.length * STEP + 400)
      );
    };

    let lastArrived = -1;
    let raf = 0;
    let lastT = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (!stops.length || !w) return;

      const yq = scrollY;
      let i = 0;
      while (i < stops.length - 1 && yq >= stops[i + 1].y) i++;
      const a = stops[i];
      const b = stops[Math.min(i + 1, stops.length - 1)];
      const span = Math.max(1, b.y - a.y);
      const tt = a === b ? 0 : smooth(clamp((yq - a.y) / span, 0, 1));

      const tx = lerp(parkX(a.wp.side, a.wp.s), parkX(b.wp.side, b.wp.s), tt);
      const ty = lerp(parkY(i), parkY(Math.min(i + 1, stops.length - 1)), tt);
      const ts = lerp(a.wp.s, b.wp.s, tt);

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

      const arrived =
        tt < 0.18 ? i : tt > 0.82 ? Math.min(i + 1, stops.length - 1) : -1;
      if (arrived !== -1 && arrived !== lastArrived) {
        lastArrived = arrived;
        cancelScene();
        const key = stops[arrived].wp.key;
        if (key) say(key, t[key]);
        startScene(arrived);
      }
      if (p.s < 0.15 && bubText.current) {
        bubText.current = null;
        setBubble(null);
      }

      // бабл со свободной стороны, позиция готова до появления текста
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

      // прожектор: вуаль с пятном света на цели + неон-луч от маскота
      const vl = veil.current;
      if (vl) {
        veilO.current = lerp(
          veilO.current,
          veilOn.current && spotEl.current ? 1 : 0,
          1 - Math.pow(0.004, dt)
        );
        vl.style.opacity = String(veilO.current);
        const elS = spotEl.current;
        if (elS) {
          const r = elS.getBoundingClientRect();
          const kk = 1 - Math.pow(0.0005, dt);
          spot.current.x = lerp(spot.current.x, r.left + r.width / 2, kk);
          spot.current.y = lerp(spot.current.y, r.top + r.height / 2, kk);
          spot.current.r = lerp(
            spot.current.r,
            Math.max(r.width, r.height) / 2 + 30,
            kk
          );
        }
        const m = `radial-gradient(circle ${spot.current.r.toFixed(1)}px at ${spot.current.x.toFixed(1)}px ${spot.current.y.toFixed(1)}px, transparent 97%, black 100%)`;
        (vl.style as unknown as Record<string, string>).webkitMask = m;
        vl.style.mask = m;
      }
      const bm = beam.current;
      if (bm) {
        const dx = spot.current.x - p.x;
        const dy = spot.current.y - p.y;
        const len = Math.max(
          0,
          Math.hypot(dx, dy) - spot.current.r - (W * p.s) * 0.2
        );
        bm.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${Math.atan2(dy, dx)}rad)`;
        bm.style.width = len + "px";
        bm.style.opacity = String(veilO.current * 0.8);
      }
    };

    build();
    pose.current = {
      x: parkX("r", 1),
      y: innerHeight * 0.36,
      s: 1,
      r: 0,
      side: "r",
    };
    spot.current = { x: innerWidth / 2, y: innerHeight / 2, r: 90 };
    raf = requestAnimationFrame(tick);
    const rebuild = () => build();
    window.addEventListener("resize", rebuild);
    window.addEventListener("load", rebuild);
    const settle = window.setTimeout(rebuild, 1600);

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
      cancelScene();
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
      {/* вуаль прожектора и неон-луч — под маскотом, над контентом */}
      <div className="cg-veil" ref={veil} aria-hidden="true" />
      <div className="cg-beam" ref={beam} aria-hidden="true" />

      {/* виньетки-декорации в полях: оживают при приземлении маскота */}
      {vignTops && (
        <>
          <div className="cg-vign cg-v1" style={{ top: vignTops.v1 }} aria-hidden="true">
            <svg viewBox="0 0 150 112">
              <rect className="vp1" x="6" y="84" width="44" height="10" rx="3" />
              <rect className="vp2" x="98" y="72" width="46" height="22" rx="3" />
              <circle className="vsig" cx="28" cy="70" r="9" />
              <circle className="vsig2" cx="28" cy="70" r="15" />
              <path className="varc" d="M48 62 Q 76 30 100 54" />
              <path className="varr" d="M95 46 l8 8 -12 3 z" />
              <line className="vmast" x1="121" y1="72" x2="121" y2="34" />
              <line className="vbar" x1="109" y1="44" x2="133" y2="44" />
              <circle className="vtop" cx="121" cy="30" r="4" />
            </svg>
            <span>{t.vign1}</span>
          </div>
          <div className="cg-vign cg-v2" style={{ top: vignTops.v2 }} aria-hidden="true">
            <svg viewBox="0 0 150 112">
              {[0, 1, 2, 3].map((i) => (
                <g key={i} className={`vf vf${i}`}>
                  <line
                    className="vmast"
                    x1={22 + i * 34}
                    y1={94}
                    x2={22 + i * 34}
                    y2={92 - 26 - i * 8}
                  />
                  <path
                    className="vflag"
                    d={`M${22 + i * 34} ${66 - i * 8} l20 6 -20 6 z`}
                  />
                </g>
              ))}
              <line className="vbase" x1="8" y1="95" x2="142" y2="95" />
            </svg>
            <span>{t.vign2}</span>
          </div>
        </>
      )}

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
