// Гигантский wordmark АР///Я в футере — отрисован по фирменному лого:
// буквы-строуки со скруглениями, И из слэшей, синий выступающий слэш,
// синий треугольник в «А». Светлая контурная версия.
export default function FooterWordmark() {
  // цвета контура — токены: в тёмной теме контур светлеет, синий ярчает
  const ink = "var(--fw-ink)";
  const blue = "var(--fw-blue)";
  return (
    <div className="foot-word" aria-hidden="true">
      <svg viewBox="0 0 1010 320" preserveAspectRatio="xMidYMax meet">
        {/* А */}
        <path
          d="M38 270 L148 50 L258 270"
          fill="none"
          stroke={ink}
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M112 270 L184 270 L148 196 Z" fill={blue} />
        {/* Р */}
        <path
          d="M320 270 V50 M320 50 H395 A62 62 0 0 1 395 174 H320"
          fill="none"
          stroke={ink}
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* /// — И из слэшей; при живой 3D-сцене прячутся: их место занимают бруски */}
        <g className="wm-slash">
          <g transform="translate(520 160)">
            <rect x="-17" y="-110" width="34" height="220" rx="12" transform="skewX(-22)" fill={ink} />
          </g>
          <g transform="translate(597 160)">
            <rect x="-17" y="-145" width="34" height="290" rx="12" transform="skewX(-22)" fill={blue} />
          </g>
          <g transform="translate(674 160)">
            <rect x="-17" y="-110" width="34" height="220" rx="12" transform="skewX(-22)" fill={ink} />
          </g>
        </g>
        {/* Я */}
        <path
          d="M940 270 V50 M940 50 H862 A62 62 0 0 0 862 174 H940 M898 174 L818 270"
          fill="none"
          stroke={ink}
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
