"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { RoundedBoxGeometry } from "three-stdlib";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

const SHEAR = Math.tan((22 * Math.PI) / 180);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Emotion = "idle" | "happy" | "surprised" | "wink" | "jump";
type Skin = "candy" | "chrome" | "nu";

const EMO_TTL: Record<Emotion, number> = {
  idle: Infinity,
  happy: 1.4,
  surprised: 1.1,
  wink: 0.55,
  jump: 0.9,
};

// лицо сидит на наклонной грани: на высоте y центр тела смещён шером;
// плюс сдвиг по ходу наклона — взгляд «туда, куда показывает слэш» (как в эскизе)
const EYE_Y = 0.55;
const FACE_X = SHEAR * EYE_Y + 0.09;
const EYE_GAP = 0.17;
const EYE_Z = 0.415;

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
    return new THREE.CanvasTexture(c);
  }, []);
}

// градиент из утверждённого эскиза №12: светлый верх-лево → синий → глубокий низ-право
const GRAD_STOPS: [number, THREE.Color][] = [
  [0, new THREE.Color("#9CC2FF")],
  [0.5, new THREE.Color("#2A6BF7")],
  [1, new THREE.Color("#0B49CC")],
];

// скин кейса «Новый уровень»: палитра игры — неон-магента игрока на чёрном небе
const NU_STOPS: [number, THREE.Color][] = [
  [0, new THREE.Color("#FF8CC0")],
  [0.5, new THREE.Color("#F0187E")],
  [1, new THREE.Color("#7C0D49")],
];
const NU_NEON = "#FF2E92";

function ramp(stops: [number, THREE.Color][], t: number, out: THREE.Color) {
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i];
    if (t <= t1 || i === stops.length - 1) {
      const [t0, c0] = stops[i - 1];
      out.lerpColors(c0, c1, THREE.MathUtils.clamp((t - t0) / (t1 - t0), 0, 1));
      return out;
    }
  }
  return out.copy(stops[0][1]);
}

type Mode = "lab" | "lost" | "guide";

