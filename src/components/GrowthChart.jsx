import { useRef, useEffect } from "react";
import { formatCFU } from "../utils/fermentation";

/**
 * Canvas-based growth curve chart — light theme, app-style.
 */
export default function GrowthChart({ data, width = 440, height = 240, comparisonData = null }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 24, right: 16, bottom: 40, left: 64 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background — light rounded card
    ctx.fillStyle = "#f8f9fc";
    roundRect(ctx, 0, 0, width, height, 14);
    ctx.fill();

    // Data ranges
    const allData = comparisonData ? [...data, ...comparisonData] : data;
    const maxHour = Math.max(...allData.map((d) => d.hour));
    const maxCFU = Math.max(...allData.map((d) => d.cfu));
    const minLog = Math.log10(Math.max(1, Math.min(...allData.map((d) => d.cfu))));
    const maxLog = Math.log10(Math.max(1, maxCFU));

    const xScale = (h) => padding.left + (h / maxHour) * chartW;
    const yScale = (cfu) => {
      const logVal = Math.log10(Math.max(1, cfu));
      const normalized = (logVal - minLog) / (maxLog - minLog || 1);
      return padding.top + chartH * (1 - normalized);
    };

    // Grid lines — subtle
    ctx.strokeStyle = "#e8ecf4";
    ctx.lineWidth = 1;

    const logSteps = 5;
    for (let i = 0; i <= logSteps; i++) {
      const logVal = minLog + (i / logSteps) * (maxLog - minLog);
      const y = padding.top + chartH * (1 - i / logSteps);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      ctx.fillStyle = "#9ca3af";
      ctx.font = "500 9px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(formatCFU(Math.pow(10, logVal)), padding.left - 6, y + 3);
    }

    // Vertical grid
    const hourStep = maxHour <= 24 ? 4 : maxHour <= 36 ? 6 : 8;
    for (let h = 0; h <= maxHour; h += hourStep) {
      const x = xScale(h);
      ctx.beginPath();
      ctx.strokeStyle = "#e8ecf4";
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();

      ctx.fillStyle = "#9ca3af";
      ctx.font = "600 9px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${h}h`, x, padding.top + chartH + 16);
    }

    // Axis labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "600 10px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Time", padding.left + chartW / 2, height - 4);

    // Gradient fill under main line
    if (data.length >= 2) {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
      gradient.addColorStop(1, "rgba(16, 185, 129, 0.02)");

      ctx.beginPath();
      ctx.moveTo(xScale(data[0].hour), padding.top + chartH);
      ctx.lineTo(xScale(data[0].hour), yScale(data[0].cfu));
      for (let i = 1; i < data.length; i++) {
        ctx.lineTo(xScale(data[i].hour), yScale(data[i].cfu));
      }
      ctx.lineTo(xScale(data[data.length - 1].hour), padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Comparison line (dashed, behind main)
    if (comparisonData && comparisonData.length > 0) {
      drawLine(ctx, comparisonData, xScale, yScale, "#d1d5db", 1.5, true);
    }

    // Main data line
    drawLine(ctx, data, xScale, yScale, "#10b981", 2.5, false);

    // Data points
    for (const point of data) {
      const x = xScale(point.hour);
      const y = yScale(point.cfu);

      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Legend
    if (comparisonData) {
      const lx = padding.left + 8;
      const ly = padding.top + 6;
      ctx.fillStyle = "#10b981";
      ctx.fillRect(lx, ly, 10, 3);
      ctx.fillStyle = "#374151";
      ctx.font = "600 9px -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("With additives", lx + 14, ly + 4);

      ctx.fillStyle = "#d1d5db";
      ctx.fillRect(lx, ly + 14, 10, 3);
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("Base", lx + 14, ly + 18);
    }
  }, [data, comparisonData, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "14px",
        display: "block"
      }}
    />
  );
}

function drawLine(ctx, points, xScale, yScale, color, lineWidth, dashed) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (dashed) ctx.setLineDash([5, 4]);
  else ctx.setLineDash([]);

  ctx.moveTo(xScale(points[0].hour), yScale(points[0].cfu));
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(xScale(points[i].hour), yScale(points[i].cfu));
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
