"use client";

import { useEffect, useRef, useState } from "react";

// Микродемо в карточках услуг: услуга не описана — она работает.

type TgT = {
  title: string;
  hello: string;
  btnCatalog: string;
  btnPay: string;
  catalogReply: string;
  payReply: string;
  paid: string;
  reset: string;
};
type WebT = { hint: string; labels: readonly string[] };
export type SvcDemoT = { tg: TgT; web: WebT };

/* ── приложения: телефон сам листает экраны ── */
function PhoneDemo() {
  const [idx, setIdx] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearInterval(timer);
        if (e.isIntersecting) {
          timer = window.setInterval(() => setIdx((i) => (i + 1) % 3), 2400);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="ld-phone-wrap" ref={wrap}>
      <div className="ld-phone">
        <i className="ld-notch" />
        <div className="ld-screens" style={{ transform: `translateX(-${idx * 100}%)` }}>
          <div className="ld-scr">
            <div className="ld-b ld-hero" />
            <div className="ld-b" style={{ height: 12, width: "76%" }} />
            <div className="ld-b" style={{ height: 12, width: "56%" }} />
            <div className="ld-b ld-cta" />
          </div>
          <div className="ld-scr">
            <div className="ld-row">
              <div className="ld-b ld-tile" />
              <div className="ld-b ld-tile" />
            </div>
            <div className="ld-row">
              <div className="ld-b ld-tile" />
              <div className="ld-b ld-tile" />
            </div>
          </div>
          <div className="ld-scr">
            <div className="ld-b ld-ava" />
            <div className="ld-b" style={{ height: 12, width: "62%" }} />
            <div className="ld-chart">
              <i style={{ height: "34%" }} />
              <i style={{ height: "58%" }} />
              <i style={{ height: "44%" }} />
              <i style={{ height: "78%" }} />
              <i style={{ height: "100%" }} />
            </div>
          </div>
        </div>
      </div>
      <div className="ld-dots">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            className={i === idx ? "on" : ""}
            onClick={() => setIdx(i)}
            aria-label={`screen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── tg mini apps: живой чат с квик-реплаями ── */
function TgDemo({ t }: { t: TgT }) {
  const [log, setLog] = useState<{ who: "b" | "u"; text: string }[]>([
    { who: "b", text: t.hello },
  ]);
  const [used, setUsed] = useState<string[]>([]);
  const body = useRef<HTMLDivElement>(null);

  const push = (who: "b" | "u", text: string, delay = 0) =>
    window.setTimeout(() => {
      setLog((l) => [...l, { who, text }]);
    }, delay);

  useEffect(() => {
    body.current?.scrollTo({ top: 1e6, behavior: "smooth" });
  }, [log]);

  const ask = (btn: "catalog" | "pay") => {
    const label = btn === "catalog" ? t.btnCatalog : t.btnPay;
    setUsed((u) => [...u, btn]);
    push("u", label);
    push("b", btn === "catalog" ? t.catalogReply : t.payReply, 420);
    if (btn === "pay") push("b", t.paid, 900);
  };

  const reset = () => {
    setLog([{ who: "b", text: t.hello }]);
    setUsed([]);
  };

  return (
    <div className="ld-tg">
      <div className="ld-tg-h">{t.title}</div>
      <div className="ld-tg-b" ref={body}>
        {log.map((m, i) => (
          <div key={i} className={"ld-m " + m.who}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="ld-tg-q">
        {!used.includes("catalog") && (
          <button type="button" onClick={() => ask("catalog")}>
            {t.btnCatalog}
          </button>
        )}
        {!used.includes("pay") && (
          <button type="button" onClick={() => ask("pay")}>
            {t.btnPay}
          </button>
        )}
        {used.length === 2 && (
          <button type="button" onClick={reset}>
            {t.reset}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── сайты: мини-инспектор — ховер раздевает макет до сетки и токенов ── */
function WebDemo({ t }: { t: WebT }) {
  const [on, setOn] = useState(false);
  return (
    <div
      className={"ld-web" + (on ? " on" : "")}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      onClick={() => setOn((v) => !v)}
    >
      <div className="ld-web-page">
        <div className="ld-b ld-wnav" data-l={t.labels[0]} />
        <div className="ld-b ld-whero" data-l={t.labels[1]} />
        <div className="ld-row">
          <div className="ld-b ld-wcard" data-l={t.labels[2]} />
          <div className="ld-b ld-wcard" data-l={t.labels[3]} />
        </div>
        <div className="ld-grid-ov" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
      <span className="ld-web-hint">{t.hint}</span>
    </div>
  );
}

export default function ServiceDemo({
  variant,
  t,
}: {
  variant: "phone" | "tg" | "web";
  t: SvcDemoT;
}) {
  if (variant === "phone") return <PhoneDemo />;
  if (variant === "tg") return <TgDemo t={t.tg} />;
  return <WebDemo t={t.web} />;
}
