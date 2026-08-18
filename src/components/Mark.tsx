export default function Mark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1280 1280"
      className={className}
      aria-hidden="true"
    >
      {/* цвета из токенов — в тёмной теме боковые слэши светлеют сами */}
      <g transform="translate(640 640) skewX(-22)">
        <rect x="-307" y="-335" width="150" height="670" rx="32" fill="var(--ink, #0D1033)" />
        <rect x="-75" y="-490" width="150" height="980" rx="32" fill="var(--blue, #0C5EFF)" />
        <rect x="157" y="-335" width="150" height="670" rx="32" fill="var(--ink, #0D1033)" />
      </g>
    </svg>
  );
}
