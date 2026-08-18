// Иконки услуг из фирменных слэшей: телефон / пузырь чата / окно браузера.
const MiniMark = ({ scale, y }: { scale: number; y: number }) => (
  <g transform={`translate(36 ${y}) scale(${scale}) skewX(-22)`}>
    <rect x="-307" y="-335" width="150" height="670" rx="60" fill="#0D1033" />
    <rect x="-75" y="-490" width="150" height="980" rx="60" fill="#0C5EFF" />
    <rect x="157" y="-335" width="150" height="670" rx="60" fill="#0D1033" />
  </g>
);

export default function ServiceIcon({
  variant,
}: {
  variant: "phone" | "chat" | "browser";
}) {
  return (
    <svg
      className="svc-icon"
      width="46"
      height="46"
      viewBox="0 0 72 72"
      aria-hidden="true"
    >
      {variant === "phone" && (
        <>
          <rect x="20" y="7" width="32" height="58" rx="8" fill="none" stroke="#0D1033" strokeWidth="2.4" />
          <line x1="31" y1="13.5" x2="41" y2="13.5" stroke="#0D1033" strokeWidth="2.4" strokeLinecap="round" />
          <MiniMark scale={0.026} y={39} />
        </>
      )}
      {variant === "chat" && (
        <>
          <path
            d="M14 12h44a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H30l-11 10v-10h-5a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z"
            fill="none"
            stroke="#0D1033"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <MiniMark scale={0.023} y={31} />
        </>
      )}
      {variant === "browser" && (
        <>
          <rect x="8" y="12" width="56" height="48" rx="7" fill="none" stroke="#0D1033" strokeWidth="2.4" />
          <line x1="8" y1="24" x2="64" y2="24" stroke="#0D1033" strokeWidth="2.4" />
          <circle cx="16" cy="18" r="1.8" fill="#0D1033" />
          <circle cx="23" cy="18" r="1.8" fill="#0D1033" />
          <circle cx="30" cy="18" r="1.8" fill="#0C5EFF" />
          <MiniMark scale={0.022} y={42} />
        </>
      )}
    </svg>
  );
}
