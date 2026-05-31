import React, { useMemo, useState } from "react";
import { DIMENSIONS, LIKERT_LABELS, QUESTIONS } from "./questions";
import type { Answers, DimensionConfig, LikertValue } from "./types";

type Screen = "home" | "survey" | "results";

const QUESTIONS_PER_DIMENSION = 5;
const MAX_SCORE_PER_DIMENSION = QUESTIONS_PER_DIMENSION * 5;

function scoreLevel(pct: number): "high" | "medium" | "low" {
  if (pct >= 80) return "high";
  if (pct >= 60) return "medium";
  return "low";
}

function scoreLevelLabel(pct: number): string {
  if (pct >= 80) return "Bueno";
  if (pct >= 60) return "Regular";
  return "Crítico";
}

function scoreLevelColor(pct: number): string {
  if (pct >= 80) return "#22c55e";
  if (pct >= 60) return "#d4af37";
  return "#f87171";
}

// ──────────────────────────────────────────────────────────────────────────────
// SVG Radar Chart (4 axes: top, right, bottom, left)
// ──────────────────────────────────────────────────────────────────────────────
function RadarChart({ scores }: { scores: { dim: DimensionConfig; pct: number }[] }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  const n = scores.length;

  function axisAngle(i: number): number {
    return (i * (2 * Math.PI)) / n - Math.PI / 2;
  }

  function polarToXY(i: number, scale: number): { x: number; y: number } {
    const angle = axisAngle(i);
    return { x: cx + r * scale * Math.cos(angle), y: cy + r * scale * Math.sin(angle) };
  }

  const rings = [0.25, 0.5, 0.75, 1];

  const ringPath = (scale: number) =>
    scores
      .map((_, i) => {
        const p = polarToXY(i, scale);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  const dataPath =
    scores
      .map((s, i) => {
        const p = polarToXY(i, s.pct / 100);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  const labelOffset = 28;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {/* Rings */}
      {rings.map((scale) => (
        <path
          key={scale}
          d={ringPath(scale)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {scores.map((_, i) => {
        const outer = polarToXY(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data fill */}
      <path d={dataPath} fill="rgba(56,189,248,0.18)" stroke="#38bdf8" strokeWidth="2" />

      {/* Data points */}
      {scores.map((s, i) => {
        const p = polarToXY(i, s.pct / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={5} fill={s.dim.color} stroke="white" strokeWidth="1.5" />;
      })}

      {/* Labels */}
      {scores.map((s, i) => {
        const angle = axisAngle(i);
        const lx = cx + (r + labelOffset) * Math.cos(angle);
        const ly = cy + (r + labelOffset) * Math.sin(angle);
        const anchor =
          Math.abs(Math.cos(angle)) < 0.1
            ? "middle"
            : Math.cos(angle) > 0
              ? "start"
              : "end";
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="700"
            fill={s.dim.color}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {s.dim.shortLabel}
          </text>
        );
      })}

      {/* Ring labels (25%, 50%, 75%, 100%) */}
      {rings.map((scale) => (
        <text
          key={scale}
          x={cx + 4}
          y={cy - r * scale + 3}
          fontSize="8"
          fill="rgba(255,255,255,0.3)"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {scale * 100}%
        </text>
      ))}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Bar indicator
// ──────────────────────────────────────────────────────────────────────────────
function ScoreBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 999,
          background: color,
          transition: "width 0.8s ease",
        }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main App
// ──────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [orgName, setOrgName] = useState("");
  const [dimensionIndex, setDimensionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const currentDimension = DIMENSIONS[dimensionIndex];
  const currentQuestions = QUESTIONS.filter((q) => q.dimension === currentDimension.key);

  const currentAnswered = currentQuestions.every((q) => answers[q.id] !== undefined);
  const totalAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);

  const results = useMemo(() => {
    return DIMENSIONS.map((dim) => {
      const dimQuestions = QUESTIONS.filter((q) => q.dimension === dim.key);
      const total = dimQuestions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
      const pct = Math.round((total / MAX_SCORE_PER_DIMENSION) * 100);
      return { dim, total, pct };
    });
  }, [answers]);

  const globalPct = useMemo(() => {
    const total = QUESTIONS.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    return Math.round((total / (QUESTIONS.length * 5)) * 100);
  }, [answers]);

  function setAnswer(questionId: number, value: LikertValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function startSurvey() {
    setAnswers({});
    setDimensionIndex(0);
    setScreen("survey");
  }

  function goNextDimension() {
    if (dimensionIndex < DIMENSIONS.length - 1) {
      setDimensionIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setScreen("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goPrevDimension() {
    if (dimensionIndex > 0) {
      setDimensionIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function restart() {
    setAnswers({});
    setDimensionIndex(0);
    setScreen("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="shell">
      <style>{css}</style>

      <div className="container">
        {/* ── HOME ───────────────────────────────────────────────────────── */}
        {screen === "home" && (
          <>
            <header className="hero">
              <div className="hero-badge">Diagnóstico Organizacional</div>
              <h1>Medidor de Clima Laboral</h1>
              <p className="hero-sub">
                Evalúa las 4 dimensiones clave del ambiente de trabajo en tu organización mediante{" "}
                <strong>20 preguntas</strong> con escala Likert 1–5.
              </p>

              <div className="dimensions-preview">
                {DIMENSIONS.map((d) => (
                  <div key={d.key} className="dim-chip" style={{ borderColor: d.color, color: d.color }}>
                    {d.label}
                  </div>
                ))}
              </div>

              <div className="org-input-wrap">
                <label className="org-label">Nombre de la organización (opcional)</label>
                <input
                  className="org-input"
                  type="text"
                  placeholder="Ej. Batallón de Ingeniería n.º 1"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <button className="btn-primary" onClick={startSurvey}>
                Comenzar evaluación →
              </button>
            </header>

            <div className="info-grid">
              {DIMENSIONS.map((d) => (
                <div key={d.key} className="info-card" style={{ borderTopColor: d.color }}>
                  <p className="info-label" style={{ color: d.color }}>{d.label}</p>
                  <p className="info-desc">{d.description}</p>
                </div>
              ))}
            </div>

            <div className="how-card">
              <h2>¿Cómo funciona?</h2>
              <div className="steps">
                <div className="step">
                  <span className="step-num">1</span>
                  <p>Responde las 20 afirmaciones según tu experiencia real en el trabajo.</p>
                </div>
                <div className="step">
                  <span className="step-num">2</span>
                  <p>Usa la escala del 1 (totalmente en desacuerdo) al 5 (totalmente de acuerdo).</p>
                </div>
                <div className="step">
                  <span className="step-num">3</span>
                  <p>Obtén un informe con puntajes, gráfico radar y recomendaciones de mejora.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── SURVEY ─────────────────────────────────────────────────────── */}
        {screen === "survey" && (
          <div className="survey-wrap">
            {/* Progress header */}
            <div className="survey-header">
              <div>
                <p className="eyebrow" style={{ color: currentDimension.color }}>
                  Dimensión {dimensionIndex + 1} de {DIMENSIONS.length}
                </p>
                <h2 className="survey-title">{currentDimension.label}</h2>
                <p className="survey-desc">{currentDimension.description}</p>
              </div>
              <div className="dim-progress">
                {DIMENSIONS.map((d, i) => (
                  <div
                    key={d.key}
                    className="dim-dot"
                    style={{
                      background:
                        i < dimensionIndex
                          ? d.color
                          : i === dimensionIndex
                            ? d.color
                            : "rgba(255,255,255,0.12)",
                      opacity: i === dimensionIndex ? 1 : i < dimensionIndex ? 0.7 : 0.3,
                    }}
                    title={d.label}
                  />
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${((dimensionIndex + 1) / DIMENSIONS.length) * 100}%`,
                  background: currentDimension.color,
                }}
              />
            </div>

            {/* Questions */}
            <div className="questions-list">
              {currentQuestions.map((q, qi) => {
                const selected = answers[q.id];
                return (
                  <div key={q.id} className="question-block">
                    <p className="q-number" style={{ color: currentDimension.color }}>
                      Pregunta {dimensionIndex * QUESTIONS_PER_DIMENSION + qi + 1} / {QUESTIONS.length}
                    </p>
                    <p className="q-text">{q.text}</p>
                    <div className="likert-scale">
                      <span className="likert-end-label">En desacuerdo</span>
                      <div className="likert-options">
                        {([1, 2, 3, 4, 5] as LikertValue[]).map((val) => (
                          <button
                            key={val}
                            className={`likert-btn${selected === val ? " active" : ""}`}
                            style={
                              selected === val
                                ? { background: currentDimension.color, borderColor: currentDimension.color, color: "#061525" }
                                : {}
                            }
                            onClick={() => setAnswer(q.id, val)}
                            title={LIKERT_LABELS[val]}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <span className="likert-end-label right">De acuerdo</span>
                    </div>
                    {selected !== undefined && (
                      <p className="selected-label" style={{ color: currentDimension.color }}>
                        {LIKERT_LABELS[selected]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="survey-nav">
              <button
                className="btn-secondary"
                onClick={goPrevDimension}
                disabled={dimensionIndex === 0}
              >
                ← Anterior
              </button>
              <button
                className="btn-primary"
                onClick={goNextDimension}
                disabled={!currentAnswered}
                title={!currentAnswered ? "Responde todas las preguntas de esta dimensión para continuar." : ""}
              >
                {dimensionIndex === DIMENSIONS.length - 1 ? "Ver resultados →" : "Siguiente dimensión →"}
              </button>
            </div>
            {!currentAnswered && (
              <p className="warning-msg">Responde todas las preguntas de esta dimensión para continuar.</p>
            )}
          </div>
        )}

        {/* ── RESULTS ────────────────────────────────────────────────────── */}
        {screen === "results" && (
          <div className="results-wrap">
            <div className="results-header">
              <p className="eyebrow gold">Informe de Clima Laboral</p>
              <h1 className="results-title">
                {orgName ? orgName : "Tu organización"}
              </h1>
            </div>

            {/* Global score */}
            <div className="global-card">
              <p className="global-label">Índice Global de Clima Laboral</p>
              <div className="global-score" style={{ color: scoreLevelColor(globalPct) }}>
                {globalPct}%
              </div>
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
                <div
                  className="global-bar-fill"
                  style={{ width: `${globalPct}%`, background: scoreLevelColor(globalPct) }}
                />
              </div>
              <div className="global-legend">
                <span style={{ color: "#f87171" }}>0–59% Crítico</span>
                <span style={{ color: "#d4af37" }}>60–79% Regular</span>
                <span style={{ color: "#22c55e" }}>80–100% Bueno</span>
              </div>
            </div>

            {/* Chart + Dimension breakdown */}
            <div className="chart-grid">
              <div className="radar-card">
                <h2>Perfil por Dimensión</h2>
                <div className="radar-wrap">
                  <RadarChart scores={results} />
                </div>
              </div>

              <div className="breakdown-card">
                <h2>Resultados por Dimensión</h2>
                <div className="breakdown-list">
                  {results.map(({ dim, pct }) => (
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

            {/* Recommendations */}
            <div className="recs-section">
              <h2>Recomendaciones de Mejora</h2>
              <div className="recs-grid">
                {results.map(({ dim, pct }) => {
                  const level = scoreLevel(pct);
                  return (
                    <div
                      key={dim.key}
                      className="rec-card"
                      style={{ borderLeftColor: dim.color, background: dim.colorSoft + "55" }}
                    >
                      <div className="rec-header">
                        <span className="rec-dim" style={{ color: dim.color }}>{dim.label}</span>
                        <span
                          className="rec-badge"
                          style={{
                            background: scoreLevelColor(pct) + "22",
                            color: scoreLevelColor(pct),
                            border: `1px solid ${scoreLevelColor(pct)}44`,
                          }}
                        >
                          {pct}% · {scoreLevelLabel(pct)}
                        </span>
                      </div>
                      <p className="rec-text">{dim.recommendation[level]}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="results-actions">
              <button className="btn-primary" onClick={startSurvey}>
                Nueva evaluación
              </button>
              <button className="btn-secondary" onClick={restart}>
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────────
const css = `
  :root {
    --navy: #071b33;
    --navy-2: #0b2f56;
    --sky: #38bdf8;
    --gold: #d4af37;
    --white: #f8fafc;
    --muted: #94a3b8;
    --border: rgba(255,255,255,0.1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: linear-gradient(135deg, #041426, #071b33 42%, #0b2f56);
    min-height: 100vh;
    color: var(--white);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  button { font: inherit; cursor: pointer; }
  input  { font: inherit; }

  .shell {
    min-height: 100vh;
  }

  .container {
    width: min(1080px, calc(100% - 32px));
    margin: 0 auto;
    padding: 36px 0 60px;
  }

  /* ── HOME ─────────────────────────────────────────────── */
  .hero {
    text-align: center;
    padding: 48px 32px 40px;
    background: rgba(7,27,51,0.7);
    border: 1px solid var(--border);
    border-radius: 28px;
    backdrop-filter: blur(12px);
    margin-bottom: 20px;
  }

  .hero-badge {
    display: inline-block;
    padding: 6px 18px;
    border-radius: 999px;
    border: 1px solid rgba(56,189,248,0.35);
    background: rgba(56,189,248,0.1);
    color: var(--sky);
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .hero h1 {
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 16px;
  }

  .hero-sub {
    color: var(--muted);
    font-size: 1.05rem;
    line-height: 1.65;
    max-width: 560px;
    margin: 0 auto 28px;
  }

  .hero-sub strong { color: var(--gold); }

  .dimensions-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin-bottom: 32px;
  }

  .dim-chip {
    padding: 6px 16px;
    border-radius: 999px;
    border: 1px solid;
    font-size: 0.82rem;
    font-weight: 700;
    background: transparent;
  }

  .org-input-wrap {
    max-width: 420px;
    margin: 0 auto 28px;
    text-align: left;
  }

  .org-label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .org-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    color: var(--white);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .org-input::placeholder { color: rgba(255,255,255,0.3); }
  .org-input:focus { border-color: rgba(56,189,248,0.5); }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin-bottom: 20px;
  }

  .info-card {
    padding: 20px;
    border: 1px solid var(--border);
    border-top-width: 3px;
    border-radius: 20px;
    background: rgba(7,27,51,0.65);
    backdrop-filter: blur(8px);
  }

  .info-label {
    font-size: 0.78rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .info-desc {
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .how-card {
    padding: 28px;
    border: 1px solid var(--border);
    border-radius: 24px;
    background: rgba(7,27,51,0.65);
    backdrop-filter: blur(8px);
  }

  .how-card h2 {
    font-size: 1.25rem;
    margin-bottom: 20px;
    color: var(--gold);
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .step {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  .step-num {
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: rgba(212,175,55,0.15);
    border: 1px solid rgba(212,175,55,0.35);
    color: var(--gold);
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
  }

  .step p {
    color: var(--muted);
    font-size: 0.88rem;
    line-height: 1.6;
    margin-top: 6px;
  }

  /* ── SURVEY ───────────────────────────────────────────── */
  .survey-wrap {
    max-width: 760px;
    margin: 0 auto;
  }

  .survey-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    padding: 28px 28px 20px;
    background: rgba(7,27,51,0.75);
    border: 1px solid var(--border);
    border-radius: 24px 24px 0 0;
    backdrop-filter: blur(10px);
  }

  .eyebrow {
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .survey-title {
    font-size: clamp(1.4rem, 3vw, 1.9rem);
    font-weight: 900;
    margin-bottom: 6px;
  }

  .survey-desc {
    color: var(--muted);
    font-size: 0.88rem;
    line-height: 1.6;
    max-width: 480px;
  }

  .dim-progress {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    padding-top: 4px;
  }

  .dim-dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    transition: background 0.3s, opacity 0.3s;
  }

  .progress-track {
    height: 6px;
    background: rgba(255,255,255,0.06);
  }

  .progress-fill {
    height: 100%;
    transition: width 0.4s ease;
  }

  .questions-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .question-block {
    padding: 24px 28px;
    border: 1px solid var(--border);
    border-top: none;
    background: rgba(7,27,51,0.65);
    backdrop-filter: blur(8px);
  }

  .question-block:last-of-type {
    border-radius: 0;
  }

  .q-number {
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .q-text {
    font-size: 1.05rem;
    line-height: 1.55;
    margin-bottom: 18px;
    font-weight: 600;
  }

  .likert-scale {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .likert-end-label {
    color: var(--muted);
    font-size: 0.78rem;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .likert-end-label.right { text-align: right; }

  .likert-options {
    display: flex;
    gap: 8px;
    flex: 1;
    justify-content: center;
  }

  .likert-btn {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.05);
    color: var(--white);
    font-size: 1rem;
    font-weight: 700;
    transition: border-color 0.18s, background 0.18s, transform 0.12s;
  }

  .likert-btn:hover {
    border-color: rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.1);
    transform: translateY(-1px);
  }

  .likert-btn.active {
    font-weight: 900;
  }

  .selected-label {
    margin-top: 10px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .survey-nav {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 28px;
    border: 1px solid var(--border);
    border-top: none;
    border-radius: 0 0 24px 24px;
    background: rgba(7,27,51,0.75);
    backdrop-filter: blur(10px);
  }

  .warning-msg {
    text-align: center;
    margin-top: 12px;
    color: rgba(248,113,113,0.8);
    font-size: 0.84rem;
  }

  /* ── RESULTS ──────────────────────────────────────────── */
  .results-wrap {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .results-header {
    text-align: center;
    padding: 36px 20px 28px;
    background: rgba(7,27,51,0.72);
    border: 1px solid var(--border);
    border-radius: 24px;
    backdrop-filter: blur(10px);
  }

  .gold { color: var(--gold) !important; }

  .results-title {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 900;
    margin-top: 8px;
  }

  .global-card {
    padding: 32px;
    background: rgba(7,27,51,0.72);
    border: 1px solid var(--border);
    border-radius: 24px;
    backdrop-filter: blur(10px);
    text-align: center;
  }

  .global-label {
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 12px;
  }

  .global-score {
    font-size: clamp(4rem, 12vw, 7rem);
    font-weight: 900;
    line-height: 1;
    margin-bottom: 12px;
  }

  .level-badge {
    display: inline-block;
    padding: 8px 24px;
    border-radius: 999px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 0.85rem;
    margin-bottom: 22px;
  }

  .global-bar-track {
    max-width: 480px;
    margin: 0 auto 14px;
    height: 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.07);
    overflow: hidden;
  }

  .global-bar-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 1s ease;
  }

  .global-legend {
    display: flex;
    justify-content: center;
    gap: 24px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .chart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .radar-card,
  .breakdown-card {
    padding: 26px;
    background: rgba(7,27,51,0.72);
    border: 1px solid var(--border);
    border-radius: 24px;
    backdrop-filter: blur(10px);
  }

  .radar-card h2,
  .breakdown-card h2 {
    font-size: 1.1rem;
    margin-bottom: 18px;
    color: var(--muted);
    font-weight: 700;
  }

  .radar-wrap {
    display: flex;
    justify-content: center;
  }

  .breakdown-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .breakdown-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .breakdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .breakdown-name {
    font-weight: 700;
    font-size: 0.92rem;
  }

  .breakdown-pct {
    font-size: 0.82rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .recs-section {
    padding: 28px;
    background: rgba(7,27,51,0.72);
    border: 1px solid var(--border);
    border-radius: 24px;
    backdrop-filter: blur(10px);
  }

  .recs-section > h2 {
    font-size: 1.2rem;
    margin-bottom: 20px;
    color: var(--gold);
  }

  .recs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .rec-card {
    padding: 20px;
    border: 1px solid rgba(255,255,255,0.08);
    border-left-width: 4px;
    border-radius: 16px;
  }

  .rec-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .rec-dim {
    font-size: 0.8rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .rec-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .rec-text {
    color: var(--muted);
    font-size: 0.88rem;
    line-height: 1.65;
  }

  .results-actions {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ── BUTTONS ──────────────────────────────────────────── */
  .btn-primary {
    padding: 14px 28px;
    border-radius: 16px;
    border: 0;
    background: linear-gradient(135deg, #f3d36b, var(--gold));
    color: #061525;
    font-weight: 900;
    font-size: 0.95rem;
    transition: transform 0.18s, filter 0.18s;
  }

  .btn-primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-secondary {
    padding: 13px 22px;
    border-radius: 16px;
    border: 1px solid rgba(56,189,248,0.32);
    background: rgba(56,189,248,0.08);
    color: #d9f5ff;
    font-weight: 700;
    font-size: 0.95rem;
    transition: transform 0.18s, filter 0.18s;
  }

  .btn-secondary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
  .btn-secondary:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── RESPONSIVE ───────────────────────────────────────── */
  @media (max-width: 720px) {
    .info-grid, .steps, .chart-grid, .recs-grid {
      grid-template-columns: 1fr;
    }

    .survey-header { flex-direction: column; }
    .dim-progress { order: -1; }

    .likert-scale {
      flex-direction: column;
      align-items: flex-start;
    }

    .likert-options { justify-content: flex-start; }
    .likert-end-label { display: none; }

    .breakdown-header { flex-direction: column; align-items: flex-start; }

    .results-actions { flex-direction: column; }
    .btn-primary, .btn-secondary { width: 100%; text-align: center; }
  }
`;
