import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { PeriodDashboard } from "./PeriodDashboard";
import { ReportDocument } from "./ReportDocument";
import { QUESTIONS, DIMENSIONS } from "./questions";
import { css } from "./styles";
import { LOGO_CENVIT, LOGO_IVAN } from "./logoData";
import type { ActionRow, SurveyResponse, LikertValue } from "./types";

function demoGlobalPct(responses: SurveyResponse[]): number {
  let sum = 0, count = 0;
  for (const r of responses) for (const q of QUESTIONS) {
    const v = r.answers[q.id];
    if (v !== undefined) { sum += v; count++; }
  }
  return count === 0 ? 0 : Math.round((sum / count / 5) * 100);
}

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

// Perfil base por dimensión (sobre 5) — calibrado al informe modelo (2026-I)
const DIM_BASE: Record<string, number> = {
  liderazgo: 3.60,              // ~72%
  comunicacion: 3.20,          // ~64%
  reconocimiento: 2.90,        // ~58% (brecha principal)
  motivacion: 3.90,            // ~78%
  trabajo_en_equipo: 4.10,     // ~82% (fortaleza)
  condiciones_seguridad: 3.70, // ~74%
  desarrollo_crecimiento: 3.30,// ~66%
  equidad: 3.05,               // ~61%
  cultura: 4.00,               // ~80%
  bienestar: 3.45,             // ~69%
};

// Sesgo por área (Gerencia alta, Logística baja) reproduciendo el comparativo del informe
const DEPTS: Array<{ name: string; bias: number; n: number }> = [
  { name: "Gerencia", bias: 0.65, n: 8 },
  { name: "Administración", bias: 0.35, n: 16 },
  { name: "Talento Humano", bias: 0.28, n: 10 },
  { name: "Financiero", bias: 0.12, n: 14 },
  { name: "Comercial", bias: -0.18, n: 20 },
  { name: "Operaciones", bias: -0.38, n: 22 },
  { name: "Logística", bias: -0.55, n: 13 },
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

const currentResponses = makeResponses(0, true);        // 2026-I (medición actual)
const prevResponses = makeResponses(-0.11, false);      // 2025-II (~-2.2 pts, semestre anterior)

// Serie histórica semestral (5 mediciones) para el gráfico de tendencia del informe
const _curPct = demoGlobalPct(currentResponses);
const _prevPct = demoGlobalPct(prevResponses);
const demoHistory = [
  { label: "2024-I", pct: 62 },
  { label: "2024-II", pct: 65 },
  { label: "2025-I", pct: Math.max(65, _prevPct - 2) },
  { label: "2025-II", pct: _prevPct },
  { label: "2026-I", pct: _curPct },
];

const demoTargets: Partial<Record<string, number>> = {
  reconocimiento: 70,
  comunicacion: 72,
  equidad: 68,
  bienestar: 75,
};

const demoPlan: ActionRow[] = [
  {
    dimension: "Reconocimiento",
    finding: "Reconocimiento insuficiente del esfuerzo (dimensión más baja, 58%).",
    level: "low",
    action: "Institucionalizar un programa mensual de reconocimiento al desempeño con criterios claros.",
    responsible: "Talento Humano",
    deadline: "2026-08-15",
    indicator: "N.º de reconocimientos y percepción de valoración",
    priority: "Alta",
    status: "en_progreso",
  },
  {
    dimension: "Comunicación interna",
    finding: "Retroceso semestral (-2 pts); la información no llega con la misma claridad a todas las áreas.",
    level: "low",
    action: "Protocolizar canales y reuniones breves de coordinación semanal por área.",
    responsible: "Talento Humano / Jefaturas",
    deadline: "2026-07-31",
    indicator: "% de áreas con reunión semanal registrada",
    priority: "Alta",
    status: "pendiente",
  },
  {
    dimension: "Bienestar psicosocial",
    finding: "Retrocede 2 pts; conviene monitorear presión, desgaste y balance laboral.",
    level: "medium",
    action: "Plan de bienestar psicosocial focalizado y revisión de cargas en áreas críticas.",
    responsible: "Talento Humano",
    deadline: "2026-09-30",
    indicator: "Índice de bienestar y carga percibida",
    priority: "Media",
    status: "pendiente",
  },
];

const LIKERT_COLORS = ["#ef4444","#f97316","#eab308","#84cc16","#22c55e"];
const LIKERT_LABELS_ES = ["Totalmente en desacuerdo","En desacuerdo","Neutral","De acuerdo","Totalmente de acuerdo"];

function SurveyPreview() {
  const [dimIdx, setDimIdx] = useState(0);
  const dim = DIMENSIONS[dimIdx];
  const qs = QUESTIONS.filter(q => q.dimension === dim.key);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 0 40px" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {DIMENSIONS.map((d, i) => (
          <button key={d.key} onClick={() => setDimIdx(i)} style={{
            padding: "6px 14px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 700,
            cursor: "pointer", border: `1.5px solid ${d.color}`,
            background: i === dimIdx ? d.color + "33" : "transparent",
            color: i === dimIdx ? d.color : "rgba(148,163,184,0.7)",
          }}>{d.label}</button>
        ))}
      </div>
      <div style={{ background: "rgba(7,27,51,0.72)", border: `1px solid ${dim.color}44`, borderRadius: 20, padding: "24px 28px", marginBottom: 16 }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: dim.color, marginBottom: 4 }}>
          Dimensión {dimIdx + 1} de {DIMENSIONS.length}
        </p>
        <h2 style={{ color: dim.color, margin: "0 0 6px", fontSize: "1.25rem" }}>{dim.label}</h2>
        <p style={{ color: "rgba(148,163,184,0.75)", fontSize: "0.82rem", margin: 0 }}>{dim.description}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {qs.map((q, qi) => (
          <div key={q.id} style={{ background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ fontSize: "0.68rem", color: dim.color, fontWeight: 900, letterSpacing: "0.1em", marginBottom: 6 }}>
              Pregunta {qs.indexOf(q) + 1} / {qs.length}
            </p>
            <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.88)", margin: "0 0 14px", lineHeight: 1.5 }}>{q.text}</p>
            <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
              {LIKERT_LABELS_ES.map((lbl, li) => (
                <button key={li} onClick={() => setAnswers(a => ({ ...a, [q.id]: li + 1 }))} title={lbl} style={{
                  flex: 1, padding: "10px 4px", borderRadius: 10, border: `2px solid`,
                  borderColor: answers[q.id] === li + 1 ? LIKERT_COLORS[li] : "rgba(255,255,255,0.1)",
                  background: answers[q.id] === li + 1 ? LIKERT_COLORS[li] + "33" : "transparent",
                  color: answers[q.id] === li + 1 ? LIKERT_COLORS[li] : "rgba(148,163,184,0.5)",
                  fontWeight: 900, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.15s",
                }}>{li + 1}</button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: "0.62rem", color: "rgba(148,163,184,0.4)" }}>
              <span>En desacuerdo</span><span>De acuerdo</span>
            </div>
          </div>
        ))}
      </div>
      {dimIdx < DIMENSIONS.length - 1 && (
        <button onClick={() => setDimIdx(dimIdx + 1)} style={{
          marginTop: 20, padding: "12px 32px", background: dim.color, color: "white",
          border: "none", borderRadius: 999, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer",
        }}>
          Siguiente dimensión → {DIMENSIONS[dimIdx + 1].label}
        </button>
      )}
    </div>
  );
}

