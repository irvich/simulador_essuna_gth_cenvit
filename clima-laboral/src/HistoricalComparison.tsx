import React from "react";
import { DIMENSIONS, QUESTIONS } from "./questions";
import { scoreLevelColor } from "./shared";
import type { Periodo, SurveyResponse } from "./types";

export interface PeriodSummary {
  periodo: Periodo;
  globalPct: number;
  dimScores: { key: string; pct: number }[];
  responseCount: number;
}

export function computePeriodSummary(periodo: Periodo, responses: SurveyResponse[]): PeriodSummary {
  let sum = 0, count = 0;
  for (const r of responses) {
    for (const q of QUESTIONS) {
      const v = r.answers[q.id];
      if (v !== undefined) { sum += v; count++; }
    }
  }
  const globalPct = count === 0 ? 0 : Math.round((sum / count / 5) * 100);

  const dimScores = DIMENSIONS.map(dim => {
    const ids = QUESTIONS.filter(q => q.dimension === dim.key).map(q => q.id);
    let ds = 0, dc = 0;
    for (const r of responses) {
      for (const qid of ids) {
        const v = r.answers[qid];
        if (v !== undefined) { ds += v; dc++; }
      }
    }
    return { key: dim.key, pct: dc === 0 ? 0 : Math.round((ds / dc / 5) * 100) };
  });

  return { periodo, globalPct, dimScores, responseCount: responses.length };
}

function GlobalTrendChart({ summaries }: { summaries: PeriodSummary[] }) {
  const W = 560, H = 200;
  const PAD = { t: 32, r: 20, b: 52, l: 44 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const n = summaries.length;
  const barW = Math.max(24, Math.min(72, (chartW / n) * 0.55));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {[0, 25, 50, 75, 100].map(val => {
        const y = PAD.t + chartH - (val / 100) * chartH;
        return (
          <g key={val}>
            <line x1={PAD.l} y1={y} x2={PAD.l + chartW} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PAD.l - 5} y={y} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="rgba(255,255,255,0.35)">{val}%</text>
          </g>
        );
      })}
      {[60, 80].map(val => {
        const y = PAD.t + chartH - (val / 100) * chartH;
        return (
          <line key={val} x1={PAD.l} y1={y} x2={PAD.l + chartW} y2={y}
            stroke={val === 80 ? "rgba(34,197,94,0.38)" : "rgba(212,175,55,0.38)"}
            strokeWidth="1" strokeDasharray="5,3"
          />
        );
      })}
      {summaries.map((s, i) => {
        const slotW = chartW / n;
        const cx = PAD.l + slotW * i + slotW / 2;
        const bH = Math.max(3, (s.globalPct / 100) * chartH);
        const y = PAD.t + chartH - bH;
        const color = scoreLevelColor(s.globalPct);
        const prev = i > 0 ? summaries[i - 1].globalPct : null;
        const delta = prev !== null ? s.globalPct - prev : null;
        return (
          <g key={s.periodo.id}>
            <rect x={cx - barW / 2} y={y} width={barW} height={bH} fill={color} opacity="0.72" rx="5" />
            {delta !== null && delta !== 0 && (
              <text x={cx} y={y - 18} textAnchor="middle" fontSize="9" fontWeight="700"
                fill={delta > 0 ? "#22c55e" : "#f87171"}>
                {delta > 0 ? `▲ +${delta}%` : `▼ ${delta}%`}
              </text>
            )}
            <text x={cx} y={y - 5} textAnchor="middle" fontSize="10" fontWeight="800" fill={color}>{s.globalPct}%</text>
            <text x={cx} y={PAD.t + chartH + 14} textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(255,255,255,0.75)">{s.periodo.etiqueta}</text>
            <text x={cx} y={PAD.t + chartH + 27} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)">{s.responseCount} resp.</text>
          </g>
        );
      })}
    </svg>
  );
}

