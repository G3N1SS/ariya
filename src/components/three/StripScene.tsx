"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { useEffect, useMemo, useRef } from "react";
import {
  makePrismaBody,
  NU_STOPS,
  NU_NEON,
  SHEAR,
  EYE_Y,
  FACE_X,
  EYE_GAP,
  EYE_Z,
} from "./PrismaScene";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// раскладка мира: 5 эпох связи из игры, высота и техника растут к 6G.
// фракции ширины продублированы в CaseStrip (лейблы) — держать в синхроне
const XS = [-0.38, -0.19, 0, 0.19, 0.38];
const TOPS = [-1.2, -0.62, -0.06, 0.5, 1.08];
const FLOOR = -2.4;
const BODY_S = 0.62;
const REST = 0.6;
const JUMP = 0.8;
const BACK = 1.35;

const STEEL = "#211d4d";
const STEEL_L = "#2c2761";
const PLASTIC = "#3d3a7e";

function useGlowTex() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 126);
    grad.addColorStop(0, "rgba(255,52,149,0.5)");
    grad.addColorStop(0.45, "rgba(255,52,149,0.2)");
    grad.addColorStop(1, "rgba(255,52,149,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
}

// звёзды мигают, как фон игры: два облака в противофазе
function useStars(seedShift: number) {
  return useMemo(() => {
    const n = 60;
    const pos = new Float32Array(n * 3);
    let s = 7 + seedShift;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rnd() - 0.5) * 44;
      pos[i * 3 + 1] = (rnd() - 0.5) * 7 + 0.6;
      pos[i * 3 + 2] = -2 - rnd() * 3;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [seedShift]);
}

// провисший провод 2G: трубка по квадратичной кривой влево за кадр
function useWire(x0: number, y0: number, len: number, sag: number) {
  return useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(x0, y0, 0),
          new THREE.Vector3(x0 - len / 2, y0 - sag, 0),
          new THREE.Vector3(x0 - len, y0 - sag * 0.35, 0)
        ),
        18,
        0.013,
        6
      ),
    [x0, y0, len, sag]
  );
}

