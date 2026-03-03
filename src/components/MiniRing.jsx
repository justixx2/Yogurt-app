/**
 * Small colored ring indicator — like the Protein/Carbs/Fat rings in fitness apps.
 */
export default function MiniRing({
  value,
  label,
  percent = 70,
  size = 56,
  strokeWidth = 5,
  color = "#10b981"
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      flexShrink: 0
    }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e8ecf4"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.8s ease",
              filter: `drop-shadow(0 1px 3px ${color}44)`
            }}
          />
        </svg>
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.24,
          fontWeight: 800,
          color: "#111827"
        }}>
          {value}
        </div>
      </div>
      <span style={{
        fontSize: "0.625rem",
        fontWeight: 700,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
        textAlign: "center",
        lineHeight: 1.2
      }}>
        {label}
      </span>
    </div>
  );
}
