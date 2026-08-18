"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
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

// раскладка мира ленты: 4 вышки эпох по фракциям ширины, высота растёт к 6G
const XS = [-0.345, -0.115, 0.115, 0.345];
const TOPS = [-0.95, -0.35, 0.3, 1.05];
const FLOOR = -2.4;
const BODY_S = 0.62;
const REST = 0.6;
const JUMP = 0.8;
const BACK = 1.2;

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
  const masts = useRef<(THREE.Mesh | null)[]>([]);
  const pads = useRef<(THREE.Mesh | null)[]>([]);
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
    flash: [0, 0, 0, 0],
    lvl: 0,
    mouse: { x: 0, y: 0 },
    d: 0,
  });

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

    // наклон мира за курсором + вертикальный параллакс слоёв
    world.current.rotation.x = lerp(world.current.rotation.x, -s.mouse.y * 0.05, k);
    world.current.rotation.y = lerp(world.current.rotation.y, s.mouse.x * 0.07, k);
    world.current.position.y = lerp(world.current.position.y, s.d * 0.7, k);
    starsA.current.position.y = s.d * 1.3;
    starsB.current.position.y = s.d * 1.9;
    (starsA.current.material as THREE.PointsMaterial).opacity =
      0.35 + 0.3 * Math.sin(t * 1.6);
    (starsB.current.material as THREE.PointsMaterial).opacity =
      0.35 + 0.3 * Math.sin(t * 1.6 + Math.PI);

    // вышки держат строй по текущей ширине вьюпорта
    masts.current.forEach((m, mi) => {
      if (m) m.position.x = xs[mi];
    });
    pads.current.forEach((pd, pi) => {
      if (pd) pd.position.x = xs[pi];
    });
    // огоньки вышек: пульс + вспышка при приземлении
    lights.current.forEach((l, li) => {
      if (!l) return;
      s.flash[li] = Math.max(0, s.flash[li] - d * 2.2);
      const on = s.lvl >= li ? 1 : 0.35;
      const m = l.material as THREE.MeshBasicMaterial;
      m.color.lerpColors(
        new THREE.Color("#5c2447"),
        new THREE.Color(li === 3 ? "#ffffff" : NU_NEON),
        Math.min(1, on + s.flash[li])
      );
      const ls = 1 + 0.15 * Math.sin(t * 3 + li) + s.flash[li] * 0.9;
      l.scale.setScalar(ls);
      // маячок сидит на краю площадки, чтобы не втыкаться в приземлившегося
      l.position.x = xs[li] + 0.34;
    });

    // машина прыжков: rest → jump к следующей вышке; с 6G — сальто назад к 3G
    const el = t - s.t0;
    let px = xs[s.i];
    let py = TOPS[s.i];
    let arc = 0;
    let p = 0;
    let flare = 0;
    if (s.phase === "rest" && el > REST) {
      s.t0 = t;
      s.phase = s.i === 3 ? "back" : "jump";
      if (s.phase === "back") s.spin += Math.PI * 2;
    } else if (s.phase === "jump") {
      p = Math.min(1, el / JUMP);
      const j = s.i + 1;
      px = lerp(xs[s.i], xs[j], p);
      py = lerp(TOPS[s.i], TOPS[j], p);
      arc = Math.sin(Math.PI * p) * 1.5;
      flare = Math.sin(Math.PI * Math.min(1, p * 1.4));
      if (p >= 1) {
        s.i = j;
        s.lvl = j;
        s.flash[j] = 1;
        if (j === 3) s.happy = 1.2;
        s.phase = "rest";
        s.t0 = t;
      }
    } else if (s.phase === "back") {
      p = Math.min(1, el / BACK);
      px = lerp(xs[3], xs[0], p);
      py = lerp(TOPS[3], TOPS[0], p);
      arc = Math.sin(Math.PI * p) * 2.7;
      flare = Math.sin(Math.PI * p);
      if (p >= 1) {
        s.i = 0;
        s.lvl = 0;
        s.flash[0] = 1;
        s.phase = "rest";
        s.t0 = t;
      }
    }
    s.happy = Math.max(0, s.happy - d);

    // сальто докручивается и обнуляется
    s.spinCur = lerp(s.spinCur, s.spin, 1 - Math.pow(0.003, d));
    if (s.spin !== 0 && Math.abs(s.spin - s.spinCur) < 0.01) {
      s.spin = 0;
      s.spinCur = 0;
    }

    const g = jumpG.current;
    const idleBob = s.phase === "rest" ? Math.sin(t * 2.4) * 0.05 : 0;
    g.position.set(px, py + 0.06 + 1.45 * BODY_S + arc + idleBob, 0);

    // сквош-стретч: вытяжка в полёте, приседание на приземлении
    const impact = s.phase === "rest" && el < 0.16 ? 1 - el / 0.16 : 0;
    const sy = 1 + flare * 0.14 - impact * 0.16;
    const sx = 1 - flare * 0.07 + impact * 0.1;
    bodyG.current.scale.set(BODY_S * sx, BODY_S * sy, BODY_S * sx);
    bodyG.current.rotation.z = s.spinCur;

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

    // неон: след-луч, ореол и антенна — пульс как у гида, вспышки в полёте
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
      antDot.current.scale.setScalar(1 + 0.14 * Math.sin(t * 3.2) + flare * 0.3);
      (antDot.current.material as THREE.MeshBasicMaterial).color.lerpColors(
        new THREE.Color(NU_NEON),
        new THREE.Color("#ffffff"),
        s.lvl / 3
      );
    }
    antRings.current.forEach((ring, ri) => {
      if (!ring) return;
      const target = s.lvl > ri ? 1 : 0;
      const ns = lerp(ring.scale.x, target, 1 - Math.pow(0.002, d));
      ring.scale.setScalar(Math.max(0.001, ns));
      (ring.material as THREE.MeshBasicMaterial).opacity = (0.75 - ri * 0.16) * ns;
    });
  });

  const towers = XS.map((fr, i) => ({ top: TOPS[i], i }));

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

        {towers.map(({ top, i }) => (
          <group key={i}>
            {/* мачта и площадка — тёмная сталь мира игры; x расставляет useFrame */}
            <mesh
              position={[0, (top + FLOOR) / 2, 0]}
              ref={(el) => {
                masts.current[i] = el;
              }}
            >
              <cylinderGeometry args={[0.05, 0.075, top - FLOOR, 10]} />
              <meshStandardMaterial color="#211d4d" metalness={0.55} roughness={0.4} />
            </mesh>
            <mesh
              position={[0, top, 0]}
              ref={(el) => {
                pads.current[i] = el;
              }}
            >
              <boxGeometry args={[0.66, 0.09, 0.48]} />
              <meshStandardMaterial color="#2c2761" metalness={0.5} roughness={0.35} />
            </mesh>
            <mesh
              position={[0, top + 0.13, 0]}
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
      camera={{ position: [0, 0.3, 10], fov: 33 }}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: "pan-y" }}
    >
      <World />
    </Canvas>
  );
}
