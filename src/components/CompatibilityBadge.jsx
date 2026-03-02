import { getCompatibilityInfo } from "../utils/fermentation";

const statusIcons = {
  check: "\u2713",
  warning: "\u26A0",
  cross: "\u2717"
};

export default function CompatibilityBadge({ status, showLabel = true }) {
  const info = getCompatibilityInfo(status);
  const icon = statusIcons[info.emoji] || "";

  return (
    <span
      className="compatibility-badge"
      style={{
        color: info.color,
        borderColor: info.color,
        backgroundColor: `${info.color}15`
      }}
    >
      <span className="badge-icon">{icon}</span>
      {showLabel && <span className="badge-label">{info.label}</span>}
    </span>
  );
}
