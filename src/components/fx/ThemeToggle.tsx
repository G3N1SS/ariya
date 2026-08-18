"use client";

import { useEffect, useState } from "react";
import { getTheme, toggleTheme, type Theme } from "@/lib/theme";

// Тумблер темы: половинка круга — светлая/тёмная. Иконка, не эмодзи.
export default function ThemeToggle({ label }: { label: string }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(getTheme());
    const onTheme = (e: Event) =>
      setThemeState((e as CustomEvent).detail as Theme);
    window.addEventListener("ariya:theme", onTheme);
    return () => window.removeEventListener("ariya:theme", onTheme);
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
    >
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <circle
          cx="7.5"
          cy="7.5"
          r="6.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* заполненная половина повёрнута фирменным наклоном */}
        <path
          d={
            theme === "dark"
              ? "M7.5 1.3 A6.2 6.2 0 0 0 7.5 13.7 Z"
              : "M7.5 1.3 A6.2 6.2 0 0 1 7.5 13.7 Z"
          }
          fill="currentColor"
          transform="rotate(22 7.5 7.5)"
        />
      </svg>
    </button>
  );
}
