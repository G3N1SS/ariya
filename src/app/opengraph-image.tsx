import { ImageResponse } from "next/og";

// OG-превью: знак /// на белом. Без текста — заголовок страницы
// мессенджеры показывают рядом сами; знак чистыми дивами, шрифты не нужны.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ARIYA ///";

const bar = (w: number, h: number, bg: string): React.CSSProperties => ({
  width: w,
  height: h,
  background: bg,
  borderRadius: 14,
  transform: "skewX(-22deg)",
});

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          gap: 44,
        }}
      >
        <div style={bar(74, 330, "#0D1033")} />
        <div style={bar(74, 480, "#0C5EFF")} />
        <div style={bar(74, 330, "#0D1033")} />
      </div>
    ),
    size
  );
}