function ComplianceTracker({ sorted }: { sorted: PeriodSummary[] }) {
  const pairs = sorted.slice(0, -1).map((s, i) => ({ prev: s, curr: sorted[i + 1] }));

  return (
    <div className="breakdown-card">
      <h2>Cumplimiento del Plan de Acción</h2>
      <p className="matrix-sub" style={{ marginBottom: 20 }}>
        Seguimiento por dimensión entre períodos consecutivos. Una mejora indica que las acciones implementadas tuvieron impacto positivo.
      </p>
      {pairs.map(({ prev, curr }) => (
        <div key={`${prev.periodo.id}-${curr.periodo.id}`} className="compliance-pair">
          <div className="compliance-pair-header">
            <span className="compliance-period">{prev.periodo.etiqueta}</span>
            <span className="compliance-arrow">→</span>
            <span className="compliance-period">{curr.periodo.etiqueta}</span>
          </div>
          <div className="compliance-items">
            {DIMENSIONS
              .map(dim => {
                const prevPct = prev.dimScores.find(d => d.key === dim.key)?.pct ?? 0;
                const currPct = curr.dimScores.find(d => d.key === dim.key)?.pct ?? 0;
                return { dim, prevPct, currPct, delta: currPct - prevPct };
              })
              .sort((a, b) => a.prevPct - b.prevPct)
              .map(({ dim, prevPct, currPct, delta }) => (
                <div key={dim.key} className="compliance-item">
                  <div className="compliance-item-header">
                    <span style={{ color: dim.color, fontWeight: 700, fontSize: "0.85rem" }}>{dim.label}</span>
                    <div className="compliance-scores">
                      <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{prevPct}% →</span>
                      <span style={{ color: scoreLevelColor(currPct), fontWeight: 800 }}>{currPct}%</span>
                      <span className={`compliance-delta ${delta > 0 ? "cdelta-up" : delta < 0 ? "cdelta-down" : "cdelta-same"}`}>
                        {delta > 0 ? `▲ +${delta}%` : delta < 0 ? `▼ ${delta}%` : "= 0%"}
                      </span>
                    </div>
                  </div>
                  <div className="score-bar-track" style={{ margin: "6px 0 4px" }}>
                    <div className="score-bar-fill" style={{ width: `${currPct}%`, background: scoreLevelColor(currPct) }} />
                  </div>
                  <div className="compliance-verdict">
                    {delta > 5 ? "Mejora significativa — acciones implementadas con éxito." :
                     delta > 0 ? "Mejora leve — continuar y reforzar el plan." :
                     delta === 0 ? "Sin variación — revisar y ajustar la estrategia." :
                     "Retroceso — priorizar esta dimensión como acción urgente."}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HistoricalComparison({ summaries }: { summaries: PeriodSummary[] }) {
  const sorted = [...summaries].sort((a, b) =>
    new Date(a.periodo.created_at).getTime() - new Date(b.periodo.created_at).getTime()
  );

  const first = sorted[0].globalPct;
  const last = sorted[sorted.length - 1].globalPct;
  const totalDelta = last - first;

  return (
    <div className="historical-wrap">
      <div className="historical-title-row">
        <h3 className="historical-title">Comparación Histórica · {sorted.length} períodos</h3>
        <span style={{
          fontSize: "0.82rem", fontWeight: 700,
          color: totalDelta > 0 ? "#22c55e" : totalDelta < 0 ? "#f87171" : "var(--muted)",
        }}>
          {totalDelta > 0 ? `▲ +${totalDelta}% mejora acumulada`
            : totalDelta < 0 ? `▼ ${totalDelta}% variación acumulada`
            : "Sin variación acumulada"}
        </span>
      </div>

      {/* 1. Evolución del índice global */}
      <div className="breakdown-card">
        <h2>Evolución del Índice Global</h2>
        <GlobalTrendChart summaries={sorted} />
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.78rem", marginTop: 6 }}>
          Las líneas punteadas indican los umbrales Regular (60%) y Bueno (80%).
        </p>
      </div>

      {/* 2. Evolución por dimensión */}
      <div className="breakdown-card">
        <h2>Evolución por Dimensión</h2>
        <div className="dim-evo-table">
          <div className="dim-evo-row dim-evo-header-row">
            <div className="dim-evo-name" style={{ color: "var(--muted)", fontWeight: 700 }}>Dimensión</div>
            {sorted.map(s => (
              <div key={s.periodo.id} className="dim-evo-cell" style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.75rem" }}>
                {s.periodo.etiqueta}
              </div>
            ))}
            <div className="dim-evo-delta" style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.75rem" }}>Var.</div>
          </div>
          {DIMENSIONS.map(dim => {
            const scores = sorted.map(s => s.dimScores.find(d => d.key === dim.key)?.pct ?? 0);
            const delta = scores[scores.length - 1] - scores[0];
            return (
              <div key={dim.key} className="dim-evo-row">
                <div className="dim-evo-name" style={{ color: dim.color, fontWeight: 700 }}>{dim.shortLabel}</div>
                {scores.map((pct, i) => (
                  <div key={i} className="dim-evo-cell">
                    <div style={{ color: scoreLevelColor(pct), fontWeight: 800, fontSize: "0.88rem" }}>{pct}%</div>
                    <div className="dim-evo-bar-track">
                      <div style={{ width: `${pct}%`, height: "100%", background: dim.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
                <div className="dim-evo-delta">
                  <span style={{ color: delta > 0 ? "#22c55e" : delta < 0 ? "#f87171" : "#94a3b8", fontWeight: 700, fontSize: "0.82rem" }}>
                    {delta > 0 ? `+${delta}%` : `${delta}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Tabla comparativa */}
      <div className="breakdown-card">
        <h2>Tabla Comparativa</h2>
        <div className="matrix-scroll">
          <table className="comparison-table" style={{ minWidth: 180 + sorted.length * 130 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 180 }}>Dimensión / Período</th>
                {sorted.map(s => (
                  <th key={s.periodo.id} style={{ minWidth: 120, textAlign: "center" }}>
                    {s.periodo.etiqueta}
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginTop: 2 }}>
                      {s.responseCount} resp.
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 800, color: "var(--white)", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  Índice Global
                </td>
                {sorted.map(s => (
                  <td key={s.periodo.id} style={{ textAlign: "center", fontWeight: 900, color: scoreLevelColor(s.globalPct), fontSize: "1.1rem", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                    {s.globalPct}%
                  </td>
                ))}
              </tr>
              {DIMENSIONS.map(dim => (
                <tr key={dim.key}>
                  <td style={{ color: dim.color, fontWeight: 700 }}>{dim.label}</td>
                  {sorted.map(s => {
                    const pct = s.dimScores.find(d => d.key === dim.key)?.pct ?? 0;
                    return (
                      <td key={s.periodo.id} style={{ textAlign: "center", fontWeight: 700, color: scoreLevelColor(pct) }}>
                        {pct}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Cumplimiento del plan */}
      <ComplianceTracker sorted={sorted} />
    </div>
  );
}
