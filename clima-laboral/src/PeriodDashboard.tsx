import React, { useMemo, useState } from "react";
import { DIMENSIONS, QUESTIONS } from "./questions";
import {
  RadarChart,
  ScoreBar,
  scoreLevel,
  scoreLevelColor,
  scoreLevelLabel,
  type DimScore,
} from "./shared";
import { ActionMatrix } from "./ActionMatrix";
import type { ActionRow, SurveyResponse } from "./types";

// ── Participation trend chart ──────────────────────────────────────────────────

type TrendPoint = { label: string; count: number; cumCount: number; avgGlobal: number };

function buildTrendData(responses: SurveyResponse[]): TrendPoint[] | null {
  if (responses.length < 3) return null;
  const sorted = [...responses].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const byDay = new Map<string, SurveyResponse[]>();
  for (const r of sorted) {
    const day = r.createdAt.slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(r);
  }
  const days = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b));
  if (days.length < 2) return null;

  // If more than 28 distinct days, group into ISO weeks (YYYY-Www)
  const useWeeks = days.length > 28;
  if (useWeeks) {
    const byWeek = new Map<string, SurveyResponse[]>();
    for (const r of sorted) {
      const d = new Date(r.createdAt);
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
      const key = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
      if (!byWeek.has(key)) byWeek.set(key, []);
      byWeek.get(key)!.push(r);
    }
    let cum: SurveyResponse[] = [];
    return Array.from(byWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, rs]) => {
        cum = [...cum, ...rs];
        return { label: key.replace("-W", " S"), count: rs.length, cumCount: cum.length, avgGlobal: globalAverage(cum) };
      });
  }

  let cum: SurveyResponse[] = [];
  return days.map(([day, rs]) => {
    cum = [...cum, ...rs];
    const d = new Date(day + "T12:00:00");
    const label = d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    return { label, count: rs.length, cumCount: cum.length, avgGlobal: globalAverage(cum) };
  });
}

