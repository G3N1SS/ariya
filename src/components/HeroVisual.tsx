"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Mark from "./Mark";
import { can3d, isCoarse } from "@/lib/capable";

const Scene = dynamic(() => import("./three/Scene"), { ssr: false });

export default function HeroVisual() {
  const [enable3d, setEnable3d] = useState(false);

  // 3D включается везде, где есть WebGL2; на десктопе — сразу (лоадер ждёт
  // сцену), на таче — после загрузки в idle: телефон сначала показывает
  // страницу со статичным знаком, 3D бесшовно подменяет его чуть позже
  useEffect(() => {
    if (!can3d()) return;
    if (!isCoarse()) {
      setEnable3d(true);
      return;
    }
    let idle = 0;
    const arm = () => {
      const ric =
        window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 700));
      idle = ric(() => setEnable3d(true)) as unknown as number;
    };
    if (document.documentElement.classList.contains("is-loaded")) arm();
    else window.addEventListener("ariya:loaded", arm, { once: true });
    return () => {
      window.removeEventListener("ariya:loaded", arm);
      window.cancelIdleCallback?.(idle);
    };
  }, []);

  return (
    <div className="hero-visual" data-cursor aria-hidden="true">
      <Mark size={430} />
      {enable3d && <Scene />}
    </div>
  );
}