// ── вышки эпох: у каждой свой узнаваемый силуэт ──
function Pole2G({ top }: { top: number }) {
  const wireA = useWire(-0.44, top + 0.02, 6, 0.55);
  const wireB = useWire(-0.3, top - 0.3, 6, 0.7);
  const ins = [-0.4, -0.18, 0.18, 0.4];
  return (
    <>
      {/* деревянный столб с двумя траверсами и изоляторами */}
      <mesh position={[0, (top + FLOOR) / 2, 0]}>
        <cylinderGeometry args={[0.055, 0.08, top - FLOOR, 8]} />
        <meshStandardMaterial color="#2b2352" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[0, top, 0]}>
        <boxGeometry args={[0.96, 0.07, 0.09]} />
        <meshStandardMaterial color={STEEL_L} metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, top - 0.32, 0]}>
        <boxGeometry args={[0.68, 0.06, 0.08]} />
        <meshStandardMaterial color={STEEL_L} metalness={0.3} roughness={0.6} />
      </mesh>
      {ins.map((x) => (
        <mesh key={`a${x}`} position={[x, top + 0.07, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#8d93c4" />
        </mesh>
      ))}
      {ins.slice(1, 3).map((x) => (
        <mesh key={`b${x}`} position={[x * 1.6, top - 0.25, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#8d93c4" />
        </mesh>
      ))}
      <mesh geometry={wireA}>
        <meshBasicMaterial color="#565b8c" transparent opacity={0.55} />
      </mesh>
      <mesh geometry={wireB}>
        <meshBasicMaterial color="#565b8c" transparent opacity={0.45} />
      </mesh>
    </>
  );
}

function Tower3G({ top }: { top: number }) {
  const h = top - FLOOR;
  const legs = [-1, 1];
  return (
    <>
      {/* решётчатая ферма: две наклонные ноги + распорки, панели веером, тарелка */}
      {legs.map((sgn) => (
        <mesh
          key={sgn}
          position={[sgn * 0.11, (top + FLOOR) / 2, 0]}
          rotation-z={sgn * -0.075}
        >
          <cylinderGeometry args={[0.035, 0.05, h, 8]} />
          <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
        </mesh>
      ))}
      {[0.22, 0.45, 0.68].map((f, bi) => (
        <mesh
          key={f}
          position={[0, FLOOR + h * f, 0]}
          rotation-z={bi % 2 ? 0.5 : -0.5}
        >
          <boxGeometry args={[0.34, 0.035, 0.035]} />
          <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, top, 0]}>
        <boxGeometry args={[0.6, 0.09, 0.44]} />
        <meshStandardMaterial color={STEEL_L} metalness={0.5} roughness={0.35} />
      </mesh>
      {[-0.45, 0, 0.45].map((ry) => (
        <mesh key={ry} position={[Math.sin(ry) * 0.16, top - 0.26, Math.cos(ry) * 0.1]} rotation-y={ry}>
          <boxGeometry args={[0.09, 0.3, 0.03]} />
          <meshStandardMaterial color="#4a4694" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      {/* спутниковая тарелка смотрит вбок */}
      <mesh position={[-0.22, top - 0.62, 0.05]} rotation-z={1.15} rotation-y={0.35}>
        <coneGeometry args={[0.17, 0.07, 18, 1, true]} />
        <meshStandardMaterial color="#8d93c4" metalness={0.5} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

function TowerLTE({ top }: { top: number }) {
  return (
    <>
      {/* городская БС: ровная мачта, кольцо секторных панелей, СВЧ-барабаны */}
      <mesh position={[0, (top + FLOOR) / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, top - FLOOR, 10]} />
        <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, top, 0]}>
        <boxGeometry args={[0.62, 0.09, 0.46]} />
        <meshStandardMaterial color={STEEL_L} metalness={0.5} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.17, top - 0.3, Math.cos(a) * 0.17]} rotation-y={a}>
            <boxGeometry args={[0.1, 0.4, 0.03]} />
            <meshStandardMaterial color={PLASTIC} metalness={0.4} roughness={0.4} />
          </mesh>
        );
      })}
      {[-1, 1].map((sgn) => (
        <mesh key={sgn} position={[sgn * 0.14, top - 0.72, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.075, 0.075, 0.09, 12]} />
          <meshStandardMaterial color="#8d93c4" metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
    </>
  );
}

function Tower5G({ top }: { top: number }) {
  const arrGeo = useMemo(() => new RoundedBoxGeometry(0.3, 0.52, 0.22, 3, 0.06), []);
  const cellGeo = useMemo(() => new RoundedBoxGeometry(0.13, 0.18, 0.11, 2, 0.035), []);
  return (
    <>
      {/* смолл-селл: гладкий светлый столб, скруглённый массив, коробочки сот */}
      <mesh position={[0, (top + FLOOR) / 2, 0]}>
        <cylinderGeometry args={[0.042, 0.055, top - FLOOR, 12]} />
        <meshStandardMaterial color={PLASTIC} metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[0, top - 0.32, 0]} geometry={arrGeo}>
        <meshStandardMaterial color="#565390" metalness={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[0, top, 0]}>
        <boxGeometry args={[0.58, 0.09, 0.42]} />
        <meshStandardMaterial color="#565390" metalness={0.4} roughness={0.3} />
      </mesh>
      {[-0.85, -1.35].map((dy, i) => (
        <mesh key={dy} position={[i % 2 ? -0.09 : 0.09, top + dy, 0]} geometry={cellGeo}>
          <meshStandardMaterial color={PLASTIC} metalness={0.35} roughness={0.35} />
        </mesh>
      ))}
    </>
  );
}

function Tower6G({ top, ring }: { top: number; ring: React.RefObject<THREE.Mesh | null> }) {
  return (
    <>
      {/* шпиль будущего: игла, левитирующее неон-кольцо, самая высокая точка */}
      <mesh position={[0, (top + FLOOR) / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.06, top - FLOOR, 10]} />
        <meshStandardMaterial color="#8d93c4" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, top, 0]}>
        <boxGeometry args={[0.56, 0.08, 0.4]} />
        <meshStandardMaterial color="#8d93c4" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh ref={ring} position={[0, top - 0.55, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.3, 0.024, 8, 36]} />
        <meshBasicMaterial color={NU_NEON} transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </>
  );
}

