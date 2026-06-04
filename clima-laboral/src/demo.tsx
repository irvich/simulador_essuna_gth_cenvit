import React from "react";
import ReactDOM from "react-dom/client";
import { PeriodDashboard } from "./PeriodDashboard";
import { QUESTIONS, DIMENSIONS } from "./questions";
import { css } from "./styles";
import type { ActionRow, SurveyResponse, LikertValue } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// DEMO SEED — datos de muestra realistas para mostrar todas las funcionalidades.
// No toca Supabase ni localStorage: todo vive en memoria solo para esta vista.
// ──────────────────────────────────────────────────────────────────────────────

// Semilla determinista para que el demo se vea igual en cada apertura
let _s = 123456789;
function rng(): number {
  _s = (_s * 1103515245 + 12345) & 0x7fffffff;
  return _s / 0x7fffffff;
}
function gauss(mean: number, sd: number): number {
  const u = Math.max(rng(), 1e-6), v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function clampLikert(x: number): LikertValue {
  return Math.max(1, Math.min(5, Math.round(x))) as LikertValue;
}

// Perfil base por dimensión (sobre 5) — algunas fuertes, otras críticas
const DIM_BASE: Record<string, number> = {
  liderazgo: 3.6,
  comunicacion: 3.1,
  trabajo_en_equipo: 4.0,
  motivacion: 2.9,
  condiciones_seguridad: 3.8,
  desarrollo_crecimiento: 2.7,
};

// Sesgo por departamento (algunos mejor, otros peor) para que el heatmap luzca
const DEPTS: Array<{ name: string; bias: number; n: number }> = [
  { name: "Administración", bias: 0.2, n: 9 },
  { name: "Operaciones", bias: -0.4, n: 14 },
  { name: "Recursos Humanos / Talento Humano", bias: 0.5, n: 6 },
  { name: "Finanzas", bias: 0.1, n: 7 },
  { name: "Logística", bias: -0.3, n: 8 },
  { name: "Tecnología / Sistemas", bias: 0.4, n: 6 },
];

const POSITIVE_COMMENTS = [
  "El ambiente con mis compañeros es excelente, hay mucho apoyo y trabajo en equipo.",
  "Me siento contento con mi equipo, hemos logrado grandes resultados juntos.",
  "Agradezco las oportunidades de aprendizaje que he tenido este año.",
  "Mi jefe directo me da buena retroalimentación y se nota el respeto en el área.",
  "Buena coordinación entre áreas, las condiciones de seguridad han mejorado mucho.",
];
const NEGATIVE_COMMENTS = [
  "Hay mucha sobrecarga de trabajo y poco reconocimiento por el esfuerzo.",
  "La comunicación entre áreas es difícil, a veces no hay claridad en las decisiones.",
  "Me siento desmotivado porque no veo oportunidades de crecimiento.",
  "El ambiente es estresante y la presión excesiva afecta al equipo.",
  "Falta de apoyo de la jefatura cuando hay problemas, es un punto a mejorar.",
];
const NEUTRAL_COMMENTS = [
  "Algunas cosas funcionan bien y otras se pueden mejorar con el tiempo.",
  "En general estable, aunque sería bueno revisar la carga de trabajo.",
  "Tengo expectativas de que mejoren los canales de comunicación interna.",
];

function makeResponses(periodBias: number, withComments: boolean): SurveyResponse[] {
  const out: SurveyResponse[] = [];
  let idc = 0;
  for (const dept of DEPTS) {
    for (let i = 0; i < dept.n; i++) {
      const answers: Record<number, LikertValue> = {};
      for (const q of QUESTIONS) {
        const base = (DIM_BASE[q.dimension] ?? 3.2) + dept.bias + periodBias;
        answers[q.id] = clampLikert(gauss(base, 0.9));
      }
      let comment: string | undefined;
      if (withComments && rng() < 0.4) {
        const avg = Object.values(answers).reduce((s, v) => s + v, 0) / QUESTIONS.length;
        const pool = avg >= 3.7 ? POSITIVE_COMMENTS : avg <= 2.9 ? NEGATIVE_COMMENTS : NEUTRAL_COMMENTS;
        comment = pool[Math.floor(rng() * pool.length)];
      }
      const daysAgo = Math.floor(rng() * 25);
      out.push({
        id: `demo-${periodBias}-${idc++}`,
        createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
        department: dept.name,
        answers,
        comment,
      });
    }
  }
  return out;
}

const currentResponses = makeResponses(0, true);
const prevResponses = makeResponses(-0.35, false); // período anterior, algo más bajo

const demoTargets: Partial<Record<string, number>> = {
  liderazgo: 75,
  comunicacion: 70,
  motivacion: 72,
  desarrollo_crecimiento: 68,
};

const demoPlan: ActionRow[] = [
  {
    dimension: "Desarrollo y Crecimiento",
    finding: "Baja percepción de oportunidades de crecimiento (dimensión más crítica).",
    level: "low",
    action: "Diseñar planes de carrera y un programa de capacitación trimestral por área.",
    responsible: "Jefatura de Talento Humano",
    deadline: "2026-09-30",
    indicator: "% de colaboradores con plan de desarrollo individual",
    priority: "Alta",
    status: "en_progreso",
  },
  {
    dimension: "Motivación",
    finding: "Sobrecarga y poco reconocimiento reportados, sobre todo en Operaciones.",
    level: "low",
    action: "Implementar esquema de reconocimiento mensual y revisar cargas de trabajo.",
    responsible: "Gerencia + Jefes de área",
    deadline: "2026-08-15",
    indicator: "Índice de motivación / rotación voluntaria",
    priority: "Alta",
    status: "pendiente",
  },
  {
    dimension: "Comunicación",
    finding: "Comunicación interáreas poco fluida y decisiones poco claras.",
    level: "medium",
    action: "Reuniones quincenales interáreas y canal único de comunicación interna.",
    responsible: "Comité de comunicación",
    deadline: "2026-07-31",
    indicator: "Satisfacción con la comunicación interna",
    priority: "Media",
    status: "completada",
  },
];

function DemoBanner() {
  return (
    <div style={{
      background: "linear-gradient(90deg, rgba(56,189,248,0.14), rgba(212,175,55,0.12))",
      border: "1px solid rgba(56,189,248,0.3)", borderRadius: 14, padding: "14px 20px",
      margin: "0 auto 24px", maxWidth: 1180, display: "flex", alignItems: "center", gap: 12,
      flexWrap: "wrap",
    }}>
      <span style={{ fontSize: "1.3rem" }}>🎬</span>
      <div>
        <strong style={{ color: "#38bdf8" }}>DEMO — Simulador de Clima Laboral · Cenvit GTH</strong>
        <p style={{ margin: "3px 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>
          Datos de muestra ({currentResponses.length} participantes simulados, 6 departamentos, comparado con un período anterior).
          Explora radar, heatmap, correlaciones, tendencias, sentimiento de comentarios y plan de acción. Puedes exportar a PDF.
        </p>
      </div>
    </div>
  );
}

function DemoRoot() {
  return (
    <div className="shell">
      <style>{css}</style>
      <div className="container" style={{ paddingTop: 28 }}>
        <DemoBanner />
        <PeriodDashboard
          responses={currentResponses}
          periodoLabel="2026-S1 (Demo)"
          empresaNombre="Empresa Demostración S.A."
          totalColaboradores={60}
          targets={demoTargets}
          sectorKey="tecnologia"
          prevResponses={prevResponses}
          prevLabel="2025-S2"
          savedPlan={demoPlan}
        />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DemoRoot />
  </React.StrictMode>
);

// Evita warning de import no usado en algunos setups
void DIMENSIONS;
