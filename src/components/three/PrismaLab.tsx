"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PrismaScene = dynamic(() => import("./PrismaScene"), { ssr: false });

type Mode = "lab" | "lost" | "guide";

const EMOTIONS = ["idle", "happy", "surprised", "wink", "spin", "jump"] as const;
const SKINS = [
  { id: "candy", label: "градиент" },
  { id: "chrome", label: "хром" },
  { id: "nu", label: "новый уровень" },
] as const;
// антенна скина «нового уровня» — эпохи сетей из игры
const ERAS = ["3g", "lte", "5g", "6g"] as const;

export default function PrismaLab() {
  const [skin, setSkin] = useState<(typeof SKINS)[number]["id"]>("candy");
  const [era, setEra] = useState(0);
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
  const fireEra = (idx: number) => {
    setEra(idx);
    window.dispatchEvent(new CustomEvent("ariya:antenna", { detail: idx }));
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
        {skin === "nu" && (
          <div className="pl-row">
            {ERAS.map((e, i) => (
              <button
                key={e}
                type="button"
                className={era === i ? "on" : undefined}
                onClick={() => fireEra(i)}
              >
                {"// "}
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
