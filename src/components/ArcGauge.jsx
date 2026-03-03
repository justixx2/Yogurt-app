/**
 * Semi-circular arc gauge — like the calorie ring in fitness apps.
 * Shows a value as a colorful arc with the number centered.
 */
export default function ArcGauge({
  value,
  label,
  sublabel,
  percent = 75,
  size = 200,
  strokeWidth = 14,
  color = "#10b981",
  bgColor = "#e8ecf4"
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="arc-gauge" style={{ width: size, height: size * 0.6, position: "relative" }}>
      <svg
        width={size}
        height={size * 0.6}
        viewBox={`0 0 ${size} ${size * 0.6}`}
        style={{ overflow: "visible" }}
      >
        {/* Background arc */}
        <path
          d={describeArc(size / 2, size * 0.55, radius, 180, 360)}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={describeArc(size / 2, size * 0.55, radius, 180, 180 + (percent / 100) * 180)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 2px 6px ${color}44)`,
            transition: "all 0.8s ease"
          }}
        />
        {/* Gradient overlay for depth */}
        <defs>
          <linearGradient id={`arcGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={adjustBrightness(color, 30)} />
          </linearGradient>
        </defs>
        <path
          d={describeArc(size / 2, size * 0.55, radius, 180, 180 + (percent / 100) * 180)}
          fill="none"
          stroke={`url(#arcGrad-${label})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: "center"
      }}>
        <div style={{
          fontSize: size * 0.16,
          fontWeight: 900,
          color: "#111827",
          lineHeight: 1,
          letterSpacing: "-1px"
        }}>
          {value}
        </div>
        <div style={{
          fontSize: size * 0.055,
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginTop: 2
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{
            fontSize: size * 0.048,
            color: "#6b7280",
            marginTop: 2
          }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function adjustBrightness(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
