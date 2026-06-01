import React, { useMemo, useState } from "react";
import {
  DEPARTMENTS,
  DIMENSIONS,
  LIKERT_LABELS,
  QUESTIONS,
  QUESTIONS_PER_DIMENSION,
} from "./questions";
import {
  BASE,
  RadarChart,
  ScoreBar,
  scoreLevel,
  scoreLevelColor,
  scoreLevelLabel,
  type DimScore,
} from "./shared";
import { ActionMatrix } from "./ActionMatrix";
import { Admin } from "./Admin";
import { submitResponse } from "./storage";
import { css } from "./styles";
import type { Answers, LikertValue } from "./types";

type Screen = "home" | "survey" | "thanks" | "myresults" | "admin";

function TopBar({ onAdmin }: { onAdmin: () => void }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-brand">
          <img src={`${BASE}logo-cenvit.png`} alt="CENVIT" className="topbar-logo" />
          <div className="topbar-brand-text">
            <span className="topbar-brand-name">CENVIT</span>
            <span className="topbar-brand-sub">Centro Educativo y de Negocios con Visión Integral del Talento Humano</span>
          </div>
        </div>
        <div className="topbar-divider" />
        <div className="topbar-author">
          <div className="topbar-author-text">
            <span className="topbar-author-name">Iván Viteri</span>
            <span className="topbar-author-sub">Psicología Laboral en acción</span>
          </div>
          <img src={`${BASE}logo-ivan-viteri.jpg`} alt="Iván Viteri" className="topbar-author-logo" />
        </div>
        <button className="admin-link no-print" onClick={onAdmin}>Panel Admin</button>
      </div>
    </header>
  );
}

