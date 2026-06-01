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
      for (const r of responses) {
        const v = r.answers[q.id];
        if (v !== undefined) { sum += v; count++; }
      }
      const avg = count === 0 ? 0 : sum / count;
      return { q, avg: Math.round(avg * 10) / 10, pct: count === 0 ? 0 : Math.round((avg / 5) * 100) };
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
              {questions.map(({ q, avg, pct }) => (
                <div key={q.id} className="q-row">
                  <div className="q-row-num" style={{ color: dim.color }}>P{q.id}</div>
                  <div className="q-row-text">{q.text}</div>
                  <div className="q-row-bar">
                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{ width: `${pct}%`, background: scoreLevelColor(pct) }} />
                    </div>
                  </div>
                  <div className="q-row-score" style={{ color: scoreLevelColor(pct) }}>
                    {avg}/5
                  </div>
                </div>
              ))}
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
            <div key={dim.key} className="dept-drill-row">
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

function CommentsSection({ responses, forceOpen }: { responses: SurveyResponse[]; forceOpen?: boolean }) {
  const [openState, setOpen] = useState(false);
  const open = openState || !!forceOpen;
  const comments = useMemo(
    () => responses
      .filter((r) => r.comment && r.comment.trim())
      .map((r) => ({ text: r.comment!.trim(), department: r.department, createdAt: r.createdAt })),
    [responses]
  );

  if (comments.length === 0) return null;

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
        <div className="comments-list">
          {comments.map((c, i) => (
            <div key={i} className="comment-item">
              <p className="comment-text">"{c.text}"</p>
              <p className="comment-meta">— {c.department}</p>
            </div>
          ))}
        </div>
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

export function PeriodDashboard({
  responses,
  periodoLabel,
  empresaNombre,
  totalColaboradores,
  savedPlan,
  onSavePlan,
  onBack,
}: {
  responses: SurveyResponse[];
  periodoLabel: string;
  empresaNombre?: string;
  totalColaboradores?: number | null;
  savedPlan?: ActionRow[] | null;
  onSavePlan?: (rows: ActionRow[]) => Promise<void>;
  onBack?: () => void;
}) {
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [filterDept, setFilterDept] = useState<string>("");
  const [printMode, setPrintMode] = useState(false);

  // Expand all collapsible sections, print, then restore the previous state
  function exportPDF() {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 120);
  }

  // All analytics recompute when the department filter changes
  const effectiveResponses = useMemo(
    () => filterDept ? responses.filter((r) => (r.department || "Sin especificar") === filterDept) : responses,
    [responses, filterDept]
  );

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

      <div className="results-header">
        {empresaNombre && <p className="eyebrow gold">{empresaNombre}</p>}
        <h1 className="results-title">Resultados · {periodoLabel}</h1>
        <p className="results-meta">{responses.length} participante(s)</p>
      </div>

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

      {responses.length > 0 && (
        <>
          {filterDept && (
            <div className="dept-filter-banner">
              <span>Viendo: <strong>{filterDept}</strong></span>
              <span style={{ color: "var(--muted)" }}>{effectiveResponses.length} respuesta(s)</span>
              <button className="dept-filter-clear" onClick={() => setFilterDept("")}>← Volver a empresa</button>
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
          </div>

          <ExecutiveSummary
            responses={effectiveResponses}
            periodoLabel={filterDept ? `${periodoLabel} · ${filterDept}` : periodoLabel}
            empresaNombre={empresaNombre}
            scores={scores}
            globalPct={globalPct}
            departments={filterDept ? [] : departments}
            forceOpen={printMode}
          />

          <div className="chart-grid">
            <div className="radar-card">
              <h2>
                Perfil por Dimensión
                {expandedDept && <span style={{ color: "#d4af37", fontSize: "0.8rem", fontWeight: 600, marginLeft: 10 }}>+ {expandedDept}</span>}
              </h2>
              <div className="radar-wrap"><RadarChart scores={scores} overlay={overlayScores} /></div>
            </div>
            <div className="breakdown-card">
              <h2>Promedio por Dimensión</h2>
              <div className="breakdown-list">
                {scores.map(({ dim, pct }) => (
                  <div key={dim.key} className="breakdown-item">
                    <div className="breakdown-header">
                      <span className="breakdown-name" style={{ color: dim.color }}>{dim.label}</span>
                      <span className="breakdown-pct" style={{ color: scoreLevelColor(pct) }}>
                        {pct}% — {scoreLevelLabel(pct)}
                      </span>
                    </div>
                    <ScoreBar pct={pct} color={dim.color} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!filterDept && departments.length > 0 && (
            <div className="breakdown-card">
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

          <QuestionAnalysis responses={effectiveResponses} forceOpen={printMode} />

          <CommentsSection responses={effectiveResponses} forceOpen={printMode} />

          <ActionMatrix scores={scores} initialRows={savedPlan} onSave={onSavePlan} />

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
