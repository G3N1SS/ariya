// Общий счётчик реальной загрузки: прелоадер слушает, источники регистрируются.
// На этапе 3 сюда же встанет готовность 3D-сцены.

type Listener = (p: number) => void;

let total = 0;
let done = 0;
const listeners = new Set<Listener>();

function emit() {
  const p = total ? done / total : 0;
  listeners.forEach((l) => l(p));
}

/** Зарегистрировать источник загрузки; вернувшийся колбэк вызвать по готовности. */
export function track(): () => void {
  total++;
  emit();
  let used = false;
  return () => {
    if (used) return;
    used = true;
    done++;
    emit();
  };
}

export function onProgress(fn: Listener): () => void {
  listeners.add(fn);
  fn(total ? done / total : 0);
  return () => {
    listeners.delete(fn);
  };
}
