"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PendantScene = dynamic(() => import("./three/PendantScene"), {
  ssr: false,
});

// Призма-подвеска в шапке кейса ковчега: только десктоп и только
// если пользователь не просил меньше движения
export default function CasePendant() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (innerWidth < 900) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const idle = window.setTimeout(() => setMounted(true), 250);
    return () => window.clearTimeout(idle);
  }, []);
  if (!mounted) return null;
  return (
    <div className="nk-pendant" aria-hidden="true">
      <PendantScene />
    </div>
  );
}
