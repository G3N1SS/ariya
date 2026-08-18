"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import { RoundedBoxGeometry } from "three-stdlib";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { isCoarse } from "@/lib/capable";

// сцена следит за темой сайта: стеклу и частицам нужны свои ночные цвета
function useDarkTheme() {
  const [dark, setDark] = useState(
    () => document.documentElement.dataset.theme === "dark"
  );
  useEffect(() => {
    const onTheme = (e: Event) =>
      setDark((e as CustomEvent).detail === "dark");
    window.addEventListener("ariya:theme", onTheme);
    return () => window.removeEventListener("ariya:theme", onTheme);
  }, []);
  return dark;
}

const SHEAR = Math.tan((22 * Math.PI) / 180); // фирменный наклон, y-up => +
const BAR = { w: 0.55, d: 0.55, mid: 3.2, side: 2.2, gap: 0.9, r: 0.14 };

// поза композиции: x/y — доли ширины/высоты вьюпорта, углы в радианах
type Pose = {
  x: number; y: number; z: number;
  rx: number; ry: number; rz: number;
  spread: number; s: number;
};

// мизансцены: hero → services → work → why → process → cta (строй лого).
// маятник-зигзаг: композиция чередует стороны экрана от сцены к сцене,
// в плотных секциях — нить у края, в просторных — пустая половина
const KEYS: Pose[] = [
  { x: 0.22, y: -0.02, z: 0, rx: 0.12, ry: -0.35, rz: 0.1, spread: 1, s: 1 },
  { x: -0.45, y: -0.08, z: -1.2, rx: 0.45, ry: 0.55, rz: -0.18, spread: 1.3, s: 0.6 },
  { x: 0.4, y: 0.04, z: -2.2, rx: 1.05, ry: 0.25, rz: 0.55, spread: 1.9, s: 0.65 },
  { x: -0.31, y: -0.13, z: -0.4, rx: -0.22, ry: -0.65, rz: -0.28, spread: 1.2, s: 0.6 },
  { x: 0.34, y: 0, z: -0.8, rx: 0.5, ry: -0.55, rz: -0.2, spread: 1.7, s: 0.8 },
  { x: 0.24, y: 0.03, z: 0, rx: 0, ry: 0, rz: 0, spread: 1, s: 0.9 },
];

// точка входа после прелоадера: по центру, как знак на экране загрузки
const ENTER: Pose = { x: 0, y: 0, z: 1.1, rx: 0, ry: 0, rz: 0, spread: 1, s: 0.78 };

const SECTION_IDS = ["services", "work", "why", "process", "contact"];

// тексты, через которые пролетает лого: при пересечении инвертируем задетое
const INV_SELECTOR = [
  ".hero h1",
  ".hero-sub",
  ".eyebrow",
  ".s-head h2",
  ".s-head .idx",
  ".intro",
  ".why-lead",
  ".why-item b",
  ".why-item p",
  ".step .n",
  ".step h3",
  ".step p",
  ".svc-plus",
  ".case-closing",
  ".case-empty b",
  ".case-empty span",
  ".cta-title",
  ".cta-sub",
].join(", ");
// свойства, которые клон копирует, чтобы лечь пиксель-в-пиксель на оригинал
const INV_STYLE_PROPS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "lineHeight",
  "textTransform",
  "textAlign",
  "whiteSpace",
  "textWrap",
  "wordSpacing",
  "padding",
] as const;
// и потомкам тоже — иначе scoped-селекторы (.hero h1 .l2 и т.п.) не сработают
// в клоне, и переносы строк разъедутся с оригиналом
const INV_KID_PROPS = [
  "display",
  "margin",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "lineHeight",
  "whiteSpace",
  "textTransform",
  "verticalAlign",
] as const;

