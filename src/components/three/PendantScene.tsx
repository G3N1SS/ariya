"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import {
  makePrismaBody,
  SHEAR,
  EYE_Y,
  FACE_X,
  EYE_GAP,
  EYE_Z,
} from "./PrismaScene";

// Призма-хрусталь для кейса «Новый Ковчег»: подвеска люстры на золотой
// цепочке. Статичный пост — маятник, дыхание и моргание, никаких полётов
const NK_STOPS: [number, THREE.Color][] = [
  [0, new THREE.Color("#fdfbf5")],
  [0.5, new THREE.Color("#efe3c6")],
  [1, new THREE.Color("#b3925a")],
];
const GOLD = "#c8a96a";

function Pendant() {
  const pivot = useRef<THREE.Group>(null!);
  const eyeL = useRef<THREE.Mesh>(null!);
  const eyeR = useRef<THREE.Mesh>(null!);
  const geo = useMemo(() => makePrismaBody(NK_STOPS), []);

  useFrame((f) => {
    const t = f.clock.elapsedTime;
    // маятник вокруг точки подвеса + едва заметное дыхание
    pivot.current.rotation.z = Math.sin(t * 0.72) * 0.062;
    pivot.current.rotation.x = Math.sin(t * 0.53) * 0.02;
    const breathe = 1 + Math.sin(t * 1.1) * 0.008;
    pivot.current.scale.setScalar(breathe);

    // моргание в общем ритме маскотов сайта
    const period = 4.2;
    const phase = t % period;
    const blink =
      phase > period - 0.2
        ? 1 - 0.9 * Math.sin(((phase - (period - 0.2)) / 0.2) * Math.PI)
        : 1;
    [eyeL.current, eyeR.current].forEach((e) => {
      if (e) e.scale.set(1, blink, 0.35);
    });
  });

  // точка подвеса — вершина кристалла; всё тело свисает из неё
  const APEX = { x: SHEAR * 1.52, y: 1.52 };
  return (
    <group position={[0.55, 1.55, 0]}>
      <group ref={pivot}>
        {/* цепочка уходит вверх за кадр */}
        <mesh position={[0, 2.6, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 5.2, 8]} />
          <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.075, 0.02, 10, 24]} />
          <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.3} />
        </mesh>
        {/* тело висит вершиной к кольцу */}
        <group position={[-APEX.x, -APEX.y - 0.12, 0]}>
          <mesh geometry={geo}>
            <meshPhysicalMaterial
              vertexColors
              roughness={0.24}
              clearcoat={0.7}
              clearcoatRoughness={0.3}
              envMapIntensity={0.85}
              emissive="#403214"
              emissiveIntensity={0.12}
            />
          </mesh>
          {/* золотой колпачок на вершине */}
          <mesh position={[APEX.x, APEX.y + 0.02, 0]}>
            <coneGeometry args={[0.13, 0.18, 12]} />
            <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh ref={eyeL} position={[FACE_X - EYE_GAP, EYE_Y, EYE_Z]} scale={[1, 1, 0.35]}>
            <capsuleGeometry args={[0.1, 0.12, 8, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh ref={eyeR} position={[FACE_X + EYE_GAP, EYE_Y, EYE_Z]} scale={[1, 1, 0.35]}>
            <capsuleGeometry args={[0.1, 0.12, 8, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function PendantScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, -0.35, 9.6], fov: 30 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Pendant />
      {/* золотой зал: тёплый свет со всех сторон, шампань-блики на гранях */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={1.5} color="#fff2d8" position={[0, 3, 4]} scale={[6, 4, 1]} />
        <Lightformer intensity={0.9} color={GOLD} position={[-4, 0, 2]} scale={[3, 5, 1]} />
        <Lightformer intensity={0.7} color="#f3ede3" position={[4, -1, 2]} scale={[3, 5, 1]} />
        <Lightformer intensity={0.5} color={GOLD} position={[0, -4, 3]} scale={[6, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
