"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toggleTheme } from "@/lib/theme";
import { ckLabel } from "@/lib/hotkey";

type CkT = {
  aria: string;
  placeholder: string;
  empty: string;
  items: readonly { id: string; label: string; hint: string }[];
};

// действия палитры; секции скроллим через lenis (событие ловит SmoothScroll)
function run(id: string) {
  const scrollTo = (sel: string) => {
    window.dispatchEvent(
      new CustomEvent("ariya:scrollto", { detail: sel })
    );
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelector(sel)?.scrollIntoView();
    }
  };
  switch (id) {
    case "services":
    case "work":
    case "process":
    case "contact":
      scrollTo(`#${id}`);
      break;
    case "lead":
      scrollTo("#contact");
      window.setTimeout(() => {
        document
          .querySelector<HTMLInputElement>('.lead-form input[name="contact"]')
          ?.focus({ preventScroll: true });
      }, 700);
      break;
    case "lang": {
      const ru = document.documentElement.lang === "ru";
      window.location.href = ru ? "/en" : "/";
      break;
    }
    case "prisma":
      // если Призма живёт на странице — реагирует; иначе идём к ней в лабораторию
      if (document.querySelector(".pg-wrap")) {
        window.dispatchEvent(
          new CustomEvent("ariya:emotion", { detail: "spin" })
        );
      } else {
        window.location.href = "/prisma";
      }
      break;
    case "changelog":
      window.location.href =
        document.documentElement.lang === "ru" ? "/changelog" : "/en/changelog";
      break;
    case "theme":
      toggleTheme();
      break;
  }
}

export default function CommandK({ t }: { t: CkT }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [mounted, setMounted] = useState(false);
  // SSR отдаёт ⌘K, клиент после маунта подставляет свой модификатор —
  // так нет расхождения гидрации у не-Apple
  const [key, setKey] = useState("⌘K");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setKey(ckLabel());
  }, []);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return t.items;
    return t.items.filter((it) =>
      (it.label + " " + it.hint).toLowerCase().includes(needle)
    );
  }, [q, t.items]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ariya:ck-open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ariya:ck-open", onOpen);
    };
  }, []);

  // при открытии: фокус в поиск, скролл на паузу
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("ariya:lock", { detail: open })
    );
    if (open) {
      setQ("");
      setSel(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const exec = (id: string) => {
    setOpen(false);
    window.setTimeout(() => run(id), 60);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && items[sel]) {
      exec(items[sel].id);
    }
  };

  return (
    <>
      <button
        type="button"
        className="ck-badge"
        aria-label={t.aria}
        onClick={() => setOpen(true)}
      >
        {key}
      </button>
      {mounted &&
        open &&
        createPortal(
          <div
            className="ck-ov"
            role="dialog"
            aria-modal="true"
            aria-label={t.aria}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className="ck">
              <input
                ref={inputRef}
                value={q}
                placeholder={t.placeholder}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={onInputKey}
                autoComplete="off"
                spellCheck={false}
              />
              <div className="ck-list" role="listbox">
                {items.length === 0 && (
                  <div className="ck-empty">{t.empty}</div>
                )}
                {items.map((it, i) => (
                  <div
                    key={it.id}
                    role="option"
                    aria-selected={i === sel}
                    className={"ck-it" + (i === sel ? " sel" : "")}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => exec(it.id)}
                  >
                    <span className="sl">{"//"}</span>
                    <span>{it.label}</span>
                    <span className="k">{it.hint}</span>
                  </div>
                ))}
              </div>
              <div className="ck-foot">
                <span>↑↓</span> · <span>↵</span> · <span>esc</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
