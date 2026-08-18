"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const Strip3D = dynamic(() => import("./three/StripScene"), { ssr: false });

export type CaseStripT = {
  cap: string;
  hint: string;
  eras: readonly string[];
};

// держать в синхроне с XS из three/StripScene (не импортим — там three-чанк)
const ERA_XS = [-0.38, -0.19, 0, 0.19, 0.38];

// идеи №3+№4 с доски: полноширинная 3D-лента мира игры, внутри которой
// Призма-геймер прыгает по вышкам эпох; параллакс на скролл, наклон за мышью
export default function CaseStrip({ t }: { t: CaseStripT }) {
  const [live, setLive] = useState(false);
  const host = useRef<HTMLElement>(null);

  // канвас поднимаем лениво — когда лента подъезжает к экрану
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (!window.WebGL2RenderingContext) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (en) => {
        if (en.some((e) => e.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: "50% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="case-strip" ref={host} aria-hidden="true">
      <span className="cs-cap">{t.cap}</span>
      <span className="cs-hint">{t.hint}</span>
      <div className="cs-canvas">{live && <Strip3D />}</div>
      <div className="cs-labels">
        {t.eras.map((e, i) => (
          // фракции ширины — синхронно с XS в StripScene: лейбл под вышкой
          <i key={e} style={{ left: `${(0.5 + ERA_XS[i]) * 100}%` }}>
            {e}
          </i>
        ))}
      </div>
    </section>
  );
}