function ResultsFooter() {
  return (
    <div className="results-footer">
      <p className="footer-label">Herramienta desarrollada por</p>
      <div className="footer-logos">
        <div className="footer-logo-block">
          <img src={`${BASE}logo-cenvit.png`} alt="CENVIT" className="footer-logo" />
          <div>
            <span className="footer-logo-name">CENVIT</span>
            <span className="footer-logo-sub">Centro Educativo y de Negocios con Visión Integral del Talento Humano</span>
          </div>
        </div>
        <div className="footer-sep" />
        <div className="footer-logo-block">
          <img src={`${BASE}logo-ivan-viteri.jpg`} alt="Iván Viteri" className="footer-logo iv-logo" />
          <div>
            <span className="footer-logo-name">Iván Viteri</span>
            <span className="footer-logo-sub">Psicología Laboral en acción</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const initialAdmin = typeof window !== "undefined" && window.location.hash === "#admin";
  const [screen, setScreen] = useState<Screen>(initialAdmin ? "admin" : "home");
  const [department, setDepartment] = useState("");
  const [dimensionIndex, setDimensionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const currentDimension = DIMENSIONS[dimensionIndex];
  const currentQuestions = QUESTIONS.filter((q) => q.dimension === currentDimension.key);
  const currentAnswered = currentQuestions.every((q) => answers[q.id] !== undefined);

  const scores: DimScore[] = useMemo(
    () =>
      DIMENSIONS.map((dim) => {
        const dimQ = QUESTIONS.filter((q) => q.dimension === dim.key);
        const total = dimQ.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
        const pct = Math.round((total / (dimQ.length * 5)) * 100);
        return { dim, pct };
      }),
    [answers]
  );

  const globalPct = useMemo(() => {
    const total = QUESTIONS.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    return Math.round((total / (QUESTIONS.length * 5)) * 100);
  }, [answers]);

  function setAnswer(qid: number, value: LikertValue) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function startSurvey() {
    setAnswers({});
    setDimensionIndex(0);
    setSubmitError("");
    setScreen("survey");
  }

  async function finishSurvey() {
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitResponse(department || "Sin especificar", answers);
      setScreen("thanks");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setSubmitError("No se pudo enviar tu respuesta. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (dimensionIndex < DIMENSIONS.length - 1) {
      setDimensionIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      finishSurvey();
    }
  }

  function goPrev() {
    if (dimensionIndex > 0) {
      setDimensionIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function restart() {
    setAnswers({});
    setDimensionIndex(0);
    setDepartment("");
    setScreen("home");
    if (typeof window !== "undefined" && window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="shell">
      <style>{css}</style>
      <TopBar onAdmin={() => setScreen("admin")} />

      <main className="container">
        {/* ── ADMIN ─────────────────────────────────────────────── */}
        {screen === "admin" && <Admin onExit={restart} />}

        {/* ── HOME ──────────────────────────────────────────────── */}
        {screen === "home" && (
          <>
            <header className="hero">
              <div className="hero-badge">Diagnóstico Organizacional</div>
              <h1>Medidor de Clima Laboral</h1>
              <p className="hero-sub">
                Evalúa <strong>6 dimensiones clave</strong> del ambiente de trabajo mediante{" "}
                <strong>{QUESTIONS.length} preguntas</strong> con escala Likert 1–5. Tus respuestas son{" "}
                <strong>confidenciales</strong> y se suman al resultado global de la organización.
              </p>

              <div className="dimensions-preview">
                {DIMENSIONS.map((d) => (
                  <div key={d.key} className="dim-chip" style={{ borderColor: d.color, color: d.color }}>
                    {d.label}
                  </div>
                ))}
              </div>

              <div className="org-input-wrap">
                <label className="org-label">Tu área o departamento</label>
                <select className="org-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="">Selecciona tu departamento…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button className="btn-primary" onClick={startSurvey} disabled={!department}>
                Comenzar encuesta →
              </button>
              {!department && <p className="warning-msg">Selecciona tu departamento para comenzar.</p>}
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
                  <p>Cada colaborador responde las {QUESTIONS.length} afirmaciones desde su propio dispositivo.</p>
                </div>
                <div className="step">
                  <span className="step-num">2</span>
                  <p>Las respuestas se consolidan de forma anónima en el resultado de la organización.</p>
                </div>
                <div className="step">
                  <span className="step-num">3</span>
                  <p>El panel administrativo muestra el clima global, por dimensión y el plan de acción.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── SURVEY ────────────────────────────────────────────── */}
        {screen === "survey" && (
          <div className="survey-wrap">
            <div className="survey-header">
              <div>
                <p className="eyebrow" style={{ color: currentDimension.color }}>
                  Dimensión {dimensionIndex + 1} de {DIMENSIONS.length} · {department}
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
                      background: i <= dimensionIndex ? d.color : "rgba(255,255,255,0.12)",
                      opacity: i === dimensionIndex ? 1 : i < dimensionIndex ? 0.7 : 0.3,
                    }}
                    title={d.label}
                  />
                ))}
              </div>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${((dimensionIndex + 1) / DIMENSIONS.length) * 100}%`,
                  background: currentDimension.color,
                }}
              />
            </div>

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

            <div className="survey-nav">
              <button className="btn-secondary" onClick={goPrev} disabled={dimensionIndex === 0 || submitting}>
                ← Anterior
              </button>
              <button className="btn-primary" onClick={goNext} disabled={!currentAnswered || submitting}>
                {submitting
                  ? "Enviando…"
                  : dimensionIndex === DIMENSIONS.length - 1
                    ? "Enviar encuesta →"
                    : "Siguiente dimensión →"}
              </button>
            </div>
            {!currentAnswered && <p className="warning-msg">Responde todas las preguntas de esta dimensión para continuar.</p>}
            {submitError && <p className="warning-msg">{submitError}</p>}
          </div>
        )}

        {/* ── THANK YOU ─────────────────────────────────────────── */}
        {screen === "thanks" && (
          <div className="thanks-wrap">
            <div className="thanks-check">✓</div>
            <h1>¡Gracias por participar!</h1>
            <p>Tu respuesta fue registrada de forma confidencial y ya forma parte del diagnóstico de clima laboral de la organización.</p>
            <p>Cuantas más personas participen, más preciso será el resultado.</p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-secondary" onClick={() => setScreen("myresults")}>Ver mi resultado personal</button>
              <button className="btn-primary" onClick={restart}>Finalizar</button>
            </div>
          </div>
        )}

        {/* ── MY RESULTS (individual) ───────────────────────────── */}
        {screen === "myresults" && (
          <div className="results-wrap">
            <div className="results-header">
              <p className="eyebrow gold">Resultado personal</p>
              <h1 className="results-title">Tu Clima Laboral</h1>
              <p className="results-meta">{department} · Este resultado es solo tuyo y no se comparte individualmente.</p>
            </div>

            <div className="global-card">
              <p className="global-label">Tu Índice de Clima Laboral</p>
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

            <div className="chart-grid">
              <div className="radar-card">
                <h2>Tu Perfil por Dimensión</h2>
                <div className="radar-wrap"><RadarChart scores={scores} /></div>
              </div>
              <div className="breakdown-card">
                <h2>Tus Resultados por Dimensión</h2>
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

            <div className="recs-section">
              <h2>Recomendaciones</h2>
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

            <ActionMatrix scores={scores} />

            <div className="results-actions no-print">
              <button className="btn-export" onClick={() => window.print()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Exportar PDF
              </button>
              <button className="btn-primary" onClick={restart}>Finalizar</button>
            </div>

            <ResultsFooter />
          </div>
        )}
      </main>
    </div>
  );
}