// инверсная база: difference от фона B возвращает исходный цвет T —
// X = B±T поканально; работает в обеих темах без ручных таблиц
function invBase(color: string, bg: [number, number, number]) {
  const m = color.match(/\d+/g);
  if (!m) return color;
  const x = [0, 1, 2].map((i) => {
    const t = Number(m[i] ?? 0);
    const b = bg[i];
    return Math.max(0, Math.min(255, b > 127 ? b - t : b + t));
  });
  return `rgb(${x[0]},${x[1]},${x[2]})`;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (t: number) => t * t * (3 - 2 * t);

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t),
    rx: lerp(a.rx, b.rx, t), ry: lerp(a.ry, b.ry, t), rz: lerp(a.rz, b.rz, t),
    spread: lerp(a.spread, b.spread, t), s: lerp(a.s, b.s, t),
  };
}

function useShearedGeometry(h: number) {
  return useMemo(() => {
    const g = new RoundedBoxGeometry(BAR.w, h, BAR.d, 4, BAR.r);
    const m = new THREE.Matrix4();
    m.set(1, SHEAR, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    g.applyMatrix4(m);
    g.computeVertexNormals();
    return g;
  }, [h]);
}

function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, "rgba(13,16,51,0.5)");
    grad.addColorStop(1, "rgba(13,16,51,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }, []);
}

// эхо знака: поле частиц держит строй /// позади хиро, разлетается от курсора
// и возвращается; при скролле вниз гаснет, уступая сцену стеклянному лого
const FIELD = { n: [500, 750, 500], depth: 3, scatter: 5 };

