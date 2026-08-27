"use client";

import { useEffect, useRef } from "react";

// Секция «Команда»: три Призмы-аватара в слэш-карточках + открытые цифры.
// Канон лица маскота — только два белых глаза-капсулы, без зрачков и рта.
type TeamT = {
  members: readonly {
    zone: string;
    role: string;
    line: string;
    text: string;
  }[];
  stats: readonly { v: string; label: string }[];
};

// скины отсылают к работам: кэнди — сайт студии, неон — игра, золото — ковчег
const SKINS = ["candy", "neon", "gold"] as const;

export default function TeamRow({ t }: { t: TeamT }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // счётчики докручиваются при появлении, один раз
    const nums = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          const target = Number(el.dataset.count);
          if (reduced || !Number.isFinite(target) || target === 0) {
            el.textContent = el.dataset.count ?? "";
            return;
          }
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / 900);
            el.textContent = String(Math.round(target * (1 - (1 - p) ** 3)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach((n) => io.observe(n));

    // глаза тонко следят за курсором (фирменная черта призмы)
    const prismas = Array.from(
      root.querySelectorAll<HTMLElement>(".tm-prisma")
    );
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        prismas.forEach((pr) => {
          const r = pr.getBoundingClientRect();
          const dx = Math.max(
            -3,
            Math.min(3, (e.clientX - (r.left + r.width / 2)) / 60)
          );
          const dy = Math.max(
            -2.5,
            Math.min(2.5, (e.clientY - (r.top + r.height / 2)) / 80)
          );
          pr.style.setProperty("--ex", `${dx.toFixed(1)}px`);
          pr.style.setProperty("--ey", `${dy.toFixed(1)}px`);
        });
      });
    };
    const fine = matchMedia("(pointer: fine)").matches;
    if (fine && !reduced) window.addEventListener("pointermove", onMove);

    // клик по карточке — подскок призмы
    const onClick = (e: Event) => {
      const card = (e.target as HTMLElement).closest(".tm-card");
      const pr = card?.querySelector<HTMLElement>(".tm-prisma");
      if (!pr || pr.classList.contains("hop")) return;
      pr.classList.add("hop");
      window.setTimeout(() => pr.classList.remove("hop"), 520);
    };
    root.addEventListener("click", onClick);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="team-wrap" ref={rootRef}>
      <div className="team-row">
        {t.members.map((m, i) => (
          <article className="tm-card" key={m.zone}>
            <div className="tm-in">
              <span className="tm-zone">{m.zone}</span>
              <div className={`tm-prisma ${SKINS[i]}`} aria-hidden="true">
                <i className="tm-ew l">
                  <i className="tm-eye" />
                </i>
                <i className="tm-ew r">
                  <i className="tm-eye" />
                </i>
              </div>
              <div className="tm-txt">
                <h3>{m.role}</h3>
                <span className="tm-line">{`// ${m.line}`}</span>
                <p>{m.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="team-stats">
        {t.stats.map((s) => (
          <div className="st" key={s.label}>
            {/^\d+$/.test(s.v) ? (
              <b data-count={s.v}>0</b>
            ) : (
              <b>{s.v}</b>
            )}
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
