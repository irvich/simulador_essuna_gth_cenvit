import React from "react";
import type { DimensionConfig } from "./types";

export const BASE = import.meta.env.BASE_URL;

export function scoreLevel(pct: number): "high" | "medium" | "low" {
  if (pct >= 80) return "high";
  if (pct >= 60) return "medium";
  return "low";
}

export function scoreLevelLabel(pct: number): string {
  if (pct >= 80) return "Bueno";
  if (pct >= 60) return "Regular";
  return "Crítico";
}

export function scoreLevelColor(pct: number): string {
  if (pct >= 80) return "#22c55e";
  if (pct >= 60) return "#d4af37";
  return "#f87171";
}

export interface DimScore {
  dim: DimensionConfig;
  pct: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Gráfico radar SVG — soporta cualquier número de ejes
// ──────────────────────────────────────────────────────────────────────────────
export function RadarChart({ scores, overlay, prevOverlay, benchmark, size = 320 }: { scores: DimScore[]; overlay?: DimScore[]; prevOverlay?: DimScore[]; benchmark?: DimScore[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  const n = scores.length;

  const axisAngle = (i: number) => (i * (2 * Math.PI)) / n - Math.PI / 2;

  const polar = (i: number, scale: number) => {
    const a = axisAngle(i);
    return { x: cx + r * scale * Math.cos(a), y: cy + r * scale * Math.sin(a) };
  };

  const rings = [0.25, 0.5, 0.75, 1];

  const ringPath = (scale: number) =>
    scores.map((_, i) => {
      const p = polar(i, scale);
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ") + " Z";

  const dataPath =
    scores.map((s, i) => {
      const p = polar(i, s.pct / 100);
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ") + " Z";

  const overlayPath = overlay
    ? overlay.map((s, i) => {
        const p = polar(i, s.pct / 100);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }).join(" ") + " Z"
    : null;

  const prevOverlayPath = prevOverlay
    ? prevOverlay.map((s, i) => {
        const p = polar(i, s.pct / 100);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }).join(" ") + " Z"
    : null;

  const benchmarkPath = benchmark
    ? benchmark.map((s, i) => {
        const p = polar(i, s.pct / 100);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }).join(" ") + " Z"
    : null;

  const labelOffset = 26;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {rings.map((scale) => (
        <path key={scale} d={ringPath(scale)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      ))}
      {scores.map((_, i) => {
        const o = polar(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={o.x} y2={o.y} stroke="rgba(255,255,255,0.10)" strokeWidth="1" />;
      })}
      {benchmarkPath && (
        <path d={benchmarkPath} fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.55)" strokeWidth="1.5" strokeDasharray="3,3" />
      )}
      {prevOverlayPath && (
        <path d={prevOverlayPath} fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.6)" strokeWidth="1.5" strokeDasharray="5,3" />
      )}
      <path d={dataPath} fill="rgba(56,189,248,0.18)" stroke="#38bdf8" strokeWidth="2" />
      {overlayPath && (
        <path d={overlayPath} fill="rgba(212,175,55,0.18)" stroke="#d4af37" strokeWidth="2" strokeDasharray="5,3" />
      )}
      {scores.map((s, i) => {
        const p = polar(i, s.pct / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={5} fill={s.dim.color} stroke="white" strokeWidth="1.5" />;
      })}
      {benchmark && benchmark.map((s, i) => {
        const p = polar(i, s.pct / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={3} fill="rgba(148,163,184,0.7)" stroke="rgba(7,27,51,0.8)" strokeWidth="1" />;
      })}
      {prevOverlay && prevOverlay.map((s, i) => {
        const p = polar(i, s.pct / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={3} fill="rgba(74,222,128,0.8)" stroke="rgba(7,27,51,0.8)" strokeWidth="1" />;
      })}
      {overlay && overlay.map((s, i) => {
        const p = polar(i, s.pct / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill="#d4af37" stroke="white" strokeWidth="1.5" />;
      })}
      {scores.map((s, i) => {
        const a = axisAngle(i);
        const lx = cx + (r + labelOffset) * Math.cos(a);
        const ly = cy + (r + labelOffset) * Math.sin(a);
        const anchor = Math.abs(Math.cos(a)) < 0.1 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
        return (
          <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" fontSize="10.5" fontWeight="700" fill={s.dim.color} style={{ fontFamily: "Inter, sans-serif" }}>
            {s.dim.shortLabel}
          </text>
        );
      })}
      {rings.map((scale) => (
        <text key={scale} x={cx + 4} y={cy - r * scale + 3} fontSize="8" fill="rgba(255,255,255,0.3)" style={{ fontFamily: "Inter, sans-serif" }}>
          {scale * 100}%
        </text>
      ))}
      {(overlay || prevOverlay || benchmark) && (
        <g transform={`translate(${cx - 90}, ${size - 14})`}>
          <line x1="0" y1="6" x2="16" y2="6" stroke="#38bdf8" strokeWidth="2" />
          <text x="20" y="10" fontSize="9" fill="rgba(255,255,255,0.55)" style={{ fontFamily: "Inter, sans-serif" }}>Actual</text>
          {overlay && <>
            <line x1="54" y1="6" x2="70" y2="6" stroke="#d4af37" strokeWidth="2" strokeDasharray="4,2" />
            <text x="74" y="10" fontSize="9" fill="rgba(255,255,255,0.55)" style={{ fontFamily: "Inter, sans-serif" }}>Depto.</text>
          </>}
          {prevOverlay && !overlay && <>
            <line x1="54" y1="6" x2="70" y2="6" stroke="rgba(74,222,128,0.7)" strokeWidth="1.5" strokeDasharray="4,2" />
            <text x="74" y="10" fontSize="9" fill="rgba(255,255,255,0.45)" style={{ fontFamily: "Inter, sans-serif" }}>Período ant.</text>
          </>}
          {benchmark && !overlay && <>
            <line x1={prevOverlay ? 138 : 54} y1="6" x2={prevOverlay ? 154 : 70} y2="6" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x={prevOverlay ? 158 : 74} y="10" fontSize="9" fill="rgba(255,255,255,0.45)" style={{ fontFamily: "Inter, sans-serif" }}>Benchmark</text>
          </>}
        </g>
      )}
    </svg>
  );
}

export function ScoreBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="score-bar-track">
      <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
