// Бегущая строка: текст с разделителем «///», синие слэши, бесшовный луп.
// Половина ленты повторяет фразу 4 раза — этого хватает шире любого экрана,
// поэтому на сбросе анимации (-50%) шов невидим и текст не «заканчивается».
export default function Ticker({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split("///").map((p) => p.trim());
  const half = Array.from({ length: 8 }, (_, r) => (
    <span key={r}>
      {parts.map((p, i) => (
        <span key={i}>
          {p} <i>///</i>{" "}
        </span>
      ))}
    </span>
  ));
  return (
    <div className={`ticker ${className}`} aria-hidden="true">
      <span className="ticker-in">
        {half}
        {half}
      </span>
    </div>
  );
}
