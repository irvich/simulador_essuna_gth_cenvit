import React, { useEffect, useMemo, useState } from "react";
import { QUESTIONS, type ChoiceKey, type Question } from "./questions";

const ATTEMPT_SIZE = 20;
const PASS_SCORE = 14;
const EXAM_MINUTES = 30;

function shuffleQuestions(items: Question[]): Question[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function cleanTopic(topic: string): string {
  const dotIndex = topic.indexOf(". ");

  if (dotIndex > 0 && dotIndex < 6) {
    return topic.slice(dotIndex + 2);
  }

  return topic;
}

export default function App() {
  const [screen, setScreen] = useState<"home" | "quiz" | "results">("home");
  const [session, setSession] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ChoiceKey>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_MINUTES * 60);

  const currentQuestion = session[currentIndex];

  const stats = useMemo(() => {
    const total = session.length;
    const answered = session.filter((question) => answers[question.id]).length;
    const correct = session.filter((question) => answers[question.id] === question.answer).length;
    const wrong = answered - correct;
    const unanswered = total - answered;
    const scoreOver20 = correct;
    const passed = scoreOver20 >= PASS_SCORE;
    const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

    const byTopic = Object.values(
      session.reduce<Record<string, { topic: string; total: number; correct: number }>>((acc, question) => {
        if (!acc[question.topic]) {
          acc[question.topic] = {
            topic: question.topic,
            total: 0,
            correct: 0,
          };
        }

        acc[question.topic].total += 1;

        if (answers[question.id] === question.answer) {
          acc[question.topic].correct += 1;
        }

        return acc;
      }, {})
    );

    return {
      total,
      answered,
      correct,
      wrong,
      unanswered,
      scoreOver20,
      passed,
      percentage,
      byTopic,
    };
  }, [answers, session]);

  const progress = session.length === 0 ? 0 : Math.round(((currentIndex + 1) / session.length) * 100);
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const reviewQuestions = session.filter((question) => {
    return !answers[question.id] || answers[question.id] !== question.answer;
  });

  useEffect(() => {
    if (screen !== "quiz") return;

    if (remainingSeconds <= 0) {
      finishAttempt();
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => value - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen, remainingSeconds]);

  function startAttempt() {
    const randomQuestions = shuffleQuestions(QUESTIONS).slice(0, ATTEMPT_SIZE);

    setSession(randomQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setRemainingSeconds(EXAM_MINUTES * 60);
    setScreen("quiz");
  }

  function chooseAnswer(choice: ChoiceKey) {
    if (!currentQuestion) return;

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion.id]: choice,
    }));
  }

  function goPrevious() {
    setCurrentIndex((value) => Math.max(0, value - 1));
  }

  function goNext() {
    if (currentIndex >= session.length - 1) {
      finishAttempt();
      return;
    }

    setCurrentIndex((value) => value + 1);
  }

  function finishAttempt() {
    setScreen("results");
  }

  function resetAttempt() {
    setScreen("home");
    setSession([]);
    setCurrentIndex(0);
    setAnswers({});
    setRemainingSeconds(EXAM_MINUTES * 60);
  }

  return (
    <main className="app-shell">
      <style>{styles}</style>

      <section className="container">
        <header className="hero-card">
          <div className="brand-row">
            <img src="/logo-cenvit.png" alt="Logo CENVIT" className="logo" />

            <div>
              <p className="eyebrow">CENVIT</p>
              <h1>Simulador de Examen – Oficiales de Administración</h1>
              <p className="subtitle">
                Banco de {QUESTIONS.length} preguntas · Cada intento contiene{" "}
                <strong>20 preguntas aleatorias</strong> · Se aprueba con{" "}
                <strong>14/20</strong>.
              </p>
            </div>
          </div>
        </header>

        {screen === "home" && (
          <section className="home-grid">
            <article className="card">
              <p className="eyebrow gold">Intento oficial</p>
              <h2>20 preguntas aleatorias</h2>
              <p className="muted">
                El sistema selecciona 20 preguntas del banco completo. Al finalizar, la nota se calcula
                directamente sobre 20 puntos.
              </p>

              <div className="rules-grid">
                <div className="rule-box">
                  <span>Preguntas</span>
                  <strong>20</strong>
                </div>
                <div className="rule-box">
                  <span>Aprobación</span>
                  <strong>14/20</strong>
                </div>
                <div className="rule-box">
                  <span>Tiempo</span>
                  <strong>{EXAM_MINUTES} min</strong>
                </div>
              </div>

              <button className="primary-button" onClick={startAttempt}>
                Iniciar intento
              </button>
            </article>

            <article className="card navy-card">
              <h2>Cómo se califica</h2>
              <p className="muted">
                Cada respuesta correcta vale 1 punto. Las respuestas incorrectas o vacías valen 0.
              </p>

              <div className="score-example">
                <span>Ejemplo:</span>
                <strong>16/20</strong>
                <small>APROBADO</small>
              </div>
            </article>
          </section>
        )}

        {screen === "quiz" && currentQuestion && (
          <section className="card quiz-card">
            <div className="quiz-topbar">
              <div>
                <p className="eyebrow gold">
                  Pregunta {currentIndex + 1} de {session.length}
                </p>
                <p className="topic">{cleanTopic(currentQuestion.topic)}</p>
              </div>

              <div className="timer">{formatTime(remainingSeconds)}</div>
            </div>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <h2 className="question-title">{currentQuestion.question}</h2>

            <div className="options-grid">
              {currentQuestion.choices.map((choice) => {
                const selected = selectedAnswer === choice.key;

                return (
                  <button
                    key={choice.key}
                    className={selected ? "option selected" : "option"}
                    onClick={() => chooseAnswer(choice.key)}
                  >
                    <span className="option-key">{choice.key}</span>
                    <span>{choice.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="quiz-actions">
              <button className="secondary-button" onClick={goPrevious} disabled={currentIndex === 0}>
                Anterior
              </button>

              <div className="right-actions">
                <button className="danger-button" onClick={finishAttempt}>
                  Finalizar intento
                </button>
                <button className="primary-button small" onClick={goNext}>
                  {currentIndex === session.length - 1 ? "Calificar" : "Siguiente"}
                </button>
              </div>
            </div>
          </section>
        )}

        {screen === "results" && (
          <section className="results-grid">
            <article className="card result-card">
              <p className="eyebrow gold">Resultado final</p>
              <h2 className="final-score">{stats.scoreOver20}/20</h2>

              <div className={stats.passed ? "status passed" : "status failed"}>
                {stats.passed ? "APROBADO" : "REPROBADO"}
              </div>

              <p className="muted">
                Mínimo para aprobar: <strong>14/20</strong>
              </p>

              <div className="summary-grid">
                <div>
                  <span>Correctas</span>
                  <strong>{stats.correct}</strong>
                </div>
                <div>
                  <span>Incorrectas</span>
                  <strong>{stats.wrong}</strong>
                </div>
                <div>
                  <span>Vacías</span>
                  <strong>{stats.unanswered}</strong>
                </div>
              </div>

              <button className="primary-button" onClick={startAttempt}>
                Nuevo intento
              </button>
              <button className="secondary-button full" onClick={resetAttempt}>
                Volver al inicio
              </button>
            </article>

            <article className="card">
              <h2>Repaso del intento</h2>

              {reviewQuestions.length === 0 ? (
                <p className="success-message">Excelente. No tuviste errores ni preguntas vacías.</p>
              ) : (
                <div className="review-list">
                  {reviewQuestions.map((question) => {
                    const correctChoice = question.choices.find((choice) => choice.key === question.answer);

                    return (
                      <div className="review-item" key={question.id}>
                        <p className="review-id">Pregunta {question.id}</p>
                        <h3>{question.question}</h3>
                        <p className="review-meta">
                          Tu respuesta: <strong>{answers[question.id] || "Sin responder"}</strong> · Correcta:{" "}
                          <strong>{question.answer}</strong>
                        </p>
                        <p className="correct-text">{correctChoice?.text}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </section>
        )}
      </section>
    </main>
  );
}

const styles = `
:root {
  --navy: #071b33;
  --navy-2: #0b2f56;
  --navy-3: #102f4d;
  --sky: #38bdf8;
  --sky-soft: rgba(56, 189, 248, 0.16);
  --gold: #d4af37;
  --gold-soft: rgba(212, 175, 55, 0.16);
  --white: #f8fafc;
  --muted: #cbd5e1;
  --border: rgba(255, 255, 255, 0.12);
  --danger: #f87171;
  --success: #22c55e;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--navy);
}

button,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 32rem),
    radial-gradient(circle at bottom right, rgba(212, 175, 55, 0.14), transparent 30rem),
    linear-gradient(135deg, #041426, #071b33 42%, #0b2f56);
  color: var(--white);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.container {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0;
}

.hero-card,
.card {
  border: 1px solid var(--border);
  background: rgba(7, 27, 51, 0.78);
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}

.hero-card {
  padding: 22px;
  margin-bottom: 22px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.logo {
  width: 92px;
  height: 92px;
  object-fit: contain;
  border-radius: 20px;
  background: white;
  padding: 10px;
  border: 2px solid rgba(212, 175, 55, 0.55);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--sky);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.gold {
  color: var(--gold);
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 8px;
  font-size: clamp(1.7rem, 4vw, 2.7rem);
  line-height: 1.08;
}

h2 {
  margin-bottom: 12px;
  font-size: clamp(1.35rem, 3vw, 2rem);
}

.subtitle,
.muted {
  color: var(--muted);
  line-height: 1.65;
}

.subtitle {
  margin-bottom: 0;
}

.subtitle strong,
.muted strong {
  color: var(--gold);
}

.home-grid,
.results-grid {
  display: grid;
  grid-template-columns: 1fr 0.82fr;
  gap: 18px;
}

.card {
  padding: 22px;
}

.navy-card {
  background: linear-gradient(145deg, rgba(11, 47, 86, 0.9), rgba(7, 27, 51, 0.72));
}

.rules-grid,
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 22px 0;
}

.rule-box,
.summary-grid div {
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 16px;
  text-align: center;
}

.rule-box span,
.summary-grid span {
  display: block;
  margin-bottom: 7px;
  color: var(--muted);
  font-size: 0.78rem;
}

.rule-box strong,
.summary-grid strong {
  color: var(--gold);
  font-size: 1.45rem;
}

.primary-button,
.secondary-button,
.danger-button {
  border: 0;
  border-radius: 18px;
  cursor: pointer;
  font-weight: 900;
  transition: transform 0.18s ease, filter 0.18s ease, background 0.18s ease;
}

.primary-button {
  width: 100%;
  background: linear-gradient(135deg, #f3d36b, var(--gold));
  color: #061525;
  padding: 15px 18px;
}

.primary-button.small {
  width: auto;
  padding: 13px 18px;
}

.secondary-button {
  border: 1px solid rgba(56, 189, 248, 0.32);
  background: var(--sky-soft);
  color: #d9f5ff;
  padding: 13px 18px;
}

.secondary-button.full {
  width: 100%;
  margin-top: 10px;
}

.danger-button {
  border: 1px solid rgba(248, 113, 113, 0.35);
  background: rgba(248, 113, 113, 0.12);
  color: #fecaca;
  padding: 13px 18px;
}

.primary-button:hover,
.secondary-button:hover,
.danger-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.secondary-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.score-example {
  margin-top: 28px;
  border: 1px solid rgba(212, 175, 55, 0.34);
  background: var(--gold-soft);
  border-radius: 22px;
  padding: 18px;
  text-align: center;
}

.score-example span,
.score-example small {
  display: block;
  color: var(--muted);
}

.score-example strong {
  display: block;
  margin: 8px 0;
  color: var(--gold);
  font-size: 3rem;
}

.score-example small {
  color: #bbf7d0;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.quiz-card {
  max-width: 960px;
  margin: 0 auto;
}

.quiz-topbar,
.quiz-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.topic {
  margin-bottom: 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.timer {
  min-width: 96px;
  border: 1px solid rgba(212, 175, 55, 0.38);
  background: var(--gold-soft);
  border-radius: 999px;
  padding: 10px 16px;
  text-align: center;
  color: var(--gold);
  font-weight: 900;
}

.progress-track {
  height: 10px;
  margin: 20px 0 24px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--sky), var(--gold));
}

.question-title {
  margin-bottom: 22px;
  line-height: 1.35;
}

.options-grid {
  display: grid;
  gap: 12px;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--white);
  border-radius: 18px;
  padding: 16px;
  text-align: left;
  cursor: pointer;
}

.option:hover {
  border-color: rgba(56, 189, 248, 0.5);
  background: rgba(56, 189, 248, 0.08);
}

.option.selected {
  border-color: var(--gold);
  background: var(--gold-soft);
}

.option-key {
  display: inline-flex;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--sky-soft);
  color: var(--sky);
  font-weight: 900;
}

.option.selected .option-key {
  background: var(--gold);
  color: #061525;
}

.quiz-actions {
  margin-top: 24px;
}

.right-actions {
  display: flex;
  gap: 10px;
}

.result-card {
  text-align: center;
}

.final-score {
  margin: 4px 0 8px;
  color: var(--gold);
  font-size: clamp(4rem, 10vw, 6.5rem);
  line-height: 1;
}

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 10px auto 16px;
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.status.passed {
  background: rgba(34, 197, 94, 0.14);
  color: #bbf7d0;
  border: 1px solid rgba(34, 197, 94, 0.35);
}

.status.failed {
  background: rgba(248, 113, 113, 0.14);
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.35);
}

.review-list {
  display: grid;
  gap: 12px;
  max-height: 620px;
  overflow: auto;
  padding-right: 4px;
}

.review-item {
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 16px;
}

.review-id {
  margin-bottom: 8px;
  color: var(--sky);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.review-item h3 {
  margin-bottom: 10px;
  font-size: 1rem;
  line-height: 1.45;
}

.review-meta {
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 0.9rem;
}

.correct-text,
.success-message {
  color: #bbf7d0;
}

@media (max-width: 780px) {
  .brand-row,
  .quiz-topbar,
  .quiz-actions,
  .right-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .home-grid,
  .results-grid,
  .rules-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .logo {
    width: 82px;
    height: 82px;
  }

  .primary-button.small {
    width: 100%;
  }
}
`;
