"use client";

import { useEffect, useRef, useState } from "react";

export type CaseDecorT = {
  vign1: string;
  vign2: string;
};

// Декорации в полях страницы кейса: спят полупрозрачными и оживают,
// когда своя секция въезжает в экран. Без маскота и без скролл-джека.
export default function CaseDecor({ t }: { t: CaseDecorT }) {
  const [tops, setTops] = useState<{ v1: number; v2: number } | null>(null);
  const v1 = useRef<HTMLDivElement>(null);
  const v2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerWidth < 1160) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const place = () => {
      const task = document.querySelector<HTMLElement>('[data-sec="task"]');
      const flow = document.querySelector<HTMLElement>('[data-sec="flow"]');
      if (task && flow) setTops({ v1: task.offsetTop, v2: flow.offsetTop });
    };
    place();
    addEventListener("resize", place);
    addEventListener("load", place);
    const settle = window.setTimeout(place, 1200);
    return () => {
      removeEventListener("resize", place);
      removeEventListener("load", place);
      clearTimeout(settle);
    };
  }, []);

  useEffect(() => {
    if (!tops) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("alive");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "-18% 0px -18% 0px" }
    );
    [v1.current, v2.current].forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [tops]);

  if (!tops) return null;

  return (
    <>
      <div className="cd-vign" ref={v1} style={{ top: tops.v1 }} aria-hidden="true">
        <svg viewBox="0 0 150 112">
          <rect className="vp1" x="6" y="84" width="44" height="10" rx="3" />
          <rect className="vp2" x="98" y="72" width="46" height="22" rx="3" />
          <circle className="vsig" cx="28" cy="70" r="9" />
          <circle className="vsig2" cx="28" cy="70" r="15" />
          <path className="varc" d="M48 62 Q 76 30 100 54" />
          <path className="varr" d="M95 46 l8 8 -12 3 z" />
          <line className="vmast" x1="121" y1="72" x2="121" y2="34" />
          <line className="vbar" x1="109" y1="44" x2="133" y2="44" />
          <circle className="vtop" cx="121" cy="30" r="4" />
        </svg>
        <span>{t.vign1}</span>
      </div>
      <div className="cd-vign" ref={v2} style={{ top: tops.v2 }} aria-hidden="true">
        <svg viewBox="0 0 150 112">
          {[0, 1, 2, 3].map((i) => (
            <g key={i} className={`vf vf${i}`}>
              <line
                className="vmast"
                x1={22 + i * 34}
                y1={94}
                x2={22 + i * 34}
                y2={92 - 26 - i * 8}
              />
              <path className="vflag" d={`M${22 + i * 34} ${66 - i * 8} l20 6 -20 6 z`} />
            </g>
          ))}
          <line className="vbase" x1="8" y1="95" x2="142" y2="95" />
        </svg>
        <span>{t.vign2}</span>
      </div>
    </>
  );
}
