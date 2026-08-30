// Подпись хоткея палитры: ⌘ — только у Apple, остальным Ctrl.
// Сам обработчик слушает оба модификатора (metaKey || ctrlKey) — здесь только текст.
export function isApple(): boolean {
  if (typeof navigator === "undefined") return true;
  return (
    /Mac|iPhone|iPad|iPod/i.test(navigator.platform ?? "") ||
    /Macintosh/i.test(navigator.userAgent)
  );
}

export const ckLabel = () => (isApple() ? "⌘K" : "Ctrl+K");

/** Заменяет ⌘K на Ctrl+K в готовой строке (реплики гида и т.п.). */
export const withHotkey = (s: string) => (isApple() ? s : s.replaceAll("⌘K", "Ctrl+K"));
