"use client";

import { useMemo, useState } from "react";

type FormT = {
  hint: string;
  name: string;
  contact: string;
  about: string;
  send: string;
  sending: string;
  ok: string;
  fail: string;
  off: string;
  // конструктор брифа
  what: string;
  feats: string;
  stage: string;
  products: readonly string[];
  features: readonly string[];
  stages: readonly string[];
  previewTitle: string;
  pProduct: string;
  pFeats: string;
  pStage: string;
  pName: string;
  pContact: string;
};

export default function LeadForm({ t }: { t: FormT }) {
  const [state, setState] = useState<
    "idle" | "sending" | "ok" | "fail" | "off"
  >("idle");
  const [product, setProduct] = useState(t.products[0]);
  const [feats, setFeats] = useState<string[]>([]);
  const [stage, setStage] = useState(t.stages[0]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [about, setAbout] = useState("");

  const toggleFeat = (f: string) =>
    setFeats((cur) =>
      cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]
    );

  // бриф собирается в текст один раз — он же превью, он же уходит в телеграм
  const brief = useMemo(
    () =>
      [
        `${t.pProduct}: ${product}`,
        `${t.pFeats}: ${feats.length ? feats.join(", ") : "—"}`,
        `${t.pStage}: ${stage}`,
      ].join("\n"),
    [product, feats, stage, t]
  );

  const preview =
    `/// ${t.previewTitle}\n${brief}\n` +
    `${t.pName}: ${name.trim() || "—"}\n` +
    `${t.pContact}: ${contact.trim() || "—"}` +
    (about.trim() ? `\n\n«${about.trim()}»` : "");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          about: brief + (about.trim() ? `\n\n${about.trim()}` : ""),
          website: fd.get("website"),
        }),
      });
      if (res.status === 503) return setState("off");
      if (!res.ok) return setState("fail");
      setName("");
      setContact("");
      setAbout("");
      setFeats([]);
      setState("ok");
      // Призма-гид радуется каждой заявке
      window.dispatchEvent(new Event("ariya:lead-sent"));
    } catch {
      setState("fail");
    }
  };

  const chip = (
    label: string,
    on: boolean,
    onClick: () => void,
    role?: string
  ) => (
    <button
      key={label}
      type="button"
      className={"bf-chip" + (on ? " on" : "")}
      onClick={onClick}
      aria-pressed={on}
      role={role}
    >
      {label}
    </button>
  );

  return (
    <form className="lead-form brief" onSubmit={onSubmit}>
      <p className="lf-hint">{t.hint}</p>
      <div className="bf-cols">
        <div className="bf-left">
          <div className="bf-t">{`// ${t.what}`}</div>
          <div className="bf-chips">
            {t.products.map((p) =>
              chip(p, product === p, () => setProduct(p))
            )}
          </div>
          <div className="bf-t">{`// ${t.feats}`}</div>
          <div className="bf-chips">
            {t.features.map((f) =>
              chip(f, feats.includes(f), () => toggleFeat(f))
            )}
          </div>
          <div className="bf-t">{`// ${t.stage}`}</div>
          <div className="bf-chips">
            {t.stages.map((s) => chip(s, stage === s, () => setStage(s)))}
          </div>
          <div className="lf-grid">
            <input
              name="name"
              type="text"
              placeholder={t.name}
              aria-label={t.name}
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              name="contact"
              type="text"
              placeholder={t.contact}
              aria-label={t.contact}
              required
              maxLength={200}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <textarea
              name="about"
              placeholder={t.about}
              aria-label={t.about}
              rows={2}
              maxLength={1200}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
            {/* приманка для ботов */}
            <input
              className="lf-hp"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
          </div>
        </div>
        <aside className="bf-preview" aria-hidden="true">
          <pre>{preview}</pre>
        </aside>
      </div>
      <div className="lf-row">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={state === "sending"}
          data-magnetic
        >
          {state === "sending" ? t.sending : t.send}
        </button>
        <span className="lf-status" role="status">
          {state === "ok" && t.ok}
          {state === "fail" && t.fail}
          {state === "off" && t.off}
        </span>
      </div>
    </form>
  );
}