function DemoRoot() {
  const [tab, setTab] = useState<"results" | "report" | "survey">("results");
  return (
    <div className="shell">
      <style>{css}</style>
      {/* ── Topbar con logos ── */}
      <header style={{
        background: "rgba(7,27,51,0.95)", borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "10px 24px", display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)",
      }}>
        <img src={LOGO_CENVIT} alt="Cenvit" style={{ height: 44, width: "auto", objectFit: "contain", borderRadius: 8 }} />
        <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.12)" }} />
        <div>
          <div style={{ fontWeight: 900, fontSize: "0.92rem", color: "#f8fafc", letterSpacing: "0.02em" }}>CENVIT GTH</div>
          <div style={{ fontSize: "0.68rem", color: "rgba(148,163,184,0.7)", letterSpacing: "0.08em" }}>Simulador de Clima Laboral</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: "0.82rem", color: "#f8fafc" }}>Iván Viteri</div>
          <div style={{ fontSize: "0.65rem", color: "rgba(148,163,184,0.7)" }}>Psicología Laboral en acción</div>
        </div>
        <img src={LOGO_IVAN} alt="Iván Viteri" style={{ height: 44, width: 44, objectFit: "contain", borderRadius: 8 }} />
      </header>

      {/* ── Logo injection for print: swap all report logos to base64 before print ── */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('beforeprint', function() {
          document.querySelectorAll('img').forEach(function(img) {
            if (img.alt === 'CENVIT' || img.alt === 'Cenvit') img.src = ${JSON.stringify(LOGO_CENVIT)};
            if (img.alt === 'Iván Viteri') img.src = ${JSON.stringify(LOGO_IVAN)};
          });
        });
      `}} />

      {/* ── Tabs ── */}
      <div style={{ background: "rgba(7,27,51,0.85)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 24px", display: "flex", gap: 2 }}>
        {([["results","📊 Dashboard de Resultados"], ["report","📄 Informe (14 págs)"], ["survey","📝 Vista de la Encuesta"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "12px 20px", background: "none", border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: "0.82rem",
            color: tab === t ? "#38bdf8" : "rgba(148,163,184,0.6)",
            borderBottom: `2px solid ${tab === t ? "#38bdf8" : "transparent"}`,
          }}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ alignSelf: "center", fontSize: "0.72rem", color: "rgba(148,163,184,0.45)", fontStyle: "italic" }}>
          ⚠ Demo — datos simulados
        </span>
      </div>

      {tab === "report" ? (
        <ReportDocument
          className="rp-screen"
          empresaNombre="Empresa Demostración S.A."
          periodoLabel="2026 · I Semestre"
          prevLabel="2025 · II Semestre"
          totalColaboradores={120}
          responses={currentResponses}
          prevResponses={prevResponses}
          benchmark={{}}
          sectorLabel="General (Latinoamérica)"
          plan={demoPlan}
          history={demoHistory}
          logoCenvit={LOGO_CENVIT}
          logoIvan={LOGO_IVAN}
        />
      ) : (
        <div className="container" style={{ paddingTop: 28 }}>
          {tab === "results" ? (
            <PeriodDashboard
              responses={currentResponses}
              periodoLabel="2026 · I Semestre"
              empresaNombre="Empresa Demostración S.A."
              totalColaboradores={120}
              targets={demoTargets}
              sectorKey="general"
              prevResponses={prevResponses}
              prevLabel="2025 · II Semestre"
              savedPlan={demoPlan}
              history={demoHistory}
            />
          ) : (
            <SurveyPreview />
          )}
        </div>
      )}
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
