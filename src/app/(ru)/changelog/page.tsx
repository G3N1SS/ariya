import type { Metadata } from "next";
import { dict } from "@/lib/dict";

export const metadata: Metadata = {
  title: "История версий — АРИЯ",
  description: "Сайт мы ведём как продукт: релизы, даты, честная история.",
};

export default function ChangelogPage() {
  const t = dict.ru.changelog;
  return (
    <main className="chlog">
      <a className="chl-back" href={t.backHref}>
        {t.back}
      </a>
      <h1>{t.title}</h1>
      <p className="chl-lead">{t.lead}</p>
      {t.releases.map((r) => (
        <section className="chl-rel" key={r.v}>
          <div className="chl-head">
            <span className="chl-v">{`/// v${r.v}`}</span>
            <span className="chl-date">{r.date}</span>
          </div>
          <ul>
            {r.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
