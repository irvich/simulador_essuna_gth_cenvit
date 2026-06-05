import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { PeriodDashboard } from "./PeriodDashboard";
import { ReportDocument } from "./ReportDocument";
import { QUESTIONS, DIMENSIONS } from "./questions";
import { css } from "./styles";
import { LOGO_CENVIT, LOGO_IVAN } from "./logoData";
import type { ActionRow, SurveyResponse, LikertValue } from "./types";
import { scoreLevelColor, scoreLevelLabel } from "./shared";

// ─────────────────────────────────────────────────────────────────────────────
// GENERACIÓN DE DATOS DE MUESTRA
// ─────────────────────────────────────────────────────────────────────────────

function demoGlobalPct(responses: SurveyResponse[]): number {
  let sum = 0, count = 0;
  for (const r of responses) for (const q of QUESTIONS) {
    const v = r.answers[q.id];
    if (v !== undefined) { sum += v; count++; }
  }
  return count === 0 ? 0 : Math.round((sum / count / 5) * 100);
}

let _s = 123456789;
function rng(): number { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; }
function gauss(mean: number, sd: number): number {
  const u = Math.max(rng(), 1e-6), v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function clampLikert(x: number): LikertValue { return Math.max(1, Math.min(5, Math.round(x))) as LikertValue; }

const DIM_BASE: Record<string, number> = {
  liderazgo: 3.60, comunicacion: 3.20, reconocimiento: 2.90, motivacion: 3.90,
  trabajo_en_equipo: 4.10, condiciones_seguridad: 3.70, desarrollo_crecimiento: 3.30,
  equidad: 3.05, cultura: 4.00, bienestar: 3.45,
};
const DEPTS = [
  { name: "Gerencia", bias: 0.65, n: 8 }, { name: "Administración", bias: 0.35, n: 16 },
  { name: "Talento Humano", bias: 0.28, n: 10 }, { name: "Financiero", bias: 0.12, n: 14 },
  { name: "Comercial", bias: -0.18, n: 20 }, { name: "Operaciones", bias: -0.38, n: 22 },
  { name: "Logística", bias: -0.55, n: 13 },
];
const POS_CMT = [
  "El ambiente con mis compañeros es excelente, hay mucho apoyo y trabajo en equipo.",
  "Me siento contento con mi equipo, hemos logrado grandes resultados juntos.",
  "Agradezco las oportunidades de aprendizaje que he tenido este año.",
];
const NEG_CMT = [
  "Hay mucha sobrecarga de trabajo y poco reconocimiento por el esfuerzo.",
  "La comunicación entre áreas es difícil, a veces no hay claridad en las decisiones.",
  "Me siento desmotivado porque no veo oportunidades de crecimiento.",
];
const NEU_CMT = [
  "Algunas cosas funcionan bien y otras se pueden mejorar con el tiempo.",
  "En general estable, aunque sería bueno revisar la carga de trabajo.",
];

function makeResponses(periodBias: number, withComments: boolean): SurveyResponse[] {
  const out: SurveyResponse[] = []; let idc = 0;
  for (const dept of DEPTS) {
    for (let i = 0; i < dept.n; i++) {
      const answers: Record<number, LikertValue> = {};
      for (const q of QUESTIONS) answers[q.id] = clampLikert(gauss((DIM_BASE[q.dimension] ?? 3.2) + dept.bias + periodBias, 0.9));
      let comment: string | undefined;
      if (withComments && rng() < 0.4) {
        const avg = Object.values(answers).reduce((s, v) => s + v, 0) / QUESTIONS.length;
        const pool = avg >= 3.7 ? POS_CMT : avg <= 2.9 ? NEG_CMT : NEU_CMT;
        comment = pool[Math.floor(rng() * pool.length)];
      }
      out.push({ id: `demo-${idc++}`, createdAt: new Date(Date.now() - Math.floor(rng() * 25) * 86400000).toISOString(), department: dept.name, answers, comment });
    }
  }
  return out;
}

const currentResponses = makeResponses(0, true);
const prevResponses = makeResponses(-0.11, false);
const _curPct = demoGlobalPct(currentResponses);
const _prevPct = demoGlobalPct(prevResponses);
const demoHistory = [
  { label: "2024-I", pct: 62 }, { label: "2024-II", pct: 65 },
  { label: "2025-I", pct: Math.max(65, _prevPct - 2) }, { label: "2025-II", pct: _prevPct },
  { label: "2026-I", pct: _curPct },
];
const demoTargets: Partial<Record<string, number>> = { reconocimiento: 70, comunicacion: 72, equidad: 68, bienestar: 75 };
const demoPlan: ActionRow[] = [
  { dimension: "Reconocimiento", finding: "Dimensión más baja (58%); reconocimiento insuficiente del esfuerzo diario.", level: "low", action: "Institucionalizar programa mensual de reconocimiento con criterios claros.", responsible: "Talento Humano", deadline: "2026-08-15", indicator: "N.º de reconocimientos y percepción de valoración", priority: "Alta", status: "en_progreso" },
  { dimension: "Comunicación interna", finding: "Retroceso semestral; información no llega con igual claridad a todas las áreas.", level: "low", action: "Protocolizar canales y reuniones breves de coordinación semanal.", responsible: "TH / Jefaturas", deadline: "2026-07-31", indicator: "% de áreas con reunión semanal registrada", priority: "Alta", status: "pendiente" },
  { dimension: "Bienestar psicosocial", finding: "Retrocede 2 pts; conviene monitorear presión y balance laboral.", level: "medium", action: "Plan de bienestar psicosocial y revisión de cargas en áreas críticas.", responsible: "Talento Humano", deadline: "2026-09-30", indicator: "Índice de bienestar y carga percibida", priority: "Media", status: "pendiente" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS Y CONSTANTES DEL FLUJO CONSULTOR
// ─────────────────────────────────────────────────────────────────────────────

type WorkflowStep = "empresa" | "periodo" | "encuesta" | "validacion" | "resultados";
type ResultsTab = "dashboard" | "report" | "survey";

interface DemoCompany {
  id: string; nombre: string; sector: string; empleados: number;
  departamentos: string[]; lastPeriod: string | null; lastScore: number | null;
  status: "validated" | "collecting" | "pending_validation" | "new";
  subTier: "Básico" | "Profesional" | "Enterprise"; subExpiry: string;
}

const DEMO_COMPANIES: DemoCompany[] = [
  { id: "demo", nombre: "Empresa Demostración S.A.", sector: "Servicios", empleados: 120, departamentos: ["Gerencia","Administración","Talento Humano","Financiero","Comercial","Operaciones","Logística"], lastPeriod: "2026 · I Semestre", lastScore: _curPct, status: "validated", subTier: "Profesional", subExpiry: "2026-12-31" },
  { id: "andina", nombre: "Constructora Andina Cía.", sector: "Construcción", empleados: 85, departamentos: ["Dirección","Obras","Administración","RRHH","Finanzas"], lastPeriod: "2026 · I Semestre", lastScore: null, status: "collecting", subTier: "Básico", subExpiry: "2026-09-30" },
  { id: "hospital", nombre: "Hospital del Valle", sector: "Salud", empleados: 210, departamentos: ["Medicina","Enfermería","Cirugía","Administración","Farmacia","Urgencias"], lastPeriod: "2026 · I Semestre", lastScore: 68, status: "pending_validation", subTier: "Enterprise", subExpiry: "2026-12-31" },
  { id: "tech", nombre: "Tech Solutions Ecuador", sector: "Tecnología", empleados: 45, departamentos: ["Desarrollo","QA","Producto","Ventas","Soporte"], lastPeriod: null, lastScore: null, status: "new", subTier: "Básico", subExpiry: "2026-06-19" },
];

const TIER_COLORS: Record<string, string> = { "Básico": "#38bdf8", "Profesional": "#d4af37", "Enterprise": "#a855f7" };
const STATUS_CFG = {
  validated:          { label: "Validado ✓",           color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  collecting:         { label: "Recolectando...",       color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
  pending_validation: { label: "Pendiente validación",  color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  new:                { label: "Sin medición",          color: "#94a3b8", bg: "rgba(148,163,184,0.1)"  },
};

const TIER_LIMITS: Record<string, string> = {
  "Básico":       "1 medición/año · hasta 100 colaboradores",
  "Profesional":  "2 mediciones/año · hasta 300 colaboradores · validación profesional",
  "Enterprise":   "Mediciones ilimitadas · colaboradores ilimitados · benchmarking sectorial",
};

const SUBS_DATA = [
  { company: "Empresa Demostración S.A.", tier: "Profesional" as const, inicio: "2026-01-01", fin: "2026-12-31", empleados: 120, status: "activa" },
  { company: "Constructora Andina Cía.",  tier: "Básico"       as const, inicio: "2026-01-01", fin: "2026-09-30", empleados:  85, status: "activa" },
  { company: "Hospital del Valle",        tier: "Enterprise"   as const, inicio: "2026-01-01", fin: "2026-12-31", empleados: 210, status: "activa" },
  { company: "Tech Solutions Ecuador",    tier: "Básico"       as const, inicio: "2025-12-01", fin: "2026-06-19", empleados:  45, status: "por_vencer" },
];

// ─────────────────────────────────────────────────────────────────────────────
// QR CODE (decorativo, no escaneable)
// ─────────────────────────────────────────────────────────────────────────────

function QRCode({ size = 156 }: { size?: number }) {
  const n = 21;
  function filled(r: number, c: number): boolean {
    if (r < 7 && c < 7) { if (r === 0||r === 6||c === 0||c === 6) return true; return r>=2&&r<=4&&c>=2&&c<=4; }
    if (r < 7 && c >= 14) { const cc=c-14; if (r===0||r===6||cc===0||cc===6) return true; return r>=2&&r<=4&&cc>=2&&cc<=4; }
    if (r >= 14 && c < 7) { const rr=r-14; if (rr===0||rr===6||c===0||c===6) return true; return rr>=2&&rr<=4&&c>=2&&c<=4; }
    if (r===6&&c>7&&c<13) return c%2===0; if (c===6&&r>7&&r<13) return r%2===0;
    return (r*17+c*13+r*c*7)%8<3;
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} style={{ imageRendering: "pixelated", display: "block", borderRadius: 8 }}>
      <rect width={n} height={n} fill="white"/>
      {Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>filled(r,c)?<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#071b33"/>:null))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW STEPPER
// ─────────────────────────────────────────────────────────────────────────────

const STEPS: { key: WorkflowStep; label: string; icon: string }[] = [
  { key: "empresa",    label: "Empresa",    icon: "🏢" },
  { key: "periodo",    label: "Período",    icon: "📅" },
  { key: "encuesta",   label: "Encuesta",   icon: "🔗" },
  { key: "validacion", label: "Validación", icon: "✅" },
  { key: "resultados", label: "Resultados", icon: "📊" },
];

function WorkflowStepper({ current, onChange, completed }: { current: WorkflowStep; onChange: (s: WorkflowStep) => void; completed: WorkflowStep[] }) {
  const curIdx = STEPS.findIndex(s => s.key === current);
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28, overflowX: "auto", padding: "4px 0 4px" }}>
      {STEPS.map((step, i) => {
        const done = completed.includes(step.key);
        const cur = step.key === current;
        return (
          <React.Fragment key={step.key}>
            <button onClick={() => onChange(step.key)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              padding: "10px 14px", borderRadius: 14, border: "none", cursor: "pointer",
              background: cur ? "rgba(56,189,248,0.12)" : "transparent", flexShrink: 0,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: done ? "1.1rem" : "1rem", fontWeight: 900,
                background: done ? "rgba(34,197,94,0.15)" : cur ? "rgba(56,189,248,0.18)" : "rgba(255,255,255,0.05)",
                border: `2px solid ${done ? "#22c55e" : cur ? "#38bdf8" : "rgba(255,255,255,0.12)"}`,
                color: done ? "#22c55e" : cur ? "#38bdf8" : "rgba(148,163,184,0.45)",
              }}>{done ? "✓" : step.icon}</div>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap", color: cur ? "#38bdf8" : done ? "#4ade80" : "rgba(148,163,184,0.45)" }}>{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, minWidth: 8, maxWidth: 36, background: i < curIdx ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.07)" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 1 — DATOS DE LA EMPRESA
// ─────────────────────────────────────────────────────────────────────────────

function StepEmpresa({ company, onNext }: { company: DemoCompany; onNext: () => void }) {
  const S = { card: { background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "24px 28px", marginBottom: 16 } as React.CSSProperties };
  const Field = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "1rem", color: "#f8fafc", fontWeight: 600 }}>{value}</div>
    </div>
  );
  return (
    <div style={{ maxWidth: 680 }}>
      <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: 20, lineHeight: 1.6 }}>
        Datos de la empresa registrados en la plataforma. El consultor completa este formulario al dar de alta un nuevo cliente.
      </p>
      <div style={S.card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
          <Field label="Razón social" value={company.nombre} />
          <Field label="Sector" value={company.sector} />
          <Field label="N.º de colaboradores" value={`${company.empleados} personas`} />
          <Field label="Suscripción activa" value={`${company.subTier} · hasta ${company.subExpiry}`} />
        </div>
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8 }}>Departamentos / Áreas</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {company.departamentos.map(d => (
              <span key={d} style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", color: "#38bdf8", fontSize: "0.8rem", fontWeight: 700 }}>{d}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 14, padding: "14px 18px", marginBottom: 24 }}>
        <p style={{ fontSize: "0.82rem", color: "#d4af37", margin: 0 }}>
          <strong>Nota:</strong> En la plataforma real el consultor puede editar esta información, agregar/quitar departamentos, ajustar el conteo de colaboradores y configurar el ciclo de medición.
        </p>
      </div>
      <button onClick={onNext} style={{ padding: "12px 32px", background: "#38bdf8", color: "#071b33", border: "none", borderRadius: 999, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}>
        Crear período de medición →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 2 — CREACIÓN DEL PERÍODO
// ─────────────────────────────────────────────────────────────────────────────

function StepPeriodo({ company, onNext }: { company: DemoCompany; onNext: () => void }) {
  const [semestre, setSemestre] = useState<"I" | "II">("I");
  const [year, setYear] = useState("2026");
  const [created, setCreated] = useState(false);
  const label = `${year} · ${semestre} Semestre`;
  return (
    <div style={{ maxWidth: 680 }}>
      <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: 20, lineHeight: 1.6 }}>
        Cada empresa realiza la medición dos veces al año (I y II semestre). El período define el intervalo en que los colaboradores pueden responder la encuesta.
      </p>
      {!created ? (
        <div style={{ background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "28px" }}>
          <h3 style={{ marginBottom: 20, fontSize: "1.1rem", color: "#f8fafc" }}>Nuevo período para {company.nombre}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8 }}>Año</label>
              <select value={year} onChange={e => setYear(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: "0.95rem" }}>
                <option value="2026">2026</option><option value="2027">2027</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8 }}>Semestre</label>
              <div style={{ display: "flex", gap: 10 }}>
                {(["I","II"] as const).map(s => (
                  <button key={s} onClick={() => setSemestre(s)} style={{
                    flex: 1, padding: "11px 0", borderRadius: 12, fontWeight: 800, fontSize: "0.95rem", cursor: "pointer",
                    background: semestre === s ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.04)",
                    border: `2px solid ${semestre === s ? "#38bdf8" : "rgba(255,255,255,0.12)"}`,
                    color: semestre === s ? "#38bdf8" : "#94a3b8",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.18)", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
            <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>
              <strong style={{ color: "#38bdf8" }}>Período:</strong> {label} &nbsp;·&nbsp; Apertura: <strong>hoy</strong> &nbsp;·&nbsp; Cierre sugerido: <strong>30 días</strong>
            </p>
          </div>
          <button onClick={() => setCreated(true)} style={{ padding: "12px 32px", background: "#38bdf8", color: "#071b33", border: "none", borderRadius: 999, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}>
            Crear período y generar enlace →
          </button>
        </div>
      ) : (
        <div>
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 16, padding: "18px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: "1.8rem" }}>✅</div>
            <div>
              <div style={{ fontWeight: 800, color: "#22c55e", marginBottom: 2 }}>Período creado exitosamente</div>
              <div style={{ fontSize: "0.84rem", color: "#94a3b8" }}>{label} · {company.nombre}</div>
            </div>
          </div>
          <button onClick={onNext} style={{ padding: "12px 32px", background: "#38bdf8", color: "#071b33", border: "none", borderRadius: 999, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}>
            Ver enlace y compartir encuesta →
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 3 — ENLACE Y SEGUIMIENTO EN VIVO
// ─────────────────────────────────────────────────────────────────────────────

const SURVEY_URL = "https://clima.cenvit.ec/s/DEMO26I";
const DEPT_RESPONSES = [
  { name: "Gerencia", received: 8, total: 8 },
  { name: "Administración", received: 14, total: 16 },
  { name: "Talento Humano", received: 10, total: 10 },
  { name: "Financiero", received: 11, total: 14 },
  { name: "Comercial", received: 18, total: 20 },
  { name: "Operaciones", received: 17, total: 22 },
  { name: "Logística", received: 9, total: 13 },
];

function StepEncuesta({ onNext }: { onNext: () => void }) {
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [totalReceived, setTotalReceived] = useState(87);
  const [closed, setClosed] = useState(false);
  const total = 103;

  useEffect(() => {
    if (!simulating) return;
    if (totalReceived >= total) { setSimulating(false); return; }
    const t = setTimeout(() => setTotalReceived(n => Math.min(n + Math.ceil(Math.random() * 3), total)), 160);
    return () => clearTimeout(t);
  }, [simulating, totalReceived]);

  const pct = Math.round((totalReceived / 120) * 100);

  function copy() { navigator.clipboard?.writeText(SURVEY_URL).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  return (
    <div style={{ maxWidth: 780 }}>
      <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: 20, lineHeight: 1.6 }}>
        El consultor comparte este enlace único con los colaboradores. Cada respuesta es anónima y se registra en tiempo real.
      </p>

      {/* URL + QR */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "24px 24px" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 10 }}>Enlace de la encuesta</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#38bdf8", fontSize: "0.88rem", fontFamily: "monospace", wordBreak: "break-all" }}>{SURVEY_URL}</div>
            <button onClick={copy} style={{ padding: "10px 18px", borderRadius: 10, background: copied ? "rgba(34,197,94,0.2)" : "rgba(56,189,248,0.15)", border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(56,189,248,0.3)"}`, color: copied ? "#22c55e" : "#38bdf8", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", whiteSpace: "nowrap" }}>
              {copied ? "✓ Copiado" : "Copiar"}
            </button>
          </div>
          <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.6 }}>
            Comparte por WhatsApp, correo o intranet. Cada colaborador responde una vez desde su dispositivo. La encuesta incluye <strong style={{ color: "#f8fafc" }}>52 preguntas</strong> en 10 dimensiones (~8 min).
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <QRCode size={140} />
          <span style={{ fontSize: "0.68rem", color: "#94a3b8", textAlign: "center" }}>Escanear para<br/>acceder</span>
        </div>
      </div>

      {/* Participación */}
      <div style={{ background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "22px 24px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 4 }}>Participación en tiempo real</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: "2.4rem", fontWeight: 900, color: scoreLevelColor(pct) }}>{totalReceived}</span>
              <span style={{ fontSize: "1.1rem", color: "#94a3b8" }}>/ 120 colaboradores</span>
              <span style={{ fontSize: "1rem", fontWeight: 800, color: scoreLevelColor(pct) }}>({pct}%)</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: 4 }}>Tasa de respuesta</div>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: `conic-gradient(${scoreLevelColor(pct)} ${pct * 3.6}deg, rgba(255,255,255,0.07) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#071b33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 900, color: scoreLevelColor(pct) }}>{pct}%</div>
            </div>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 18 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${scoreLevelColor(pct)}, ${scoreLevelColor(pct)}bb)`, borderRadius: 999, transition: "width 0.3s" }} />
        </div>
        {/* Dept breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {DEPT_RESPONSES.map(d => {
            const dp = Math.round((d.received / d.total) * 100);
            return (
              <div key={d.name} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: "0.8rem" }}>
                  <span style={{ color: "#f8fafc", fontWeight: 600 }}>{d.name}</span>
                  <span style={{ color: "#94a3b8" }}>{d.received}/{d.total}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.07)" }}>
                  <div style={{ height: "100%", width: `${dp}%`, background: dp === 100 ? "#22c55e" : "#38bdf8", borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {!closed ? (
          <>
            <button onClick={() => setSimulating(true)} disabled={simulating || totalReceived >= total} style={{
              padding: "11px 24px", borderRadius: 999, fontWeight: 800, fontSize: "0.88rem", cursor: "pointer",
              background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8",
              opacity: simulating || totalReceived >= total ? 0.5 : 1,
            }}>
              {simulating ? "⏳ Simulando respuestas..." : totalReceived >= total ? "✓ Respuestas simuladas" : "▶ Simular más respuestas"}
            </button>
            <button onClick={() => setClosed(true)} style={{ padding: "11px 24px", borderRadius: 999, fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)", color: "#fb923c" }}>
              Cerrar período
            </button>
          </>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#22c55e", fontWeight: 800 }}>✓ Período cerrado · {totalReceived} respuestas registradas</span>
            </div>
            <button onClick={onNext} style={{ padding: "11px 28px", background: "#d4af37", color: "#071b33", border: "none", borderRadius: 999, fontWeight: 800, fontSize: "0.88rem", cursor: "pointer" }}>
              Enviar a validación →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 4 — VALIDACIÓN PSICÓLOGO LABORAL
// ─────────────────────────────────────────────────────────────────────────────

function StepValidacion({ onNext }: { onNext: () => void }) {
  const [valState, setValState] = useState<"pending" | "reviewing" | "approved">("pending");
  const [notes, setNotes] = useState("");

  const keyMetrics = [
    { label: "Índice Global", value: `${_curPct}%`, sub: scoreLevelLabel(_curPct), color: scoreLevelColor(_curPct) },
    { label: "Dimensión más alta", value: "T. en equipo", sub: "82% · Favorable", color: "#22c55e" },
    { label: "Dimensión más baja", value: "Reconocimiento", sub: "58% · Crítico", color: "#f87171" },
    { label: "Respuestas", value: "103 / 120", sub: "85.8% participación", color: "#38bdf8" },
  ];

  return (
    <div style={{ maxWidth: 720 }}>
      <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: 20, lineHeight: 1.6 }}>
        Antes de liberar el informe al cliente, un <strong style={{ color: "#f8fafc" }}>Psicólogo Laboral certificado</strong> revisa los resultados, añade contexto profesional y valida que el análisis sea riguroso y ético.
      </p>

      {/* Métricas clave */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {keyMetrics.map(m => (
          <div key={m.label} style={{ background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "16px 14px", textAlign: "center" }}>
            <div style={{ fontSize: "0.64rem", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: m.color, marginBottom: 3 }}>{m.value}</div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Estado de validación */}
      <div style={{ background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "24px 28px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(212,175,55,0.12)", border: "2px solid rgba(212,175,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>👨‍🔬</div>
          <div>
            <div style={{ fontWeight: 800, color: "#f8fafc" }}>Psic. Iván Viteri, MSc.</div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Psicólogo Laboral · Reg. SENESCYT · CENVIT GTH</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{
              padding: "6px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 800,
              background: valState === "approved" ? "rgba(34,197,94,0.15)" : valState === "reviewing" ? "rgba(56,189,248,0.15)" : "rgba(249,115,22,0.15)",
              border: `1px solid ${valState === "approved" ? "rgba(34,197,94,0.4)" : valState === "reviewing" ? "rgba(56,189,248,0.4)" : "rgba(249,115,22,0.4)"}`,
              color: valState === "approved" ? "#22c55e" : valState === "reviewing" ? "#38bdf8" : "#fb923c",
            }}>
              {valState === "approved" ? "✓ Validado" : valState === "reviewing" ? "⏳ En revisión" : "🕐 Pendiente"}
            </span>
          </div>
        </div>

        {valState !== "approved" && (
          <>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8 }}>
              Observaciones y contexto profesional
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="El psicólogo laboral añade contexto, observaciones cualitativas y recomendaciones especializadas antes de liberar el informe..."
              rows={4}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#f8fafc", fontSize: "0.88rem", lineHeight: 1.6, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {valState === "pending" && (
                <button onClick={() => setValState("reviewing")} style={{ padding: "10px 22px", borderRadius: 999, fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8" }}>
                  Iniciar revisión
                </button>
              )}
              {valState === "reviewing" && (
                <button onClick={() => setValState("approved")} style={{ padding: "10px 22px", borderRadius: 999, fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", background: "#22c55e", color: "#071b33", border: "none" }}>
                  Validar y publicar resultados ✓
                </button>
              )}
            </div>
          </>
        )}

        {valState === "approved" && (
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontWeight: 800, color: "#22c55e", marginBottom: 6 }}>✓ Resultados validados y publicados</div>
            {notes && <p style={{ fontSize: "0.84rem", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}><em>"{notes}"</em></p>}
            {!notes && <p style={{ fontSize: "0.84rem", color: "#94a3b8", margin: 0 }}>Los resultados han sido revisados y cumplen los estándares de calidad de CENVIT GTH. El informe está disponible para el cliente.</p>}
          </div>
        )}
      </div>

      {valState === "approved" && (
        <button onClick={onNext} style={{ padding: "12px 32px", background: "#d4af37", color: "#071b33", border: "none", borderRadius: 999, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}>
          Ver resultados y generar informe →
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 5 — RESULTADOS (dashboard + informe + encuesta)
// ─────────────────────────────────────────────────────────────────────────────

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
            padding: "6px 14px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
            border: `1.5px solid ${d.color}`, background: i === dimIdx ? d.color + "33" : "transparent",
            color: i === dimIdx ? d.color : "rgba(148,163,184,0.7)",
          }}>{d.label}</button>
        ))}
      </div>
      <div style={{ background: "rgba(7,27,51,0.72)", border: `1px solid ${dim.color}44`, borderRadius: 20, padding: "24px 28px", marginBottom: 16 }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: dim.color, marginBottom: 4 }}>Dimensión {dimIdx + 1} de {DIMENSIONS.length}</p>
        <h2 style={{ color: dim.color, margin: "0 0 6px", fontSize: "1.25rem" }}>{dim.label}</h2>
        <p style={{ color: "rgba(148,163,184,0.75)", fontSize: "0.82rem", margin: 0 }}>{dim.description}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {qs.map(q => (
          <div key={q.id} style={{ background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ fontSize: "0.68rem", color: dim.color, fontWeight: 900, letterSpacing: "0.1em", marginBottom: 6 }}>Pregunta {qs.indexOf(q)+1}/{qs.length}</p>
            <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.88)", margin: "0 0 14px", lineHeight: 1.5 }}>{q.text}</p>
            <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
              {LIKERT_LABELS_ES.map((lbl, li) => (
                <button key={li} onClick={() => setAnswers(a => ({...a,[q.id]:li+1}))} title={lbl} style={{
                  flex: 1, padding: "10px 4px", borderRadius: 10, border: `2px solid`,
                  borderColor: answers[q.id]===li+1 ? LIKERT_COLORS[li] : "rgba(255,255,255,0.1)",
                  background: answers[q.id]===li+1 ? LIKERT_COLORS[li]+"33" : "transparent",
                  color: answers[q.id]===li+1 ? LIKERT_COLORS[li] : "rgba(148,163,184,0.5)",
                  fontWeight: 900, fontSize: "0.95rem", cursor: "pointer",
                }}>{li+1}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {dimIdx < DIMENSIONS.length - 1 && (
        <button onClick={() => setDimIdx(dimIdx+1)} style={{ marginTop: 20, padding: "12px 32px", background: dim.color, color: "white", border: "none", borderRadius: 999, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}>
          Siguiente → {DIMENSIONS[dimIdx+1].label}
        </button>
      )}
    </div>
  );
}

function StepResultados() {
  const [tab, setTab] = useState<ResultsTab>("dashboard");
  const tabs: [ResultsTab, string][] = [["dashboard","📊 Dashboard"], ["report","📄 Informe 14 págs"], ["survey","📝 Vista Encuesta"]];
  return (
    <div>
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 24 }}>
        {tabs.map(([t, lbl]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem",
            color: tab === t ? "#38bdf8" : "rgba(148,163,184,0.6)",
            borderBottom: `2px solid ${tab === t ? "#38bdf8" : "transparent"}`,
          }}>{lbl}</button>
        ))}
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
          benchmark={{}} sectorLabel="General (Latinoamérica)"
          plan={demoPlan} history={demoHistory}
          logoCenvit={LOGO_CENVIT} logoIvan={LOGO_IVAN}
        />
      ) : tab === "survey" ? (
        <SurveyPreview />
      ) : (
        <PeriodDashboard
          responses={currentResponses} periodoLabel="2026 · I Semestre"
          empresaNombre="Empresa Demostración S.A." totalColaboradores={120}
          targets={demoTargets} sectorKey="general"
          prevResponses={prevResponses} prevLabel="2025 · II Semestre"
          savedPlan={demoPlan} history={demoHistory}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETA DE EMPRESA (portfolio)
// ─────────────────────────────────────────────────────────────────────────────

function CompanyCard({ company, onOpen }: { company: DemoCompany; onOpen: () => void }) {
  const sc = STATUS_CFG[company.status];
  const tc = TIER_COLORS[company.subTier];
  const daysLeft = Math.ceil((new Date(company.subExpiry).getTime() - Date.now()) / 86400000);
  return (
    <div style={{ background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 22, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#f8fafc", margin: "0 0 4px", lineHeight: 1.2 }}>{company.nombre}</h3>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{company.sector} · {company.empleados} colaboradores</span>
        </div>
        <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 800, background: tc + "18", border: `1px solid ${tc}44`, color: tc, whiteSpace: "nowrap", flexShrink: 0 }}>{company.subTier}</span>
      </div>

      {company.lastPeriod && (
        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>Última medición · {company.lastPeriod}</div>
          {company.lastScore !== null ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)" }}>
                <div style={{ height: "100%", width: `${company.lastScore}%`, background: scoreLevelColor(company.lastScore), borderRadius: 999 }} />
              </div>
              <span style={{ fontSize: "0.88rem", fontWeight: 800, color: scoreLevelColor(company.lastScore) }}>{company.lastScore}%</span>
            </div>
          ) : (
            <div style={{ fontSize: "0.84rem", color: "#38bdf8" }}>Recolectando respuestas...</div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 800, background: sc.bg, border: `1px solid ${sc.color}44`, color: sc.color }}>{sc.label}</span>
        <span style={{ fontSize: "0.7rem", color: daysLeft <= 30 ? "#fb923c" : "#94a3b8" }}>Vence: {company.subExpiry} {daysLeft <= 30 ? `(${daysLeft}d)` : ""}</span>
      </div>

      <button onClick={onOpen} style={{ width: "100%", padding: "10px 0", borderRadius: 12, fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8" }}>
        {company.status === "validated" ? "Ver resultados →" : company.status === "collecting" ? "Ver seguimiento →" : company.status === "pending_validation" ? "Validar →" : "Iniciar medición →"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO CONSULTOR
// ─────────────────────────────────────────────────────────────────────────────

function ConsultantPortfolio({ onSelectCompany }: { onSelectCompany: (id: string) => void }) {
  const stats = [
    { label: "Empresas cliente", value: "4", icon: "🏢" },
    { label: "Mediciones activas", value: "3", icon: "📊" },
    { label: "Pendientes validación", value: "1", icon: "⏳" },
    { label: "Suscripciones activas", value: "4", icon: "💳" },
  ];
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f8fafc", marginBottom: 4 }}>Portfolio de Clientes</h2>
        <p style={{ fontSize: "0.88rem", color: "#94a3b8" }}>Gestiona las mediciones de clima laboral de tus empresas cliente.</p>
      </div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f8fafc", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {DEMO_COMPANIES.map(c => <CompanyCard key={c.id} company={c} onOpen={() => onSelectCompany(c.id)} />)}
        {/* Nueva empresa card */}
        <div style={{ background: "rgba(7,27,51,0.4)", border: "2px dashed rgba(255,255,255,0.12)", borderRadius: 22, padding: "22px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 200, cursor: "pointer" }} onClick={() => onSelectCompany("new")}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(56,189,248,0.1)", border: "2px dashed rgba(56,189,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>+</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, color: "#38bdf8", marginBottom: 4 }}>Nuevo cliente</div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Dar de alta una empresa y crear su primer período de medición</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTIÓN DE SUSCRIPCIONES
// ─────────────────────────────────────────────────────────────────────────────

function SubscriptionManager() {
  const [showNew, setShowNew] = useState(false);
  const statusColor = (s: string) => s === "activa" ? "#22c55e" : s === "por_vencer" ? "#f97316" : "#f87171";
  const statusLabel = (s: string) => s === "activa" ? "Activa" : s === "por_vencer" ? "Por vencer" : "Expirada";

  const plans = [
    { tier: "Básico", price: "$299/año", features: ["1 medición/año","Hasta 100 colaboradores","Informe PDF automático","Soporte por correo"] },
    { tier: "Profesional", price: "$599/año", features: ["2 mediciones/año","Hasta 300 colaboradores","Validación Psicólogo Laboral","Benchmarking sectorial","Soporte prioritario"] },
    { tier: "Enterprise", price: "$1.299/año", features: ["Mediciones ilimitadas","Colaboradores ilimitados","Consultor dedicado","Acceso multi-empresa","API + integraciones"] },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f8fafc", marginBottom: 4 }}>Suscripciones</h2>
          <p style={{ fontSize: "0.88rem", color: "#94a3b8" }}>Empresas con acceso a la plataforma para realizar mediciones de forma independiente.</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} style={{ padding: "10px 22px", background: "#d4af37", color: "#071b33", border: "none", borderRadius: 999, fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}>
          + Nueva suscripción
        </button>
      </div>

      {/* Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {plans.map(p => {
          const tc = TIER_COLORS[p.tier];
          return (
            <div key={p.tier} style={{ background: "rgba(7,27,51,0.72)", border: `1px solid ${tc}33`, borderRadius: 20, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontWeight: 900, color: tc, fontSize: "1rem" }}>{p.tier}</span>
                <span style={{ fontWeight: 900, color: "#f8fafc", fontSize: "1.05rem" }}>{p.price}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {p.features.map(f => <li key={f} style={{ fontSize: "0.78rem", color: "#94a3b8", display: "flex", gap: 7, alignItems: "flex-start" }}><span style={{ color: tc, flexShrink: 0, marginTop: 1 }}>✓</span>{f}</li>)}
              </ul>
            </div>
          );
        })}
      </div>

      {/* New subscription form */}
      {showNew && (
        <div style={{ background: "rgba(7,27,51,0.85)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 20, padding: "24px 28px", marginBottom: 24 }}>
          <h3 style={{ marginBottom: 18, color: "#d4af37" }}>Nueva suscripción</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {["Empresa", "Plan", "Vigencia (meses)"].map(l => (
              <div key={l}>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>{l}</label>
                <input placeholder={l === "Empresa" ? "Nombre de la empresa" : l === "Plan" ? "Básico / Profesional / Enterprise" : "12"} style={{ width: "100%", padding: "10px 13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#f8fafc", fontSize: "0.9rem" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button style={{ padding: "10px 24px", background: "#d4af37", color: "#071b33", border: "none", borderRadius: 999, fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}>Crear suscripción</button>
            <button onClick={() => setShowNew(false)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", borderRadius: 999, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "rgba(7,27,51,0.72)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Empresa","Plan","Desde","Hasta","Colaboradores","Estado","Acciones"].map(h => (
                <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUBS_DATA.map((s, i) => {
              const tc = TIER_COLORS[s.tier];
              const sc = statusColor(s.status);
              return (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "14px 18px", fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc" }}>{s.company}</td>
                  <td style={{ padding: "14px 18px" }}><span style={{ padding: "4px 12px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 800, background: tc + "18", color: tc }}>{s.tier}</span></td>
                  <td style={{ padding: "14px 18px", fontSize: "0.82rem", color: "#94a3b8" }}>{s.inicio}</td>
                  <td style={{ padding: "14px 18px", fontSize: "0.82rem", color: "#94a3b8" }}>{s.fin}</td>
                  <td style={{ padding: "14px 18px", fontSize: "0.88rem", color: "#f8fafc", fontWeight: 600 }}>{s.empleados}</td>
                  <td style={{ padding: "14px 18px" }}><span style={{ padding: "4px 12px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 800, background: sc + "18", border: `1px solid ${sc}44`, color: sc }}>{statusLabel(s.status)}</span></td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", color: "#38bdf8", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Renovar</button>
                      <button style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#fca5a5", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW COMPLETO DE LA EMPRESA
// ─────────────────────────────────────────────────────────────────────────────

function CompanyWorkflow({ companyId, onBack }: { companyId: string; onBack: () => void }) {
  const company = DEMO_COMPANIES.find(c => c.id === companyId) ?? DEMO_COMPANIES[0];
  const initialStep: WorkflowStep = company.status === "validated" ? "resultados"
    : company.status === "pending_validation" ? "validacion"
    : company.status === "collecting" ? "encuesta" : "empresa";
  const [step, setStep] = useState<WorkflowStep>(initialStep);
  const [completed, setCompleted] = useState<WorkflowStep[]>(() => {
    if (company.status === "validated")          return ["empresa","periodo","encuesta","validacion","resultados"];
    if (company.status === "pending_validation") return ["empresa","periodo","encuesta"];
    if (company.status === "collecting")         return ["empresa","periodo"];
    return [];
  });

  function advance(next: WorkflowStep) {
    setCompleted(prev => prev.includes(step) ? prev : [...prev, step]);
    setStep(next);
  }

  const stepsSeq: WorkflowStep[] = ["empresa","periodo","encuesta","validacion","resultados"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>← Portfolio</button>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#f8fafc", margin: 0 }}>{company.nombre}</h2>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>{company.sector} · {company.empleados} colaboradores · Suscripción {company.subTier}</p>
        </div>
      </div>
      <WorkflowStepper current={step} onChange={setStep} completed={completed} />
      <div style={{ background: "rgba(7,27,51,0.55)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "28px 32px" }}>
        {step === "empresa"    && <StepEmpresa company={company} onNext={() => advance("periodo")} />}
        {step === "periodo"    && <StepPeriodo company={company} onNext={() => advance("encuesta")} />}
        {step === "encuesta"   && <StepEncuesta onNext={() => advance("validacion")} />}
        {step === "validacion" && <StepValidacion onNext={() => advance("resultados")} />}
        {step === "resultados" && <StepResultados />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RAÍZ PRINCIPAL — DEMO DEL CONSULTOR
// ─────────────────────────────────────────────────────────────────────────────

function DemoRoot() {
  const [navTab, setNavTab] = useState<"portfolio" | "subscriptions">("portfolio");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const inCompany = selectedCompanyId !== null && selectedCompanyId !== "new";

  return (
    <div className="shell">
      <style>{css}</style>

      {/* Logo injection for print */}
      <script dangerouslySetInnerHTML={{ __html: `window.addEventListener('beforeprint',function(){document.querySelectorAll('img').forEach(function(img){if(img.alt==='CENVIT'||img.alt==='Cenvit')img.src=${JSON.stringify(LOGO_CENVIT)};if(img.alt==='Iván Viteri')img.src=${JSON.stringify(LOGO_IVAN)};});});` }} />

      {/* Header */}
      <header style={{ background: "rgba(4,20,38,0.95)", borderBottom: "1px solid rgba(212,175,55,0.2)", padding: "10px 28px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(14px)" }}>
        <img src={LOGO_CENVIT} alt="Cenvit" style={{ height: 44, width: 44, objectFit: "contain", background: "white", borderRadius: 8, padding: 4, border: "1px solid rgba(212,175,55,0.4)" }} />
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />
        <div>
          <div style={{ fontWeight: 900, fontSize: "0.82rem", color: "#d4af37", letterSpacing: "0.08em" }}>CENVIT GTH</div>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 1 }}>Panel del Consultor</div>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontStyle: "italic", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", padding: "4px 12px", borderRadius: 999 }}>⚠ Demo — datos simulados</span>
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: "0.82rem", color: "#f8fafc" }}>Iván Viteri</div>
          <div style={{ fontSize: "0.63rem", color: "#94a3b8" }}>Psicólogo Laboral</div>
        </div>
        <img src={LOGO_IVAN} alt="Iván Viteri" style={{ height: 44, width: 44, objectFit: "contain", background: "white", borderRadius: 8, padding: 4, border: "1px solid rgba(56,189,248,0.3)" }} />
      </header>

      {/* Nav bar */}
      {!inCompany && (
        <div style={{ background: "rgba(7,27,51,0.9)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 28px", display: "flex", gap: 2 }}>
          {([["portfolio","🏠 Portfolio"], ["subscriptions","💳 Suscripciones"]] as const).map(([t, l]) => (
            <button key={t} onClick={() => setNavTab(t)} style={{
              padding: "12px 20px", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.83rem",
              color: navTab === t ? "#38bdf8" : "rgba(148,163,184,0.6)",
              borderBottom: `2px solid ${navTab === t ? "#38bdf8" : "transparent"}`,
            }}>{l}</button>
          ))}
        </div>
      )}

      <div className="container" style={{ paddingTop: 32 }}>
        {inCompany ? (
          <CompanyWorkflow companyId={selectedCompanyId!} onBack={() => setSelectedCompanyId(null)} />
        ) : navTab === "subscriptions" ? (
          <SubscriptionManager />
        ) : (
          <ConsultantPortfolio onSelectCompany={id => { if (id !== "new") setSelectedCompanyId(id); }} />
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><DemoRoot /></React.StrictMode>
);

void DIMENSIONS;