function World() {
  const world = useRef<THREE.Group>(null!);
  const starsA = useRef<THREE.Points>(null!);
  const starsB = useRef<THREE.Points>(null!);
  const jumpG = useRef<THREE.Group>(null!);
  const bodyG = useRef<THREE.Group>(null!);
  const eyeL = useRef<THREE.Mesh>(null!);
  const eyeR = useRef<THREE.Mesh>(null!);
  const trail = useRef<THREE.Mesh>(null!);
  const glow = useRef<THREE.Mesh>(null!);
  const antDot = useRef<THREE.Mesh>(null!);
  const antRings = useRef<(THREE.Mesh | null)[]>([]);
  const lights = useRef<(THREE.Mesh | null)[]>([]);
  const towersG = useRef<(THREE.Group | null)[]>([]);
  const ring6 = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  const bodyGeo = useMemo(() => makePrismaBody(NU_STOPS), []);
  const glowTex = useGlowTex();
  const starsGeoA = useStars(0);
  const starsGeoB = useStars(31);

  const st = useRef({
    i: 0,
    phase: "rest" as "rest" | "jump" | "back",
    t0: 0,
    happy: 0,
    spin: 0,
    spinCur: 0,
    flash: [0, 0, 0, 0, 0],
    lvl: 0,
    mouse: { x: 0, y: 0 },
    d: 0,
  });
  // эстафета с гидом кейса: на десктопе джампер ждёт, пока гид нырнёт в ленту;
  // без гида (мобилка, прямой заход) живёт с самого начала
  const hand = useRef({
    mode: (typeof window !== "undefined" &&
    (window as unknown as Record<string, unknown>).__ariyaStripOwned === true
      ? "hidden"
      : "live") as "hidden" | "enter" | "live" | "exit",
    t0: 0,
    x0: 0,
    y0: 0,
    pendIn: false,
    pendOut: false,
  });

  useEffect(() => {
    const hd = hand.current;
    const onIn = () => {
      hd.pendIn = true;
    };
    const onOut = () => {
      hd.pendOut = true;
    };
    window.addEventListener("ariya:strip-in", onIn);
    window.addEventListener("ariya:strip-out", onOut);
    return () => {
      window.removeEventListener("ariya:strip-in", onIn);
      window.removeEventListener("ariya:strip-out", onOut);
    };
  }, []);

  // параллакс: смещение центра ленты от центра вьюпорта; наклон — за мышью
  useEffect(() => {
    const el = gl.domElement;
    const s = st.current;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      s.d = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    };
    const onMove = (e: PointerEvent) => {
      s.mouse.x = (e.clientX / innerWidth) * 2 - 1;
      s.mouse.y = (e.clientY / innerHeight) * 2 - 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, [gl]);

  useFrame((f, dt) => {
    const t = f.clock.elapsedTime;
    const d = Math.min(dt, 0.05);
    const k = 1 - Math.pow(0.001, d);
    const s = st.current;
    const vw = f.viewport.width;
    const xs = XS.map((fr) => fr * vw);

    // наклон мира за курсором + вертикальный параллакс слоёв;
    // мир сидит ниже центра, а его параллакс УМЕРЕННЫЙ: подъём на d·0.7
    // съедал запас над дугами и прыжки резались кромкой (глубину держат звёзды)
    world.current.rotation.x = lerp(world.current.rotation.x, -s.mouse.y * 0.05, k);
    world.current.rotation.y = lerp(world.current.rotation.y, s.mouse.x * 0.07, k);
    world.current.position.y = lerp(world.current.position.y, -0.35 + s.d * 0.28, k);
    starsA.current.position.y = s.d * 1.3;
    starsB.current.position.y = s.d * 1.9;
    (starsA.current.material as THREE.PointsMaterial).opacity =
      0.35 + 0.3 * Math.sin(t * 1.6);
    (starsB.current.material as THREE.PointsMaterial).opacity =
      0.35 + 0.3 * Math.sin(t * 1.6 + Math.PI);

    // вышки держат строй по ширине; кольцо 6G левитирует и вращается
    towersG.current.forEach((tw, ti) => {
      if (tw) tw.position.x = xs[ti];
    });
    if (ring6.current) {
      ring6.current.rotation.z += d * 1.1;
      ring6.current.position.y = TOPS[4] - 0.55 + Math.sin(t * 1.4) * 0.07;
    }

    // маячки: пульс, вспышка при приземлении; включаются по мере прогресса
    lights.current.forEach((l, li) => {
      if (!l) return;
      s.flash[li] = Math.max(0, s.flash[li] - d * 2.2);
      const on = s.lvl >= li ? 1 : 0.35;
      const m = l.material as THREE.MeshBasicMaterial;
      m.color.lerpColors(
        new THREE.Color("#5c2447"),
        new THREE.Color(li === 4 ? "#ffffff" : NU_NEON),
        Math.min(1, on + s.flash[li])
      );
      l.scale.setScalar(1 + 0.15 * Math.sin(t * 3 + li) + s.flash[li] * 0.9);
    });

    // эстафета: запрыгивание с неба на 2G / вылет сальто за верхнюю кромку
    const hd = hand.current;
    const g = jumpG.current;
    if (hd.pendIn) {
      hd.pendIn = false;
      if (hd.mode === "hidden" || hd.mode === "exit") {
        hd.mode = "enter";
        hd.t0 = t;
        s.i = 0;
        s.lvl = 0;
        s.phase = "rest";
        s.spin = 0;
        s.spinCur = 0;
      }
    }
    if (hd.pendOut) {
      hd.pendOut = false;
      if (hd.mode === "live" || hd.mode === "enter") {
        hd.mode = "exit";
        hd.t0 = t;
        hd.x0 = g.position.x;
        hd.y0 = g.position.y;
      }
    }
    g.visible = hd.mode !== "hidden";

    let flare = 0;
    if (hd.mode === "enter") {
      // падает с неба на 2G с горящим следом; приземление ловит сквош машины
      const q = Math.min(1, (t - hd.t0) / 0.65);
      const landY = TOPS[0] + 0.06 + 1.45 * BODY_S;
      g.position.set(xs[0], lerp(landY + 5.4, landY, q * q), 0);
      flare = 1 - q * 0.35;
      bodyG.current.scale.set(BODY_S, BODY_S * (1 + 0.12 * (1 - q)), BODY_S);
      bodyG.current.rotation.z = 0;
      if (q >= 1) {
        hd.mode = "live";
        s.flash[0] = 1;
        s.phase = "rest";
        s.t0 = t;
      }
    } else if (hd.mode === "exit") {
      // взмывает с сальто и уходит из кадра — эстафету забрал гид
      const q = Math.min(1, (t - hd.t0) / 0.75);
      g.position.set(hd.x0 + q * 1.1, hd.y0 + 7 * q * q, 0);
      bodyG.current.rotation.z = q * Math.PI * 2;
      flare = 1;
      if (q >= 1) hd.mode = "hidden";
    } else if (hd.mode === "live") {
      // машина прыжков: rest → jump к следующей эпохе; с 6G — сальто назад к 2G
      const el = t - s.t0;
      let px = xs[s.i];
      let py = TOPS[s.i];
      let arc = 0;
      if (s.phase === "rest" && el > REST) {
        s.t0 = t;
        s.phase = s.i === 4 ? "back" : "jump";
        if (s.phase === "back") s.spin += Math.PI * 2;
      } else if (s.phase === "jump") {
        const p = Math.min(1, el / JUMP);
        const j = s.i + 1;
        px = lerp(xs[s.i], xs[j], p);
        py = lerp(TOPS[s.i], TOPS[j], p);
        arc = Math.sin(Math.PI * p) * 1.15;
        flare = Math.sin(Math.PI * Math.min(1, p * 1.4));
        if (p >= 1) {
          s.i = j;
          s.lvl = j;
          s.flash[j] = 1;
          if (j === 4) s.happy = 1.2;
          s.phase = "rest";
          s.t0 = t;
        }
      } else if (s.phase === "back") {
        const p = Math.min(1, el / BACK);
        px = lerp(xs[4], xs[0], p);
        py = lerp(TOPS[4], TOPS[0], p);
        arc = Math.sin(Math.PI * p) * 2.1;
        flare = Math.sin(Math.PI * p);
        if (p >= 1) {
          s.i = 0;
          s.lvl = 0;
          s.flash[0] = 1;
          s.phase = "rest";
          s.t0 = t;
        }
      }

      const idleBob = s.phase === "rest" ? Math.sin(t * 2.4) * 0.05 : 0;
      g.position.set(px, py + 0.06 + 1.45 * BODY_S + arc + idleBob, 0);

      // сквош-стретч: вытяжка в полёте, приседание на приземлении
      const elNow = t - s.t0;
      const impact = s.phase === "rest" && elNow < 0.16 ? 1 - elNow / 0.16 : 0;
      const sy = 1 + flare * 0.14 - impact * 0.16;
      const sx = 1 - flare * 0.07 + impact * 0.1;
      bodyG.current.scale.set(BODY_S * sx, BODY_S * sy, BODY_S * sx);
      bodyG.current.rotation.z = s.spinCur;
    }
    s.happy = Math.max(0, s.happy - d);

    // сальто докручивается и обнуляется
    s.spinCur = lerp(s.spinCur, s.spin, 1 - Math.pow(0.003, d));
    if (s.spin !== 0 && Math.abs(s.spin - s.spinCur) < 0.01) {
      s.spin = 0;
      s.spinCur = 0;
    }

    // глаза: моргание в покое, счастливый прищур на 6G и в сальто
    const period = 4.2;
    const phase = t % period;
    const blink =
      phase > period - 0.2
        ? 1 - 0.9 * Math.sin(((phase - (period - 0.2)) / 0.2) * Math.PI)
        : 1;
    const happyNow = s.happy > 0 || s.spin !== 0;
    const eyeSy = happyNow ? 0.26 : blink;
    const kf = 1 - Math.pow(0.0001, d);
    [eyeL.current, eyeR.current].forEach((e) => {
      e.scale.y = lerp(e.scale.y, eyeSy, kf);
      e.scale.x = lerp(e.scale.x, happyNow ? 1.15 : 1, kf);
    });

    // неон: след-луч, ореол и антенна — пульс как у гида, вспышки в полёте.
    // антенна читает эпоху: на 2G огонёк тусклый, кольца появляются с LTE
    const pulse = 0.5 + 0.5 * Math.sin(t * 6);
    const flick = 0.88 + 0.12 * Math.sin(t * 23.7);
    if (trail.current) {
      const w = 0.75 + flare * 0.5;
      trail.current.scale.set(w, 0.55 + flare * 1.15, w);
      (trail.current.material as THREE.MeshBasicMaterial).opacity =
        0.14 + 0.08 * pulse + flare * 0.6;
    }
    if (glow.current) {
      (glow.current.material as THREE.MeshBasicMaterial).opacity =
        (0.14 + 0.4 * pulse) * flick + flare * 0.3;
    }
    if (antDot.current) {
      const dim = s.lvl === 0 ? 0.72 : 1;
      antDot.current.scale.setScalar(
        (1 + 0.14 * Math.sin(t * 3.2) + flare * 0.3) * dim
      );
      const m = antDot.current.material as THREE.MeshBasicMaterial;
      if (s.lvl === 0) m.color.set("#a63d76");
      else
        m.color.lerpColors(
          new THREE.Color(NU_NEON),
          new THREE.Color("#ffffff"),
          (s.lvl - 1) / 3
        );
    }
    antRings.current.forEach((ring, ri) => {
      if (!ring) return;
      const target = s.lvl - 1 > ri ? 1 : 0;
      const ns = lerp(ring.scale.x, target, 1 - Math.pow(0.002, d));
      ring.scale.setScalar(Math.max(0.001, ns));
      (ring.material as THREE.MeshBasicMaterial).opacity = (0.75 - ri * 0.16) * ns;
    });
  });

  return (
    <>
      <group ref={world}>
        <points ref={starsA} geometry={starsGeoA}>
          <pointsMaterial size={0.055} color="#9FB0E8" transparent opacity={0.5} depthWrite={false} />
        </points>
        <points ref={starsB} geometry={starsGeoB}>
          <pointsMaterial size={0.04} color="#FF8CC0" transparent opacity={0.5} depthWrite={false} />
        </points>

        {/* пол мира — тонкая неоновая линия горизонта */}
        <mesh position={[0, FLOOR - 0.05, -0.4]}>
          <boxGeometry args={[60, 0.02, 0.02]} />
          <meshBasicMaterial color="#3a2a55" />
        </mesh>

        {TOPS.map((top, i) => (
          <group
            key={i}
            ref={(el) => {
              towersG.current[i] = el;
            }}
          >
            {i === 0 && <Pole2G top={top} />}
            {i === 1 && <Tower3G top={top} />}
            {i === 2 && <TowerLTE top={top} />}
            {i === 3 && <Tower5G top={top} />}
            {i === 4 && <Tower6G top={top} ring={ring6} />}
            {/* маячок на краю площадки: пульс эпохи и вспышка приземления */}
            <mesh
              position={[0.34, top + 0.13, 0]}
              ref={(el) => {
                lights.current[i] = el;
              }}
            >
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshBasicMaterial color={NU_NEON} />
            </mesh>
          </group>
        ))}

        {/* Призма-геймер: тот же конструктор тела, что у гида */}
        <group ref={jumpG}>
          <group ref={bodyG} scale={BODY_S}>
            <mesh
              geometry={bodyGeo}
              onClick={() => {
                st.current.spin += Math.PI * 2;
              }}
              onPointerOver={() => (document.body.style.cursor = "pointer")}
              onPointerOut={() => (document.body.style.cursor = "")}
            >
              <meshPhysicalMaterial
                vertexColors
                roughness={0.3}
                metalness={0}
                clearcoat={0.7}
                clearcoatRoughness={0.25}
                envMapIntensity={0.8}
                emissive="#99105C"
                emissiveIntensity={0.35}
              />
            </mesh>
            <mesh ref={glow} position={[0, 0, -0.65]} rotation-z={-0.2}>
              <planeGeometry args={[3.6, 4.8]} />
              <meshBasicMaterial map={glowTex} transparent opacity={0.3} depthWrite={false} />
            </mesh>
            <mesh ref={eyeL} position={[FACE_X - EYE_GAP, EYE_Y, EYE_Z]} scale={[1, 1, 0.35]}>
              <capsuleGeometry args={[0.1, 0.12, 8, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh ref={eyeR} position={[FACE_X + EYE_GAP, EYE_Y, EYE_Z]} scale={[1, 1, 0.35]}>
              <capsuleGeometry args={[0.1, 0.12, 8, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <group position={[SHEAR * 1.45, 1.42, 0]}>
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.026, 0.032, 0.46, 10]} />
                <meshStandardMaterial color="#16132E" metalness={0.55} roughness={0.35} />
              </mesh>
              <mesh ref={antDot} position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.068, 16, 16]} />
                <meshBasicMaterial color={NU_NEON} />
              </mesh>
              {[0, 1, 2].map((ri) => (
                <mesh
                  key={ri}
                  ref={(el) => {
                    antRings.current[ri] = el;
                  }}
                  position={[0, 0.5, 0]}
                  scale={0.001}
                >
                  <torusGeometry args={[0.15 + ri * 0.088, 0.02, 8, 28]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
                </mesh>
              ))}
            </group>
            <mesh ref={trail} position={[SHEAR * -1.5, -1.82, 0]} rotation-x={Math.PI}>
              <coneGeometry args={[0.3, 0.9, 16]} />
              <meshBasicMaterial color={NU_NEON} transparent opacity={0.2} depthWrite={false} />
            </mesh>
          </group>
        </group>
      </group>

      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={0.45} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={1.4} position={[0, 4, 3]} scale={[8, 4, 1]} />
        <Lightformer
          intensity={1.6}
          position={[2.6, 1.5, 4]}
          rotation-y={-0.4}
          scale={[0.6, 6, 1]}
          color={NU_NEON}
        />
      </Environment>
    </>
  );
}

export default function StripScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.55, 14.2], fov: 33 }}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: "pan-y" }}
    >
      <World />
    </Canvas>
  );
}