function HeroField() {
  const pts = useRef<THREE.Points>(null!);
  const mat = useRef<THREE.PointsMaterial>(null!);
  const { viewport } = useThree();
  const dark = useDarkTheme();

  const sim = useMemo(() => {
    // компактный профиль — от РАСКЛАДКИ (узкое окно), не от типа указателя:
    // меньше точек, рассыпное облако прижато к знаку — не сыплется на текст
    const compact = window.innerWidth < 900;
    const N = compact ? [220, 320, 220] : FIELD.n;
    const scatter = compact ? 2.2 : FIELD.scatter;
    const total = N[0] + N[1] + N[2];
    const tgt = new Float32Array(total * 3);
    const pos = new Float32Array(total * 3);
    const vel = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    // цвета — ровно как у брусков знака: чернильные бока, синяя середина
    const cSide = new THREE.Color("#0D1033");
    const cMid = new THREE.Color("#0C5EFF");
    const c = new THREE.Color();
    let i = 0;
    // равномерно засеиваем три бруска знака (локальные координаты до масштаба)
    ([-1, 0, 1] as const).forEach((bar, bi) => {
      const h = bar === 0 ? BAR.mid : BAR.side;
      for (let k = 0; k < N[bi]; k++) {
        const y = (Math.random() - 0.5) * h;
        const x = bar * BAR.gap + (Math.random() - 0.5) * BAR.w + SHEAR * y;
        const z = (Math.random() - 0.5) * 0.28;
        tgt[i * 3] = x;
        tgt[i * 3 + 1] = y;
        tgt[i * 3 + 2] = z;
        // рождаются в рассыпном облаке — после лоадера строй собирается сам
        pos[i * 3] = x + (Math.random() - 0.5) * scatter;
        pos[i * 3 + 1] = y + (Math.random() - 0.5) * scatter;
        pos[i * 3 + 2] = z + (Math.random() - 0.5) * 2;
        c.copy(bar === 0 ? cMid : cSide);
        c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.06);
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
        i++;
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { geo, tgt, vel, total, N };
  }, []);

  // ночью чернильные бока строя стали бы невидимыми — перекрашиваем под тему
  useEffect(() => {
    const cSide = new THREE.Color(dark ? "#9FB0E8" : "#0D1033");
    const cMid = new THREE.Color(dark ? "#4C86FF" : "#0C5EFF");
    const c = new THREE.Color();
    const colA = sim.geo.attributes.color;
    const arr = colA.array as Float32Array;
    const [n0, n1] = sim.N;
    for (let i = 0; i < sim.total; i++) {
      c.copy(i >= n0 && i < n0 + n1 ? cMid : cSide);
      c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.06);
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    colA.needsUpdate = true;
  }, [dark, sim]);

  // на мыши поле реагирует на ховер всегда; на таче — чисто фон,
  // разлетается только пока палец на экране (свайп), без фантомных точек
  const mouse = useRef({ x: 0, y: 0, active: true });
  useEffect(() => {
    const coarse = isCoarse();
    if (coarse) mouse.current.active = false;
    const put = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / innerHeight) * 2 - 1);
    };
    const onMove = (e: PointerEvent) => put(e);
    const onDown = (e: PointerEvent) => {
      if (coarse) mouse.current.active = true;
      put(e);
    };
    const onUp = () => {
      if (coarse) mouse.current.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  useFrame((f, dt) => {
    const p = pts.current;
    if (!p) return;
    const d = Math.min(dt, 0.05);
    const t = f.clock.elapsedTime;

    // гаснем при уходе из хиро — и не тратим кадры на невидимое
    const fade =
      clamp01(1 - window.scrollY / (window.innerHeight * 0.62)) *
      (document.documentElement.classList.contains("is-loaded") ? 1 : 0.65);
    mat.current.opacity = 0.62 * fade;
    p.visible = fade > 0.02;
    if (!p.visible) return;

    // строй живёт глубже сцены и крупнее лого: эхо, а не дубль;
    // в узком окне — компактнее и у знака сверху, чтобы не лезть на текст
    const depthK = (7 + FIELD.depth) / 7;
    const compact = window.innerWidth < 900;
    const S = viewport.height * 0.155 * (compact ? 1.05 : 1.5) * depthK;
    p.scale.setScalar(S);
    if (compact)
      p.position.set(0, 0.22 * viewport.height * depthK, -FIELD.depth);
    else p.position.set(0.21 * viewport.width * depthK, 0, -FIELD.depth);

    // курсор в локальных координатах поля; неактивен — уводим за горизонт
    const touchLive = mouse.current.active;
    const halfH = viewport.height * 0.5 * depthK;
    const halfW = viewport.width * 0.5 * depthK;
    const mx = touchLive
      ? (mouse.current.x * halfW - p.position.x) / S
      : 1e4;
    const my = touchLive
      ? (mouse.current.y * halfH - p.position.y) / S
      : 1e4;

    const posA = sim.geo.attributes.position;
    const arr = posA.array as Float32Array;
    const spring = 4.2;
    const damp = Math.pow(0.12, d);
    const rr = 1.15; // радиус разлёта в локальных единицах
    for (let i = 0; i < sim.total; i++) {
      const ix = i * 3;
      const wob = Math.sin(t * 0.7 + i * 1.7) * 0.028;
      let fx = (sim.tgt[ix] + wob - arr[ix]) * spring;
      let fy = (sim.tgt[ix + 1] + Math.cos(t * 0.6 + i) * 0.024 - arr[ix + 1]) * spring;
      const fz = (sim.tgt[ix + 2] - arr[ix + 2]) * spring;
      const dx = arr[ix] - mx;
      const dy = arr[ix + 1] - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < rr * rr) {
        const dist = Math.sqrt(d2) + 1e-4;
        const push = ((rr - dist) / rr) * 26;
        fx += (dx / dist) * push;
        fy += (dy / dist) * push;
      }
      sim.vel[ix] = (sim.vel[ix] + fx * d) * damp;
      sim.vel[ix + 1] = (sim.vel[ix + 1] + fy * d) * damp;
      sim.vel[ix + 2] = (sim.vel[ix + 2] + fz * d) * damp;
      arr[ix] += sim.vel[ix] * d * 8;
      arr[ix + 1] += sim.vel[ix + 1] * d * 8;
      arr[ix + 2] += sim.vel[ix + 2] * d * 8;
    }
    posA.needsUpdate = true;
  });

  return (
    <points ref={pts} geometry={sim.geo} frustumCulled={false}>
      <pointsMaterial
        ref={mat}
        vertexColors
        transparent
        opacity={0}
        size={0.05}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Composition() {
  const group = useRef<THREE.Group>(null!);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const shadow = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  const dark = useDarkTheme();

  const sideGeo = useShearedGeometry(BAR.side);
  const midGeo = useShearedGeometry(BAR.mid);
  const shadowTex = useShadowTexture();
  // стекло преломляет «фон» — ночью он чернильный, не белый
  const glassBg = useMemo(
    () => new THREE.Color(dark ? "#0a0e2a" : "#ffffff"),
    [dark]
  );

  const st = useRef({
    mouse: { x: 0, y: 0 },
    drag: { x: 0, y: 0 },
    dragging: false,
    lastPX: 0,
    lastPY: 0,
    coarse: isCoarse(),
    narrow: false, // мобильная раскладка (<900px) — ставится в measure()
    entrance: document.documentElement.classList.contains("is-loaded") ? 1 : 0,
    stops: [0, 0.18, 0.38, 0.58, 0.78, 1],
    docH: 1,
    // парковка хранится в КООРДИНАТАХ СТРАНИЦЫ: канвас фиксирован во вьюпорте,
    // а wordmark скроллится — позу нужно пересчитывать от живого scrollY
    finalPark: null as {
      pageX: number;
      pageY: number;
      s: number;
      spread: number;
    } | null,
    // якорь хиро-позы: центр и размер бокса статичного знака — на мобиле
    // лого встаёт ровно на его место и не наезжает на заголовок
    heroAnchor: null as { x: number; y: number; s: number } | null,
    // инверсия задетых текстов: клоны в body + активные пары
    invEls: [] as HTMLElement[],
    invActive: new Map<HTMLElement, HTMLElement>(),
    invBox: new THREE.Box3(),
    invV: new THREE.Vector3(),
  });

  useEffect(() => {
    const s = st.current;

    const measure = () => {
      s.narrow = window.innerWidth < 900;
      s.docH = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );

      // хиро-поза целится в реальный бокс знака (page-координаты, поза видна
      // только у верха страницы); масштаб — чтобы средний брусок = высоте бокса
      const hv = document.querySelector(".hero-visual");
      if (hv) {
        const r = hv.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cyPage = r.top + window.scrollY + r.height / 2;
        const nf =
          0.6 + 0.4 * Math.min(1, window.innerWidth / window.innerHeight / 0.8);
        s.heroAnchor = {
          x: cx / window.innerWidth - 0.5,
          y: 0.5 - cyPage / window.innerHeight,
          s: Math.min(1, (0.92 * r.height) / window.innerHeight / (0.496 * nf)),
        };
      }
      const stops = [0];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        // сцена встаёт в позу, когда заголовок секции у верха экрана —
        // зритель читает мизансцену вместе с началом секции
        stops.push(clamp01((el.offsetTop - window.innerHeight * 0.25) / s.docH));
      }

      // финал: бруски паркуются в прорезь гигантского wordmark, становясь его
      // слэшами — ровно в дизайнерской точке SVG (viewBox 1010×320: центр
      // кластера 597;160, синий по замыслу лого чуть ныряет под базовую линию)
      const foot = document.querySelector(".foot-word svg");
      if (foot) {
        const r = foot.getBoundingClientRect();
        const scale = r.width / 1010;
        const vh = window.innerHeight;
        const pageX = r.left + 597 * scale;
        const pageY = r.top + window.scrollY + 160 * scale;
        const sPose = (290 * scale) / (0.496 * vh);
        s.finalPark = {
          pageX,
          pageY,
          s: sPose,
          spread: (77 * scale) / (0.1395 * vh * sPose),
        };
        stops.push(0.995);
      }
      s.stops = stops;
    };
    measure();

    const onMove = (e: PointerEvent) => {
      s.mouse.x = (e.clientX / innerWidth) * 2 - 1;
      s.mouse.y = (e.clientY / innerHeight) * 2 - 1;
      if (s.dragging) {
        s.drag.y = THREE.MathUtils.clamp(
          s.drag.y + (e.clientX - s.lastPX) * 0.005,
          -0.8,
          0.8
        );
        s.drag.x = THREE.MathUtils.clamp(
          s.drag.x + (e.clientY - s.lastPY) * 0.004,
          -0.6,
          0.6
        );
        s.lastPX = e.clientX;
        s.lastPY = e.clientY;
      }
    };
    const onDown = (e: PointerEvent) => {
      // на таче драг конфликтует со скроллом — там лого крутится само
      if (isCoarse()) return;
      // drag живёт в хиро, пока оно на экране
      if (window.scrollY > innerHeight * 0.7) return;
      const zone = document.querySelector(".hero-visual");
      if (!zone) return;
      const r = zone.getBoundingClientRect();
      if (
        e.clientX < r.left || e.clientX > r.right ||
        e.clientY < r.top || e.clientY > r.bottom
      )
        return;
      s.dragging = true;
      s.lastPX = e.clientX;
      s.lastPY = e.clientY;
    };
    const onUp = () => (s.dragging = false);
    const onLoaded = () => measure();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("resize", measure);
    window.addEventListener("ariya:loaded", onLoaded);

    // клоны задетых текстов живут ПРЯМО в body: любой позиционированный
    // контейнер-обёртка создал бы стекинг-контекст и отрезал difference
    // от канваса с фоном — бленд обязан жить в корневом контексте
    s.invEls = Array.from(
      document.querySelectorAll<HTMLElement>(INV_SELECTOR)
    );

    // сцена собрана — сообщаем прелоадеру и прячем статичный знак
    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.add("has-3d");
      window.dispatchEvent(new Event("ariya:scene-ready"));
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", measure);
      window.removeEventListener("ariya:loaded", onLoaded);
      document.documentElement.classList.remove("has-3d");
      s.invActive.forEach((clone, el) => {
        clone.remove();
        el.classList.remove("inv-src");
      });
      s.invActive.clear();
    };
  }, []);

  useFrame((frame, dt) => {
    const s = st.current;
    const t = frame.clock.elapsedTime;
    const d = Math.min(dt, 0.05);

    // вход после лоадера; на таче сцена монтируется позже и отдельно —
    // никаких пролётов из центра над текстом: лого растёт прямо на якоре
    const loaded = document.documentElement.classList.contains("is-loaded");
    if (loaded && s.entrance < 1)
      s.entrance = Math.min(1, s.entrance + d * 1.1);
    const enterPose =
      s.narrow && s.heroAnchor
        ? { ...ENTER, x: s.heroAnchor.x, y: s.heroAnchor.y, z: 0.8, s: s.heroAnchor.s * 0.55 }
        : ENTER;

    // сегмент скролла → поза (с динамическим финалом-«парковкой» в wordmark);
    // финальная поза каждый кадр строится от текущего scrollY — бруски
    // приклеены к прорези wordmark на любом скролле и едут вместе с футером
    let P = KEYS;
    if (s.heroAnchor) {
      P = [{ ...KEYS[0], ...s.heroAnchor }, ...KEYS.slice(1)];
    }
    if (s.finalPark) {
      const fp = s.finalPark;
      P = [
        ...P,
        {
          x: fp.pageX / window.innerWidth - 0.5,
          y: 0.5 - (fp.pageY - window.scrollY) / window.innerHeight,
          z: 0,
          rx: 0,
          ry: 0,
          rz: 0,
          spread: fp.spread,
          s: fp.s,
        },
      ];
    }
    const p = clamp01(window.scrollY / s.docH);
    const stops = s.stops;
    let i = 0;
    while (i < stops.length - 2 && p > stops[i + 1]) i++;
    const span = Math.max(1e-4, stops[i + 1] - stops[i]);
    const tt = smooth(clamp01((p - stops[i]) / span));
    // доля «припаркованности»: на финальном отрезке гасим всю живность,
    // иначе покачивание и параллакс утапливают бруски ниже wordmark
    const park = s.finalPark && i === P.length - 2 ? tt : 0;
    const live = 1 - park;
    let pose = lerpPose(P[i], P[Math.min(i + 1, P.length - 1)], tt);
    // дуга подлёта: в середине перехода композиция приподнимается и идёт ближе к камере
    const arc = Math.sin(tt * Math.PI);
    pose.y += arc * 0.04;
    pose.z += arc * 0.35;
    pose = lerpPose(enterPose, pose, smooth(s.entrance));

    // drag с мягким возвратом
    if (!s.dragging) {
      s.drag.x = lerp(s.drag.x, 0, 1 - Math.pow(0.02, d));
      s.drag.y = lerp(s.drag.y, 0, 1 - Math.pow(0.02, d));
    }

    const g = group.current;
    // на узких экранах композиция ужимается — иначе строй шире вьюпорта
    const narrow = Math.min(1, viewport.width / viewport.height / 0.8);
    const baseScale = viewport.height * 0.155 * (0.6 + 0.4 * narrow);

    // параллакс от мыши + лёгкое дыхание (замирают в парковке)
    const targetRX =
      pose.rx + (-s.mouse.y * 0.09 + s.drag.x + Math.sin(t * 0.4) * 0.015) * live;
    const targetRY = pose.ry + (s.mouse.x * 0.13 + s.drag.y) * live;
    const targetRZ = pose.rz + Math.sin(t * 0.3) * 0.012 * live;

    // парковка: долли-зум — fov сужается, камера отъезжает так, что видимый
    // мир в плоскости z=0 остаётся того же размера. Перспектива умирает,
    // проекция становится плоской как SVG: без завалов и бокового смаза
    const cam = frame.camera as THREE.PerspectiveCamera;
    const targetFov = 35 - park * 27; // 35° → 8°
    if (Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov = targetFov;
      cam.position.z = 2.207 / Math.tan((cam.fov * Math.PI) / 360);
      cam.updateProjectionMatrix();
    }

    const k = 1 - Math.pow(0.001, d); // сглаживание к цели
    // в парковке позиция должна липнуть к скроллящемуся wordmark жёстче,
    // иначе бруски резинисто отстают от букв
    const kPos = park > 0 ? 1 - Math.pow(0.001, d * (1 + park * 3)) : k;
    g.position.x = lerp(g.position.x, pose.x * viewport.width, kPos);
    g.position.y = lerp(g.position.y, pose.y * viewport.height, kPos);
    g.position.z = lerp(g.position.z, pose.z, kPos);
    g.rotation.x = lerp(g.rotation.x, targetRX, k);
    g.rotation.y = lerp(g.rotation.y, targetRY, k);
    g.rotation.z = lerp(g.rotation.z, targetRZ, k);
    const sc = baseScale * pose.s;
    g.scale.setScalar(lerp(g.scale.x, sc, k));

    // бруски: раздвижка по мизансцене + противофазный флоат (гаснет в парковке)
    bars.current.forEach((m, bi) => {
      if (!m) return;
      m.position.x = (bi - 1) * BAR.gap * pose.spread;
      m.position.y = Math.sin(t * 0.9 + bi * 2.1) * 0.05 * live;
    });

    // ── инверсия задетого текста: экранный bbox лого против rect'ов текстов ──
    if (s.entrance > 0.85 && s.invEls.length) {
      const box = s.invBox.setFromObject(g);
      const v = s.invV;
      let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      for (let ci = 0; ci < 8; ci++) {
        v.set(
          ci & 1 ? box.max.x : box.min.x,
          ci & 2 ? box.max.y : box.min.y,
          ci & 4 ? box.max.z : box.min.z
        ).project(cam);
        const sx = ((v.x + 1) / 2) * window.innerWidth;
        const sy = ((1 - v.y) / 2) * window.innerHeight;
        if (sx < minX) minX = sx;
        if (sx > maxX) maxX = sx;
        if (sy < minY) minY = sy;
        if (sy > maxY) maxY = sy;
      }
      const pad = 8;
      for (const el of s.invEls) {
        const r = el.getBoundingClientRect();
        const hit =
          r.width > 0 &&
          r.left < maxX + pad && r.right > minX - pad &&
          r.top < maxY + pad && r.bottom > minY - pad;
        const clone = s.invActive.get(el);
        if (hit && !clone) {
          // накрываем оригинал клоном с difference: тот же текст, та же метрика
          const bgm = getComputedStyle(document.body)
            .backgroundColor.match(/\d+/g);
          const bg: [number, number, number] = bgm
            ? [Number(bgm[0]), Number(bgm[1]), Number(bgm[2])]
            : [255, 255, 255];
          const c = document.createElement("div");
          c.className = "inv-clone";
          const cs = getComputedStyle(el) as unknown as Record<string, string>;
          const st2 = c.style as unknown as Record<string, string>;
          for (const p of INV_STYLE_PROPS) st2[p] = cs[p];
          c.style.color = invBase(cs.color, bg);
          // innerHTML + вычисленные стили каждому потомку: scoped-селекторы
          // оригинала в клоне не работают — копируем раскладку и цвет руками
          c.innerHTML = el.innerHTML;
          const srcKids = el.querySelectorAll<HTMLElement>("*");
          const dstKids = c.querySelectorAll<HTMLElement>("*");
          srcKids.forEach((sk, ki) => {
            const dk = dstKids[ki];
            if (!dk) return;
            const ks = getComputedStyle(sk) as unknown as Record<string, string>;
            const ds = dk.style as unknown as Record<string, string>;
            for (const p of INV_KID_PROPS) ds[p] = ks[p];
            dk.style.color = invBase(ks.color, bg);
          });
          c.style.width = r.width + "px";
          c.style.transform = `translate(${r.left}px, ${r.top}px)`;
          document.body.appendChild(c);
          el.classList.add("inv-src");
          s.invActive.set(el, c);
        } else if (!hit && clone) {
          clone.remove();
          el.classList.remove("inv-src");
          s.invActive.delete(el);
        } else if (clone) {
          clone.style.width = r.width + "px";
          clone.style.transform = `translate(${r.left}px, ${r.top}px)`;
        }
      }
    }

    // мягкая тень: в хиро и у строя в CTA; в футере (парковка в wordmark) её нет
    const ctaStop = stops[Math.max(0, stops.length - 2)];
    const nearHero = Math.max(0, 1 - p / 0.1);
    const nearCta = Math.max(0, 1 - Math.abs(p - ctaStop) / 0.06);
    const shOp = 0.34 * Math.min(1, nearHero + nearCta) * s.entrance;
    const sh = shadow.current;
    sh.position.set(g.position.x, g.position.y - sc * (BAR.mid / 2) - 0.5, g.position.z);
    sh.scale.set(sc * 2.4 * pose.spread, sc * 1.05, 1);
    (sh.material as THREE.MeshBasicMaterial).opacity = shOp;
  });

  return (
    <>
      <group ref={group}>
        {/* ночью чернильные бока превращаются в лунную сталь */}
        <mesh ref={(el) => { bars.current[0] = el; }} geometry={sideGeo}>
          <meshStandardMaterial color={dark ? "#D7DEF8" : "#131740"} metalness={0.35} roughness={0.3} envMapIntensity={1.5} />
        </mesh>
        <mesh ref={(el) => { bars.current[1] = el; }} geometry={midGeo}>
          {/* мобильный профиль стекла: меньше сэмплов и буфер преломления */}
          <MeshTransmissionMaterial
            transmission={1}
            thickness={0.9}
            roughness={0.12}
            ior={1.4}
            chromaticAberration={0.28}
            anisotropicBlur={0.35}
            color="#5b93ff"
            attenuationColor="#0C5EFF"
            attenuationDistance={1.4}
            samples={isCoarse() ? 4 : 6}
            resolution={isCoarse() ? 256 : 512}
            background={glassBg}
          />
        </mesh>
        <mesh ref={(el) => { bars.current[2] = el; }} geometry={sideGeo}>
          <meshStandardMaterial color={dark ? "#D7DEF8" : "#131740"} metalness={0.35} roughness={0.3} envMapIntensity={1.5} />
        </mesh>
      </group>

      <mesh ref={shadow} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0} depthWrite={false} />
      </mesh>

      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 4]} intensity={0.55} />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} position={[0, 3, 4]} scale={[6, 3, 1]} />
        <Lightformer intensity={1.1} position={[-4, 1, 2]} rotation-y={0.6} scale={[3, 4, 1]} />
        <Lightformer intensity={1.4} position={[4, -1, 3]} rotation-y={-0.7} scale={[3, 4, 1]} color="#dfe8ff" />
      </Environment>
    </>
  );
}

export default function Scene() {
  // канвас должен жить вне main, иначе попадает в его контекст наложения
  // и рисуется поверх непозиционированных секций
  return createPortal(
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        dpr={isCoarse() ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 35 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <HeroField />
        <Composition />
      </Canvas>
    </div>,
    document.body
  );
}
