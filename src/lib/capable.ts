// Способности устройства: одно место истины для HeroVisual и прелоадера.
// 3D едет на всём, где есть WebGL2 (three давно не умеет WebGL1) и нет
// prefers-reduced-motion; мобильные получают облегчённый профиль сцены.

export function can3d(): boolean {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const probe = document.createElement("canvas");
  return !!probe.getContext("webgl2");
}

export function isCoarse(): boolean {
  return matchMedia("(pointer: coarse)").matches;
}
