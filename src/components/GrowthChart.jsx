import { useRef, useEffect } from "react";
import { formatCFU } from "../utils/fermentation";

/**
 * Canvas-based growth curve chart — premium app style.
 * When comparison data exists, fills the area between curves to
 * make the difference visually obvious.
 */
export default function GrowthChart({ data, width = 440, height = 260, comparisonData = null }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 28, right: 20, bottom: 44, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#ffffff");
    bgGrad.addColorStop(1, "#f5f6fa");
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, width, height, 16);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.04)";
    ctx.lineWidth = 1;
    roundRect(ctx, 0.5, 0.5, width - 1, height - 1, 16);
    ctx.stroke();

    // Data ranges — use LINEAR scale when comparing to show difference better
    const allData = comparisonData ? [...data, ...comparisonData] : data;
    const maxHour = Math.max(...allData.map((d) => d.hour));
    const maxCFU = Math.max(...allData.map((d) => d.cfu));
    const minCFU = Math.min(...allData.map((d) => d.cfu));

    // Use linear scale when comparing (shows difference much better than log)
    const useLinear = !!comparisonData;

    const xScale = (h) => padding.left + (h / maxHour) * chartW;
    const yScale = (cfu) => {
      if (useLinear) {
        const normalized = (cfu - minCFU) / (maxCFU - minCFU || 1);
        return padding.top + chartH * (1 - normalized);
      }
      const minLog = Math.log10(Math.max(1, minCFU));
      const maxLog = Math.log10(Math.max(1, maxCFU));
      const logVal = Math.log10(Math.max(1, cfu));
      const normalized = (logVal - minLog) / (maxLog - minLog || 1);
      return padding.top + chartH * (1 - normalized);
    };

    // Grid
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = padding.top + chartH * (1 - i / steps);
      ctx.beginPath();
      ctx.strokeStyle = i === 0 ? "#e2e6ef" : "rgba(0,0,0,0.04)";
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      let val;
      if (useLinear) {
        val = minCFU + (i / steps) * (maxCFU - minCFU);
      } else {
        const minLog = Math.log10(Math.max(1, minCFU));
        const maxLog = Math.log10(Math.max(1, maxCFU));
        val = Math.pow(10, minLog + (i / steps) * (maxLog - minLog));
      }
      ctx.fillStyle = "#9ca3af";
      ctx.font = "600 8px -apple-system, 'SF Pro Display', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(formatCFU(val), padding.left - 8, y + 3);
    }

    const hourStep = maxHour <= 24 ? 4 : maxHour <= 36 ? 6 : 8;
    for (let h = 0; h <= maxHour; h += hourStep) {
      const x = xScale(h);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0,0,0,0.04)";
      ctx.lineWidth = 1;
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();

      ctx.fillStyle = "#6b7280";
      ctx.font = "700 9px -apple-system, 'SF Pro Display', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${h}h`, x, padding.top + chartH + 18);
    }

    ctx.fillStyle = "#9ca3af";
    ctx.font = "600 9px -apple-system, 'SF Pro Display', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Time (hours)", padding.left + chartW / 2, height - 6);

    // If comparison: fill the area BETWEEN the two curves to highlight difference
    if (comparisonData && comparisonData.length >= 2 && data.length >= 2) {
      const mainPts = data.map(d => ({ x: xScale(d.hour), y: yScale(d.cfu) }));
      const basePts = comparisonData.map(d => ({ x: xScale(d.hour), y: yScale(d.cfu) }));

      // Fill between: green where main > base
      const diffGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      diffGrad.addColorStop(0, "rgba(16, 185, 129, 0.3)");
      diffGrad.addColorStop(1, "rgba(16, 185, 129, 0.08)");

      ctx.beginPath();
      // Trace main curve forward
      ctx.moveTo(mainPts[0].x, mainPts[0].y);
      for (let i = 0; i < mainPts.length - 1; i++) {
        const p0 = mainPts[Math.max(0, i - 1)];
        const p1 = mainPts[i];
        const p2 = mainPts[i + 1];
        const p3 = mainPts[Math.min(mainPts.length - 1, i + 2)];
        ctx.bezierCurveTo(
          p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
          p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
          p2.x, p2.y
        );
      }
      // Trace base curve backward
      for (let i = basePts.length - 2; i >= 0; i--) {
        const p0 = basePts[Math.min(basePts.length - 1, i + 2)];
        const p1 = basePts[i + 1];
        const p2 = basePts[i];
        const p3 = basePts[Math.max(0, i - 1)];
        ctx.bezierCurveTo(
          p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
          p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
          p2.x, p2.y
        );
      }
      ctx.closePath();
      ctx.fillStyle = diffGrad;
      ctx.fill();

      // Draw base curve — thick dashed orange
      drawSmoothLine(ctx, comparisonData, xScale, yScale, "#f59e0b", 2.5, true);

      // Draw base data points
      for (const point of comparisonData) {
        const x = xScale(point.hour);
        const y = yScale(point.cfu);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    } else {
      // Single curve: gradient fill under
      if (data.length >= 2) {
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.25)");
        gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.08)");
        gradient.addColorStop(1, "rgba(16, 185, 129, 0.01)");

        ctx.beginPath();
        ctx.moveTo(xScale(data[0].hour), padding.top + chartH);
        const pts = data.map(d => ({ x: xScale(d.hour), y: yScale(d.cfu) }));
        ctx.lineTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[Math.max(0, i - 1)];
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const p3 = pts[Math.min(pts.length - 1, i + 2)];
          ctx.bezierCurveTo(
            p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
            p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
            p2.x, p2.y
          );
        }
        ctx.lineTo(xScale(data[data.length - 1].hour), padding.top + chartH);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Main line with glow
    ctx.shadowColor = "rgba(16, 185, 129, 0.3)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    drawSmoothLine(ctx, data, xScale, yScale, "#10b981", 3, false);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Main data points
    for (const point of data) {
      const x = xScale(point.hour);
      const y = yScale(point.cfu);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Legend
    if (comparisonData) {
      const lx = padding.left + 6;
      const ly = padding.top + 4;

      ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
      roundRect(ctx, lx, ly, 108, 18, 9);
      ctx.fill();
      ctx.fillStyle = "#10b981";
      ctx.fillRect(lx + 8, ly + 7, 12, 3);
      ctx.fillStyle = "#374151";
      ctx.font = "700 8px -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("With boost", lx + 24, ly + 12);

      ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
      roundRect(ctx, lx, ly + 22, 52, 18, 9);
      ctx.fill();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx + 8, ly + 31);
      ctx.lineTo(lx + 20, ly + 31);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#92400e";
      ctx.fillText("Base", lx + 24, ly + 34);
    }
  }, [data, comparisonData, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "16px",
        display: "block"
      }}
    />
  );
}

function drawSmoothLine(ctx, points, xScale, yScale, color, lineWidth, dashed) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (dashed) ctx.setLineDash([6, 4]);
  else ctx.setLineDash([]);

  const pts = points.map(d => ({ x: xScale(d.hour), y: yScale(d.cfu) }));
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    ctx.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
      p2.x, p2.y
    );
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
