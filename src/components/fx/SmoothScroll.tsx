"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // во время прелоадера скролл заперт
    if (document.documentElement.classList.contains("is-loading")) {
      lenis.stop();
      window.addEventListener("ariya:loaded", () => lenis.start(), {
        once: true,
      });
    }

    // якорные ссылки — через lenis, с поправкой на фикс-шапку
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -72 });
    };
    document.addEventListener("click", onClick);

    // палитра и прочие оверлеи говорят со скроллом событиями
    const onScrollTo = (e: Event) => {
      const el = document.querySelector(String((e as CustomEvent).detail));
      if (el) lenis.scrollTo(el as HTMLElement, { offset: -72 });
    };
    const onLock = (e: Event) => {
      if ((e as CustomEvent).detail) lenis.stop();
      else if (!document.documentElement.classList.contains("is-loading"))
        lenis.start();
    };
    window.addEventListener("ariya:scrollto", onScrollTo);
    window.addEventListener("ariya:lock", onLock);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("ariya:scrollto", onScrollTo);
      window.removeEventListener("ariya:lock", onLock);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
