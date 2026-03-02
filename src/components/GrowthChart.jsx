import { useRef, useEffect } from "react";
import { formatCFU } from "../utils/fermentation";

/**
 * Canvas-based growth curve chart.
 * Renders a line chart with CFU over time.
 */
export default function GrowthChart({ data, width = 600, height = 300, comparisonData = null }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 30, right: 30, bottom: 50, left: 80 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#0f1729";
    ctx.fillRect(0, 0, width, height);

    // Find data ranges
    const allData = comparisonData ? [...data, ...comparisonData] : data;
    const maxHour = Math.max(...allData.map((d) => d.hour));
    const maxCFU = Math.max(...allData.map((d) => d.cfu));

    // Use log scale for CFU
    const minLog = Math.log10(Math.max(1, Math.min(...allData.map((d) => d.cfu))));
    const maxLog = Math.log10(Math.max(1, maxCFU));

    const xScale = (h) => padding.left + (h / maxHour) * chartW;
    const yScale = (cfu) => {
      const logVal = Math.log10(Math.max(1, cfu));
      const normalized = (logVal - minLog) / (maxLog - minLog || 1);
      return padding.top + chartH * (1 - normalized);
    };

    // Grid lines
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;

    // Horizontal grid (log scale)
    const logSteps = 6;
    for (let i = 0; i <= logSteps; i++) {
      const logVal = minLog + (i / logSteps) * (maxLog - minLog);
      const y = padding.top + chartH * (1 - i / logSteps);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      // Labels
      ctx.fillStyle = "#64748b";
      ctx.font = "11px monospace";
      ctx.textAlign = "right";
      ctx.fillText(formatCFU(Math.pow(10, logVal)), padding.left - 8, y + 4);
    }

    // Vertical grid (hours)
    const hourStep = maxHour <= 24 ? 4 : maxHour <= 36 ? 6 : 8;
    for (let h = 0; h <= maxHour; h += hourStep) {
      const x = xScale(h);
      ctx.beginPath();
      ctx.strokeStyle = "#1e293b";
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${h}h`, x, padding.top + chartH + 20);
    }

    // Axis labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Time (hours)", padding.left + chartW / 2, height - 5);

    ctx.save();
    ctx.translate(15, padding.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("CFU (log scale)", 0, 0);
    ctx.restore();

    // Draw comparison data first (behind main line)
    if (comparisonData && comparisonData.length > 0) {
      drawLine(ctx, comparisonData, xScale, yScale, "#475569", 2, true);
    }

    // Draw main data
    drawLine(ctx, data, xScale, yScale, "#22d3ee", 2.5, false);

    // Data points on main line
    for (const point of data) {
      const x = xScale(point.hour);
      const y = yScale(point.cfu);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#22d3ee";
      ctx.fill();
      ctx.strokeStyle = "#0f1729";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Legend
    if (comparisonData) {
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(padding.left + 10, padding.top + 5, 12, 3);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.fillText("With additives", padding.left + 28, padding.top + 10);

      ctx.fillStyle = "#475569";
      ctx.fillRect(padding.left + 10, padding.top + 22, 12, 3);
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Base (no additives)", padding.left + 28, padding.top + 27);
    }
  }, [data, comparisonData, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px`, borderRadius: "8px" }}
    />
  );
}

function drawLine(ctx, points, xScale, yScale, color, lineWidth, dashed) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  if (dashed) ctx.setLineDash([6, 4]);
  else ctx.setLineDash([]);

  ctx.moveTo(xScale(points[0].hour), yScale(points[0].cfu));
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(xScale(points[i].hour), yScale(points[i].cfu));
  }
  ctx.stroke();
  ctx.setLineDash([]);
}
