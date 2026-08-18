"use client";

import { useEffect } from "react";

// Живая типографика хиро: буквы возле курсора приподнимаются и синеют.
// Прогрессивное улучшение — разметку и SEO не трогаем, текст остаётся текстом.
export default function HeroTypo() {
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const h1 = document.querySelector<HTMLElement>(".hero h1");
    if (!h1 || h1.dataset.typo) return;
    h1.dataset.typo = "1";

    // доступность: полный текст — в aria-label, буквы-спаны скрыты от AT
    h1.setAttribute("aria-label", h1.textContent ?? "");

    const letters: HTMLElement[] = [];
    const wrapText = (node: Node) => {
      const text = node.textContent ?? "";
      const frag = document.createDocumentFragment();
      let word: HTMLElement | null = null;
      for (const ch of text) {
        if (ch === " ") {
          frag.appendChild(document.createTextNode(" "));
          word = null;
          continue;
        }
        if (!word) {
          word = document.createElement("span");
          word.className = "ht-w";
          word.setAttribute("aria-hidden", "true");
          frag.appendChild(word);
        }
        const s = document.createElement("span");
        s.className = "ht-l";
        s.textContent = ch;
        word.appendChild(s);
        letters.push(s);
      }
      node.parentNode?.replaceChild(frag, node);
    };
    // обходим прямые текстовые узлы и текст внутри .l2, сохраняя структуру строк
    [...h1.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) wrapText(n);
      else if (n instanceof HTMLElement)
        [...n.childNodes].forEach((inner) => {
          if (inner.nodeType === Node.TEXT_NODE) wrapText(inner);
        });
    });

    let rects: { x: number; y: number }[] = [];
    const measure = () => {
      rects = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };
    measure();

    let raf = 0;
    let mx = -1e4;
    let my = -1e4;
    const paint = () => {
      raf = 0;
      for (let i = 0; i < letters.length; i++) {
        const dx = rects[i].x - mx;
        const dy = rects[i].y - my;
        const k = Math.max(0, 1 - Math.hypot(dx, dy) / 150);
        const l = letters[i];
        if (k > 0.01) {
          l.style.transform = `translateY(${-k * 9}px)`;
          l.style.color = k > 0.42 ? "var(--blue)" : "";
        } else if (l.style.transform) {
          l.style.transform = "";
          l.style.color = "";
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      if (window.scrollY > innerHeight) return; // хиро уехало — не считаем зря
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onScroll = () => {
      if (window.scrollY <= innerHeight) measure();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("ariya:loaded", measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("ariya:loaded", measure);
    };
  }, []);

  return null;
}