function ParticipationTrend({ responses }: { responses: SurveyResponse[] }) {
  const data = useMemo(() => buildTrendData(responses), [responses]);
  if (!data) return null;

  const W = 560, H = 150;
  const padL = 28, padR = 12, padT = 12, padB = 26;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = data.length;
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const gap = chartW / n;
  const bw = Math.max(4, gap * 0.55);

  const xPos = (i: number) => padL + i * gap + gap / 2;
  const yBar = (c: number) => padT + chartH - (c / maxCount) * chartH;
  const yLine = (pct: number) => padT + chartH - (pct / 100) * chartH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xPos(i).toFixed(1)},${yLine(d.avgGlobal).toFixed(1)}`).join(" ");

  const last = data[data.length - 1];

  return (
    <div className="breakdown-card">
      <h2>Tendencia de Participación</h2>
      <div style={{ overflowX: "auto" }}>
        <svg
          width={Math.max(W, n * 28 + padL + padR)}
          height={H}
          style={{ display: "block", width: "100%", minWidth: n < 8 ? 0 : n * 28 + padL + padR }}
          viewBox={`0 0 ${Math.max(W, n * 28 + padL + padR)} ${H}`}
        >
          {[25, 50, 75, 100].map((pct) => (
            <line key={pct} x1={padL} y1={yLine(pct)} x2={Math.max(W, n * 28 + padL + padR) - padR} y2={yLine(pct)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          ))}
          {[25, 50, 75, 100].map((pct) => (
            <text key={pct} x={padL - 3} y={yLine(pct) + 3} textAnchor="end" fontSize="7.5" fill="rgba(148,163,184,0.5)" style={{ fontFamily: "Inter,sans-serif" }}>{pct}</text>
          ))}
          {data.map((d, i) => (
            <rect
              key={i}
              x={xPos(i) - bw / 2}
              y={yBar(d.count)}
              width={bw}
              height={(d.count / maxCount) * chartH}
              fill="rgba(56,189,248,0.3)"
              rx="2"
            >
              <title>{d.label}: {d.count} respuesta(s) · acumulado {d.cumCount}</title>
            </rect>
          ))}
          <path d={linePath} fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((d, i) => (
            <circle key={i} cx={xPos(i)} cy={yLine(d.avgGlobal)} r="3" fill="#d4af37" stroke="rgba(7,27,51,0.9)" strokeWidth="1.5">
              <title>{d.label}: índice {d.avgGlobal}%</title>
            </circle>
          ))}
          {data.map((d, i) => (
            <text key={i} x={xPos(i)} y={H - padB + 13} textAnchor="middle" fontSize="8" fill="rgba(148,163,184,0.7)" style={{ fontFamily: "Inter,sans-serif" }}>
              {d.label}
            </text>
          ))}
        </svg>
      </div>
      <div style={{ display: "flex", gap: 18, fontSize: "0.72rem", color: "var(--muted)", marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 12, height: 8, background: "rgba(56,189,248,0.3)", borderRadius: 2 }} />
          Respuestas del día
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 16, height: 2, background: "#d4af37", borderRadius: 1 }} />
          Índice global acumulado
        </span>
        <span style={{ marginLeft: "auto", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
          {data.length} día(s) · {last.cumCount} resp. · {last.avgGlobal}% actual
        </span>
      </div>
    </div>
  );
}

function exportCSV(responses: SurveyResponse[], label: string) {
  const qHeaders = QUESTIONS.map((q) => `"P${q.id}: ${q.text.replace(/"/g, '""')}"`);
  const header = ["Fecha", "Departamento", ...qHeaders, "Comentario"].join(",");
  const rows = responses.map((r) => {
    const fecha = new Date(r.createdAt).toLocaleDateString("es-ES");
    const dept = `"${r.department.replace(/"/g, '""')}"`;
    const scores = QUESTIONS.map((q) => r.answers[q.id] ?? "");
    const comment = `"${(r.comment ?? "").replace(/"/g, '""')}"`;
    return [fecha, dept, ...scores, comment].join(",");
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clima_${label.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function QuestionAnalysis({ responses, forceOpen }: { responses: SurveyResponse[]; forceOpen?: boolean }) {
  const [openState, setOpen] = useState(false);
  const open = openState || !!forceOpen;

  const byDim = useMemo(() => {
    const qAvgs = QUESTIONS.map((q) => {
      let sum = 0, count = 0;
      const dist = [0, 0, 0, 0, 0]; // index 0 = value 1, ..., index 4 = value 5
      for (const r of responses) {
        const v = r.answers[q.id];
        if (v !== undefined) { sum += v; count++; if (v >= 1 && v <= 5) dist[v - 1]++; }
      }
      const avg = count === 0 ? 0 : sum / count;
      return {
        q,
        avg: Math.round(avg * 10) / 10,
        pct: count === 0 ? 0 : Math.round((avg / 5) * 100),
        dist,
        total: count,
      };
    });
    return DIMENSIONS.map((dim) => ({
      dim,
      questions: qAvgs.filter((qa) => qa.q.dimension === dim.key).sort((a, b) => a.pct - b.pct),
    }));
  }, [responses]);

  return (
    <div className="breakdown-card">
      <button
        className="q-analysis-toggle no-print"
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: "inherit", padding: 0, cursor: "pointer", width: "100%" }}
      >
        <h2 style={{ margin: 0 }}>Análisis Detallado por Pregunta</h2>
        <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: "auto" }}>
          {open ? "Ocultar ▲" : "Ver preguntas ▼"}
        </span>
      </button>
      <h2 className="print-only" style={{ margin: 0 }}>Análisis Detallado por Pregunta</h2>
      {!open && (
        <p className="no-print" style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 10 }}>
          Muestra el promedio de cada una de las {QUESTIONS.length} preguntas, ordenadas de más crítica a más sólida dentro de cada dimensión.
        </p>
      )}
      {open && (
        <div className="q-analysis-body">
          {byDim.map(({ dim, questions }) => (
            <div key={dim.key} className="q-dim-section">
              <h3 style={{ color: dim.color, fontSize: "0.88rem", fontWeight: 800, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {dim.label}
              </h3>
              {questions.map(({ q, avg, pct, dist, total }) => {
                const LIKERT_COLORS = ["#f87171", "#fb923c", "#facc15", "#86efac", "#4ade80"];
                const LIKERT_LABELS = ["Muy bajo", "Bajo", "Medio", "Alto", "Muy alto"];
                return (
                  <div key={q.id} className="q-row">
                    <div className="q-row-num" style={{ color: dim.color }}>P{q.id}</div>
                    <div className="q-row-text">{q.text}</div>
                    <div className="q-row-bars">
                      <div className="score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${pct}%`, background: scoreLevelColor(pct) }} />
                      </div>
                      {total > 0 && (
                        <div className="q-dist-bar">
                          {dist.map((n, idx) => {
                            const w = Math.round((n / total) * 100);
                            return w > 0 ? (
                              <div
                                key={idx}
                                className="q-dist-seg"
                                style={{ width: `${w}%`, background: LIKERT_COLORS[idx] }}
                                title={`${LIKERT_LABELS[idx]} (${idx + 1}): ${n} resp. (${w}%)`}
                              />
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    <div className="q-row-score" style={{ color: scoreLevelColor(pct) }}>
                      {avg}/5
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeptDrillDown({ deptName, deptResponses, globalScores }: {
  deptName: string;
  deptResponses: SurveyResponse[];
  globalScores: DimScore[];
}) {
  const deptScores: DimScore[] = useMemo(
    () => DIMENSIONS.map((dim) => ({ dim, pct: dimensionAverage(deptResponses, dim.key) })),
    [deptResponses]
  );
  return (
    <div className="dept-drill-panel">
      <div className="dept-drill-header">
        <span style={{ fontWeight: 700, color: "var(--sky)" }}>{deptName}</span>
        <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
          vs. promedio empresa — {deptResponses.length} respuesta(s)
        </span>
      </div>
      <div className="dept-drill-grid">
        {deptScores.map(({ dim, pct }) => {
          const global = globalScores.find((s) => s.dim.key === dim.key)?.pct ?? 0;
          const delta = pct - global;
          return (
            <React.Fragment key={dim.key}>
              <div className="dept-drill-row">
                <div className="dept-drill-dim-name" style={{ color: dim.color }}>{dim.shortLabel}</div>
                <div className="dept-drill-bar-track">
                  <div style={{ width: `${pct}%`, height: "100%", background: dim.color, borderRadius: 3, transition: "width 0.4s" }} />
                  <div
                    className="dept-drill-avg-line"
                    style={{ left: `${global}%` }}
                    title={`Empresa: ${global}%`}
                  />
                </div>
                <div className="dept-drill-pct" style={{ color: dim.color }}>{pct}%</div>
                <div className={`dept-drill-delta ${delta > 2 ? "delta-up" : delta < -2 ? "delta-down" : "delta-same"}`}>
                  {delta > 0 ? `+${delta}` : delta === 0 ? "=" : delta}
                </div>
              </div>
              <DimDistribution responses={deptResponses} dimKey={dim.key} />
            </React.Fragment>
          );
        })}
      </div>
      <p className="dept-drill-legend">
        <span className="dept-drill-legend-bar" /> Dpto. &nbsp;
        <span className="dept-drill-legend-line" /> Empresa
      </p>
    </div>
  );
}

function computeCorrelation(responses: SurveyResponse[]): Record<string, Record<string, number>> | null {
  if (responses.length < 8) return null;
  const data: Record<string, number>[] = responses.map((r) => {
    const row: Record<string, number> = {};
    for (const dim of DIMENSIONS) {
      const ids = QUESTIONS.filter((q) => q.dimension === dim.key).map((q) => q.id);
      const vals = ids.map((id) => r.answers[id]).filter((v): v is number => v !== undefined);
      row[dim.key] = vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : NaN;
    }
    return row;
  }).filter((d) => !Object.values(d).some(isNaN));
  if (data.length < 8) return null;
  const means: Record<string, number> = {};
  for (const dim of DIMENSIONS) {
    means[dim.key] = data.reduce((s, d) => s + d[dim.key], 0) / data.length;
  }
  const corr: Record<string, Record<string, number>> = {};
  for (const d1 of DIMENSIONS) {
    corr[d1.key] = {};
    for (const d2 of DIMENSIONS) {
      if (d1.key === d2.key) { corr[d1.key][d2.key] = 1; continue; }
      let num = 0, den1 = 0, den2 = 0;
      for (const d of data) {
        const xi = d[d1.key] - means[d1.key];
        const yi = d[d2.key] - means[d2.key];
        num += xi * yi; den1 += xi * xi; den2 += yi * yi;
      }
      corr[d1.key][d2.key] = den1 === 0 || den2 === 0 ? 0 : Math.round((num / Math.sqrt(den1 * den2)) * 100) / 100;
    }
  }
  return corr;
}

function CorrelationMatrix({ responses }: { responses: SurveyResponse[] }) {
  const corr = useMemo(() => computeCorrelation(responses), [responses]);
  if (!corr) return null;
  function cellColor(r: number): string {
    if (r >= 0.7) return "#22c55e";
    if (r >= 0.4) return "#86efac";
    if (r >= 0.2) return "#d4af37";
    if (r >= 0) return "rgba(148,163,184,0.5)";
    return "#f87171";
  }
  function cellBg(r: number): string {
    if (r >= 0.7) return "rgba(34,197,94,0.18)";
    if (r >= 0.4) return "rgba(134,239,172,0.12)";
    if (r >= 0.2) return "rgba(212,175,55,0.12)";
    if (r >= 0) return "rgba(148,163,184,0.07)";
    return "rgba(248,113,113,0.12)";
  }
  return (
    <div className="breakdown-card">
      <h2>Correlación entre Dimensiones</h2>
      <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginBottom: 16 }}>
        Indica qué tan relacionadas están las dimensiones entre sí. Correlación alta (verde) significa que ambas tienden a subir o bajar juntas en cada colaborador.
      </p>
      <div className="corr-table-wrap">
        <table className="corr-table">
          <thead>
            <tr>
              <th />
              {DIMENSIONS.map((d) => (
                <th key={d.key} title={d.label} style={{ color: d.color }}>{d.shortLabel}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.map((d1, i) => (
              <tr key={d1.key}>
                <td className="corr-row-label" style={{ color: d1.color }}>{d1.shortLabel}</td>
                {DIMENSIONS.map((d2, j) => {
                  if (j > i) return <td key={d2.key} className="corr-cell-empty" />;
                  const r = corr[d1.key][d2.key];
                  return (
                    <td
                      key={d2.key}
                      className="corr-cell"
                      style={{ background: cellBg(r), color: cellColor(r) }}
                      title={`${d1.label} ↔ ${d2.label}: r = ${r}`}
                    >
                      {j === i ? "—" : r.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="corr-legend">
        {[["≥0.70", "#22c55e", "Fuerte"], ["0.40–0.69", "#86efac", "Moderada"], ["0.20–0.39", "#d4af37", "Débil"], ["<0.20", "rgba(148,163,184,0.6)", "Muy débil"], ["< 0", "#f87171", "Inversa"]].map(([range, color, label]) => (
          <span key={label} className="corr-legend-item">
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: color, marginRight: 4 }} />
            <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>{range} — {label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const POSITIVE_KW = ["bien", "excelente", "buen", "buena", "bueno", "positivo", "feliz", "contento", "satisfecho", "satisfecha", "mejor", "genial", "agradecido", "agradecida", "gracias", "apoyo", "motivado", "motivada", "orgulloso", "orgullosa", "aprendizaje", "crecimiento", "respeto", "gran equipo", "unidos", "colaboraci"];
const NEGATIVE_KW = ["mal ", "malo", "mala", "pésimo", "terrible", "peor", "difícil", "problema", "falta de", "estresante", "estrés", "sobrecarga", "injusto", "injusticia", "desmotivado", "desmotivada", "presión excesiva", "conflicto", "desorganizado", "sin apoyo", "no se comunica", "no hay claridad", "poco reconocimiento"];

function classifySentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();
  const pos = POSITIVE_KW.filter((kw) => lower.includes(kw)).length;
  const neg = NEGATIVE_KW.filter((kw) => lower.includes(kw)).length;
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

const STOPWORDS = new Set([
  "de","la","el","en","y","a","que","los","las","un","una","por","con","del","al","se","es","su","sus","para","no","lo","le","me","mi","más","pero","como","si","ha","he","han","hay","ya","fue","ser","son","era","esto","esta","este","eso","entre","sobre","porque","donde","cuando","también","todo","todos","toda","todas","muy","bien","así","sin","hasta","desde","tienen","tiene","puede","poder","nos","les","quien","cada","solo","solo","nada","algo","mucho","muchos","mucha","muchas","poco","poca","pocos","pocas","otro","otra","otros","otras","mismo","misma","mismos","mismas","hace","hacer","hemos","antes","después","ahora","aún","aunque","mientras","dentro","fuera","junto","vez","veces","tanto","tan","ni","sino","sea","soy","somos","fueron","están","estaba","estamos","estoy","estaba","había","hubiera","me","te","nos","os","les"
]);

function topWords(comments: Array<{ text: string }>): Array<{ word: string; count: number }> {
  const freq: Record<string, number> = {};
  for (const { text } of comments) {
    const words = text.toLowerCase().replace(/[^a-záéíóúüñ\s]/gi, " ").split(/\s+/);
    for (const w of words) {
      if (w.length < 4 || STOPWORDS.has(w)) continue;
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 18);
}

function CommentsSection({ responses, forceOpen }: { responses: SurveyResponse[]; forceOpen?: boolean }) {
  const [openState, setOpen] = useState(false);
  const open = openState || !!forceOpen;
  const comments = useMemo(
    () => responses
      .filter((r) => r.comment && r.comment.trim())
      .map((r) => ({ text: r.comment!.trim(), department: r.department, createdAt: r.createdAt })),
    [responses]
  );
  const wordCloud = useMemo(() => topWords(comments), [comments]);
  const tagged = useMemo(
    () => comments.map((c) => ({ ...c, sentiment: classifySentiment(c.text) })),
    [comments]
  );
  const sentCounts = useMemo(() => ({
    positive: tagged.filter((c) => c.sentiment === "positive").length,
    neutral: tagged.filter((c) => c.sentiment === "neutral").length,
    negative: tagged.filter((c) => c.sentiment === "negative").length,
  }), [tagged]);

  if (comments.length === 0) return null;

  const maxCount = wordCloud[0]?.count || 1;

  return (
    <div className="breakdown-card">
      <button
        className="no-print"
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: "inherit", padding: 0, cursor: "pointer", width: "100%" }}
      >
        <h2 style={{ margin: 0 }}>Comentarios de Colaboradores</h2>
        <span style={{ color: "var(--muted)", fontSize: "0.82rem", marginLeft: "auto" }}>
          {comments.length} comentario(s) · {open ? "Ocultar ▲" : "Ver ▼"}
        </span>
      </button>
      <h2 className="print-only" style={{ margin: 0 }}>Comentarios de Colaboradores ({comments.length})</h2>
      {!open && (
        <p className="no-print" style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 10 }}>
          Respuestas abiertas y anónimas dejadas por los participantes. Útiles para entender el "por qué" detrás de los números.
        </p>
      )}
      {open && (
        <>
          {wordCloud.length >= 4 && (
            <div className="word-cloud-wrap">
              <p className="word-cloud-title">Palabras más frecuentes</p>
              <div className="word-cloud-pills">
                {wordCloud.map(({ word, count }) => {
                  const ratio = count / maxCount;
                  const size = 0.72 + ratio * 0.72;
                  const opacity = 0.45 + ratio * 0.55;
                  return (
                    <span
                      key={word}
                      className="word-cloud-pill"
                      style={{ fontSize: `${size}rem`, opacity, fontWeight: ratio > 0.6 ? 800 : ratio > 0.3 ? 700 : 600 }}
                      title={`${count} vez${count > 1 ? "es" : ""}`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {comments.length >= 3 && (
            <div className="sent-summary">
              <span className="sent-chip sent-positive">✓ Positivo {sentCounts.positive}</span>
              <span className="sent-chip sent-neutral">~ Neutral {sentCounts.neutral}</span>
              <span className="sent-chip sent-negative">↓ Mejorable {sentCounts.negative}</span>
            </div>
          )}
          <div className="comments-list">
            {tagged.map((c, i) => {
              const sentColor = c.sentiment === "positive" ? "#22c55e" : c.sentiment === "negative" ? "#f87171" : "rgba(148,163,184,0.6)";
              return (
                <div key={i} className="comment-item" style={{ borderLeftColor: sentColor + "99" }}>
                  <p className="comment-text">"{c.text}"</p>
                  <p className="comment-meta">— {c.department}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ExecutiveSummary({ responses, periodoLabel, empresaNombre, scores, globalPct, departments, forceOpen }: {
  responses: SurveyResponse[];
  periodoLabel: string;
  empresaNombre?: string;
  scores: DimScore[];
  globalPct: number;
  departments: Array<{ name: string; count: number; pct: number }>;
  forceOpen?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [openState, setOpen] = useState(false);
  const open = openState || !!forceOpen;

  const sorted = useMemo(() => [...scores].sort((a, b) => b.pct - a.pct), [scores]);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const bestDept = useMemo(() => departments.length > 0 ? [...departments].sort((a, b) => b.pct - a.pct)[0] : null, [departments]);
  const worstDept = useMemo(() => departments.length > 1 ? [...departments].sort((a, b) => a.pct - b.pct)[0] : null, [departments]);

  const narrative = useMemo(() => {
    const empresa = empresaNombre || "la organización";
    const level = scoreLevelLabel(globalPct);
    let text = `En el período ${periodoLabel}, ${empresa} registró un Índice Global de Clima Laboral de ${globalPct}%, calificado como "${level}" según la escala del diagnóstico. La medición contó con la participación de ${responses.length} colaborador(es).`;
    text += `\n\nLa dimensión con mayor fortaleza fue ${top.dim.label} (${top.pct}%), mientras que ${bottom.dim.label} (${bottom.pct}%) representa el área de mayor oportunidad de mejora.`;
    if (bestDept) {
      text += `\n\nA nivel departamental, ${bestDept.name} obtuvo el mejor desempeño (${bestDept.pct}%)`;
      if (worstDept && worstDept.name !== bestDept.name) {
        text += `, en contraste con ${worstDept.name} (${worstDept.pct}%), que requiere atención prioritaria`;
      }
      text += `.`;
    }
    const critical = sorted.filter((s) => s.pct < 60);
    if (critical.length > 0) {
      text += `\n\nSe recomienda priorizar acciones de mejora en ${critical.map((s) => s.dim.label).join(" y ")}, dado que estas dimensiones se encuentran en nivel Crítico.`;
    } else {
      const medium = sorted.filter((s) => s.pct < 80);
      if (medium.length > 0) {
        text += `\n\nSe recomienda fortalecer ${medium[medium.length - 1].dim.label} como el área con mayor potencial de crecimiento para el próximo período.`;
      }
    }
    return text;
  }, [scores, globalPct, departments, responses.length, periodoLabel, empresaNombre, top, bottom, bestDept, worstDept, sorted]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(narrative);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  return (
    <div className="breakdown-card">
      <button
        className="no-print"
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: "inherit", padding: 0, cursor: "pointer", width: "100%" }}
      >
        <h2 style={{ margin: 0 }}>Resumen Ejecutivo</h2>
        <span style={{ color: "var(--muted)", fontSize: "0.82rem", marginLeft: "auto" }}>{open ? "Ocultar ▲" : "Ver resumen ▼"}</span>
      </button>
      <h2 className="print-only" style={{ margin: 0 }}>Resumen Ejecutivo</h2>

      {!open && (
        <p className="no-print" style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 10 }}>
          Párrafo listo para copiar y compartir con directivos, con índice global, fortalezas, áreas de mejora y recomendación principal.
        </p>
      )}

      {open && (
        <>
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <div className="exec-kpi-num" style={{ color: scoreLevelColor(globalPct) }}>{globalPct}%</div>
              <div className="exec-kpi-label">Índice global · {scoreLevelLabel(globalPct)}</div>
            </div>
            <div className="exec-kpi">
              <div className="exec-kpi-num" style={{ color: "#38bdf8" }}>{responses.length}</div>
              <div className="exec-kpi-label">Participantes</div>
            </div>
            <div className="exec-kpi">
              <div className="exec-kpi-num" style={{ color: top.dim.color, fontSize: "1rem", paddingTop: 6 }}>{top.dim.shortLabel}</div>
              <div className="exec-kpi-label">Fortaleza · {top.pct}%</div>
            </div>
            <div className="exec-kpi">
              <div className="exec-kpi-num" style={{ color: bottom.dim.color, fontSize: "1rem", paddingTop: 6 }}>{bottom.dim.shortLabel}</div>
              <div className="exec-kpi-label">Oportunidad · {bottom.pct}%</div>
            </div>
          </div>
          <div className="exec-summary-box">
            {narrative.split("\n\n").map((para, i) => (
              <p key={i} style={{ marginBottom: 12, lineHeight: 1.75 }}>{para}</p>
            ))}
          </div>
          <button
            className="btn-secondary no-print"
            style={{ fontSize: "0.8rem", padding: "7px 18px" }}
            onClick={handleCopy}
          >
            {copied ? "¡Copiado al portapapeles!" : "Copiar texto"}
          </button>
        </>
      )}
    </div>
  );
}

function heatBg(pct: number): string {
  if (pct >= 80) return "rgba(34,197,94,0.22)";
  if (pct >= 60) return "rgba(212,175,55,0.22)";
  return "rgba(248,113,113,0.22)";
}
function heatText(pct: number): string {
  if (pct >= 80) return "#86efac";
  if (pct >= 60) return "#fde68a";
  return "#fca5a5";
}

function DeptHeatmap({ departments, deptResponsesMap, scores, globalPct }: {
  departments: Array<{ name: string; count: number; pct: number }>;
  deptResponsesMap: Map<string, SurveyResponse[]>;
  scores: DimScore[];
  globalPct: number;
}) {
  const matrix = useMemo(() =>
    departments.map((d) => ({
      name: d.name,
      count: d.count,
      globalPct: d.pct,
      dimScores: DIMENSIONS.map((dim) => dimensionAverage(deptResponsesMap.get(d.name) ?? [], dim.key)),
    })),
    [departments, deptResponsesMap]
  );

  return (
    <div className="breakdown-card">
      <h2>Mapa de Calor: Departamento × Dimensión</h2>
      <div className="matrix-scroll">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="heatmap-dept-col">Departamento</th>
              {DIMENSIONS.map((dim) => (
                <th key={dim.key} style={{ color: dim.color, textAlign: "center" }}>{dim.shortLabel}</th>
              ))}
              <th style={{ textAlign: "center", color: "var(--muted)" }}>Global</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.name}>
                <td className="heatmap-dept-name">
                  {row.name}
                  <span className="heatmap-count">({row.count})</span>
                </td>
                {row.dimScores.map((pct, i) => (
                  <td key={i} className="heatmap-cell" style={{ background: heatBg(pct) }}>
                    <span style={{ color: heatText(pct) }}>{pct}%</span>
                  </td>
                ))}
                <td className="heatmap-cell heatmap-global" style={{ background: heatBg(row.globalPct) }}>
                  <span style={{ color: heatText(row.globalPct), fontWeight: 800 }}>{row.globalPct}%</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="heatmap-avg-row">
              <td className="heatmap-dept-name" style={{ color: "var(--muted)", fontStyle: "italic" }}>Empresa</td>
              {scores.map(({ dim, pct }) => (
                <td key={dim.key} className="heatmap-cell" style={{ background: heatBg(pct) }}>
                  <span style={{ color: heatText(pct), fontWeight: 800 }}>{pct}%</span>
                </td>
              ))}
              <td className="heatmap-cell heatmap-global" style={{ background: heatBg(globalPct) }}>
                <span style={{ color: heatText(globalPct), fontWeight: 800 }}>{globalPct}%</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="heatmap-legend">
        <span className="heatmap-legend-item heat-low">0–59% Crítico</span>
        <span className="heatmap-legend-item heat-mid">60–79% Regular</span>
        <span className="heatmap-legend-item heat-high">80–100% Bueno</span>
      </div>
    </div>
  );
}

function computeENPS(responses: SurveyResponse[]) {
  if (responses.length === 0) return null;
  let promoters = 0, neutrals = 0, detractors = 0;
  for (const r of responses) {
    const vals = Object.values(r.answers);
    if (vals.length === 0) continue;
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    if (avg >= 4.0) promoters++;
    else if (avg >= 3.0) neutrals++;
    else detractors++;
  }
  const total = promoters + neutrals + detractors;
  if (total === 0) return null;
  return {
    score: Math.round(((promoters - detractors) / total) * 100),
    pctPromoters: Math.round((promoters / total) * 100),
    pctNeutral: Math.round((neutrals / total) * 100),
    pctDetractors: Math.round((detractors / total) * 100),
  };
}

function RespondentHistogram({ responses }: { responses: SurveyResponse[] }) {
  const buckets = useMemo(() => {
    if (responses.length < 3) return null;
    // 10 buckets: 0-9%, 10-19%, …, 90-100%
    const counts = new Array(10).fill(0);
    for (const r of responses) {
      const vals = Object.values(r.answers);
      if (vals.length === 0) continue;
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      const pct = (avg / 5) * 100;
      const bucket = Math.min(9, Math.floor(pct / 10));
      counts[bucket]++;
    }
    const max = Math.max(...counts, 1);
    return counts.map((c, i) => ({
      label: `${i * 10}–${i * 10 + 9}%`,
      count: c,
      pct: Math.round((c / responses.length) * 100),
      barH: Math.round((c / max) * 100),
      color: i < 6 ? "#f87171" : i < 8 ? "#d4af37" : "#22c55e",
    }));
  }, [responses]);

  if (!buckets) return null;
  const hasData = buckets.some((b) => b.count > 0);
  if (!hasData) return null;

  return (
    <div style={{ maxWidth: 460, margin: "18px auto 0" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, textAlign: "left" }}>
        Distribución de puntaje por colaborador
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
        {buckets.map((b, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div
              style={{ width: "100%", height: `${b.barH}%`, minHeight: b.count > 0 ? 3 : 0, background: b.color, borderRadius: "2px 2px 0 0", opacity: 0.8, transition: "height 0.4s" }}
              title={`${b.label}: ${b.count} persona(s) (${b.pct}%)`}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "rgba(148,163,184,0.45)", marginTop: 3 }}>
        <span>0%</span><span>50%</span><span>100%</span>
      </div>
    </div>
  );
}

function dimensionAverage(responses: SurveyResponse[], dimKey: string): number {
  const ids = QUESTIONS.filter((q) => q.dimension === dimKey).map((q) => q.id);
  let sum = 0, count = 0;
  for (const r of responses) {
    for (const qid of ids) {
      const v = r.answers[qid];
      if (v !== undefined) { sum += v; count++; }
    }
  }
  return count === 0 ? 0 : Math.round((sum / count / 5) * 100);
}

function globalAverage(responses: SurveyResponse[]): number {
  let sum = 0, count = 0;
  for (const r of responses) {
    for (const q of QUESTIONS) {
      const v = r.answers[q.id];
      if (v !== undefined) { sum += v; count++; }
    }
  }
  return count === 0 ? 0 : Math.round((sum / count / 5) * 100);
}

const DIST_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#86efac", "#22c55e"];
const DIST_LABELS = ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"];

function useDimDistribution(responses: SurveyResponse[], dimKey: string) {
  return useMemo(() => {
    const ids = QUESTIONS.filter((q) => q.dimension === dimKey).map((q) => q.id);
    const counts = [0, 0, 0, 0, 0];
    let total = 0;
    for (const r of responses) {
      for (const qid of ids) {
        const v = r.answers[qid];
        if (v !== undefined) { counts[v - 1]++; total++; }
      }
    }
    if (total === 0) return null;
    const pcts = counts.map((c) => (c / total) * 100);
    // Standard deviation on 1-5 scale
    const mean = counts.reduce((s, c, i) => s + c * (i + 1), 0) / total;
    const variance = counts.reduce((s, c, i) => s + c * (i + 1 - mean) ** 2, 0) / total;
    const sd = Math.sqrt(variance);
    return { pcts, sd: Math.round(sd * 10) / 10, total };
  }, [responses, dimKey]);
}

function DimDistribution({ responses, dimKey }: { responses: SurveyResponse[]; dimKey: string }) {
  const dist = useDimDistribution(responses, dimKey);
  if (!dist) return null;
  const { pcts, sd } = dist;
  const alignLabel = sd <= 0.85 ? "Alineado" : sd <= 1.25 ? "Diverso" : "Polarizado";
  const alignColor = sd <= 0.85 ? "#22c55e" : sd <= 1.25 ? "#d4af37" : "#f87171";
  const tooltip = pcts.map((p, i) => `${DIST_LABELS[i]}: ${Math.round(p)}%`).join(" · ");
  return (
    <div className="dim-dist-wrap">
      <div className="dist-bar-track" title={tooltip}>
        {pcts.map((p, i) =>
          p > 0 ? <div key={i} style={{ width: `${p}%`, background: DIST_COLORS[i] }} title={`${DIST_LABELS[i]}: ${Math.round(p)}%`} /> : null
        )}
      </div>
      <span className="dist-align-badge" style={{ color: alignColor, borderColor: alignColor + "44", background: alignColor + "12" }}>
        {alignLabel} · σ {sd.toFixed(1)}
      </span>
    </div>
  );
}

function RiskMatrix({ responses }: { responses: SurveyResponse[] }) {
  const points = useMemo(() => {
    if (responses.length < 5) return null;
    return DIMENSIONS.map((dim) => {
      const ids = QUESTIONS.filter((q) => q.dimension === dim.key).map((q) => q.id);
      const counts = [0, 0, 0, 0, 0];
      let total = 0;
      for (const r of responses) {
        for (const qid of ids) {
          const v = r.answers[qid];
          if (v !== undefined) { counts[v - 1]++; total++; }
        }
      }
      if (total === 0) return null;
      const mean = counts.reduce((s, c, i) => s + c * (i + 1), 0) / total;
      const variance = counts.reduce((s, c, i) => s + c * (i + 1 - mean) ** 2, 0) / total;
      const sd = Math.sqrt(variance);
      return { dim, pct: Math.round((mean / 5) * 100), sd: Math.round(sd * 100) / 100 };
    }).filter(Boolean) as Array<{ dim: { key: string; label: string; shortLabel: string; color: string }; pct: number; sd: number }>;
  }, [responses]);

  if (!points || points.length === 0) return null;

  const W = 420, H = 310;
  const padL = 36, padR = 18, padT = 28, padB = 38;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxSD = 2.0;

  const xPos = (pct: number) => padL + (pct / 100) * chartW;
  const yPos = (sd: number) => padT + (1 - Math.min(sd, maxSD) / maxSD) * chartH;
  const xMid = xPos(70);
  const yMid = yPos(1.0);

  return (
    <div className="breakdown-card">
      <h2>Mapa de Riesgo: Puntaje vs Polarización</h2>
      <p style={{ color: "var(--muted)", fontSize: "0.76rem", marginBottom: 12 }}>
        Eje X = puntaje promedio · Eje Y = dispersión (σ). Dimensiones abajo-izquierda requieren atención urgente.
      </p>
      <div style={{ overflowX: "auto" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", width: "100%", maxWidth: W }}>
          {/* Quadrant fills */}
          <rect x={padL} y={padT} width={xMid - padL} height={yMid - padT} fill="rgba(251,146,60,0.07)" />
          <rect x={xMid} y={padT} width={W - padR - xMid} height={yMid - padT} fill="rgba(212,175,55,0.05)" />
          <rect x={padL} y={yMid} width={xMid - padL} height={H - padB - yMid} fill="rgba(248,113,113,0.10)" />
          <rect x={xMid} y={yMid} width={W - padR - xMid} height={H - padB - yMid} fill="rgba(34,197,94,0.06)" />
          {/* Quadrant labels */}
          <text x={padL + 5} y={padT + 13} fontSize="8" fill="rgba(251,146,60,0.55)" style={{ fontFamily: "Inter,sans-serif" }}>Percepción mixta</text>
          <text x={xMid + 5} y={padT + 13} fontSize="8" fill="rgba(212,175,55,0.55)" style={{ fontFamily: "Inter,sans-serif" }}>Dividida positiva</text>
          <text x={padL + 5} y={H - padB - 5} fontSize="8" fill="rgba(248,113,113,0.65)" style={{ fontFamily: "Inter,sans-serif" }}>⚠ Zona de riesgo</text>
          <text x={xMid + 5} y={H - padB - 5} fontSize="8" fill="rgba(34,197,94,0.55)" style={{ fontFamily: "Inter,sans-serif" }}>✓ Fortaleza</text>
          {/* Threshold lines */}
          <line x1={xMid} y1={padT} x2={xMid} y2={H - padB} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,3" />
          <line x1={padL} y1={yMid} x2={W - padR} y2={yMid} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,3" />
          {/* Axes */}
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          {/* X ticks */}
          {[0, 25, 50, 75, 100].map((v) => (
            <React.Fragment key={v}>
              <line x1={xPos(v)} y1={H - padB} x2={xPos(v)} y2={H - padB + 3} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
              <text x={xPos(v)} y={H - padB + 13} textAnchor="middle" fontSize="8" fill="rgba(148,163,184,0.55)" style={{ fontFamily: "Inter,sans-serif" }}>{v}%</text>
            </React.Fragment>
          ))}
          {/* Y ticks */}
          {[0, 0.5, 1.0, 1.5, 2.0].map((v) => (
            <text key={v} x={padL - 4} y={yPos(v) + 3} textAnchor="end" fontSize="8" fill="rgba(148,163,184,0.55)" style={{ fontFamily: "Inter,sans-serif" }}>{v.toFixed(1)}</text>
          ))}
          {/* Axis labels */}
          <text x={padL + chartW / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="rgba(148,163,184,0.4)" style={{ fontFamily: "Inter,sans-serif" }}>Puntaje (%) →</text>
          <text x={9} y={padT + chartH / 2} textAnchor="middle" fontSize="8" fill="rgba(148,163,184,0.4)" transform={`rotate(-90,9,${padT + chartH / 2})`} style={{ fontFamily: "Inter,sans-serif" }}>σ →</text>
          {/* Points */}
          {points.map(({ dim, pct, sd }) => {
            const x = xPos(pct);
            const y = yPos(sd);
            return (
              <g key={dim.key}>
                <circle cx={x} cy={y} r={8} fill={dim.color} opacity={0.85} stroke="rgba(7,27,51,0.8)" strokeWidth="1.5">
                  <title>{dim.label}: {pct}% · σ {sd.toFixed(2)}</title>
                </circle>
                <text x={x} y={y - 11} textAnchor="middle" fontSize="8.5" fill={dim.color} fontWeight="700" style={{ fontFamily: "Inter,sans-serif" }}>
                  {dim.shortLabel.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: "0.7rem", color: "var(--muted)", marginTop: 8 }}>
        {[["rgba(248,113,113,0.18)", "Riesgo (bajo puntaje + alta polarización)"], ["rgba(34,197,94,0.14)", "Fortaleza (alto puntaje + baja polarización)"]].map(([bg, label]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: bg }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopQuestions({ responses }: { responses: SurveyResponse[] }) {
  const qData = useMemo(() => {
    if (responses.length === 0) return [];
    return QUESTIONS.map((q) => {
      let sum = 0, count = 0;
      for (const r of responses) {
        const v = r.answers[q.id];
        if (v !== undefined) { sum += v; count++; }
      }
      const avg = count === 0 ? 0 : sum / count;
      const pct = count === 0 ? 0 : Math.round((avg / 5) * 100);
      const dim = DIMENSIONS.find((d) => d.key === q.dimension)!;
      return { q, avg: Math.round(avg * 10) / 10, pct, dim };
    });
  }, [responses]);

  if (qData.length === 0) return null;

  const sorted = [...qData].sort((a, b) => a.pct - b.pct);
  const critical = sorted.slice(0, 3);
  const strong = sorted.slice(-3).reverse();

  function QCard({ item, type }: { item: typeof critical[0]; type: "critical" | "strong" }) {
    const accent = type === "critical" ? "#f87171" : "#22c55e";
    return (
      <div className="top-q-card" style={{ borderLeftColor: accent }}>
        <div className="top-q-header">
          <span className="top-q-badge" style={{ background: item.dim.color + "22", color: item.dim.color, border: `1px solid ${item.dim.color}44` }}>
            {item.dim.shortLabel}
          </span>
          <span className="top-q-num" style={{ color: "var(--muted)" }}>P{item.q.id}</span>
          <span className="top-q-score" style={{ color: accent, marginLeft: "auto" }}>{item.avg}/5</span>
        </div>
        <p className="top-q-text">{item.q.text}</p>
        <div className="score-bar-track" style={{ marginTop: 6 }}>
          <div className="score-bar-fill" style={{ width: `${item.pct}%`, background: accent }} />
        </div>
      </div>
    );
  }

  return (
    <div className="breakdown-card">
      <h2>Preguntas Críticas y Fortalezas</h2>
      <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginBottom: 16 }}>
        Las 3 preguntas con mayor oportunidad de mejora y las 3 más consolidadas, sobre {QUESTIONS.length} preguntas totales.
      </p>
      <div className="top-q-grid">
        <div>
          <p className="top-q-section-label" style={{ color: "#f87171" }}>🚨 Atención prioritaria</p>
          <div className="top-q-list">
            {critical.map((item) => <QCard key={item.q.id} item={item} type="critical" />)}
          </div>
        </div>
        <div>
          <p className="top-q-section-label" style={{ color: "#22c55e" }}>⭐ Fortalezas confirmadas</p>
          <div className="top-q-list">
            {strong.map((item) => <QCard key={item.q.id} item={item} type="strong" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Valores de referencia por sector (LATAM, fuentes: SHRM, Aon, Gallup adaptado)
const SECTOR_BENCHMARKS: Record<string, { label: string; values: Record<string, number> }> = {
  general:      { label: "General (Latinoamérica)",      values: { liderazgo: 67, comunicacion: 63, trabajo_en_equipo: 70, motivacion: 62, condiciones_seguridad: 69, desarrollo_crecimiento: 58 } },
  manufactura:  { label: "Manufactura",                  values: { liderazgo: 64, comunicacion: 59, trabajo_en_equipo: 68, motivacion: 60, condiciones_seguridad: 72, desarrollo_crecimiento: 55 } },
  retail:       { label: "Comercio / Retail",            values: { liderazgo: 65, comunicacion: 65, trabajo_en_equipo: 71, motivacion: 63, condiciones_seguridad: 67, desarrollo_crecimiento: 57 } },
  tecnologia:   { label: "Tecnología",                   values: { liderazgo: 72, comunicacion: 68, trabajo_en_equipo: 74, motivacion: 70, condiciones_seguridad: 71, desarrollo_crecimiento: 69 } },
  salud:        { label: "Salud",                        values: { liderazgo: 66, comunicacion: 62, trabajo_en_equipo: 69, motivacion: 64, condiciones_seguridad: 75, desarrollo_crecimiento: 60 } },
  educacion:    { label: "Educación",                    values: { liderazgo: 68, comunicacion: 66, trabajo_en_equipo: 72, motivacion: 65, condiciones_seguridad: 68, desarrollo_crecimiento: 62 } },
  servicios:    { label: "Servicios profesionales",      values: { liderazgo: 66, comunicacion: 64, trabajo_en_equipo: 70, motivacion: 62, condiciones_seguridad: 68, desarrollo_crecimiento: 57 } },
  construccion: { label: "Construcción",                 values: { liderazgo: 63, comunicacion: 58, trabajo_en_equipo: 66, motivacion: 59, condiciones_seguridad: 65, desarrollo_crecimiento: 53 } },
};

function ScoreBarWithTarget({ pct, color, target, benchmark }: {
  pct: number; color: string; target?: number; benchmark?: number;
}) {
  if (target == null && benchmark == null) return <ScoreBar pct={pct} color={color} />;
  return (
    <div style={{ position: "relative" }}>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      {benchmark != null && (
        <div className="benchmark-line" style={{ left: `${benchmark}%` }} title={`Benchmark sectorial: ${benchmark}%`} />
      )}
      {target != null && (
        <div className="target-line" style={{ left: `${target}%` }} title={`Meta: ${target}%`} />
      )}
    </div>
  );
}

export function PeriodDashboard({
  responses,
  periodoLabel,
  empresaNombre,
  totalColaboradores,
  targets,
  sectorKey,
  prevResponses,
  prevLabel,
  savedPlan,
  onSavePlan,
  onBack,
}: {
  responses: SurveyResponse[];
  periodoLabel: string;
  empresaNombre?: string;
  totalColaboradores?: number | null;
  targets?: Partial<Record<string, number>>;
  sectorKey?: string;
  prevResponses?: SurveyResponse[];
  prevLabel?: string;
  savedPlan?: ActionRow[] | null;
  onSavePlan?: (rows: ActionRow[]) => Promise<void>;
  onBack?: () => void;
}) {
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [filterDept, setFilterDept] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [printMode, setPrintMode] = useState(false);

  const dateRange = useMemo(() => {
    if (responses.length === 0) return { min: "", max: "" };
    const dates = responses.map((r) => r.createdAt.slice(0, 10)).sort();
    return { min: dates[0], max: dates[dates.length - 1] };
  }, [responses]);
  const showDateFilter = dateRange.min !== dateRange.max;

  // Expand all collapsible sections, print, then restore the previous state
  function exportPDF() {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 120);
  }

  // All analytics recompute when the department or date filter changes
  const effectiveResponses = useMemo(() => {
    let result = filterDept
      ? responses.filter((r) => (r.department || "Sin especificar") === filterDept)
      : responses;
    if (dateFrom) result = result.filter((r) => r.createdAt.slice(0, 10) >= dateFrom);
    if (dateTo) result = result.filter((r) => r.createdAt.slice(0, 10) <= dateTo);
    return result;
  }, [responses, filterDept, dateFrom, dateTo]);

  const scores: DimScore[] = useMemo(
    () => DIMENSIONS.map((dim) => ({ dim, pct: dimensionAverage(effectiveResponses, dim.key) })),
    [effectiveResponses]
  );
  const globalPct = useMemo(() => globalAverage(effectiveResponses), [effectiveResponses]);

  // Full dept map (always from all responses — used for filter pills, heatmap, overlay)
  const deptResponsesMap = useMemo(() => {
    const map = new Map<string, SurveyResponse[]>();
    for (const r of responses) {
      const key = r.department || "Sin especificar";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [responses]);

  const overlayScores: DimScore[] | undefined = useMemo(() => {
    if (!expandedDept) return undefined;
    const deptResps = deptResponsesMap.get(expandedDept) ?? [];
    return DIMENSIONS.map((dim) => ({ dim, pct: dimensionAverage(deptResps, dim.key) }));
  }, [expandedDept, deptResponsesMap]);

  const sectorData = SECTOR_BENCHMARKS[sectorKey ?? "general"] ?? SECTOR_BENCHMARKS.general;
  const sectorBenchmark = sectorData.values;

  const benchmarkScores: DimScore[] = useMemo(
    () => DIMENSIONS.map((dim) => ({ dim, pct: sectorBenchmark[dim.key] ?? 65 })),
    [sectorKey]
  );

  const prevScores: Map<string, number> | undefined = useMemo(() => {
    if (!prevResponses || prevResponses.length === 0) return undefined;
    return new Map(DIMENSIONS.map((dim) => [dim.key, dimensionAverage(prevResponses, dim.key)]));
  }, [prevResponses]);

  const prevGlobalPct: number | undefined = useMemo(
    () => prevResponses && prevResponses.length > 0 ? globalAverage(prevResponses) : undefined,
    [prevResponses]
  );

  const prevDimScores: DimScore[] | undefined = useMemo(() => {
    if (!prevScores) return undefined;
    return DIMENSIONS.map((dim) => ({ dim, pct: prevScores.get(dim.key) ?? 0 }));
  }, [prevScores]);

  const departments = useMemo(() => {
    const map = new Map<string, SurveyResponse[]>();
    for (const r of responses) {
      const key = r.department || "Sin especificar";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries())
      .map(([name, list]) => ({ name, count: list.length, pct: globalAverage(list) }))
      .sort((a, b) => b.count - a.count);
  }, [responses]);
  const strongest = useMemo(() => [...scores].sort((a, b) => b.pct - a.pct)[0], [scores]);
  const weakest = useMemo(() => [...scores].sort((a, b) => a.pct - b.pct)[0], [scores]);

  return (
    <div className="results-wrap">
      {onBack && (
        <button className="btn-secondary no-print" onClick={onBack} style={{ marginBottom: 20 }}>
          ← Volver
        </button>
      )}

      {/* ── Portada PDF (print-only cover page) ─────────────── */}
      {responses.length > 0 && (
        <div className="pdf-cover">
          <div className="pdf-cover-top">
            <p className="pdf-cover-eyebrow">INFORME DE CLIMA LABORAL</p>
            <h1 className="pdf-cover-company">{empresaNombre || "Empresa"}</h1>
            <p className="pdf-cover-period">{periodoLabel}</p>
            <p className="pdf-cover-date">
              Generado el {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="pdf-cover-score-wrap">
            <div className="pdf-cover-score-circle" style={{ borderColor: scoreLevelColor(globalPct) }}>
              <span className="pdf-cover-score-num" style={{ color: scoreLevelColor(globalPct) }}>{globalPct}%</span>
              <span className="pdf-cover-score-sub">ÍNDICE GLOBAL</span>
            </div>
            <div className="pdf-cover-score-meta">
              <span className="pdf-cover-level" style={{ color: scoreLevelColor(globalPct), borderColor: scoreLevelColor(globalPct) }}>
                {scoreLevelLabel(globalPct)}
              </span>
              <p className="pdf-cover-participants">{responses.length} participante(s) encuestado(s)</p>
              {(sectorKey && sectorKey !== "general") && (
                <p className="pdf-cover-sector">Sector de referencia: {sectorData.label}</p>
              )}
            </div>
          </div>

          <div className="pdf-cover-dims">
            <p className="pdf-cover-dims-title">Resultados por dimensión</p>
            {scores.map(({ dim, pct }) => (
              <div key={dim.key} className="pdf-cover-dim-row">
                <span className="pdf-cover-dim-name">{dim.label}</span>
                <div className="pdf-cover-dim-bar-track">
                  <div className="pdf-cover-dim-bar-fill" style={{ width: `${pct}%`, background: dim.color }} />
                  <div className="pdf-cover-dim-bm-line" style={{ left: `${sectorBenchmark[dim.key] ?? 65}%` }} />
                </div>
                <span className="pdf-cover-dim-pct">{pct}%</span>
              </div>
            ))}
            <p className="pdf-cover-bm-note">La línea vertical en cada barra indica el benchmark sectorial de referencia.</p>
          </div>

          <div className="pdf-cover-footer">
            <div className="pdf-cover-footer-sep" />
            <p>Diagnóstico elaborado con <strong>Simulador de Clima Laboral · Cenvit GTH</strong></p>
            <p className="pdf-cover-confidential">DOCUMENTO CONFIDENCIAL · Uso exclusivo del área de Recursos Humanos</p>
          </div>
        </div>
      )}

      <div className="results-header" id="sec-resumen">
        {empresaNombre && <p className="eyebrow gold">{empresaNombre}</p>}
        <h1 className="results-title">Resultados · {periodoLabel}</h1>
        <p className="results-meta">
          {responses.length} participante(s)
          {prevLabel && (
            <span style={{ marginLeft: 10, fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>
              · comparando con {prevLabel}
            </span>
          )}
        </p>
      </div>

      {responses.length > 0 && (
        <nav className="section-nav no-print" aria-label="Secciones">
          {[
            ["sec-resumen", "Resumen"],
            ...(showDateFilter ? [["sec-tendencia", "Tendencia"]] : []),
            ["sec-dimensiones", "Dimensiones"],
            ["sec-riesgo", "Riesgo"],
            ...(departments.length > 0 ? [["sec-departamentos", "Departamentos"]] : []),
            ["sec-preguntas", "Preguntas"],
            ["sec-plan", "Plan"],
          ].map(([id, label]) => (
            <button
              key={id}
              className="section-nav-pill"
              onClick={() => document.getElementById(id as string)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {responses.length === 0 && (
        <div className="empty-state">
          <div className="big">📭</div>
          <p>Aún no hay respuestas registradas en este período.</p>
          {onBack && (
            <button className="btn-secondary" onClick={onBack} style={{ marginTop: 20 }}>← Volver</button>
          )}
        </div>
      )}

      {responses.length > 0 && departments.length > 1 && (
        <div className="dept-filter-bar no-print">
          <span className="dept-filter-label">Filtrar por departamento:</span>
          <div className="dept-filter-pills">
            <button
              className={`dept-filter-pill${!filterDept ? " active" : ""}`}
              onClick={() => { setFilterDept(""); setExpandedDept(null); }}
            >
              Toda la empresa
            </button>
            {departments.map((d) => (
              <button
                key={d.name}
                className={`dept-filter-pill${filterDept === d.name ? " active" : ""}`}
                onClick={() => { setFilterDept(filterDept === d.name ? "" : d.name); setExpandedDept(null); }}
                title={`${d.count} respuesta(s)`}
              >
                {d.name}
                {filterDept === d.name && " ×"}
              </button>
            ))}
          </div>
        </div>
      )}

      {responses.length > 0 && showDateFilter && (
        <div className="date-filter-bar no-print">
          <span className="dept-filter-label">Filtrar por fecha:</span>
          <div className="date-filter-row">
            {(() => {
              const allDates = [...responses].map((r) => r.createdAt.slice(0, 10)).sort();
              const mid = allDates[Math.floor(allDates.length / 2)];
              const midPrev = allDates[Math.floor(allDates.length / 2) - 1];
              return (
                <>
                  <button
                    className={`dept-filter-pill${dateFrom === dateRange.min && dateTo === midPrev ? " active" : ""}`}
                    style={{ fontSize: "0.72rem", padding: "4px 10px" }}
                    onClick={() => { setDateFrom(dateRange.min); setDateTo(midPrev); }}
                    title={`${dateRange.min} → ${midPrev}`}
                  >1ª mitad</button>
                  <button
                    className={`dept-filter-pill${dateFrom === mid && dateTo === dateRange.max ? " active" : ""}`}
                    style={{ fontSize: "0.72rem", padding: "4px 10px" }}
                    onClick={() => { setDateFrom(mid); setDateTo(dateRange.max); }}
                    title={`${mid} → ${dateRange.max}`}
                  >2ª mitad</button>
                  <span style={{ color: "rgba(255,255,255,0.15)", margin: "0 2px" }}>|</span>
                </>
              );
            })()}
            <input
              className="org-input date-filter-input"
              type="date"
              value={dateFrom}
              min={dateRange.min}
              max={dateTo || dateRange.max}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>—</span>
            <input
              className="org-input date-filter-input"
              type="date"
              value={dateTo}
              min={dateFrom || dateRange.min}
              max={dateRange.max}
              onChange={(e) => setDateTo(e.target.value)}
            />
            {(dateFrom || dateTo) && (
              <button
                className="dept-filter-clear"
                style={{ padding: "5px 12px", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 8, fontSize: "0.75rem" }}
                onClick={() => { setDateFrom(""); setDateTo(""); }}
              >
                × Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {responses.length > 0 && (
        <>
          {filterDept && (
            <div className="dept-filter-banner">
              <span>Viendo: <strong>{filterDept}</strong></span>
              <span style={{ color: "var(--muted)" }}>{effectiveResponses.length} respuesta(s)</span>
              <button className="dept-filter-clear" onClick={() => setFilterDept("")}>← Volver a empresa</button>
            </div>
          )}
          {(dateFrom || dateTo) && (
            <div className="dept-filter-banner" style={{ borderColor: "rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.05)" }}>
              <span style={{ color: "var(--gold)" }}>📅 Rango:</span>
              <span>{dateFrom || dateRange.min} → {dateTo || dateRange.max}</span>
              <span style={{ color: "var(--muted)" }}>{effectiveResponses.length} respuesta(s)</span>
              <button className="dept-filter-clear" onClick={() => { setDateFrom(""); setDateTo(""); }}>× Limpiar</button>
            </div>
          )}
          <div className="admin-statbar">
            <div className="stat-card">
              <div className="stat-num" style={{ color: "#38bdf8" }}>{effectiveResponses.length}</div>
              <div className="stat-label">Respuestas{filterDept ? ` · ${filterDept}` : ""}</div>
            </div>
            {!filterDept && totalColaboradores != null && totalColaboradores > 0 && (() => {
              const pct = Math.round((responses.length / totalColaboradores) * 100);
              const col = pct >= 70 ? "#22c55e" : pct >= 40 ? "#d4af37" : "#f87171";
              return (
                <div className="stat-card">
                  <div className="stat-num" style={{ color: col, fontSize: "1.1rem" }}>{pct}%</div>
                  <div className="stat-label">Tasa respuesta ({responses.length}/{totalColaboradores})</div>
                </div>
              );
            })()}
            <div className="stat-card">
              <div className="stat-num" style={{ color: scoreLevelColor(globalPct) }}>{globalPct}%</div>
              <div className="stat-label">Índice global</div>
              {prevGlobalPct != null && !filterDept && (() => {
                const d = globalPct - prevGlobalPct;
                return (
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, marginTop: 4, color: d > 0 ? "#22c55e" : d < 0 ? "#f87171" : "var(--muted)" }}>
                    {d > 0 ? "▲" : d < 0 ? "▼" : "="} {d > 0 ? "+" : ""}{d} pts vs {prevLabel}
                  </div>
                );
              })()}
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: strongest?.dim.color, fontSize: "1.05rem", paddingTop: 6 }}>
                {strongest?.dim.shortLabel}
              </div>
              <div className="stat-label">Más fuerte ({strongest?.pct}%)</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: weakest?.dim.color, fontSize: "1.05rem", paddingTop: 6 }}>
                {weakest?.dim.shortLabel}
              </div>
              <div className="stat-label">Más débil ({weakest?.pct}%)</div>
            </div>
          </div>

          {/* ── Alertas contextuales inteligentes ───────────────── */}
          {(() => {
            type AlertType = "danger" | "warning" | "success" | "info";
            const alerts: Array<{ type: AlertType; text: string }> = [];

            // Dimensiones críticas
            const criticalDims = scores.filter((s) => s.pct < 60);
            if (criticalDims.length >= 2) {
              alerts.push({ type: "danger", text: `🚨 ${criticalDims.length} dimensiones en zona crítica (${criticalDims.map((s) => s.dim.shortLabel).join(", ")}) — revisa el plan de acción` });
            } else if (criticalDims.length === 1) {
              alerts.push({ type: "warning", text: `⚠️ ${criticalDims[0].dim.label} en zona crítica (${criticalDims[0].pct}%) — prioriza acciones de mejora` });
            }

            // Baja participación
            if (!filterDept && totalColaboradores && totalColaboradores > 0) {
              const partPct = (effectiveResponses.length / totalColaboradores) * 100;
              if (partPct < 30) {
                alerts.push({ type: "warning", text: `⚠️ Tasa de respuesta muy baja (${Math.round(partPct)}%) — los resultados pueden no ser representativos` });
              }
            }

            // Alta polarización (σ > 1.4 en alguna dimensión)
            const polarized = scores.filter((s) => {
              const ids = QUESTIONS.filter((q) => q.dimension === s.dim.key).map((q) => q.id);
              let sm = 0, sm2 = 0, cnt = 0;
              for (const r of effectiveResponses) {
                for (const qid of ids) {
                  const v = r.answers[qid];
                  if (v !== undefined) { sm += v; sm2 += v * v; cnt++; }
                }
              }
              if (cnt < 5) return false;
              const mean = sm / cnt;
              return Math.sqrt(sm2 / cnt - mean * mean) > 1.4;
            });
            if (polarized.length >= 2) {
              alerts.push({ type: "info", text: `⚡ Opiniones polarizadas en ${polarized.map((s) => s.dim.shortLabel).join(", ")} — complementa con entrevistas o focus groups` });
            }

            // Superación del benchmark
            const aboveBm = scores.filter((s) => s.pct >= (sectorBenchmark[s.dim.key] ?? 65)).length;
            if (aboveBm >= 5) {
              alerts.push({ type: "success", text: `✅ ${aboveBm} de 6 dimensiones superan el benchmark sectorial — organización con clima sólido` });
            }

            // Evolución vs período anterior
            if (prevGlobalPct != null && !filterDept) {
              const delta = globalPct - prevGlobalPct;
              if (delta >= 5) {
                alerts.push({ type: "success", text: `📈 Mejora significativa: +${delta} pts respecto a ${prevLabel}` });
              } else if (delta <= -5) {
                alerts.push({ type: "warning", text: `📉 Descenso de ${Math.abs(delta)} pts respecto a ${prevLabel} — analiza los factores de riesgo` });
              }
            }

            if (alerts.length === 0) return null;
            return (
              <div className="alert-chips-row no-print">
                {alerts.map((a, i) => (
                  <div key={i} className={`alert-chip alert-chip-${a.type}`}>{a.text}</div>
                ))}
              </div>
            );
          })()}

          <div className="global-card">
            <p className="global-label">Índice Global de Clima Laboral</p>
            <div className="global-score" style={{ color: scoreLevelColor(globalPct) }}>{globalPct}%</div>
            <div
              className="level-badge"
              style={{
                background: scoreLevelColor(globalPct) + "22",
                borderColor: scoreLevelColor(globalPct) + "55",
                color: scoreLevelColor(globalPct),
              }}
            >
              {scoreLevelLabel(globalPct)}
            </div>
            <div className="global-bar-track">
              <div className="global-bar-fill" style={{ width: `${globalPct}%`, background: scoreLevelColor(globalPct) }} />
            </div>
            <div className="global-legend">
              <span style={{ color: "#f87171" }}>0–59% Crítico</span>
              <span style={{ color: "#d4af37" }}>60–79% Regular</span>
              <span style={{ color: "#22c55e" }}>80–100% Bueno</span>
            </div>
            <RespondentHistogram responses={effectiveResponses} />
            {(() => {
              const enps = computeENPS(effectiveResponses);
              if (!enps) return null;
              return (
                <div className="enps-block">
                  <div className="enps-header">
                    <span className="enps-label">eNPS Adaptado</span>
                    <span className="enps-score" style={{ color: enps.score >= 20 ? "#22c55e" : enps.score >= 0 ? "#d4af37" : "#f87171" }}>
                      {enps.score >= 0 ? "+" : ""}{enps.score}
                    </span>
                  </div>
                  <div className="enps-bar">
                    <div style={{ width: `${enps.pctDetractors}%`, background: "#f87171" }} title={`Detractores: ${enps.pctDetractors}%`} />
                    <div style={{ width: `${enps.pctNeutral}%`, background: "#94a3b8" }} title={`Neutros: ${enps.pctNeutral}%`} />
                    <div style={{ width: `${enps.pctPromoters}%`, background: "#22c55e" }} title={`Promotores: ${enps.pctPromoters}%`} />
                  </div>
                  <div className="enps-legend">
                    <span style={{ color: "#f87171" }}>Det. {enps.pctDetractors}%</span>
                    <span style={{ color: "var(--muted)" }}>Neutros {enps.pctNeutral}%</span>
                    <span style={{ color: "#22c55e" }}>Prom. {enps.pctPromoters}%</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── Indicadores compuestos ───────────────────────── */}
          {(() => {
            const get = (key: string) => scores.find((s) => s.dim.key === key)?.pct ?? 0;
            const composites = [
              {
                label: "Engagement",
                icon: "🔥",
                pct: Math.round((get("motivacion") + get("desarrollo_crecimiento") + get("liderazgo")) / 3),
                desc: "Motivación · Desarrollo · Liderazgo",
                tooltip: "Mide el nivel de compromiso activo, impulso de crecimiento y confianza en la dirección.",
              },
              {
                label: "Clima Relacional",
                icon: "🤝",
                pct: Math.round((get("comunicacion") + get("trabajo_en_equipo")) / 2),
                desc: "Comunicación · Trabajo en equipo",
                tooltip: "Calidad de las relaciones interpersonales, flujo de información y cohesión de equipos.",
              },
              {
                label: "Bienestar Laboral",
                icon: "🌱",
                pct: Math.round((get("condiciones_seguridad") + get("motivacion")) / 2),
                desc: "Condiciones · Motivación",
                tooltip: "Percepción del entorno físico y emocional de trabajo y el nivel de energía interna.",
              },
            ];
            const turnoverRisk = 100 - Math.round((get("motivacion") * 0.40 + get("desarrollo_crecimiento") * 0.35 + get("liderazgo") * 0.25));
            const riskLabel = turnoverRisk >= 50 ? "Alto" : turnoverRisk >= 30 ? "Moderado" : "Bajo";
            const riskColor = turnoverRisk >= 50 ? "#f87171" : turnoverRisk >= 30 ? "#d4af37" : "#22c55e";
            return (
              <div className="composite-wrap">
                <div className="composite-row">
                  {composites.map((c) => {
                    const levelColor = scoreLevelColor(c.pct);
                    const levelLabel = scoreLevelLabel(c.pct);
                    return (
                      <div key={c.label} className="composite-card" title={c.tooltip}>
                        <div className="composite-icon">{c.icon}</div>
                        <div className="composite-score" style={{ color: levelColor }}>{c.pct}%</div>
                        <div className="composite-label">{c.label}</div>
                        <span className="composite-level" style={{ color: levelColor, borderColor: levelColor + "44", background: levelColor + "14" }}>
                          {levelLabel}
                        </span>
                        <div className="composite-desc">{c.desc}</div>
                      </div>
                    );
                  })}
                  <div className="composite-card composite-risk" title="Índice inverso basado en motivación, desarrollo y liderazgo.">
                    <div className="composite-icon">📊</div>
                    <div className="composite-score" style={{ color: riskColor }}>{riskLabel}</div>
                    <div className="composite-label">Riesgo Rotación</div>
                    <span className="composite-level" style={{ color: riskColor, borderColor: riskColor + "44", background: riskColor + "14" }}>
                      {turnoverRisk}%
                    </span>
                    <div className="composite-desc">Estimado según engagement</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {!filterDept && <div id="sec-tendencia"><ParticipationTrend responses={responses} /></div>}

          <ExecutiveSummary
            responses={effectiveResponses}
            periodoLabel={filterDept ? `${periodoLabel} · ${filterDept}` : periodoLabel}
            empresaNombre={empresaNombre}
            scores={scores}
            globalPct={globalPct}
            departments={filterDept ? [] : departments}
            forceOpen={printMode}
          />

          <div className="chart-grid" id="sec-dimensiones">
            <div className="radar-card">
              <h2>
                Perfil por Dimensión
                {expandedDept && <span style={{ color: "#d4af37", fontSize: "0.8rem", fontWeight: 600, marginLeft: 10 }}>+ {expandedDept}</span>}
              </h2>
              <div className="radar-wrap"><RadarChart scores={scores} overlay={overlayScores} prevOverlay={!expandedDept ? prevDimScores : undefined} benchmark={expandedDept ? undefined : benchmarkScores} /></div>
            </div>
            <div className="breakdown-card">
              <h2 style={{ marginBottom: 6 }}>Promedio por Dimensión</h2>
              {(() => {
                const above = scores.filter(({ dim, pct }) => pct >= (sectorBenchmark[dim.key] ?? 65)).length;
                return (
                  <p className="benchmark-summary">
                    Benchmark <strong style={{ color: "rgba(148,163,184,0.8)" }}>{sectorData.label}</strong>:{" "}
                    <strong style={{ color: above > scores.length / 2 ? "#86efac" : "#fde68a" }}>{above}/{scores.length}</strong> dimensiones por encima
                  </p>
                );
              })()}
              <div className="breakdown-list">
                {scores.map(({ dim, pct }) => {
                  const target = targets?.[dim.key];
                  const bm = sectorBenchmark[dim.key];
                  const gap = target != null ? pct - target : null;
                  const prev = !filterDept ? prevScores?.get(dim.key) : undefined;
                  const prevDelta = prev != null ? pct - prev : null;
                  return (
                    <div key={dim.key} className="breakdown-item">
                      <div className="breakdown-header">
                        <span className="breakdown-name" style={{ color: dim.color }}>{dim.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {prevDelta != null && (
                            <span style={{
                              fontSize: "0.69rem", fontWeight: 800, padding: "1px 6px", borderRadius: 999,
                              background: prevDelta > 0 ? "rgba(34,197,94,0.12)" : prevDelta < 0 ? "rgba(248,113,113,0.12)" : "rgba(148,163,184,0.1)",
                              color: prevDelta > 0 ? "#22c55e" : prevDelta < 0 ? "#f87171" : "var(--muted)",
                              border: `1px solid ${prevDelta > 0 ? "rgba(34,197,94,0.3)" : prevDelta < 0 ? "rgba(248,113,113,0.3)" : "rgba(148,163,184,0.2)"}`,
                              whiteSpace: "nowrap",
                            }}>
                              {prevDelta > 0 ? "▲ +" : prevDelta < 0 ? "▼ " : "= "}{prevDelta} pts
                            </span>
                          )}
                          {bm != null && (
                            <span style={{ fontSize: "0.69rem", fontWeight: 700, color: pct >= bm ? "rgba(134,239,172,0.75)" : "rgba(252,165,165,0.75)" }}>
                              Ref.{bm}%{pct >= bm ? " ↑" : " ↓"}
                            </span>
                          )}
                          {gap != null && (
                            <span
                              className="target-gap"
                              style={{
                                color: gap >= 0 ? "#22c55e" : "#f87171",
                                borderColor: (gap >= 0 ? "#22c55e" : "#f87171") + "44",
                                background: (gap >= 0 ? "rgba(34,197,94," : "rgba(248,113,113,") + "0.08)",
                              }}
                            >
                              Meta {target}% · {gap > 0 ? "+" : ""}{gap} pts
                            </span>
                          )}
                          <span className="breakdown-pct" style={{ color: scoreLevelColor(pct) }}>
                            {pct}% — {scoreLevelLabel(pct)}
                          </span>
                        </div>
                      </div>
                      <ScoreBarWithTarget pct={pct} color={dim.color} target={target} benchmark={bm} />
                      <DimDistribution responses={effectiveResponses} dimKey={dim.key} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: "0.69rem", color: "var(--muted)", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ display: "inline-block", width: 16, height: 0, borderTop: "2px dotted rgba(148,163,184,0.65)" }} />
                  Benchmark sectorial
                </span>
                {Object.keys(targets ?? {}).length > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ display: "inline-block", width: 16, height: 0, borderTop: "2px dashed rgba(212,175,55,0.9)" }} />
                    Meta configurada
                  </span>
                )}
              </div>
            </div>
          </div>

          <div id="sec-riesgo"><RiskMatrix responses={effectiveResponses} /></div>

          {!filterDept && departments.length > 0 && (
            <div className="breakdown-card" id="sec-departamentos">
              <h2>
                Resultados por Departamento
                <span style={{ color: "var(--muted)", fontSize: "0.75rem", fontWeight: 400, marginLeft: 10 }}>
                  Haz clic en una fila para ver el detalle por dimensión
                </span>
              </h2>
              <div className="matrix-scroll">
                <table className="dept-table">
                  <thead>
                    <tr>
                      <th>Departamento</th>
                      <th>Participantes</th>
                      <th>Índice global</th>
                      <th>Nivel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d) => {
                      const isExpanded = expandedDept === d.name;
                      return (
                        <React.Fragment key={d.name}>
                          <tr
                            className="dept-row-clickable"
                            onClick={() => setExpandedDept(isExpanded ? null : d.name)}
                          >
                            <td style={{ fontWeight: 700 }}>
                              <span className="dept-expand-icon">{isExpanded ? "▼" : "▶"}</span>
                              {d.name}
                            </td>
                            <td>{d.count}</td>
                            <td style={{ color: scoreLevelColor(d.pct), fontWeight: 700 }}>{d.pct}%</td>
                            <td>{scoreLevelLabel(d.pct)}</td>
                          </tr>
                          {isExpanded && (
                            <tr className="dept-drill-tr">
                              <td colSpan={4} style={{ padding: 0 }}>
                                <DeptDrillDown
                                  deptName={d.name}
                                  deptResponses={deptResponsesMap.get(d.name) ?? []}
                                  globalScores={scores}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!filterDept && departments.length >= 2 && (
            <DeptHeatmap
              departments={departments}
              deptResponsesMap={deptResponsesMap}
              scores={scores}
              globalPct={globalPct}
            />
          )}

          <CorrelationMatrix responses={effectiveResponses} />

          {/* ── Recomendaciones por dimensión ─────────────── */}
          <div className="recs-section">
            <h2>Recomendaciones por Dimensión</h2>
            <div className="recs-grid">
              {scores.map(({ dim, pct }) => {
                const level = scoreLevel(pct);
                return (
                  <div key={dim.key} className="rec-card" style={{ borderLeftColor: dim.color, background: dim.colorSoft + "55" }}>
                    <div className="rec-header">
                      <span className="rec-dim" style={{ color: dim.color }}>{dim.label}</span>
                      <span className="rec-badge" style={{ background: scoreLevelColor(pct) + "22", color: scoreLevelColor(pct), border: `1px solid ${scoreLevelColor(pct)}44` }}>
                        {pct}% · {scoreLevelLabel(pct)}
                      </span>
                    </div>
                    <p className="rec-text">{dim.recommendation[level]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div id="sec-preguntas"><TopQuestions responses={effectiveResponses} /></div>

          <QuestionAnalysis responses={effectiveResponses} forceOpen={printMode} />

          <CommentsSection responses={effectiveResponses} forceOpen={printMode} />

          <div id="sec-plan"><ActionMatrix scores={scores} initialRows={savedPlan} onSave={onSavePlan} /></div>

          <div className="results-actions no-print">
            <button className="btn-export" onClick={exportPDF}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Exportar PDF
            </button>
            <button
              className="btn-export"
              style={{ borderColor: "rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.08)", color: "#22c55e" }}
              onClick={() => exportCSV(responses, periodoLabel)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar CSV
            </button>
            {onBack && (
              <button className="btn-secondary" onClick={onBack}>← Volver</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
