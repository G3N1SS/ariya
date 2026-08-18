"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Чертёжная диагональ −22° через секцию процесса; синяя каретка-слэш
// едет по ней вместе со скроллом — прогресс пути.
export default function ProcessRail() {
  const caret = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 900) return;
    gsap.registerPlugin(ScrollTrigger);
    const tw = gsap.fromTo(
      caret.current,
      { top: "3%" },
      {
        top: "90%",
        ease: "none",
        scrollTrigger: {
          trigger: "#process",
          start: "top 65%",
          end: "bottom 45%",
          scrub: 0.4,
        },
      }
    );
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, []);

  return (
    <div className="proc-rail" aria-hidden="true">
      <i className="pr-line">
        <span className="pr-caret" ref={caret} />
      </i>
    </div>
  );
}
