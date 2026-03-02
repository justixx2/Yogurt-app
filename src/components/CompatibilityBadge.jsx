import { getCompatibilityInfo } from "../utils/fermentation";

const bgColors = {
  "#22c55e": "#dcfce7",
  "#84cc16": "#ecfccb",
  "#f59e0b": "#fef3c7",
  "#ef4444": "#fee2e2"
};

export default function CompatibilityBadge({ status, showLabel = true }) {
  const info = getCompatibilityInfo(status);

  return (
    <span
      className="compatibility-badge"
      style={{
        color: info.color,
        backgroundColor: bgColors[info.color] || "#f0f2f8"
      }}
    >
      {showLabel && <span className="badge-label">{info.label}</span>}
    </span>
  );
}