function Mascot({ mode }: { mode: Mode }) {
  const group = useRef<THREE.Group>(null!);
  const eyes = useRef<THREE.Group>(null!);
  const eyeL = useRef<THREE.Mesh>(null!);
  const eyeR = useRef<THREE.Mesh>(null!);
  const shadow = useRef<THREE.Mesh>(null!);
  const [skin, setSkin] = useState<Skin>("candy");
  // рефы скина «нового уровня»: пламя джетпака, огонёк и кольца антенны
  const skinRef = useRef<Skin>("candy");
  const flameL = useRef<THREE.Mesh>(null);
  const flameR = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Mesh>(null);
  const antDot = useRef<THREE.Mesh>(null);
  const antRings = useRef<(THREE.Mesh | null)[]>([]);
  const antLevel = useRef(0);
  const { camera, gl } = useThree();

  const st = useRef({
    mouse: { x: 0, y: 0 },
    drag: { x: 0, y: 0 },
    dragging: false,
    dragMoved: 0,
    lastX: 0,
    lastY: 0,
    emo: { name: "idle" as Emotion, ttl: Infinity },
    impulse: 0,
    spinTarget: 0,
    spinCur: 0,
    clicks: 0,
  });

  // тело Призмы — фирменный слэш; сегментов много, чтобы фаски были гладкими.
  // вершинный градиент — непрерывный по всему телу, без швов на гранях;
  // светлая зона накрывает верхнюю половину, глубокая — только низ.
  // у скинов свои палитры — геометрия печётся под каждую и выбирается по скину
  const makeBody = (stops: [number, THREE.Color][]) => {
    const g = new RoundedBoxGeometry(1.15, 2.9, 0.8, 10, 0.34);
    const m = new THREE.Matrix4();
    m.set(1, SHEAR, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    g.applyMatrix4(m);
    g.computeVertexNormals();
    const dir = new THREE.Vector3(0.42, -0.88, 0.18).normalize();
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3();
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const t = THREE.MathUtils.clamp(v.dot(dir) / 2.7 + 0.42, 0, 1);
      ramp(stops, t, c);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geo = useMemo(() => makeBody(GRAD_STOPS), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geoNu = useMemo(() => makeBody(NU_STOPS), []);
  // корпус джетпака — скруглённый ранец на спине, скошен как тело
  const jetGeo = useMemo(() => {
    const g = new RoundedBoxGeometry(0.58, 0.78, 0.26, 4, 0.09);
    const m = new THREE.Matrix4();
    m.set(1, SHEAR, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    g.applyMatrix4(m);
    g.computeVertexNormals();
    return g;
  }, []);

  const shadowTex = useShadowTexture();

  const setEmotion = (name: Emotion) => {
    const s = st.current;
    s.emo = { name, ttl: EMO_TTL[name] };
    if (name === "happy" || name === "surprised") s.impulse = 1;
  };

  const react = () => {
    const s = st.current;
    // в скине игры клик — всегда прыжок «как в игре», с пламенем джетпака
    if (skinRef.current === "nu") {
      setEmotion("jump");
      return;
    }
    const turn = s.clicks++ % 3;
    if (turn === 0) setEmotion("happy");
    else if (turn === 1) s.spinTarget += Math.PI * 2;
    else setEmotion("wink");
  };

  useEffect(() => {
    const s = st.current;
    const onMove = (e: PointerEvent) => {
      s.mouse.x = (e.clientX / innerWidth) * 2 - 1;
      s.mouse.y = (e.clientY / innerHeight) * 2 - 1;
      if (s.dragging) {
        s.dragMoved += Math.abs(e.clientX - s.lastX) + Math.abs(e.clientY - s.lastY);
        s.drag.y = THREE.MathUtils.clamp(
          s.drag.y + (e.clientX - s.lastX) * 0.006,
          -1.2,
          1.2
        );
        s.drag.x = THREE.MathUtils.clamp(
          s.drag.x + (e.clientY - s.lastY) * 0.005,
          -0.8,
          0.8
        );
        s.lastX = e.clientX;
        s.lastY = e.clientY;
      }
    };
    const onDown = (e: PointerEvent) => {
      // в роли гида Призма живёт в углу страницы — глобальный драг ей не принадлежит
      if (mode === "guide") return;
      s.dragging = true;
      s.dragMoved = 0;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
    };
    const onUp = () => (s.dragging = false);

    // панель лаборатории говорит с Призмой событиями
    const onEmotion = (e: Event) => {
      const name = (e as CustomEvent).detail as Emotion | "spin";
      if (name === "spin") st.current.spinTarget += Math.PI * 2;
      else setEmotion(name);
    };
    const onSkin = (e: Event) => {
      const name = (e as CustomEvent).detail as Skin;
      if (name === "candy" || name === "chrome" || name === "nu") {
        skinRef.current = name;
        setSkin(name);
      }
    };
    // антенна скина «нового уровня» апгрейдится по эпохам: 0=3G … 3=6G
    const onAntenna = (e: Event) => {
      const lvl = Number((e as CustomEvent).detail);
      if (lvl >= 0 && lvl <= 3) antLevel.current = lvl;
    };

    // гид живёт в канвасе без pointer-events (клики проходят на страницу) —
    // попадание по телу ловим сами рейкастом из глобального клика
    const onGuideClick = (e: MouseEvent) => {
      if (mode !== "guide") return;
      const r = gl.domElement.getBoundingClientRect();
      if (
        e.clientX < r.left || e.clientX > r.right ||
        e.clientY < r.top || e.clientY > r.bottom
      )
        return;
      const ndc = new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1)
      );
      const rc = new THREE.Raycaster();
      rc.setFromCamera(ndc, camera);
      if (rc.intersectObject(group.current, true).length) react();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("click", onGuideClick);
    window.addEventListener("ariya:emotion", onEmotion);
    window.addEventListener("ariya:skin", onSkin);
    window.addEventListener("ariya:antenna", onAntenna);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("click", onGuideClick);
      window.removeEventListener("ariya:emotion", onEmotion);
      window.removeEventListener("ariya:skin", onSkin);
      window.removeEventListener("ariya:antenna", onAntenna);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useFrame((f, dt) => {
    const t = f.clock.elapsedTime;
    const d = Math.min(dt, 0.05);
    const s = st.current;
    const k = 1 - Math.pow(0.001, d);
    const lost = mode === "lost";

    // таймер эмоции
    if (s.emo.ttl !== Infinity) {
      s.emo.ttl -= d;
      if (s.emo.ttl <= 0) s.emo = { name: "idle", ttl: Infinity };
    }
    const emo = s.emo.name;
    s.impulse *= Math.pow(0.03, d);

    if (!s.dragging) {
      const back = 1 - Math.pow(0.02, d);
      s.drag.x = lerp(s.drag.x, 0, back);
      s.drag.y = lerp(s.drag.y, 0, back);
    }

    // кувырок: докручиваем и обнуляем накопленное
    s.spinCur = lerp(s.spinCur, s.spinTarget, 1 - Math.pow(0.003, d));
    if (Math.abs(s.spinTarget - s.spinCur) < 0.01 && s.spinTarget !== 0) {
      s.spinTarget = 0;
      s.spinCur = 0;
    }

    const g = group.current;
    const guide = mode === "guide";
    // прыжок «как в игре»: параболический подлёт, пламя вспыхивает на разгоне
    let jumpY = 0;
    let flare = 0;
    if (emo === "jump") {
      const p = 1 - s.emo.ttl / EMO_TTL.jump;
      jumpY = Math.sin(Math.PI * p) * 0.62;
      flare = Math.sin(Math.PI * Math.min(1, p * 1.5));
    }
    const floatY =
      Math.sin(t * 0.9) * (guide ? 0.09 : 0.14) +
      (emo === "happy" ? s.impulse * 0.3 : 0) +
      jumpY;
    g.position.y = lerp(g.position.y, floatY, k);
    g.position.z = lerp(
      g.position.z,
      emo === "surprised" ? -s.impulse * 0.5 : 0,
      k
    );

    g.rotation.x = lerp(
      g.rotation.x,
      -s.mouse.y * 0.1 +
        s.drag.x +
        Math.sin(t * 0.5) * 0.02 +
        (emo === "surprised" ? -s.impulse * 0.16 : 0),
      k
    );
    g.rotation.y = lerp(
      g.rotation.y,
      s.mouse.x * (lost ? 0.06 : guide ? 0.22 : 0.16) +
        s.drag.y +
        (lost ? Math.sin(t * 0.45) * 0.16 : 0),
      k
    );
    g.rotation.z = lerp(
      g.rotation.z,
      Math.sin(t * 0.4) * 0.02 +
        (lost ? Math.sin(t * 0.27) * 0.05 : 0) +
        (emo === "happy" ? Math.sin(t * 16) * 0.045 * s.impulse : 0) +
        s.spinCur,
      k
    );

    // сквош-стретч: дыхание + подскок в счастье + вытяжка в удивлении
    const breath = 1 + Math.sin(t * 1.3) * 0.008;
    let sy = breath;
    let sxz = 1;
    if (emo === "happy") {
      sy = breath + s.impulse * 0.1;
      sxz = 1 - s.impulse * 0.06;
    } else if (emo === "surprised") {
      sy = breath + s.impulse * 0.07;
      sxz = 1 - s.impulse * 0.04;
    } else if (emo === "jump") {
      // стретч на взлёте, сквош к приземлению
      sy = breath + flare * 0.09;
      sxz = 1 - flare * 0.05;
    }
    // в гиде размер — жёсткая доля кадра: тело = половина высоты бокса,
    // какой бы ни была камера; кувырок с наклоном занимают максимум ~55% —
    // до краёв канваса ей не дотянуться в принципе
    const guideK = guide ? (f.viewport.height * 0.5) / 2.9 : 1;
    g.scale.x = lerp(g.scale.x, sxz * guideK, k);
    g.scale.z = lerp(g.scale.z, sxz * guideK, k);
    g.scale.y = lerp(g.scale.y, sy * guideK, k);

    // взгляд: в лаборатории — за курсором, в 404 — сканирует по сторонам
    eyes.current.position.x = lerp(
      eyes.current.position.x,
      lost ? Math.sin(t * 0.6) * 0.1 + s.mouse.x * 0.03 : s.mouse.x * 0.07,
      k
    );
    eyes.current.position.y = lerp(
      eyes.current.position.y,
      lost ? Math.sin(t * 0.9 + 1) * 0.03 - s.mouse.y * 0.02 : -s.mouse.y * 0.05,
      k
    );

    // глаза: спокойные белые щёлки; моргание — только в покое
    const period = lost ? 3.1 : 4.2;
    const phase = t % period;
    const b0 = period - 0.2;
    const blink =
      emo === "idle" && phase > b0
        ? 1 - 0.9 * Math.sin(((phase - b0) / 0.2) * Math.PI)
        : 1;

    let syL = blink,
      syR = blink,
      sx = 1,
      eyeLift = 0;
    if (emo === "happy" || emo === "jump") {
      syL = syR = 0.26;
      sx = 1.15;
      eyeLift = 0.06;
    } else if (emo === "surprised") {
      syL = syR = 1.3;
      sx = 1.15;
    } else if (emo === "wink") {
      syL = 0.08;
      syR = 1;
    }

    const kf = 1 - Math.pow(0.0001, d); // мимика быстрее тела
    eyeL.current.scale.y = lerp(eyeL.current.scale.y, syL, kf);
    eyeR.current.scale.y = lerp(eyeR.current.scale.y, syR, kf);
    eyeL.current.scale.x = lerp(eyeL.current.scale.x, sx, kf);
    eyeR.current.scale.x = lerp(eyeR.current.scale.x, sx, kf);
    eyeL.current.position.y = lerp(eyeL.current.position.y, EYE_Y + eyeLift, kf);
    eyeR.current.position.y = lerp(eyeR.current.position.y, EYE_Y + eyeLift, kf);

    // мягкая тень дышит противофазой к высоте (в гиде тени нет — парит в углу)
    if (!guide && shadow.current) {
      const sc = 1.9 - floatY * 0.55;
      shadow.current.scale.set(sc, sc * 0.42, 1);
      (shadow.current.material as THREE.MeshBasicMaterial).opacity =
        0.3 - floatY * 0.35;
    }

    // ── скин «нового уровня»: живой джетпак и антенна эпох ──
    if (skinRef.current === "nu") {
      // пламя мерцает в покое и раздувается в прыжке
      [flameL.current, flameR.current].forEach((fl, fi) => {
        if (!fl) return;
        const flick = 0.7 + 0.3 * Math.sin(t * 24 + fi * 2.4);
        fl.scale.y = flick * (0.65 + flare * 1.7);
        const w = 0.85 + flare * 0.45;
        fl.scale.x = w;
        fl.scale.z = w;
        (fl.material as THREE.MeshBasicMaterial).opacity =
          0.55 + 0.25 * flick + flare * 0.2;
      });
      // неоновый след под телом — луч игрока из игры: тлеет, в прыжке бьёт
      if (trail.current) {
        const tr = 0.5 + 0.5 * Math.sin(t * 18);
        const w = 0.75 + flare * 0.5;
        trail.current.scale.set(w, 0.55 + flare * 1.1 + tr * 0.07, w);
        (trail.current.material as THREE.MeshBasicMaterial).opacity =
          0.16 + tr * 0.07 + flare * 0.55;
      }
      // огонёк пульсирует и белеет к 6G, кольца сигнала растут по уровню
      const lvl = antLevel.current;
      if (antDot.current) {
        const pulse = 1 + 0.14 * Math.sin(t * 3.2) + flare * 0.35;
        antDot.current.scale.setScalar(pulse);
        (antDot.current.material as THREE.MeshBasicMaterial).color.lerpColors(
          new THREE.Color(NU_NEON),
          new THREE.Color("#ffffff"),
          lvl / 3
        );
      }
      antRings.current.forEach((ring, ri) => {
        if (!ring) return;
        const target = lvl > ri ? 1 : 0;
        const ns = lerp(ring.scale.x, target, 1 - Math.pow(0.002, d));
        ring.scale.setScalar(Math.max(0.001, ns));
        (ring.material as THREE.MeshBasicMaterial).opacity =
          (0.75 - ri * 0.16) * ns;
      });
    }
  });

  return (
    <>
      <group
        ref={group}
        onClick={() => {
          // клик — реакция; но не после активного драга
          if (st.current.dragMoved < 8) react();
        }}
        onPointerOver={() => {
          // на сайте свой курсор — родной pointer нужен только в лаборатории
          if (mode !== "guide") document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          if (mode !== "guide") document.body.style.cursor = "";
        }}
      >
        <mesh geometry={skin === "nu" ? geoNu : geo}>
          {/* key: скины требуют разных шейдеров — материал пересоздаём, не мутируем */}
          {skin === "candy" ? (
            <meshPhysicalMaterial
              key="skin-candy"
              vertexColors
              roughness={0.3}
              metalness={0}
              clearcoat={0.65}
              clearcoatRoughness={0.28}
              envMapIntensity={0.75}
            />
          ) : skin === "nu" ? (
            <meshPhysicalMaterial
              key="skin-nu"
              vertexColors
              roughness={0.3}
              metalness={0}
              clearcoat={0.7}
              clearcoatRoughness={0.25}
              envMapIntensity={0.8}
              emissive="#99105C"
              emissiveIntensity={0.35}
            />
          ) : (
            <meshPhysicalMaterial
              key="skin-chrome"
              color="#F2F5FB"
              metalness={1}
              roughness={0.16}
              clearcoat={0.4}
              clearcoatRoughness={0.2}
              envMapIntensity={1.1}
            />
          )}
        </mesh>
        {/* глаза из эскиза №12: белые щёлки на наклонной грани, вплотную к телу */}
        <group ref={eyes}>
          <mesh
            ref={eyeL}
            position={[FACE_X - EYE_GAP, EYE_Y, EYE_Z]}
            scale={[1, 1, 0.35]}
          >
            <capsuleGeometry args={[0.1, 0.12, 8, 16]} />
            {/* самосветящиеся, не зависят от света; на хроме — чернильные, для контраста */}
            <meshBasicMaterial color={skin === "chrome" ? "#0D1033" : "#ffffff"} />
          </mesh>
          <mesh
            ref={eyeR}
            position={[FACE_X + EYE_GAP, EYE_Y, EYE_Z]}
            scale={[1, 1, 0.35]}
          >
            <capsuleGeometry args={[0.1, 0.12, 8, 16]} />
            <meshBasicMaterial color={skin === "chrome" ? "#0D1033" : "#ffffff"} />
          </mesh>
        </group>

        {/* экипировка «нового уровня»: космо-джетпак и антенна эпох из игры */}
        {skin === "nu" && (
          <group>
            <group position={[0, 0.02, -0.47]}>
              <mesh geometry={jetGeo}>
                <meshStandardMaterial color="#191536" metalness={0.5} roughness={0.38} />
              </mesh>
              <mesh position={[-0.16, -0.48, 0]}>
                <cylinderGeometry args={[0.085, 0.105, 0.16, 16]} />
                <meshStandardMaterial color="#0D1033" metalness={0.6} roughness={0.3} />
              </mesh>
              <mesh position={[0.16, -0.48, 0]}>
                <cylinderGeometry args={[0.085, 0.105, 0.16, 16]} />
                <meshStandardMaterial color="#0D1033" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* пламя — плоский неон, как след игрока в игре */}
              <mesh ref={flameL} position={[-0.16, -0.78, 0]} rotation-x={Math.PI}>
                <coneGeometry args={[0.095, 0.42, 12]} />
                <meshBasicMaterial color={NU_NEON} transparent opacity={0.8} depthWrite={false} />
              </mesh>
              <mesh ref={flameR} position={[0.16, -0.78, 0]} rotation-x={Math.PI}>
                <coneGeometry args={[0.095, 0.42, 12]} />
                <meshBasicMaterial color={NU_NEON} transparent opacity={0.8} depthWrite={false} />
              </mesh>
            </group>
            {/* реактивный след — неоновый луч под телом, видим с фронта */}
            <mesh ref={trail} position={[SHEAR * -1.5, -1.82, 0]} rotation-x={Math.PI}>
              <coneGeometry args={[0.3, 0.9, 16]} />
              <meshBasicMaterial color={NU_NEON} transparent opacity={0.25} depthWrite={false} />
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
          </group>
        )}
      </group>

      <mesh
        ref={shadow}
        rotation-x={-Math.PI / 2}
        position={[0, -1.95, 0]}
        visible={mode !== "guide"}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={shadowTex}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={0.4} />
      {/* key: окружение печётся один раз, при смене скина пересобираем */}
      <Environment key={skin} resolution={256} frames={1}>
        {skin === "candy" || skin === "nu" ? (
          <>
            {/* большие мягкие панели: ровный шёлковый глянец без резких «рамок» */}
            <Lightformer
              intensity={1.6}
              position={[-3.5, 2, 3]}
              rotation-y={0.5}
              scale={[2.4, 6, 1]}
            />
            <Lightformer intensity={1.5} position={[0, 4, 3]} scale={[8, 4, 1]} />
            <Lightformer
              intensity={0.9}
              position={[4, -0.5, 3]}
              rotation-y={-0.7}
              scale={[4, 5, 1]}
              color="#dfe8ff"
            />
            {/* неон-подсветка магентой — только для скина игры */}
            {skin === "nu" && (
              <Lightformer
                intensity={1.8}
                position={[2.6, 1.5, 4]}
                rotation-y={-0.4}
                scale={[0.6, 6, 1]}
                color={NU_NEON}
              />
            )}
          </>
        ) : (
          <>
            {/* хрому — светлый купол с тонкими тёмными зазорами и синей фирменной полосой */}
            {/* большая панель за камерой: плоская грань-зеркало отражает её, а не черноту */}
            <Lightformer intensity={0.85} position={[0, 0.5, 9]} scale={[12, 12, 1]} />
            <Lightformer intensity={1.1} position={[0, 4, 2]} scale={[9, 5, 1]} />
            <Lightformer
              intensity={0.9}
              position={[-4, 0.5, 3]}
              rotation-y={0.6}
              scale={[5, 7, 1]}
            />
            <Lightformer
              intensity={0.7}
              position={[4, -0.5, 3]}
              rotation-y={-0.6}
              scale={[5, 7, 1]}
              color="#dfe8ff"
            />
            <Lightformer
              intensity={0.5}
              position={[0, -4, 2]}
              scale={[9, 3, 1]}
              color="#cfd8ea"
            />
            <Lightformer
              intensity={2.4}
              position={[-1.2, 2.5, 4]}
              rotation-y={0.2}
              scale={[0.5, 6, 1]}
              color="#0C5EFF"
            />
            {/* горизонт и тыл: узкие тёмные зазоры вместо сплошного чёрного канта */}
            <Lightformer
              intensity={0.6}
              position={[-9, 0, 0]}
              rotation-y={Math.PI / 2}
              scale={[10, 10, 1]}
            />
            <Lightformer
              intensity={0.6}
              position={[9, 0, 0]}
              rotation-y={-Math.PI / 2}
              scale={[10, 10, 1]}
            />
            <Lightformer intensity={0.4} position={[0, 0, -9]} scale={[12, 12, 1]} />
          </>
        )}
      </Environment>
    </>
  );
}

export default function PrismaScene({ mode = "lab" }: { mode?: Mode }) {
  const guide = mode === "guide";
  return (
    <div className="prisma-canvas">
      <Canvas
        dpr={guide ? [1, 1.5] : [1, 2]}
        camera={
          guide
            ? { position: [0, 0, 11], fov: 27 }
            : { position: [0, -0.1, 8.2], fov: 33 }
        }
        gl={{ alpha: true, antialias: true }}
      >
        <Mascot mode={mode} />
      </Canvas>
    </div>
  );
}
