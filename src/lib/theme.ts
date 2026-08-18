// Тема сайта: светлая — фирменная по умолчанию, тёмная — «чернильная ночь».
// Выбор живёт в localStorage, применяется до первой отрисовки инлайн-скриптом
// в layout (см. THEME_BOOT), переключается с кроссфейдом через View Transitions.

export type Theme = "light" | "dark";

const KEY = "ariya-theme";
const META: Record<Theme, string> = { light: "#ffffff", dark: "#090c22" };

export const THEME_BOOT = `try{if(localStorage.getItem("${KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function setTheme(t: Theme) {
  const apply = () => {
    if (t === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", META[t]);
    window.dispatchEvent(new CustomEvent("ariya:theme", { detail: t }));
  };
  try {
    localStorage.setItem(KEY, t);
  } catch {}
  // кроссфейд между темами — там, где браузер умеет
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => void;
  };
  if (doc.startViewTransition) doc.startViewTransition(apply);
  else apply();
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}
