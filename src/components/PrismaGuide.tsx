"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { withHotkey } from "@/lib/hotkey";

const PrismaScene = dynamic(() => import("./three/PrismaScene"), {
  ssr: false,
});

type GuideT = {
  hello: string;
  services: string;
  work: string;
  process: string;
  contact: string;
  sent: string;
};

const BUBBLE_MS = 4600;

export default function PrismaGuide({ t }: { t: GuideT }) {
  const [mounted, setMounted] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const timer = useRef(0);
  const said = useRef(new Set<string>());

  // гид — десктопная роскошь: мобильным экранам угол нужнее
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || innerWidth < 900) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let idle = 0;
    const arrive = () => {
      idle = window.setTimeout(() => setMounted(true), 1600);
    };
    if (document.documentElement.classList.contains("is-loaded")) arrive();
    else window.addEventListener("ariya:loaded", arrive, { once: true });
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("ariya:loaded", arrive);
    };
  }, []);

  const say = (key: string, text: string, once = true) => {
    if (once && said.current.has(key)) return;
    said.current.add(key);
    setBubble(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBubble(null), BUBBLE_MS);
  };

  useEffect(() => {
    if (!mounted) return;
    const hello = window.setTimeout(() => say("hello", withHotkey(t.hello)), 900);

    // реплики по секциям — по одной на визит
    const sections: [string, string][] = [
      ["#services", t.services],
      ["#work", t.work],
      ["#process", t.process],
      ["#contact", t.contact],
    ];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const hit = sections.find(([sel]) => e.target.matches(sel));
          if (hit) say(hit[0], hit[1]);
        }
      },
      { threshold: 0.3 }
    );
    sections.forEach(([sel]) => {
      const el = document.querySelector(sel);
      if (el) io.observe(el);
    });

    // отправленная заявка — праздник
    const onSent = () => {
      window.dispatchEvent(
        new CustomEvent("ariya:emotion", { detail: "happy" })
      );
      say("sent", t.sent, false);
    };
    window.addEventListener("ariya:lead-sent", onSent);

    return () => {
      window.clearTimeout(hello);
      window.clearTimeout(timer.current);
      io.disconnect();
      window.removeEventListener("ariya:lead-sent", onSent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="pg-wrap" aria-hidden="true">
      {bubble && (
        <div className="pg-bubble" onClick={() => setBubble(null)}>
          <span className="t">{"// prisma"}</span>
          {bubble}
        </div>
      )}
      <div className="pg-canvas">
        <PrismaScene mode="guide" />
      </div>
    </div>
  );
}
