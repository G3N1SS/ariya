"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Reveals() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    if (!els.length) return;

    gsap.set(els, { opacity: 0, y: 26 });
    ScrollTrigger.batch(els, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          overwrite: true,
        }),
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("ariya:loaded", refresh, { once: true });

    return () => {
      window.removeEventListener("ariya:loaded", refresh);
      ScrollTrigger.getAll().forEach((s) => s.kill());
    };
  }, []);

  return null;
}
