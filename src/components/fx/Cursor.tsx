"use client";

import { useEffect, useRef } from "react";

const clampMag = (n: number, lim = 7) => Math.max(-lim, Math.min(lim, n));

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const doc = document.documentElement;
    doc.classList.add("has-cursor");
    const dot = dotRef.current!;
    const ring = ringRef.current!;

    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let dx = x, dy = y, rx = x, ry = y;
    let seen = false;
    let magEl: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        seen = true;
        dx = rx = x;
        dy = ry = y;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest?.("a,button,[data-cursor]");
      ring.classList.toggle("is-slash", !!link);
      ring.classList.toggle(
        "on-dark",
        !!(link && (link as HTMLElement).classList.contains("btn-primary"))
      );
      dot.classList.toggle("is-hidden", !!link);

      const m = target.closest?.("[data-magnetic]") as HTMLElement | null;
      if (m !== magEl) {
        if (magEl) magEl.style.transform = "";
        magEl = m;
      }
    };

    let raf = 0;
    const loop = () => {
      dx += (x - dx) * 0.55;
      dy += (y - dy) * 0.55;
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      dot.style.transform = `translate(${dx}px, ${dy}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      if (magEl) {
        const r = magEl.getBoundingClientRect();
        const mx = clampMag((x - (r.left + r.width / 2)) * 0.18);
        const my = clampMag((y - (r.top + r.height / 2)) * 0.18);
        magEl.style.transform = `translate(${mx}px, ${my}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // морф под курсором должен переоцениваться и при скролле без движения мыши
    const applyHoverState = (target: Element | null) => {
      const link = target?.closest?.("a,button,[data-cursor]") ?? null;
      ring.classList.toggle("is-slash", !!link);
      ring.classList.toggle(
        "on-dark",
        !!(link && (link as HTMLElement).classList.contains("btn-primary"))
      );
      dot.classList.toggle("is-hidden", !!link);
    };
    let scrollRaf = 0;
    const onScroll = () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        if (!seen) return;
        applyHoverState(document.elementFromPoint(x, y));
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("scroll", onScroll);
      doc.classList.remove("has-cursor");
      if (magEl) magEl.style.transform = "";
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true">
        <i />
      </div>
    </>
  );
}
