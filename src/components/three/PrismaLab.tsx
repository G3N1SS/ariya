"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PrismaScene = dynamic(() => import("./PrismaScene"), { ssr: false });

type Mode = "lab" | "lost" | "guide";

const EMOTIONS = ["idle", "happy", "surprised", "wink", "spin"] as const;
const SKINS = [
  { id: "candy", label: "градиент" },
  { id: "chrome", label: "хром" },
] as const;

export default function PrismaLab() {
  const [skin, setSkin] = useState<(typeof SKINS)[number]["id"]>("candy");
  // ?mode=lost|guide — превью других ипостасей Призмы прямо в лаборатории
  const [mode, setMode] = useState<Mode>("lab");
  useEffect(() => {
    const m = new URLSearchParams(location.search).get("mode");
    if (m === "lost" || m === "guide") setMode(m);
  }, []);

  const fireEmotion = (name: (typeof EMOTIONS)[number]) =>
    window.dispatchEvent(new CustomEvent("ariya:emotion", { detail: name }));
  const fireSkin = (id: (typeof SKINS)[number]["id"]) => {
    setSkin(id);
    window.dispatchEvent(new CustomEvent("ariya:skin", { detail: id }));
  };

  return (
    <main className="prisma-lab">
      <div className="pl-head">
        <a href="/">← на сайт</a>
        <span className="pl-tag">{"// prisma — r&d маскота"}</span>
        <span className="pl-hint">тыкни её · драг — повертеть · мышь — взгляд</span>
      </div>
      <PrismaScene mode={mode} key={mode} />
      <div className="pl-dock">
        <div className="pl-row">
          {SKINS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={skin === s.id ? "on" : undefined}
              onClick={() => fireSkin(s.id)}
            >
              {"// "}
              {s.label}
            </button>
          ))}
        </div>
        <div className="pl-row">
          {EMOTIONS.map((e) => (
            <button key={e} type="button" onClick={() => fireEmotion(e)}>
              {"// "}
              {e}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
