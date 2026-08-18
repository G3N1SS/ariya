// Тема сайта: без сохранённого выбора следуем системной (prefers-color-scheme),
// явный выбор тумблером сильнее системы и живёт в localStorage. Применяется до
// первой отрисовки инлайн-скриптом THEME_BOOT, переключается с кроссфейдом.

export type Theme = "light" | "dark";

const KEY = "ariya-theme";
const META: Record<Theme, string> = { light: "#ffffff", dark: "#090c22" };

// до гидрации: сохранённый выбор → он; иначе — системная тема
export const THEME_BOOT = `try{var s=localStorage.getItem("${KEY}");var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.dataset.theme="dark"}catch(e){}`;

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function hasExplicitChoice(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}

function apply(t: Theme) {
  if (t === "dark") document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  // theme-color объявлен парой media-тегов (auto) — явное применение
  // перекрашивает оба, чтобы цвет шапки браузера совпал с выбором
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute("content", META[t]));
  window.dispatchEvent(new CustomEvent("ariya:theme", { detail: t }));
}

function withFade(cb: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => {
      finished?: Promise<void>;
      ready?: Promise<void>;
      updateCallbackDone?: Promise<void>;
    };
  };
  if (doc.startViewTransition) {
    // в скрытой вкладке переход абортится — DOM всё равно обновляется,
    // а отклонённые промисы (все три) не должны шуметь в консоли
    const vt = doc.startViewTransition(cb);
    vt?.finished?.catch(() => {});
    vt?.ready?.catch(() => {});
    vt?.updateCallbackDone?.catch(() => {});
  } else cb();
}

export function setTheme(t: Theme) {
  try {
    localStorage.setItem(KEY, t);
  } catch {}
  withFade(() => apply(t));
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

// пока человек не выбрал сам — темнеем и светлеем вместе с системой
export function followSystemTheme(): () => void {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (hasExplicitChoice()) return;
    withFade(() => apply(mq.matches ? "dark" : "light"));
  };
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
