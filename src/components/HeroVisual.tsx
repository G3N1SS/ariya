"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Mark from "./Mark";
import { can3d } from "@/lib/capable";

const Scene = dynamic(() => import("./three/Scene"), { ssr: false });

export default function HeroVisual() {
  const [enable3d, setEnable3d] = useState(false);

  // 3D включается везде, где есть WebGL2 — мобильные получают
  // облегчённый профиль внутри самой сцены; статичный знак — фолбэк
  useEffect(() => {
    if (can3d()) setEnable3d(true);
  }, []);

  return (
    <div className="hero-visual" data-cursor aria-hidden="true">
      <Mark size={430} />
      {enable3d && <Scene />}
    </div>
  );
}
