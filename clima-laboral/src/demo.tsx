import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { PeriodDashboard } from "./PeriodDashboard";
import { ReportDocument } from "./ReportDocument";
import { QUESTIONS, DIMENSIONS } from "./questions";
import { css } from "./styles";
import { LOGO_CENVIT as _LC, LOGO_IVAN as _LI } from "./logoData";
// Fallback a archivos /public si no hay base64 local (builds CI/CD sin logoData real)
const _BASE = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
const LOGO_CENVIT = _LC || `${_BASE}logo-cenvit.png`;
const LOGO_IVAN = _LI || `${_BASE}logo-ivan-viteri.jpg`;
import type { ActionRow, SurveyResponse, LikertValue } from "./types";
import { scoreLevelColor, scoreLevelLabel } from "./shared";

// ─────────────────────────────────────────────────────────────────────────────
// GENERACIÓN DE DATOS
// ─────────────────────────────────────────────────────────────────────────────

function demoGlobalPct(responses: SurveyResponse[]): number {
  let sum = 0, count = 0;
  for (const r of responses) for (const q of QUESTIONS) { const v = r.answers[q.id]; if (v !== undefined) { sum += v; count++; } }
  return count === 0 ? 0 : Math.round((sum / count / 5) * 100);
}
let _s = 123456789;
function rng(): number { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; }
function gauss(m: number, sd: number): number { const u = Math.max(rng(), 1e-6), v = rng(); return m + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function cl(x: number): LikertValue { return Math.max(1, Math.min(5, Math.round(x))) as LikertValue; }

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
function makeResponses(periodBias: number, withCmt: boolean): SurveyResponse[] {
  const POS = ["Excelente compañerismo y apoyo mutuo en el equipo.","Buenas oportunidades de aprendizaje este semestre.","Mi jefe directo da buena retroalimentación y respeto."];
  const NEG = ["Poco reconocimiento por el esfuerzo diario.","Comunicación difícil entre áreas, falta claridad.","Sin oportunidades de crecimiento visibles."];
  const NEU = ["Algunas cosas bien, otras mejorables.","En general estable, revisar cargas de trabajo."];
  const out: SurveyResponse[] = []; let id = 0;
  for (const dept of DEPTS) for (let i = 0; i < dept.n; i++) {
    const answers: Record<number, LikertValue> = {};
    for (const q of QUESTIONS) answers[q.id] = cl(gauss((DIM_BASE[q.dimension] ?? 3.2) + dept.bias + periodBias, 0.9));
    const avg = Object.values(answers).reduce((s, v) => s + v, 0) / QUESTIONS.length;
    out.push({ id: `d-${id++}`, createdAt: new Date(Date.now() - Math.floor(rng() * 25) * 86400000).toISOString(), department: dept.name, answers,
      comment: withCmt && rng() < 0.4 ? (avg >= 3.7 ? POS : avg <= 2.9 ? NEG : NEU)[Math.floor(rng() * 3)] : undefined });
  }
  return out;
}

const curR = makeResponses(0, true);
const prevR = makeResponses(-0.11, false);
const curPct = demoGlobalPct(curR);
const prevPct = demoGlobalPct(prevR);
const demoHistory = [{ label: "2024-I", pct: 62 }, { label: "2024-II", pct: 65 }, { label: "2025-I", pct: Math.max(65, prevPct - 2) }, { label: "2025-II", pct: prevPct }, { label: "2026-I", pct: curPct }];
const demoTargets: Partial<Record<string, number>> = { reconocimiento: 70, comunicacion: 72, equidad: 68, bienestar: 75 };
const demoPlan: ActionRow[] = [
  { dimension: "Reconocimiento", finding: "Dimensión más baja (58%); reconocimiento insuficiente.", level: "low", action: "Programa mensual de reconocimiento con criterios claros.", responsible: "Talento Humano", deadline: "2026-08-15", indicator: "N.º reconocimientos / percepción de valoración", priority: "Alta", status: "en_progreso" },
  { dimension: "Comunicación interna", finding: "Retroceso semestral; información no llega a todas las áreas.", level: "low", action: "Protocolizar canales y reuniones semanales de coordinación.", responsible: "TH / Jefaturas", deadline: "2026-07-31", indicator: "% áreas con reunión semanal registrada", priority: "Alta", status: "pendiente" },
  { dimension: "Bienestar psicosocial", finding: "Retrocede 2 pts; monitorear presión y balance laboral.", level: "medium", action: "Plan de bienestar psicosocial y revisión de cargas.", responsible: "Talento Humano", deadline: "2026-09-30", indicator: "Índice de bienestar y carga percibida", priority: "Media", status: "pendiente" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS Y CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

type SideSection = "dashboard" | "empresas" | "mediciones" | "validaciones" | "subscriptions" | "config";
type WorkflowStep = "empresa" | "periodo" | "encuesta" | "validacion" | "resultados";
type ResultsTab = "dashboard" | "report" | "survey";

interface DemoCompany { id: string; nombre: string; sector: string; empleados: number; departamentos: string[]; lastPeriod: string | null; lastScore: number | null; lastResponses: number | null; lastTotal: number | null; status: "validated" | "collecting" | "pending_validation" | "new"; subTier: "Básico" | "Profesional" | "Enterprise"; subExpiry: string; }

const COMPANIES: DemoCompany[] = [
  { id: "demo",    nombre: "Empresa Demostración S.A.",  sector: "Servicios",    empleados: 120, departamentos: ["Gerencia","Administración","Talento Humano","Financiero","Comercial","Operaciones","Logística"],   lastPeriod: "2026 · I Sem.", lastScore: curPct, lastResponses: 103, lastTotal: 120, status: "validated",          subTier: "Profesional", subExpiry: "2026-12-31" },
  { id: "andina",  nombre: "Constructora Andina Cía.",   sector: "Construcción", empleados:  85, departamentos: ["Dirección","Obras","Administración","RRHH","Finanzas"],                                             lastPeriod: "2026 · I Sem.", lastScore: null,    lastResponses:  55, lastTotal:  85, status: "collecting",         subTier: "Básico",       subExpiry: "2026-09-30" },
  { id: "hospital",nombre: "Hospital del Valle",         sector: "Salud",        empleados: 210, departamentos: ["Medicina","Enfermería","Cirugía","Administración","Farmacia","Urgencias"],                           lastPeriod: "2026 · I Sem.", lastScore: 68,      lastResponses: 187, lastTotal: 210, status: "pending_validation", subTier: "Enterprise",   subExpiry: "2026-12-31" },
  { id: "tech",    nombre: "Tech Solutions Ecuador",     sector: "Tecnología",   empleados:  45, departamentos: ["Desarrollo","QA","Producto","Ventas","Soporte"],                                                     lastPeriod: null,            lastScore: null,    lastResponses: null, lastTotal: null, status: "new",              subTier: "Básico",       subExpiry: "2026-06-19" },
];

const TIER_C: Record<string, string> = { "Básico": "#38bdf8", "Profesional": "#d4af37", "Enterprise": "#a855f7" };
const STATUS_CFG = {
  validated:          { label: "Validado ✓",          color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  collecting:         { label: "Recolectando...",      color: "#38bdf8", bg: "rgba(56,189,248,0.12)"  },
  pending_validation: { label: "Pend. validación",     color: "#f97316", bg: "rgba(249,115,22,0.12)"  },
  new:                { label: "Sin medición",         color: "#94a3b8", bg: "rgba(148,163,184,0.1)"  },
};
const SUBS = [
  { company: "Empresa Demostración S.A.", tier: "Profesional" as const, inicio: "2026-01-01", fin: "2026-12-31", empleados: 120, status: "activa"    },
  { company: "Constructora Andina Cía.",  tier: "Básico"       as const, inicio: "2026-01-01", fin: "2026-09-30", empleados:  85, status: "activa"    },
  { company: "Hospital del Valle",        tier: "Enterprise"   as const, inicio: "2026-01-01", fin: "2026-12-31", empleados: 210, status: "activa"    },
  { company: "Tech Solutions Ecuador",    tier: "Básico"       as const, inicio: "2025-12-01", fin: "2026-06-19", empleados:  45, status: "por_vencer" },
];

// ─────────────────────────────────────────────────────────────────────────────
// QR CODE decorativo
// ─────────────────────────────────────────────────────────────────────────────

function QRCode({ size = 148 }: { size?: number }) {
  const n = 21;
  function f(r: number, c: number): boolean {
    if (r<7&&c<7){if(r===0||r===6||c===0||c===6)return true;return r>=2&&r<=4&&c>=2&&c<=4;}
    if (r<7&&c>=14){const cc=c-14;if(r===0||r===6||cc===0||cc===6)return true;return r>=2&&r<=4&&cc>=2&&cc<=4;}
    if (r>=14&&c<7){const rr=r-14;if(rr===0||rr===6||c===0||c===6)return true;return rr>=2&&rr<=4&&c>=2&&c<=4;}
    if(r===6&&c>7&&c<13)return c%2===0; if(c===6&&r>7&&r<13)return r%2===0;
    return(r*17+c*13+r*c*7)%8<3;
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} style={{imageRendering:"pixelated",display:"block",borderRadius:8}}>
      <rect width={n} height={n} fill="white"/>
      {Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>f(r,c)?<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#071b33"/>:null))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW STEPPER
// ─────────────────────────────────────────────────────────────────────────────

const WSTEPS: {key: WorkflowStep; label: string; icon: string}[] = [
  {key:"empresa",    label:"Empresa",    icon:"🏢"},
  {key:"periodo",    label:"Período",    icon:"📅"},
  {key:"encuesta",   label:"Encuesta",   icon:"🔗"},
  {key:"validacion", label:"Validación", icon:"✅"},
  {key:"resultados", label:"Resultados", icon:"📊"},
];

function WorkflowStepper({current, onChange, completed}: {current: WorkflowStep; onChange: (s: WorkflowStep) => void; completed: WorkflowStep[]}) {
  const ci = WSTEPS.findIndex(s => s.key === current);
  const pct = Math.round((completed.length / WSTEPS.length) * 100);
  return (
    <div style={{display:"flex",alignItems:"center",marginBottom:24,overflowX:"auto",padding:"2px 0",gap:4}}>
      {WSTEPS.map((s,i)=>{const done=completed.includes(s.key),cur=s.key===current;return(
        <React.Fragment key={s.key}>
          <button onClick={()=>onChange(s.key)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"8px 12px",borderRadius:12,border:"none",cursor:"pointer",background:cur?"rgba(56,189,248,0.1)":"transparent",flexShrink:0}}>
            <div style={{width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:done?"1rem":"0.95rem",background:done?"rgba(34,197,94,0.15)":cur?"rgba(56,189,248,0.18)":"rgba(255,255,255,0.04)",border:`2px solid ${done?"#22c55e":cur?"#38bdf8":"rgba(255,255,255,0.1)"}`,color:done?"#22c55e":cur?"#38bdf8":"rgba(148,163,184,0.4)"}}>
              {done?"✓":s.icon}
            </div>
            <span style={{fontSize:"0.68rem",fontWeight:700,whiteSpace:"nowrap",color:cur?"#38bdf8":done?"#4ade80":"rgba(148,163,184,0.4)"}}>{s.label}</span>
          </button>
          {i<WSTEPS.length-1&&<div style={{flex:1,height:2,minWidth:6,maxWidth:32,background:i<ci?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.06)"}}/>}
        </React.Fragment>
      );})}
      <div style={{marginLeft:"auto",paddingLeft:18,flexShrink:0,textAlign:"right"}}>
        <div style={{fontSize:"0.66rem",color:"#64748b",fontWeight:700,marginBottom:5}}>Paso {ci+1} de {WSTEPS.length} · <span style={{color:pct===100?"#22c55e":"#38bdf8",fontWeight:900}}>{pct}%</span></div>
        <div style={{width:110,height:4,borderRadius:999,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#22c55e":"#38bdf8",borderRadius:999,transition:"width 0.3s ease"}}/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASOS DEL WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────

function StepEmpresa({co, onNext}: {co: DemoCompany; onNext: ()=>void}) {
  const F = ({label,value}: {label:string;value:string}) => (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:"0.65rem",fontWeight:900,letterSpacing:"0.14em",textTransform:"uppercase",color:"#94a3b8",marginBottom:3}}>{label}</div>
      <div style={{fontSize:"0.95rem",color:"#f8fafc",fontWeight:600}}>{value}</div>
    </div>
  );
  return (
    <div style={{maxWidth:640}}>
      <p style={{color:"#94a3b8",fontSize:"0.85rem",marginBottom:18,lineHeight:1.6}}>Datos de la empresa registrados en la plataforma. El consultor puede actualizar esta información en cualquier momento.</p>
      <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:"22px 26px",marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 28px"}}>
          <F label="Razón social" value={co.nombre}/>
          <F label="Sector" value={co.sector}/>
          <F label="Colaboradores" value={`${co.empleados} personas`}/>
          <F label="Suscripción" value={`${co.subTier} · vence ${co.subExpiry}`}/>
        </div>
        <div style={{marginTop:6}}>
          <div style={{fontSize:"0.65rem",fontWeight:900,letterSpacing:"0.14em",textTransform:"uppercase",color:"#94a3b8",marginBottom:8}}>Áreas / Departamentos</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {co.departamentos.map(d=><span key={d} style={{padding:"4px 11px",borderRadius:999,background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.22)",color:"#38bdf8",fontSize:"0.78rem",fontWeight:700}}>{d}</span>)}
          </div>
        </div>
      </div>
      <button onClick={onNext} style={{padding:"11px 28px",background:"#38bdf8",color:"#071b33",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.88rem",cursor:"pointer"}}>Crear período de medición →</button>
    </div>
  );
}

function StepPeriodo({co, onNext}: {co: DemoCompany; onNext: ()=>void}) {
  const [sem, setSem] = useState<"I"|"II">("I");
  const [yr, setYr] = useState("2026");
  const [ok, setOk] = useState(false);
  return (
    <div style={{maxWidth:600}}>
      <p style={{color:"#94a3b8",fontSize:"0.85rem",marginBottom:18,lineHeight:1.6}}>La medición de clima laboral es semestral: I semestre (ene–jun) y II semestre (jul–dic). El período define la ventana en que los colaboradores pueden responder.</p>
      {!ok ? (
        <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:"26px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
            <div>
              <label style={{display:"block",fontSize:"0.68rem",fontWeight:900,letterSpacing:"0.1em",textTransform:"uppercase",color:"#94a3b8",marginBottom:7}}>Año</label>
              <select value={yr} onChange={e=>setYr(e.target.value)} style={{width:"100%",padding:"10px 13px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#f8fafc",fontSize:"0.93rem"}}>
                <option value="2026">2026</option><option value="2027">2027</option>
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:"0.68rem",fontWeight:900,letterSpacing:"0.1em",textTransform:"uppercase",color:"#94a3b8",marginBottom:7}}>Semestre</label>
              <div style={{display:"flex",gap:8}}>
                {(["I","II"] as const).map(s=><button key={s} onClick={()=>setSem(s)} style={{flex:1,padding:"10px 0",borderRadius:12,fontWeight:800,fontSize:"0.93rem",cursor:"pointer",background:sem===s?"rgba(56,189,248,0.18)":"rgba(255,255,255,0.04)",border:`2px solid ${sem===s?"#38bdf8":"rgba(255,255,255,0.1)"}`,color:sem===s?"#38bdf8":"#94a3b8"}}>{s}</button>)}
              </div>
            </div>
          </div>
          <div style={{background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.15)",borderRadius:10,padding:"12px 14px",marginBottom:22}}>
            <p style={{fontSize:"0.8rem",color:"#94a3b8",margin:0}}><strong style={{color:"#38bdf8"}}>Período:</strong> {yr} · {sem} Semestre · Apertura hoy · Cierre sugerido: 30 días</p>
          </div>
          <button onClick={()=>setOk(true)} style={{padding:"11px 28px",background:"#38bdf8",color:"#071b33",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.88rem",cursor:"pointer"}}>Crear período y generar enlace →</button>
        </div>
      ) : (
        <div>
          <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.28)",borderRadius:14,padding:"16px 20px",marginBottom:18,display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:"1.6rem"}}>✅</span>
            <div><div style={{fontWeight:800,color:"#22c55e",marginBottom:2}}>Período creado exitosamente</div><div style={{fontSize:"0.82rem",color:"#94a3b8"}}>{yr} · {sem} Semestre · {co.nombre}</div></div>
          </div>
          <button onClick={onNext} style={{padding:"11px 28px",background:"#38bdf8",color:"#071b33",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.88rem",cursor:"pointer"}}>Ver enlace y compartir encuesta →</button>
        </div>
      )}
    </div>
  );
}

const SURVEY_URL = "https://clima.cenvit.ec/s/DEMO26I";
const DEPT_R = [{name:"Gerencia",r:8,t:8},{name:"Administración",r:14,t:16},{name:"Talento Humano",r:10,t:10},{name:"Financiero",r:11,t:14},{name:"Comercial",r:18,t:20},{name:"Operaciones",r:17,t:22},{name:"Logística",r:9,t:13}];

function StepEncuesta({onNext}: {onNext:()=>void}) {
  const [copied, setCopied] = useState(false);
  const [sim, setSim] = useState(false);
  const [n, setN] = useState(87);
  const [closed, setClosed] = useState(false);
  const target = 103;
  useEffect(()=>{
    if(!sim)return; if(n>=target){setSim(false);return;}
    const t=setTimeout(()=>setN(x=>Math.min(x+Math.ceil(Math.random()*3),target)),160);
    return()=>clearTimeout(t);
  },[sim,n]);
  const pct=Math.round((n/120)*100);
  function copy(){navigator.clipboard?.writeText(SURVEY_URL).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}
  return (
    <div style={{maxWidth:740}}>
      <p style={{color:"#94a3b8",fontSize:"0.85rem",marginBottom:18,lineHeight:1.6}}>Comparte el enlace o el código QR con los colaboradores. Cada respuesta es anónima y se registra en tiempo real.</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 156px",gap:16,marginBottom:16}}>
        <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:"20px 22px"}}>
          <div style={{fontSize:"0.65rem",fontWeight:900,letterSpacing:"0.13em",textTransform:"uppercase",color:"#94a3b8",marginBottom:9}}>Enlace único de la encuesta</div>
          <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:14}}>
            <div style={{flex:1,padding:"9px 13px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#38bdf8",fontSize:"0.85rem",fontFamily:"monospace",wordBreak:"break-all"}}>{SURVEY_URL}</div>
            <button onClick={copy} style={{padding:"9px 16px",borderRadius:10,background:copied?"rgba(34,197,94,0.18)":"rgba(56,189,248,0.13)",border:`1px solid ${copied?"rgba(34,197,94,0.38)":"rgba(56,189,248,0.28)"}`,color:copied?"#22c55e":"#38bdf8",fontWeight:800,fontSize:"0.8rem",cursor:"pointer",whiteSpace:"nowrap"}}>{copied?"✓ Copiado":"Copiar"}</button>
          </div>
          <div style={{display:"flex",gap:7,marginBottom:11,flexWrap:"wrap"}}>
            {[{icon:"💬",label:"WhatsApp",c:"#22c55e"},{icon:"✉️",label:"Correo",c:"#38bdf8"},{icon:"🌐",label:"Intranet",c:"#a855f7"}].map(ch=>(
              <button key={ch.label} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:999,background:`${ch.c}10`,border:`1px solid ${ch.c}30`,color:ch.c,fontWeight:700,fontSize:"0.75rem",cursor:"pointer"}}>{ch.icon} {ch.label}</button>
            ))}
          </div>
          <p style={{fontSize:"0.76rem",color:"#94a3b8",margin:0,lineHeight:1.55}}><strong style={{color:"#f8fafc"}}>52 preguntas</strong> · 10 dimensiones · ~8 min · anónimo</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:9}}>
          <QRCode size={148}/>
          <span style={{fontSize:"0.67rem",color:"#94a3b8",textAlign:"center"}}>Escanear para acceder</span>
        </div>
      </div>
      {/* Participación */}
      <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:"20px 22px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
          <div>
            <div style={{fontSize:"0.65rem",fontWeight:900,letterSpacing:"0.13em",textTransform:"uppercase",color:"#94a3b8",marginBottom:4}}>Participación en tiempo real</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8}}>
              <span style={{fontSize:"2.2rem",fontWeight:900,color:scoreLevelColor(pct)}}>{n}</span>
              <span style={{fontSize:"1rem",color:"#94a3b8"}}>/ 120 · {pct}%</span>
            </div>
          </div>
          <div style={{width:56,height:56,borderRadius:"50%",background:`conic-gradient(${scoreLevelColor(pct)} ${pct*3.6}deg,rgba(255,255,255,0.06) 0)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:"#071b33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:900,color:scoreLevelColor(pct)}}>{pct}%</div>
          </div>
        </div>
        <div style={{height:7,borderRadius:999,background:"rgba(255,255,255,0.07)",overflow:"hidden",marginBottom:16}}>
          <div style={{height:"100%",width:`${pct}%`,background:scoreLevelColor(pct),borderRadius:999,transition:"width 0.25s"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(188px,1fr))",gap:8}}>
          {DEPT_R.map(d=>{const dp=Math.round((d.r/d.t)*100);return(
            <div key={d.name} style={{background:"rgba(255,255,255,0.03)",borderRadius:9,padding:"9px 11px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:"0.78rem"}}>
                <span style={{color:"#f8fafc",fontWeight:600}}>{d.name}</span>
                <span style={{color:"#94a3b8"}}>{d.r}/{d.t}</span>
              </div>
              <div style={{height:4,borderRadius:999,background:"rgba(255,255,255,0.07)"}}>
                <div style={{height:"100%",width:`${dp}%`,background:dp===100?"#22c55e":"#38bdf8",borderRadius:999}}/>
              </div>
            </div>
          );})}
        </div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {!closed ? (<>
          <button onClick={()=>setSim(true)} disabled={sim||n>=target} style={{padding:"10px 22px",borderRadius:999,fontWeight:800,fontSize:"0.84rem",cursor:"pointer",background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.28)",color:"#38bdf8",opacity:sim||n>=target?0.5:1}}>
            {sim?"⏳ Simulando...":n>=target?"✓ Simuladas":"▶ Simular respuestas"}
          </button>
          <button onClick={()=>setClosed(true)} style={{padding:"10px 22px",borderRadius:999,fontWeight:800,fontSize:"0.84rem",cursor:"pointer",background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.28)",color:"#fb923c"}}>Cerrar período</button>
        </>) : (
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{padding:"9px 16px",borderRadius:999,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.28)",color:"#22c55e",fontWeight:800,fontSize:"0.84rem"}}>✓ Período cerrado · {n} respuestas</span>
            <button onClick={onNext} style={{padding:"10px 26px",background:"#d4af37",color:"#071b33",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.84rem",cursor:"pointer"}}>Enviar a validación →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ValidationPanel({inline}: {inline?: boolean}) {
  const [state, setState] = useState<"pending"|"reviewing"|"approved">("pending");
  const [notes, setNotes] = useState("");
  const km = [{l:"Índice Global",v:`${curPct}%`,s:scoreLevelLabel(curPct),c:scoreLevelColor(curPct)},{l:"Dim. más alta",v:"T. Equipo",s:"82% · Favorable",c:"#22c55e"},{l:"Dim. más baja",v:"Reconocim.",s:"58% · Crítico",c:"#f87171"},{l:"Participación",v:"103/120",s:"85.8%",c:"#38bdf8"}];
  return (
    <div style={{maxWidth:inline?undefined:680}}>
      {!inline&&<p style={{color:"#94a3b8",fontSize:"0.85rem",marginBottom:18,lineHeight:1.6}}>Un <strong style={{color:"#f8fafc"}}>Psicólogo Laboral certificado</strong> revisa los resultados antes de liberar el informe al cliente.</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {km.map(m=><div key={m.l} style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:14,padding:"14px 12px",textAlign:"center"}}>
          <div style={{fontSize:"0.62rem",fontWeight:900,letterSpacing:"0.11em",textTransform:"uppercase",color:"#94a3b8",marginBottom:5}}>{m.l}</div>
          <div style={{fontSize:"1.2rem",fontWeight:900,color:m.c,marginBottom:2}}>{m.v}</div>
          <div style={{fontSize:"0.7rem",color:"#94a3b8"}}>{m.s}</div>
        </div>)}
      </div>
      <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:"20px 24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(212,175,55,0.1)",border:"2px solid rgba(212,175,55,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",flexShrink:0}}>👨‍🔬</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,color:"#f8fafc",marginBottom:1}}>Psic. Iván Viteri, MSc.</div>
            <div style={{fontSize:"0.75rem",color:"#94a3b8"}}>Psicólogo Laboral · Reg. SENESCYT · CENVIT GTH</div>
          </div>
          <span style={{padding:"5px 13px",borderRadius:999,fontSize:"0.72rem",fontWeight:800,background:state==="approved"?"rgba(34,197,94,0.14)":state==="reviewing"?"rgba(56,189,248,0.14)":"rgba(249,115,22,0.14)",border:`1px solid ${state==="approved"?"rgba(34,197,94,0.38)":state==="reviewing"?"rgba(56,189,248,0.38)":"rgba(249,115,22,0.38)"}`,color:state==="approved"?"#22c55e":state==="reviewing"?"#38bdf8":"#fb923c"}}>
            {state==="approved"?"✓ Validado":state==="reviewing"?"⏳ En revisión":"🕐 Pendiente"}
          </span>
        </div>
        {state!=="approved"&&(
          <>
            <label style={{display:"block",fontSize:"0.68rem",fontWeight:900,letterSpacing:"0.1em",textTransform:"uppercase",color:"#94a3b8",marginBottom:7}}>Observaciones profesionales</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Añade contexto, hallazgos cualitativos y recomendaciones especializadas antes de publicar..." rows={3} style={{width:"100%",padding:"11px 13px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#f8fafc",fontSize:"0.85rem",lineHeight:1.6,resize:"vertical"}}/>
            <div style={{display:"flex",gap:9,marginTop:12}}>
              {state==="pending"&&<button onClick={()=>setState("reviewing")} style={{padding:"9px 20px",borderRadius:999,fontWeight:800,fontSize:"0.83rem",cursor:"pointer",background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.28)",color:"#38bdf8"}}>Iniciar revisión</button>}
              {state==="reviewing"&&<button onClick={()=>setState("approved")} style={{padding:"9px 22px",borderRadius:999,fontWeight:800,fontSize:"0.83rem",cursor:"pointer",background:"#22c55e",color:"#071b33",border:"none"}}>Validar y publicar ✓</button>}
            </div>
          </>
        )}
        {state==="approved"&&(
          <div style={{background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.22)",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontWeight:800,color:"#22c55e",marginBottom:notes?6:0}}>✓ Resultados validados y publicados</div>
            {notes&&<p style={{fontSize:"0.82rem",color:"#94a3b8",lineHeight:1.6,margin:0}}><em>"{notes}"</em></p>}
            {!notes&&<p style={{fontSize:"0.82rem",color:"#94a3b8",margin:0}}>Revisados y aprobados. El informe está disponible para el cliente.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function StepValidacion({onNext}: {onNext:()=>void}) {
  const [done, setDone] = useState(false);
  return (
    <div>
      <ValidationPanel/>
      {!done&&<button onClick={()=>setDone(true)} style={{marginTop:18,padding:"11px 28px",background:"#d4af37",color:"#071b33",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.88rem",cursor:"pointer"}}>Ver resultados y generar informe →</button>}
      {done&&<button onClick={onNext} style={{marginTop:18,padding:"11px 28px",background:"#d4af37",color:"#071b33",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.88rem",cursor:"pointer"}}>Abrir dashboard de resultados →</button>}
    </div>
  );
}

const LL_ES = ["Totalmente en desacuerdo","En desacuerdo","Neutral","De acuerdo","Totalmente de acuerdo"];
const LL_C  = ["#ef4444","#f97316","#eab308","#84cc16","#22c55e"];

function SurveyPreview() {
  const [di,setDi]=useState(0); const dim=DIMENSIONS[di]; const qs=QUESTIONS.filter(q=>q.dimension===dim.key);
  const [ans,setAns]=useState<Record<number,number>>({});
  return (
    <div style={{maxWidth:700,margin:"0 auto",paddingBottom:40}}>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:22}}>
        {DIMENSIONS.map((d,i)=><button key={d.key} onClick={()=>setDi(i)} style={{padding:"5px 13px",borderRadius:999,fontSize:"0.77rem",fontWeight:700,cursor:"pointer",border:`1.5px solid ${d.color}`,background:i===di?d.color+"33":"transparent",color:i===di?d.color:"rgba(148,163,184,0.65)"}}>{d.label}</button>)}
      </div>
      <div style={{background:"rgba(7,27,51,0.65)",border:`1px solid ${dim.color}44`,borderRadius:18,padding:"22px 26px",marginBottom:14}}>
        <p style={{fontSize:"0.65rem",fontWeight:900,letterSpacing:"0.13em",textTransform:"uppercase",color:dim.color,marginBottom:3}}>Dimensión {di+1} / {DIMENSIONS.length}</p>
        <h2 style={{color:dim.color,margin:"0 0 5px",fontSize:"1.2rem"}}>{dim.label}</h2>
        <p style={{color:"rgba(148,163,184,0.72)",fontSize:"0.8rem",margin:0}}>{dim.description}</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {qs.map(q=><div key={q.id} style={{background:"rgba(7,27,51,0.65)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"16px 18px"}}>
          <p style={{fontSize:"0.65rem",color:dim.color,fontWeight:900,letterSpacing:"0.09em",marginBottom:5}}>Pregunta {qs.indexOf(q)+1}/{qs.length}</p>
          <p style={{fontSize:"0.92rem",color:"rgba(255,255,255,0.86)",margin:"0 0 12px",lineHeight:1.5}}>{q.text}</p>
          <div style={{display:"flex",gap:5}}>
            {LL_ES.map((lb,li)=><button key={li} onClick={()=>setAns(a=>({...a,[q.id]:li+1}))} title={lb} style={{flex:1,padding:"9px 3px",borderRadius:9,border:`2px solid ${ans[q.id]===li+1?LL_C[li]:"rgba(255,255,255,0.1)"}`,background:ans[q.id]===li+1?LL_C[li]+"33":"transparent",color:ans[q.id]===li+1?LL_C[li]:"rgba(148,163,184,0.45)",fontWeight:900,fontSize:"0.92rem",cursor:"pointer"}}>{li+1}</button>)}
          </div>
        </div>)}
      </div>
      {di<DIMENSIONS.length-1&&<button onClick={()=>setDi(di+1)} style={{marginTop:18,padding:"11px 28px",background:dim.color,color:"white",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.87rem",cursor:"pointer"}}>Siguiente → {DIMENSIONS[di+1].label}</button>}
    </div>
  );
}

function StepResultados() {
  const [tab,setTab]=useState<ResultsTab>("dashboard");
  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:22,background:"rgba(255,255,255,0.04)",borderRadius:12,padding:4,width:"fit-content",border:"1px solid rgba(255,255,255,0.07)"}}>
        {([["dashboard","📊 Dashboard"],["report","📄 Informe 14 págs"],["survey","📝 Vista Encuesta"]] as const).map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 16px",background:tab===t?"rgba(56,189,248,0.18)":"transparent",border:`1px solid ${tab===t?"rgba(56,189,248,0.35)":"transparent"}`,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:"0.8rem",color:tab===t?"#38bdf8":"rgba(148,163,184,0.55)",transition:"all 0.15s"}}>{l}</button>
        ))}
      </div>
      {tab!=="survey"&&(
        <div style={{display:"flex",gap:8,marginBottom:18,alignItems:"center"}}>
          {tab==="report"&&<button onClick={()=>window.print()} style={{padding:"7px 16px",borderRadius:999,background:"rgba(212,175,55,0.1)",border:"1px solid rgba(212,175,55,0.3)",color:"#d4af37",fontWeight:800,fontSize:"0.77rem",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>🖨 Imprimir informe</button>}
          {tab==="dashboard"&&<>
            <button style={{padding:"7px 16px",borderRadius:999,background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.24)",color:"#38bdf8",fontWeight:800,fontSize:"0.77rem",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>⬇ Exportar CSV</button>
            <button style={{padding:"7px 16px",borderRadius:999,background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.24)",color:"#38bdf8",fontWeight:800,fontSize:"0.77rem",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>📊 Exportar PNG</button>
          </>}
          <span style={{fontSize:"0.73rem",color:"#475569",marginLeft:4}}>{tab==="report"?"Informe 14 págs · firma del Psicólogo Laboral":"Datos del período 2026 · I Semestre"}</span>
        </div>
      )}
      {tab==="report"?<ReportDocument className="rp-screen" empresaNombre="Empresa Demostración S.A." periodoLabel="2026 · I Semestre" prevLabel="2025 · II Semestre" totalColaboradores={120} responses={curR} prevResponses={prevR} benchmark={{}} sectorLabel="General (Latinoamérica)" plan={demoPlan} history={demoHistory} logoCenvit={LOGO_CENVIT} logoIvan={LOGO_IVAN}/>
        :tab==="survey"?<SurveyPreview/>
        :<PeriodDashboard responses={curR} periodoLabel="2026 · I Semestre" empresaNombre="Empresa Demostración S.A." totalColaboradores={120} targets={demoTargets} sectorKey="general" prevResponses={prevR} prevLabel="2025 · II Semestre" savedPlan={demoPlan} history={demoHistory}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW EMPRESA
// ─────────────────────────────────────────────────────────────────────────────

function CompanyWorkflow({cid, onBack}: {cid: string; onBack: ()=>void}) {
  const co = COMPANIES.find(c=>c.id===cid)??COMPANIES[0];
  const init: WorkflowStep = co.status==="validated"?"resultados":co.status==="pending_validation"?"validacion":co.status==="collecting"?"encuesta":"empresa";
  const [step, setStep] = useState<WorkflowStep>(init);
  const [completed, setCompleted] = useState<WorkflowStep[]>(()=>{
    if(co.status==="validated")return["empresa","periodo","encuesta","validacion","resultados"];
    if(co.status==="pending_validation")return["empresa","periodo","encuesta"];
    if(co.status==="collecting")return["empresa","periodo"];
    return[];
  });
  function advance(next: WorkflowStep){setCompleted(p=>p.includes(step)?p:[...p,step]);setStep(next);}
  const sc = STATUS_CFG[co.status];
  const initials = co.nombre.split(" ").slice(0,2).map((w:string)=>w[0]).join("").toUpperCase();
  return (
    <div>
      <div style={{background:"rgba(7,27,51,0.6)",border:`1px solid ${sc.color}28`,borderRadius:20,padding:"18px 22px",marginBottom:22,boxShadow:`inset 0 3px 0 ${sc.color}80`}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:56,height:56,borderRadius:16,background:`${sc.color}18`,border:`2px solid ${sc.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:"1.3rem",color:sc.color,flexShrink:0}}>{initials}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:900,fontSize:"1.1rem",color:"#f8fafc",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{co.nombre}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:"0.75rem",color:"#94a3b8"}}>{co.sector} · {co.empleados} colaboradores</span>
              <span style={{padding:"2px 10px",borderRadius:999,fontSize:"0.7rem",fontWeight:800,background:sc.bg,border:`1px solid ${sc.color}44`,color:sc.color}}>{sc.label}</span>
              <span style={{padding:"2px 9px",borderRadius:999,fontSize:"0.7rem",fontWeight:800,background:TIER_C[co.subTier]+"18",border:`1px solid ${TIER_C[co.subTier]}33`,color:TIER_C[co.subTier]}}>{co.subTier}</span>
            </div>
          </div>
          {co.lastScore!=null&&<ScoreGauge score={co.lastScore} size={84}/>}
          {co.lastScore==null&&co.lastResponses!=null&&(
            <div style={{textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:"1.6rem",fontWeight:900,color:"#38bdf8",lineHeight:1}}>{Math.round(co.lastResponses/co.lastTotal!*100)}%</div>
              <div style={{fontSize:"0.65rem",color:"#94a3b8",marginTop:3}}>{co.lastResponses}/{co.lastTotal}</div>
              <div style={{fontSize:"0.63rem",color:"#94a3b8"}}>respuestas</div>
            </div>
          )}
          <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:10,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",fontSize:"0.8rem",fontWeight:700,cursor:"pointer",flexShrink:0,alignSelf:"flex-start"}}>← Volver</button>
        </div>
      </div>
      <WorkflowStepper current={step} onChange={setStep} completed={completed}/>
      <div style={{background:"rgba(7,27,51,0.45)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:22,padding:"26px 30px"}}>
        {step==="empresa"   &&<StepEmpresa co={co} onNext={()=>advance("periodo")}/>}
        {step==="periodo"   &&<StepPeriodo co={co} onNext={()=>advance("encuesta")}/>}
        {step==="encuesta"  &&<StepEncuesta onNext={()=>advance("validacion")}/>}
        {step==="validacion"&&<StepValidacion onNext={()=>advance("resultados")}/>}
        {step==="resultados"&&<StepResultados/>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIONES PRINCIPALES
// ─────────────────────────────────────────────────────────────────────────────

function Sparkline({data,color,w=64,h=28}:{data:number[];color:string;w?:number;h?:number}) {
  const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rng)*h*0.8-h*0.1}`).join(" ");
  const last=pts.split(" ").pop()!.split(",").map(Number);
  return(<svg width={w} height={h} style={{display:"block",overflow:"visible"}}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7}/><circle cx={last[0]} cy={last[1]} r={2.5} fill={color}/></svg>);
}

function HistoryChart({data,h=72}:{data:{label:string;pct:number}[];h?:number}) {
  const W=500,PD=32,aW=W-PD*2,MN=50,MX=100,RNG=MX-MN;
  const cx=(i:number)=>PD+(i/(data.length-1))*aW;
  const cy=(v:number)=>h-((v-MN)/RNG)*(h-18)-9;
  const lpts=data.map((_,i)=>`${cx(i)},${cy(data[i].pct)}`).join(" ");
  const apts=[`${cx(0)},${h+2}`,lpts,`${cx(data.length-1)},${h+2}`].join(" ");
  const lc=scoreLevelColor(data[data.length-1].pct);
  return(
    <svg viewBox={`0 0 ${W} ${h+26}`} width="100%" height={h+26} style={{display:"block"}} preserveAspectRatio="none">
      <defs><linearGradient id="hcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lc} stopOpacity={0.2}/><stop offset="100%" stopColor={lc} stopOpacity={0.01}/></linearGradient></defs>
      {[65,75,85].map(v=><line key={v} x1={PD} y1={cy(v)} x2={W-PD} y2={cy(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1}/>)}
      {[65,75,85].map(v=><text key={v} x={PD-4} y={cy(v)+3} textAnchor="end" fill="rgba(148,163,184,0.3)" fontSize={8}>{v}</text>)}
      <polygon points={apts} fill="url(#hcg)"/>
      <polyline points={lpts} fill="none" stroke={lc} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d,i)=>{const x=cx(i),y=cy(d.pct),last=i===data.length-1;return(
        <g key={d.label}>
          <circle cx={x} cy={y} r={last?4:2.5} fill={last?lc:"rgba(255,255,255,0.3)"} stroke={last?"rgba(0,0,0,0.2)":"none"} strokeWidth={1}/>
          <text x={x} y={h+20} textAnchor="middle" fill="rgba(148,163,184,0.55)" fontSize={9} fontWeight={700}>{d.label}</text>
          <text x={x} y={y-8} textAnchor="middle" fill={last?lc:"rgba(255,255,255,0.45)"} fontSize={last?11:9} fontWeight={last?900:600}>{d.pct}%</text>
        </g>
      );})}
    </svg>
  );
}

function ScoreGauge({score,size=130}:{score:number;size?:number}) {
  const c=size/2,r=size*0.37,sw=Math.max(6,size*0.076);
  const clr=scoreLevelColor(score);
  const p=(a:number)=>({x:+(c+r*Math.cos(a*Math.PI/180)).toFixed(2),y:+(c+r*Math.sin(a*Math.PI/180)).toFixed(2)});
  const ts=p(135),te=p(45);
  const trackD=`M${ts.x},${ts.y} A${r},${r} 0 1,1 ${te.x},${te.y}`;
  const sweep=score/100*270,ea=(135+sweep)%360,ep=p(ea);
  const scoreD=score>0?`M${ts.x},${ts.y} A${r},${r} 0 ${sweep>180?1:0},1 ${ep.x},${ep.y}`:null;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={trackD} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw} strokeLinecap="round"/>
      {scoreD&&<path d={scoreD} fill="none" stroke={clr} strokeWidth={sw} strokeLinecap="round"/>}
      <text x={c} y={c-2} textAnchor="middle" dominantBaseline="middle" fill={clr} fontSize={size*0.21} fontWeight={900}>{score}%</text>
      <text x={c} y={c+size*0.165} textAnchor="middle" dominantBaseline="middle" fill="rgba(148,163,184,0.65)" fontSize={size*0.082} fontWeight={600}>{scoreLevelLabel(score)}</text>
    </svg>
  );
}

function ScoreRing({score,size=52}:{score:number;size?:number}) {
  const sw=size*0.115,r=(size-sw*2)/2,c=size/2;
  const circ=2*Math.PI*r,clr=scoreLevelColor(score);
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw}/>
      <circle cx={c} cy={c} r={r} fill="none" stroke={clr} strokeWidth={sw}
        strokeDasharray={`${circ*score/100} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}/>
      <text x={c} y={c+1} textAnchor="middle" dominantBaseline="middle" fill={clr} fontSize={size*0.27} fontWeight={900}>{score}</text>
    </svg>
  );
}

function DimBreakdown({responses}:{responses:SurveyResponse[]}) {
  const scores=DIMENSIONS.map(d=>{
    const qs=QUESTIONS.filter(q=>q.dimension===d.key);
    let sum=0,count=0;
    for(const r of responses)for(const q of qs){const v=r.answers[q.id];if(v!==undefined){sum+=v;count++;}}
    return{key:d.key,label:d.label,pct:count===0?0:Math.round(sum/count/5*100)};
  }).sort((a,b)=>b.pct-a.pct);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      {scores.map(s=>(
        <div key={s.key}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:"0.71rem",color:"#94a3b8",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"72%"}}>{s.label}</span>
            <span style={{fontSize:"0.71rem",fontWeight:800,color:scoreLevelColor(s.pct),flexShrink:0}}>{s.pct}%</span>
          </div>
          <div style={{height:5,borderRadius:999,background:"rgba(255,255,255,0.06)"}}>
            <div style={{height:"100%",width:`${s.pct}%`,background:scoreLevelColor(s.pct),borderRadius:999,transition:"width 0.4s"}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function CountUp({to,duration=600}:{to:number;duration?:number}) {
  const [n,setN]=useState(0);
  useEffect(()=>{
    if(to===0)return;
    const start=Date.now();let raf=0;
    const step=()=>{const p=Math.min((Date.now()-start)/duration,1);setN(Math.round((1-Math.pow(1-p,3))*to));if(p<1)raf=requestAnimationFrame(step);};
    raf=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(raf);
  },[to,duration]);
  return <>{n}</>;
}

function RadarChart({responses,size=218}:{responses:SurveyResponse[];size?:number}) {
  const n=DIMENSIONS.length,cx=size/2,cy=size/2,R=size*0.32;
  const scores=DIMENSIONS.map(d=>{
    const qs=QUESTIONS.filter(q=>q.dimension===d.key);
    let sum=0,count=0;
    for(const r of responses)for(const q of qs){const v=r.answers[q.id];if(v!==undefined){sum+=v;count++;}}
    return count===0?0:Math.round(sum/count/5*100);
  });
  const avg=Math.round(scores.reduce((a,b)=>a+b,0)/n);
  const clr=scoreLevelColor(avg);
  const pt=(i:number,pct:number)=>{const a=(i/n)*2*Math.PI-Math.PI/2,rr=R*pct/100;return{x:+(cx+rr*Math.cos(a)).toFixed(1),y:+(cy+rr*Math.sin(a)).toFixed(1)};};
  const lpt=(i:number)=>{const a=(i/n)*2*Math.PI-Math.PI/2,rr=R*1.32;return{x:+(cx+rr*Math.cos(a)).toFixed(1),y:+(cy+rr*Math.sin(a)).toFixed(1)};};
  const poly=(pct:number)=>Array.from({length:n},(_,i)=>{const p=pt(i,pct);return`${p.x},${p.y}`;}).join(" ");
  const dpts=scores.map((_,i)=>pt(i,scores[i]));
  const path=dpts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ")+"Z";
  const SHORT:Record<string,string>={liderazgo:"Liderazgo",comunicacion:"Comunic.",reconocimiento:"Reconoc.",motivacion:"Motivac.",trabajo_en_equipo:"T.Equipo",condiciones_seguridad:"Condic.",desarrollo_crecimiento:"Desarro.",equidad:"Equidad",cultura:"Cultura",bienestar:"Bienestar"};
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible" style={{display:"block",margin:"0 auto"}}>
      {[25,50,75,100].map(p=><polygon key={p} points={poly(p)} fill={p===100?"rgba(255,255,255,0.015)":"none"} stroke="rgba(255,255,255,0.06)" strokeWidth={1}/>)}
      {Array.from({length:n},(_,i)=>{const p=pt(i,100);return<line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.05)" strokeWidth={1}/>;})}
      <path d={path} fill={clr} fillOpacity={0.13} stroke={clr} strokeWidth={1.5} strokeLinejoin="round"/>
      {dpts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={2.5} fill={scoreLevelColor(scores[i])} stroke="rgba(4,20,38,0.7)" strokeWidth={1}/>)}
      {DIMENSIONS.map((d,i)=>{const lp=lpt(i);return(<text key={d.key} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fill="rgba(148,163,184,0.62)" fontSize={7} fontWeight={600}>{SHORT[d.key]||d.label.split(" ")[0]}</text>);})}
    </svg>
  );
}

function DashboardHome({onGoCompany}: {onGoCompany:(id:string)=>void}) {
  const kpis=[{icon:"🏢",label:"Empresas cliente",value:"4",sub:"+1 este semestre",trend:[1,2,2,3,4],tColor:"#22c55e"},{icon:"📊",label:"Mediciones activas",value:"3",sub:"2026 · I Semestre",trend:[4,3,5,4,3],tColor:"#38bdf8"},{icon:"⏳",label:"Pend. validación",value:"1",sub:"Hospital del Valle",alert:true,trend:[0,1,0,2,1],tColor:"#f97316"},{icon:"💳",label:"Suscripciones",value:"4",sub:"1 por vencer",warn:true,trend:[2,3,3,4,4],tColor:"#fb923c"}];
  const activity=[
    {icon:"✅",label:"Empresa Demostración S.A.",detail:"Validación aprobada · Informe liberado",time:"Hoy 09:42",color:"#22c55e"},
    {icon:"📊",label:"Constructora Andina Cía.",detail:"55 de 85 respuestas recibidas (64.7%)",time:"Hoy 08:15",color:"#38bdf8"},
    {icon:"🔔",label:"Hospital del Valle",detail:"Período cerrado · 187/210 respuestas · Pendiente validación",time:"Ayer 17:30",color:"#f97316"},
    {icon:"💳",label:"Tech Solutions Ecuador",detail:"Suscripción Básico vence en 14 días",time:"Jun 5",color:"#f97316"},
    {icon:"🆕",label:"Tech Solutions Ecuador",detail:"Suscripción creada · Básico · 45 colaboradores",time:"Dic 1, 2025",color:"#94a3b8"},
  ];
  const pending=[
    {co:"Hospital del Valle",task:"Validar resultados 2026-I",cta:"Validar ahora",color:"#f97316",id:"hospital"},
    {co:"Tech Solutions Ecuador",task:"Suscripción vence en 14 días",cta:"Renovar",color:"#fb923c",id:"tech"},
    {co:"Constructora Andina",task:"64.7% de participación — recordatorio",cta:"Ver encuesta",color:"#38bdf8",id:"andina"},
  ];
  const [dimView,setDimView]=useState<"bars"|"radar">("bars");
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:18,marginBottom:22,alignItems:"center"}}>
        <div>
          <p style={{fontSize:"0.75rem",color:"#94a3b8",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Jueves, 5 de junio de 2026</p>
          <h2 style={{fontSize:"1.5rem",fontWeight:900,color:"#f8fafc",marginTop:4}}>Bienvenido, Iván 👋</h2>
          <p style={{fontSize:"0.88rem",color:"#94a3b8",marginTop:3}}>Tienes <strong style={{color:"#f97316"}}>1 validación pendiente</strong> y 1 suscripción por vencer.</p>
        </div>
        <div style={{background:"rgba(7,27,51,0.65)",border:`1px solid ${scoreLevelColor(curPct)}28`,borderRadius:20,padding:"16px 22px",display:"flex",gap:18,alignItems:"center",flexShrink:0}}>
          <ScoreGauge score={curPct} size={116}/>
          <div>
            <div style={{fontSize:"0.62rem",fontWeight:900,letterSpacing:"0.1em",textTransform:"uppercase",color:"#64748b",marginBottom:4}}>Clima laboral · 2026-I</div>
            <div style={{fontSize:"0.76rem",color:"#94a3b8",marginBottom:8}}>Empresa Demostración S.A.</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:"0.82rem",fontWeight:800,color:"#4ade80"}}>▲ {curPct-prevPct}pts</span>
              <span style={{fontSize:"0.74rem",color:"#64748b"}}>vs. semestre anterior</span>
            </div>
            <div style={{fontSize:"0.72rem",color:"#64748b"}}>103/120 respondieron · 85.8%</div>
          </div>
        </div>
      </div>
      {/* Insights bar */}
      <div style={{display:"flex",gap:10,marginBottom:22}}>
        {[
          {icon:"⚠",color:"#f87171",bg:"rgba(248,113,113,0.07)",bd:"rgba(248,113,113,0.2)",text:"Reconocimiento en zona crítica (58%) — tercera caída consecutiva"},
          {icon:"▲",color:"#22c55e",bg:"rgba(34,197,94,0.06)",bd:"rgba(34,197,94,0.18)",text:"T. Equipo lidera (82%) — punto de apoyo para el plan de mejora"},
          {icon:"⏳",color:"#f97316",bg:"rgba(249,115,22,0.06)",bd:"rgba(249,115,22,0.18)",text:"Hospital del Valle requiere validación — pendiente desde ayer"},
        ].map((ins,i)=>(
          <div key={i} style={{flex:1,display:"flex",gap:9,alignItems:"center",background:ins.bg,border:`1px solid ${ins.bd}`,borderRadius:12,padding:"10px 14px",minWidth:0}}>
            <span style={{fontSize:"0.85rem",flexShrink:0,color:ins.color}}>{ins.icon}</span>
            <span style={{fontSize:"0.76rem",color:"#94a3b8",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ins.text}</span>
          </div>
        ))}
      </div>
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        {kpis.map(k=>{const vc=k.alert?"#f97316":k.warn?"#fb923c":"#f8fafc";const delta=k.trend[k.trend.length-1]-k.trend[0];return(
          <div key={k.label} style={{background:"rgba(7,27,51,0.65)",border:`1px solid ${k.alert?"rgba(249,115,22,0.3)":k.warn?"rgba(249,115,22,0.2)":"rgba(255,255,255,0.08)"}`,borderRadius:18,padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <span style={{fontSize:"1.5rem"}}>{k.icon}</span>
              <Sparkline data={k.trend} color={k.tColor}/>
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:6}}>
              <div style={{fontSize:"1.9rem",fontWeight:900,color:vc,lineHeight:1}}><CountUp to={parseInt(k.value)}/></div>
              {delta!==0&&<span style={{fontSize:"0.7rem",fontWeight:800,color:delta>0?"#4ade80":"#f87171"}}>{delta>0?"▲":"▼"}{Math.abs(delta)}</span>}
            </div>
            <div style={{fontSize:"0.72rem",fontWeight:700,color:"#94a3b8",marginTop:4}}>{k.label}</div>
            <div style={{fontSize:"0.68rem",color:k.alert||k.warn?"#f97316":"#64748b",marginTop:2}}>{k.sub}</div>
          </div>
        );})}
      </div>
      {/* Quick access */}
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16,overflowX:"auto",paddingBottom:2}}>
        <span style={{fontSize:"0.63rem",fontWeight:900,letterSpacing:"0.12em",textTransform:"uppercase",color:"#475569",flexShrink:0,whiteSpace:"nowrap"}}>Acceso rápido</span>
        {COMPANIES.map(co=>{const sc=STATUS_CFG[co.status];return(
          <button key={co.id} onClick={()=>onGoCompany(co.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 13px",borderRadius:12,background:"rgba(7,27,51,0.7)",border:`1px solid ${sc.color}28`,color:"#e2e8f0",fontSize:"0.79rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,transition:"border-color 0.14s"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:sc.color,flexShrink:0}}/>
            <span>{co.nombre.split(" ")[0]}</span>
            {co.lastScore!=null&&<span style={{fontSize:"0.72rem",color:scoreLevelColor(co.lastScore),fontWeight:900}}>{co.lastScore}%</span>}
          </button>
        );})}
      </div>
      {/* Trend chart */}
      <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"18px 22px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
          <h3 style={{fontSize:"0.88rem",fontWeight:900,color:"#f8fafc",margin:0}}>Evolución del clima laboral</h3>
          <span style={{fontSize:"0.72rem",color:"#94a3b8"}}>Empresa Demostración S.A. · últimos 5 períodos</span>
        </div>
        <HistoryChart data={demoHistory}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"260px 1fr 300px",gap:16}}>
        {/* Dimensiones */}
        <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"18px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <h3 style={{fontSize:"0.88rem",fontWeight:900,color:"#f8fafc",margin:0}}>Dimensiones · 2026-I</h3>
            <div style={{display:"flex",gap:2}}>
              {(["bars","radar"] as const).map(v=>(
                <button key={v} onClick={()=>setDimView(v)} style={{padding:"3px 9px",borderRadius:7,border:"none",cursor:"pointer",background:dimView===v?"rgba(56,189,248,0.15)":"transparent",color:dimView===v?"#38bdf8":"#475569",fontSize:"0.88rem",lineHeight:1,transition:"all 0.15s"}}>
                  {v==="bars"?"≡":"◎"}
                </button>
              ))}
            </div>
          </div>
          <p style={{fontSize:"0.7rem",color:"#94a3b8",marginBottom:dimView==="radar"?6:13}}>Empresa Demostración S.A.</p>
          {dimView==="bars"?<DimBreakdown responses={curR}/>:<RadarChart responses={curR} size={214}/>}
        </div>
        {/* Actividad */}
        <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"20px 22px"}}>
          <h3 style={{fontSize:"0.88rem",fontWeight:900,color:"#f8fafc",marginBottom:16}}>Actividad reciente</h3>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {activity.map((a,i)=><div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"11px 0 11px 10px",borderBottom:i<activity.length-1?"1px solid rgba(255,255,255,0.06)":"none",borderLeft:`2px solid ${a.color}55`}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:a.color+"18",border:`1px solid ${a.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",flexShrink:0}}>{a.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"0.82rem",fontWeight:700,color:"#f8fafc",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.label}</div>
                <div style={{fontSize:"0.75rem",color:"#94a3b8",lineHeight:1.4}}>{a.detail}</div>
              </div>
              <div style={{fontSize:"0.68rem",color:"#64748b",whiteSpace:"nowrap",marginTop:2,flexShrink:0}}>{a.time}</div>
            </div>)}
          </div>
        </div>
        {/* Pendientes */}
        <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"20px 22px"}}>
          <h3 style={{fontSize:"0.88rem",fontWeight:900,color:"#f8fafc",marginBottom:16}}>Tareas pendientes</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {pending.map((p,i)=><div key={i} style={{background:`${p.color}0d`,border:`1px solid ${p.color}28`,borderRadius:12,padding:"12px 14px",boxShadow:`inset 3px 0 0 ${p.color}`}}>
              <div style={{fontSize:"0.78rem",fontWeight:800,color:p.color,marginBottom:3}}>{p.co}</div>
              <div style={{fontSize:"0.75rem",color:"#94a3b8",marginBottom:10,lineHeight:1.4}}>{p.task}</div>
              <button onClick={()=>onGoCompany(p.id)} style={{padding:"6px 14px",borderRadius:999,background:p.color+"22",border:`1px solid ${p.color}44`,color:p.color,fontWeight:800,fontSize:"0.74rem",cursor:"pointer"}}>{p.cta} →</button>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmpresasSection({onOpenCompany}: {onOpenCompany:(id:string)=>void}) {
  const [hovId,setHovId]=useState<string|null>(null);
  const [q,setQ]=useState("");
  const [sf,setSf]=useState("all");
  const FILT=[["all","Todas"],["validated","Validadas"],["collecting","Recolectando"],["pending_validation","Pend. validación"],["new","Sin medición"]];
  const filtered=COMPANIES.filter(co=>{
    const mq=!q||co.nombre.toLowerCase().includes(q.toLowerCase())||co.sector.toLowerCase().includes(q.toLowerCase());
    const mf=sf==="all"||co.status===sf;
    return mq&&mf;
  });
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={{fontSize:"1.3rem",fontWeight:900,color:"#f8fafc",marginBottom:3}}>Empresas cliente</h2><p style={{fontSize:"0.84rem",color:"#94a3b8"}}>Gestiona el ciclo completo de medición de cada cliente.</p></div>
        <button style={{padding:"9px 20px",background:"#d4af37",color:"#071b33",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.83rem",cursor:"pointer"}}>+ Nuevo cliente</button>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:18,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:"1 1 220px",maxWidth:320}}>
          <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:"0.88rem",pointerEvents:"none",color:"#64748b"}}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar empresa o sector..." style={{width:"100%",padding:"9px 12px 9px 33px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#f8fafc",fontSize:"0.84rem",boxSizing:"border-box",outline:"none"}}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {FILT.map(([v,l])=><button key={v} onClick={()=>setSf(v)} style={{padding:"6px 13px",borderRadius:999,fontSize:"0.73rem",fontWeight:700,cursor:"pointer",background:sf===v?"rgba(56,189,248,0.14)":"rgba(255,255,255,0.04)",border:`1px solid ${sf===v?"rgba(56,189,248,0.35)":"rgba(255,255,255,0.09)"}`,color:sf===v?"#38bdf8":"#94a3b8",transition:"all 0.14s"}}>{l}</button>)}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
        {filtered.map(co=>{
          const sc=STATUS_CFG[co.status]; const tc=TIER_C[co.subTier];
          const days=Math.ceil((new Date(co.subExpiry).getTime()-Date.now())/86400000);
          return(
            <div key={co.id} onMouseEnter={()=>setHovId(co.id)} onMouseLeave={()=>setHovId(null)} style={{background:hovId===co.id?"rgba(10,36,65,0.8)":"rgba(7,27,51,0.65)",border:`1px solid ${hovId===co.id?"rgba(56,189,248,0.28)":"rgba(255,255,255,0.08)"}`,borderRadius:20,padding:"20px 22px",display:"flex",flexDirection:"column",gap:12,transition:"all 0.18s",transform:hovId===co.id?"translateY(-2px)":"none",boxShadow:`inset 0 3px 0 ${sc.color}99,${hovId===co.id?"0 8px 24px rgba(0,0,0,0.28)":"0 0 0 transparent"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div><h3 style={{fontSize:"0.95rem",fontWeight:800,color:"#f8fafc",margin:"0 0 3px",lineHeight:1.2}}>{co.nombre}</h3><span style={{fontSize:"0.73rem",color:"#94a3b8"}}>{co.sector} · {co.empleados} colab.</span></div>
                <span style={{padding:"3px 10px",borderRadius:999,fontSize:"0.7rem",fontWeight:800,background:tc+"18",border:`1px solid ${tc}33`,color:tc,flexShrink:0}}>{co.subTier}</span>
              </div>
              {co.lastPeriod&&<div>
                <div style={{fontSize:"0.63rem",fontWeight:900,letterSpacing:"0.12em",textTransform:"uppercase",color:"#94a3b8",marginBottom:5}}>{co.lastPeriod}</div>
                {co.lastScore!=null?(<div style={{display:"flex",alignItems:"center",gap:12}}>
                  <ScoreRing score={co.lastScore} size={52}/>
                  <div>
                    <div style={{fontSize:"0.68rem",color:"#64748b",marginBottom:2}}>Índice global</div>
                    <div style={{fontSize:"0.88rem",fontWeight:800,color:scoreLevelColor(co.lastScore)}}>{scoreLevelLabel(co.lastScore)}</div>
                    <div style={{fontSize:"0.72rem",color:"#64748b",marginTop:1}}>{co.lastScore}%</div>
                  </div>
                </div>):<div style={{display:"flex",alignItems:"center",gap:7,fontSize:"0.82rem",color:"#38bdf8"}}><span>⏳</span>Recolectando · {co.lastResponses}/{co.lastTotal}</div>}
              </div>}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                <span style={{padding:"4px 11px",borderRadius:999,fontSize:"0.7rem",fontWeight:800,background:sc.bg,border:`1px solid ${sc.color}44`,color:sc.color}}>{sc.label}</span>
                <span style={{fontSize:"0.67rem",color:days<=30?"#fb923c":"#64748b"}}>Vence {co.subExpiry}{days<=30?` (${days}d)`:""}</span>
              </div>
              <button onClick={()=>onOpenCompany(co.id)} style={{width:"100%",padding:"9px 0",borderRadius:11,fontWeight:800,fontSize:"0.82rem",cursor:"pointer",background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.28)",color:"#38bdf8"}}>
                {co.status==="validated"?"Ver resultados →":co.status==="collecting"?"Ver seguimiento →":co.status==="pending_validation"?"Validar →":"Iniciar medición →"}
              </button>
            </div>
          );
        })}
        {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px 0",color:"#475569",fontSize:"0.88rem"}}>Sin resultados para la búsqueda actual.</div>}
        <div style={{background:"rgba(7,27,51,0.35)",border:"2px dashed rgba(255,255,255,0.1)",borderRadius:20,padding:"22px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,minHeight:180,cursor:"pointer"}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(56,189,248,0.08)",border:"2px dashed rgba(56,189,248,0.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",color:"#38bdf8"}}>+</div>
          <div style={{textAlign:"center"}}><div style={{fontWeight:800,color:"#38bdf8",marginBottom:3}}>Nuevo cliente</div><div style={{fontSize:"0.76rem",color:"#94a3b8"}}>Dar de alta empresa y crear primer período</div></div>
        </div>
      </div>
    </div>
  );
}

function MedicionesSection({onOpenCompany}: {onOpenCompany:(id:string)=>void}) {
  const [hovRow,setHovRow]=useState<number|null>(null);
  type SortKey="Empresa"|"Período"|"Puntaje";
  const [sortKey,setSortKey]=useState<SortKey>("Período");
  const meds=[
    {co:"Empresa Demostración S.A.",periodo:"2026 · I Semestre",respuestas:103,total:120,score:curPct,status:"validated",  id:"demo"},
    {co:"Empresa Demostración S.A.",periodo:"2025 · II Semestre",respuestas:109,total:120,score:prevPct,status:"validated", id:"demo"},
    {co:"Constructora Andina Cía.",  periodo:"2026 · I Semestre",respuestas:55, total:85, score:null,   status:"collecting",id:"andina"},
    {co:"Hospital del Valle",        periodo:"2026 · I Semestre",respuestas:187,total:210,score:68,     status:"pending_validation",id:"hospital"},
  ];
  const sorted=[...meds].sort((a,b)=>{
    if(sortKey==="Empresa")return a.co.localeCompare(b.co);
    if(sortKey==="Puntaje")return(b.score??-1)-(a.score??-1);
    return b.periodo.localeCompare(a.periodo);
  });
  const STATS=[{label:"Total",value:meds.length,color:"#94a3b8"},{label:"Validadas",value:meds.filter(m=>m.status==="validated").length,color:"#22c55e"},{label:"Recolectando",value:meds.filter(m=>m.status==="collecting").length,color:"#38bdf8"},{label:"Pend. validación",value:meds.filter(m=>m.status==="pending_validation").length,color:"#f97316"}];
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16}}>
        <div><h2 style={{fontSize:"1.3rem",fontWeight:900,color:"#f8fafc",marginBottom:3}}>Mediciones</h2><p style={{fontSize:"0.84rem",color:"#94a3b8"}}>Historial de todos los períodos de medición por empresa.</p></div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:"0.68rem",color:"#64748b",fontWeight:700,marginRight:2}}>Ordenar:</span>
          {(["Empresa","Período","Puntaje"] as SortKey[]).map(s=><button key={s} onClick={()=>setSortKey(s)} style={{padding:"5px 12px",borderRadius:999,fontSize:"0.72rem",fontWeight:700,cursor:"pointer",background:sortKey===s?"rgba(56,189,248,0.14)":"rgba(255,255,255,0.04)",border:`1px solid ${sortKey===s?"rgba(56,189,248,0.35)":"rgba(255,255,255,0.09)"}`,color:sortKey===s?"#38bdf8":"#94a3b8",transition:"all 0.14s"}}>{s}{sortKey===s?" ↓":""}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        {STATS.map(s=><div key={s.label} style={{padding:"6px 14px",borderRadius:999,background:`${s.color}10`,border:`1px solid ${s.color}28`,display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontWeight:900,color:s.color,fontSize:"0.9rem"}}>{s.value}</span>
          <span style={{fontSize:"0.71rem",color:"#94a3b8"}}>{s.label}</span>
        </div>)}
      </div>
      <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
              {["Empresa","Período","Respuestas","Participación","Puntaje","Estado","Acciones"].map(h=><th key={h} style={{padding:"13px 16px",textAlign:"left",fontSize:"0.65rem",fontWeight:900,letterSpacing:"0.11em",textTransform:"uppercase",color:"#94a3b8"}}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {sorted.map((m,i)=>{const sc=STATUS_CFG[m.status as keyof typeof STATUS_CFG];const pct=Math.round((m.respuestas/m.total)*100);return(
              <tr key={i} onMouseEnter={()=>setHovRow(i)} onMouseLeave={()=>setHovRow(null)} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:hovRow===i?"rgba(56,189,248,0.04)":"transparent",transition:"background 0.12s",cursor:"default"}}>
                <td style={{padding:"13px 16px",fontSize:"0.84rem",fontWeight:700,color:"#f8fafc"}}>{m.co}</td>
                <td style={{padding:"13px 16px",fontSize:"0.82rem",color:"#94a3b8"}}>{m.periodo}</td>
                <td style={{padding:"13px 16px",fontSize:"0.84rem",color:"#f8fafc"}}>{m.respuestas}/{m.total}</td>
                <td style={{padding:"13px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:60,height:5,borderRadius:999,background:"rgba(255,255,255,0.07)"}}><div style={{height:"100%",width:`${pct}%`,background:pct>=80?"#22c55e":pct>=65?"#d4af37":"#f97316",borderRadius:999}}/></div>
                    <span style={{fontSize:"0.78rem",color:"#94a3b8"}}>{pct}%</span>
                  </div>
                </td>
                <td style={{padding:"13px 16px",fontSize:"0.9rem",fontWeight:800,color:m.score!=null?scoreLevelColor(m.score):"#94a3b8"}}>{m.score!=null?`${m.score}%`:"—"}</td>
                <td style={{padding:"13px 16px"}}><span style={{padding:"4px 11px",borderRadius:999,fontSize:"0.7rem",fontWeight:800,background:sc.bg,border:`1px solid ${sc.color}44`,color:sc.color}}>{sc.label}</span></td>
                <td style={{padding:"13px 16px"}}>
                  <button onClick={()=>onOpenCompany(m.id)} style={{padding:"5px 13px",borderRadius:8,background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.24)",color:"#38bdf8",fontSize:"0.74rem",fontWeight:700,cursor:"pointer"}}>Ver →</button>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ValidacionesSection() {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
        <div><h2 style={{fontSize:"1.3rem",fontWeight:900,color:"#f8fafc",marginBottom:3}}>Cola de validaciones</h2><p style={{fontSize:"0.84rem",color:"#94a3b8"}}>Resultados que esperan revisión y firma del Psicólogo Laboral.</p></div>
        <div style={{background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.3)",borderRadius:14,padding:"10px 20px",textAlign:"center",flexShrink:0}}>
          <div style={{fontSize:"0.6rem",fontWeight:900,letterSpacing:"0.1em",textTransform:"uppercase",color:"#94a3b8",marginBottom:2}}>Pendientes</div>
          <div style={{fontSize:"1.7rem",fontWeight:900,color:"#f97316",lineHeight:1}}>1</div>
        </div>
      </div>
      <div style={{background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.22)",borderRadius:18,padding:"20px 24px",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
          <div style={{width:46,height:46,borderRadius:"50%",background:"rgba(249,115,22,0.14)",border:"1px solid rgba(249,115,22,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",flexShrink:0}}>⏳</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:"1rem",color:"#f8fafc",marginBottom:5}}>Hospital del Valle · 2026 · I Semestre</div>
            <div style={{display:"flex",gap:14,marginBottom:10,flexWrap:"wrap"}}>
              <span style={{fontSize:"0.76rem",color:"#94a3b8"}}>187/210 respuestas</span>
              <span style={{fontSize:"0.76rem",color:"#94a3b8"}}>89.0% participación</span>
              <span style={{fontSize:"0.76rem",color:"#94a3b8"}}>Cerrado: 4 jun. 2026</span>
            </div>
            <div style={{display:"flex",gap:9,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 13px",borderRadius:999,background:"rgba(249,115,22,0.12)",border:"1px solid rgba(249,115,22,0.28)"}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:"#f97316",flexShrink:0,animation:"_pulse 1.5s ease-in-out infinite"}}/>
                <span style={{fontSize:"0.73rem",fontWeight:800,color:"#fb923c"}}>En espera hace 16h 24min</span>
              </div>
              <span style={{padding:"5px 13px",borderRadius:999,fontSize:"0.72rem",fontWeight:800,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",color:"#f87171"}}>Prioridad Alta</span>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,flexShrink:0}}>
            <ScoreRing score={68} size={52}/>
            <span style={{fontSize:"0.64rem",color:"#64748b",textAlign:"center"}}>Índice</span>
          </div>
        </div>
      </div>
      <ValidationPanel inline/>
      <div style={{marginTop:22,padding:"14px 18px",background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.15)",borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:"1rem",color:"#22c55e"}}>✓</span>
        <p style={{fontSize:"0.8rem",color:"#94a3b8",margin:0}}>No hay más mediciones pendientes de validación.</p>
      </div>
    </div>
  );
}

function SubscriptionsSection() {
  const [showNew,setShowNew]=useState(false);
  const [hovPlan,setHovPlan]=useState<string|null>(null);
  const [hovSub,setHovSub]=useState<number|null>(null);
  const plans=[
    {tier:"Básico",    price:"$299/año",  tc:"#38bdf8", f:["1 medición/año","Hasta 100 colaboradores","Informe PDF automático","Soporte por correo"]},
    {tier:"Profesional",price:"$599/año", tc:"#d4af37", f:["2 mediciones/año","Hasta 300 colaboradores","Validación Psicólogo Laboral","Benchmarking sectorial","Soporte prioritario"]},
    {tier:"Enterprise",price:"$1.299/año",tc:"#a855f7", f:["Mediciones ilimitadas","Colaboradores ilimitados","Consultor dedicado","API + integraciones","Informes personalizados"]},
  ];
  const sc=(s:string)=>s==="activa"?"#22c55e":s==="por_vencer"?"#f97316":"#f87171";
  const sl=(s:string)=>s==="activa"?"Activa":s==="por_vencer"?"Por vencer":"Expirada";
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><h2 style={{fontSize:"1.3rem",fontWeight:900,color:"#f8fafc",marginBottom:3}}>Suscripciones</h2><p style={{fontSize:"0.84rem",color:"#94a3b8"}}>Acceso de empresas para gestionar mediciones de forma autónoma.</p></div>
        <button onClick={()=>setShowNew(!showNew)} style={{padding:"9px 20px",background:"#d4af37",color:"#071b33",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.83rem",cursor:"pointer"}}>+ Nueva suscripción</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13,marginBottom:24}}>
        {plans.map(p=><div key={p.tier} onMouseEnter={()=>setHovPlan(p.tier)} onMouseLeave={()=>setHovPlan(null)} style={{background:hovPlan===p.tier?"rgba(12,40,72,0.8)":"rgba(7,27,51,0.6)",border:`1px solid ${hovPlan===p.tier?p.tc+"55":p.tc+"2a"}`,borderRadius:18,padding:"18px 20px",transition:"all 0.18s",transform:hovPlan===p.tier?"translateY(-3px)":"none",boxShadow:hovPlan===p.tier?`0 8px 24px rgba(0,0,0,0.3),0 0 0 1px ${p.tc}18`:"none",cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:11}}>
            <span style={{fontWeight:900,color:p.tc,fontSize:"0.98rem"}}>{p.tier}</span>
            <span style={{fontWeight:900,color:"#f8fafc",fontSize:"1rem"}}>{p.price}</span>
          </div>
          <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:5}}>
            {p.f.map(f=><li key={f} style={{fontSize:"0.76rem",color:"#94a3b8",display:"flex",gap:6,alignItems:"flex-start"}}><span style={{color:p.tc,flexShrink:0,marginTop:1}}>✓</span>{f}</li>)}
          </ul>
        </div>)}
      </div>
      {showNew&&(
        <div style={{background:"rgba(7,27,51,0.8)",border:"1px solid rgba(212,175,55,0.22)",borderRadius:18,padding:"22px 26px",marginBottom:22}}>
          <h3 style={{marginBottom:16,color:"#d4af37",fontSize:"1rem"}}>Nueva suscripción</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:13}}>
            {["Empresa","Plan","Vigencia (meses)"].map(l=><div key={l}><label style={{display:"block",fontSize:"0.67rem",fontWeight:900,letterSpacing:"0.1em",textTransform:"uppercase",color:"#94a3b8",marginBottom:6}}>{l}</label><input placeholder={l==="Empresa"?"Nombre":"Básico / Profesional / Enterprise"} style={{width:"100%",padding:"9px 12px",borderRadius:11,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#f8fafc",fontSize:"0.88rem"}}/></div>)}
          </div>
          <div style={{display:"flex",gap:9,marginTop:14}}>
            <button style={{padding:"9px 22px",background:"#d4af37",color:"#071b33",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.83rem",cursor:"pointer"}}>Crear suscripción</button>
            <button onClick={()=>setShowNew(false)} style={{padding:"9px 18px",background:"transparent",border:"1px solid rgba(255,255,255,0.13)",color:"#94a3b8",borderRadius:999,fontWeight:700,fontSize:"0.83rem",cursor:"pointer"}}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            {["Empresa","Plan","Desde","Hasta","Colaboradores","Estado","Acciones"].map(h=><th key={h} style={{padding:"13px 16px",textAlign:"left",fontSize:"0.65rem",fontWeight:900,letterSpacing:"0.11em",textTransform:"uppercase",color:"#94a3b8"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {SUBS.map((s,i)=>{const tc=TIER_C[s.tier];const c=sc(s.status);return(
              <tr key={i} onMouseEnter={()=>setHovSub(i)} onMouseLeave={()=>setHovSub(null)} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:hovSub===i?"rgba(56,189,248,0.04)":"transparent",transition:"background 0.12s"}}>
                <td style={{padding:"13px 16px",fontSize:"0.84rem",fontWeight:700,color:"#f8fafc"}}>{s.company}</td>
                <td style={{padding:"13px 16px"}}><span style={{padding:"3px 11px",borderRadius:999,fontSize:"0.7rem",fontWeight:800,background:tc+"18",color:tc}}>{s.tier}</span></td>
                <td style={{padding:"13px 16px",fontSize:"0.8rem",color:"#94a3b8"}}>{s.inicio}</td>
                <td style={{padding:"13px 16px",fontSize:"0.8rem",color:"#94a3b8"}}>{s.fin}</td>
                <td style={{padding:"13px 16px",fontSize:"0.84rem",color:"#f8fafc",fontWeight:600}}>{s.empleados}</td>
                <td style={{padding:"13px 16px"}}><span style={{padding:"3px 11px",borderRadius:999,fontSize:"0.7rem",fontWeight:800,background:c+"18",border:`1px solid ${c}33`,color:c}}>{sl(s.status)}</span></td>
                <td style={{padding:"13px 16px"}}><div style={{display:"flex",gap:7}}>
                  <button style={{padding:"5px 11px",borderRadius:8,background:"rgba(56,189,248,0.09)",border:"1px solid rgba(56,189,248,0.22)",color:"#38bdf8",fontSize:"0.73rem",fontWeight:700,cursor:"pointer"}}>Renovar</button>
                  <button style={{padding:"5px 11px",borderRadius:8,background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.2)",color:"#fca5a5",fontSize:"0.73rem",fontWeight:700,cursor:"pointer"}}>Cancelar</button>
                </div></td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConfigSection() {
  const [notifs,setNotifs]=useState<Record<string,boolean>>({"Nuevas respuestas recibidas":true,"Período cerrado listo para validar":true,"Suscripción próxima a vencer":true,"Informes generados":false});
  const toggle=(k:string)=>setNotifs(n=>({...n,[k]:!n[k]}));
  const [twofa,setTwofa]=useState(false);
  const [pwSaved,setPwSaved]=useState(false);
  return (
    <div style={{maxWidth:620}}>
      <div style={{marginBottom:22}}><h2 style={{fontSize:"1.3rem",fontWeight:900,color:"#f8fafc",marginBottom:3}}>Configuración</h2><p style={{fontSize:"0.84rem",color:"#94a3b8"}}>Perfil del consultor y preferencias de la plataforma.</p></div>
      <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"24px 26px",marginBottom:14}}>
        <h3 style={{fontSize:"0.88rem",fontWeight:800,color:"#d4af37",marginBottom:18}}>Perfil del consultor</h3>
        <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:22,padding:"16px",background:"rgba(255,255,255,0.03)",borderRadius:14,border:"1px solid rgba(255,255,255,0.06)"}}>
          <img src={LOGO_IVAN} alt="Iván Viteri" style={{width:68,height:68,borderRadius:14,objectFit:"cover",border:"2px solid rgba(56,189,248,0.35)",background:"white",padding:2,flexShrink:0}}/>
          <div>
            <div style={{fontWeight:900,fontSize:"1.05rem",color:"#f8fafc",marginBottom:2}}>Iván Viteri, MSc.</div>
            <div style={{fontSize:"0.78rem",color:"#94a3b8",marginBottom:8}}>Psicólogo Laboral · CENVIT GTH · Reg. SENESCYT</div>
            <button style={{padding:"5px 14px",borderRadius:999,background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.28)",color:"#38bdf8",fontWeight:700,fontSize:"0.75rem",cursor:"pointer"}}>Cambiar foto</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {[["Nombre","Iván Viteri"],["Título","MSc. Psicología Laboral"],["Registro","SENESCYT-2018-XXXX"],["Institución","CENVIT GTH"],["Correo","iavip2018@gmail.com"],["Teléfono","+593 99 XXX XXXX"]].map(([l,v])=><div key={l}>
            <label style={{display:"block",fontSize:"0.67rem",fontWeight:900,letterSpacing:"0.1em",textTransform:"uppercase",color:"#94a3b8",marginBottom:6}}>{l}</label>
            <input defaultValue={v} style={{width:"100%",padding:"9px 12px",borderRadius:11,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#f8fafc",fontSize:"0.88rem",boxSizing:"border-box"}}/>
          </div>)}
        </div>
        <button style={{marginTop:18,padding:"9px 22px",background:"#d4af37",color:"#071b33",border:"none",borderRadius:999,fontWeight:800,fontSize:"0.83rem",cursor:"pointer"}}>Guardar cambios</button>
      </div>
      <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"20px 24px"}}>
        <h3 style={{fontSize:"0.88rem",fontWeight:800,color:"#94a3b8",marginBottom:16}}>Notificaciones</h3>
        {Object.entries(notifs).map(([label,on],i,arr)=>(
          <div key={label} onClick={()=>toggle(label)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none",cursor:"pointer"}}>
            <span style={{fontSize:"0.84rem",color:"#f8fafc"}}>{label}</span>
            <div style={{width:36,height:20,borderRadius:999,background:on?"#22c55e":"rgba(255,255,255,0.12)",position:"relative",transition:"background 0.2s",flexShrink:0}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:3,left:on?19:3,transition:"left 0.2s"}}/>
            </div>
          </div>
        ))}
      </div>
      {/* Seguridad */}
      <div style={{background:"rgba(7,27,51,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"20px 24px",marginTop:14}}>
        <h3 style={{fontSize:"0.88rem",fontWeight:800,color:"#94a3b8",marginBottom:16}}>Seguridad</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          {[["Nueva contraseña","••••••••"],["Confirmar contraseña","••••••••"]].map(([l,ph])=>(
            <div key={l}>
              <label style={{display:"block",fontSize:"0.67rem",fontWeight:900,letterSpacing:"0.1em",textTransform:"uppercase",color:"#94a3b8",marginBottom:6}}>{l}</label>
              <input type="password" placeholder={ph} style={{width:"100%",padding:"9px 12px",borderRadius:11,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#f8fafc",fontSize:"0.88rem",boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
        {pwSaved?<div style={{padding:"8px 14px",borderRadius:10,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.25)",color:"#22c55e",fontSize:"0.8rem",fontWeight:700,marginBottom:14}}>✓ Contraseña actualizada</div>
        :<button onClick={()=>{setPwSaved(true);setTimeout(()=>setPwSaved(false),3000);}} style={{padding:"8px 20px",background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.28)",color:"#38bdf8",borderRadius:999,fontWeight:800,fontSize:"0.82rem",cursor:"pointer",marginBottom:14}}>Cambiar contraseña</button>}
        <div style={{paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <div onClick={()=>setTwofa(v=>!v)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
            <div>
              <div style={{fontSize:"0.84rem",fontWeight:700,color:"#f8fafc",marginBottom:2}}>Autenticación de dos pasos</div>
              <div style={{fontSize:"0.74rem",color:"#64748b"}}>Código OTP por aplicación autenticadora</div>
            </div>
            <div style={{width:36,height:20,borderRadius:999,background:twofa?"#22c55e":"rgba(255,255,255,0.12)",position:"relative",transition:"background 0.2s",flexShrink:0,marginLeft:16}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:3,left:twofa?19:3,transition:"left 0.2s"}}/>
            </div>
          </div>
          {twofa&&<div style={{marginTop:12,padding:"12px 14px",background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:10,fontSize:"0.77rem",color:"#94a3b8"}}>
            2FA activado · Escanea el QR en tu app autenticadora para completar la configuración
          </div>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS: {key: SideSection; icon: string; label: string; badge?: number}[] = [
  {key:"dashboard",    icon:"⬡",  label:"Panel"},
  {key:"empresas",     icon:"🏢", label:"Empresas"},
  {key:"mediciones",   icon:"📅", label:"Mediciones"},
  {key:"validaciones", icon:"✅", label:"Validaciones", badge:1},
  {key:"subscriptions",icon:"💳", label:"Suscripciones"},
  {key:"config",       icon:"⚙️", label:"Configuración"},
];

function Sidebar({active, onSelect, collapsed, onToggle, onLogout}: {active: SideSection; onSelect:(s:SideSection)=>void; collapsed:boolean; onToggle:()=>void; onLogout:()=>void}) {
  const [hovNav,setHovNav]=useState<string|null>(null);
  const [showUser,setShowUser]=useState(false);
  const W=collapsed?56:220;
  return (
    <aside style={{width:W,minWidth:W,background:"rgba(4,20,38,0.97)",borderRight:"1px solid rgba(212,175,55,0.15)",display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,overflow:"hidden",transition:"width 0.22s ease,min-width 0.22s ease",flexShrink:0}}>
      {/* Logo */}
      <div style={{padding:collapsed?"18px 10px 14px":"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:10,flexShrink:0}}>
        <img src={LOGO_CENVIT} alt="CENVIT" style={{width:36,height:36,objectFit:"contain",background:"white",borderRadius:8,padding:3,border:"1px solid rgba(212,175,55,0.4)",flexShrink:0}}/>
        {!collapsed&&<div><div style={{fontWeight:900,fontSize:"0.9rem",color:"#d4af37",letterSpacing:"0.06em",lineHeight:1}}>CENVIT</div><div style={{fontSize:"0.62rem",color:"#64748b",marginTop:2}}>Panel Consultor</div></div>}
      </div>
      {/* Nav */}
      <nav style={{flex:1,padding:collapsed?"10px 6px":"12px 10px",overflowY:"auto"}}>
        {NAV_ITEMS.map(item=>{const isA=active===item.key;return(
          <button key={item.key} onClick={()=>onSelect(item.key)} onMouseEnter={()=>setHovNav(item.key)} onMouseLeave={()=>setHovNav(null)} title={collapsed?item.label:undefined} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:10,padding:collapsed?"10px 0":"10px 12px",borderRadius:12,border:"none",cursor:"pointer",marginBottom:2,background:isA?"rgba(56,189,248,0.12)":hovNav===item.key?"rgba(255,255,255,0.05)":"transparent",textAlign:"left",transition:"background 0.15s",position:"relative"}}>
            <span style={{fontSize:"1rem",width:20,textAlign:"center",lineHeight:1,flexShrink:0}}>{item.icon}</span>
            {!collapsed&&<span style={{flex:1,fontSize:"0.84rem",fontWeight:700,color:isA?"#38bdf8":"#94a3b8"}}>{item.label}</span>}
            {!collapsed&&item.badge&&<span style={{minWidth:18,height:18,borderRadius:999,background:"#f97316",color:"white",fontSize:"0.68rem",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{item.badge}</span>}
            {collapsed&&item.badge&&<span style={{position:"absolute",top:5,right:7,width:8,height:8,borderRadius:"50%",background:"#f97316",border:"1.5px solid rgba(4,20,38,0.95)"}}/>}
            {!collapsed&&isA&&<div style={{width:3,height:22,borderRadius:999,background:"#38bdf8",flexShrink:0}}/>}
          </button>
        );})}
      </nav>
      {/* Collapse toggle */}
      <div style={{padding:collapsed?"8px 6px":"6px 10px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <button onClick={onToggle} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-end",gap:6,padding:"7px 10px",borderRadius:10,border:"none",cursor:"pointer",background:"transparent",color:"#475569",fontSize:"0.8rem",fontWeight:900,transition:"color 0.15s"}} onMouseEnter={e=>(e.currentTarget.style.color="#94a3b8")} onMouseLeave={e=>(e.currentTarget.style.color="#475569")}>
          {collapsed?"›":"‹"}
          {!collapsed&&<span style={{fontSize:"0.68rem",fontWeight:700,color:"#475569"}}>Contraer</span>}
        </button>
      </div>
      {/* User */}
      <div style={{position:"relative"}}>
        {showUser&&(
          <div style={{position:"absolute",bottom:"100%",left:6,right:6,background:"rgba(4,20,38,0.97)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:6,marginBottom:4,zIndex:100,boxShadow:"0 -12px 32px rgba(0,0,0,0.4)"}}>
            <button onClick={()=>{setShowUser(false);onSelect("config");}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,border:"none",cursor:"pointer",background:"transparent",color:"#94a3b8",fontSize:"0.8rem",fontWeight:700,textAlign:"left"}}>👤 Perfil</button>
            <button onClick={()=>{setShowUser(false);onLogout();}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,border:"none",cursor:"pointer",background:"transparent",color:"#f87171",fontSize:"0.8rem",fontWeight:700,textAlign:"left"}}>⎋ Cerrar sesión</button>
          </div>
        )}
        <div onClick={()=>setShowUser(s=>!s)} style={{padding:collapsed?"10px 6px":"12px 16px",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:10,cursor:"pointer",background:showUser?"rgba(255,255,255,0.04)":"transparent",transition:"background 0.15s"}}>
          <img src={LOGO_IVAN} alt="Iván Viteri" style={{width:34,height:34,objectFit:"contain",background:"white",borderRadius:8,padding:2,border:`1px solid ${showUser?"rgba(56,189,248,0.5)":"rgba(56,189,248,0.3)"}`,flexShrink:0}}/>
          {!collapsed&&<div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:"0.8rem",color:"#f8fafc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Iván Viteri</div>
            <div style={{fontSize:"0.63rem",color:"#64748b"}}>Psicólogo Laboral</div>
          </div>}
          {!collapsed&&<span style={{fontSize:"0.65rem",color:"#475569",flexShrink:0}}>{showUser?"▾":"▸"}</span>}
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

function LoginScreen({onLogin}: {onLogin:()=>void}) {
  const [pass,setPass]=useState("");
  const [err,setErr]=useState(false);
  const [loading,setLoading]=useState(false);
  function submit(){if(!pass.trim()){setErr(true);return;}setLoading(true);setTimeout(()=>{setLoading(false);onLogin();},700);}
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#020e1f 0%,#041426 50%,#071b33 100%)",position:"relative",overflow:"hidden"}}>
      <style>{css}</style>
      <div style={{position:"absolute",top:"20%",left:"28%",width:480,height:480,borderRadius:"50%",background:"rgba(56,189,248,0.04)",filter:"blur(90px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"10%",right:"20%",width:360,height:360,borderRadius:"50%",background:"rgba(212,175,55,0.05)",filter:"blur(70px)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:420,margin:"0 20px",background:"rgba(4,20,38,0.9)",border:"1px solid rgba(212,175,55,0.25)",borderRadius:28,padding:"44px 38px",backdropFilter:"blur(24px)",boxShadow:"0 32px 64px rgba(0,0,0,0.55),0 0 0 1px rgba(255,255,255,0.04)"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:36}}>
          <div style={{padding:8,background:"white",borderRadius:18,border:"2px solid rgba(212,175,55,0.5)",boxShadow:"0 0 28px rgba(212,175,55,0.22)",marginBottom:18}}>
            <img src={LOGO_CENVIT} alt="CENVIT" style={{width:64,height:64,objectFit:"contain",display:"block"}}/>
          </div>
          <div style={{fontWeight:900,fontSize:"1.6rem",color:"#d4af37",letterSpacing:"0.08em",lineHeight:1}}>CENVIT GTH</div>
          <div style={{fontSize:"0.82rem",color:"#64748b",marginTop:6,letterSpacing:"0.05em"}}>Panel del Consultor</div>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:"0.67rem",fontWeight:900,letterSpacing:"0.12em",textTransform:"uppercase",color:"#94a3b8",marginBottom:7}}>Usuario</label>
          <input type="text" defaultValue="ivan.viteri" readOnly style={{width:"100%",padding:"11px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#94a3b8",fontSize:"0.95rem",boxSizing:"border-box",cursor:"default"}}/>
        </div>
        <div style={{marginBottom:err?8:22}}>
          <label style={{display:"block",fontSize:"0.67rem",fontWeight:900,letterSpacing:"0.12em",textTransform:"uppercase",color:"#94a3b8",marginBottom:7}}>Contraseña</label>
          <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Cualquier contraseña" style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`1px solid ${err?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.1)"}`,background:"rgba(255,255,255,0.04)",color:"#f8fafc",fontSize:"0.95rem",boxSizing:"border-box",outline:"none"}}/>
        </div>
        {err&&<p style={{fontSize:"0.78rem",color:"#f87171",marginBottom:16,marginTop:0}}>Ingresa cualquier contraseña para continuar.</p>}
        <button onClick={submit} disabled={loading} style={{width:"100%",padding:"13px 0",background:loading?"rgba(212,175,55,0.35)":"linear-gradient(135deg,#d4af37,#b8932a)",color:"#071b33",border:"none",borderRadius:12,fontWeight:900,fontSize:"0.97rem",cursor:loading?"default":"pointer",boxShadow:loading?"none":"0 4px 18px rgba(212,175,55,0.28)",transition:"all 0.2s"}}>
          {loading?"Ingresando...":"Ingresar al panel →"}
        </button>
        <div style={{marginTop:22,padding:"11px 14px",background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.18)",borderRadius:10,textAlign:"center"}}>
          <div style={{fontSize:"0.7rem",color:"#64748b",marginBottom:2}}>Demostración</div>
          <div style={{fontSize:"0.78rem",color:"#38bdf8",fontWeight:700}}>ivan.viteri · cualquier contraseña</div>
        </div>
      </div>
      <div style={{position:"absolute",bottom:22,left:0,right:0,textAlign:"center",fontSize:"0.68rem",color:"rgba(100,116,139,0.45)"}}>Iván Viteri, MSc. · Psicólogo Laboral · CENVIT GTH</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RAÍZ PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

function DemoRoot() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [section, setSection] = useState<SideSection>("dashboard");
  const [companyId, setCompanyId] = useState<string|null>(null);
  const [showBell, setShowBell] = useState(false);
  const [search, setSearch] = useState("");
  const found = search.trim() ? COMPANIES.filter(c=>c.nombre.toLowerCase().includes(search.toLowerCase())||c.sector.toLowerCase().includes(search.toLowerCase())) : [];

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  function goCompany(id: string) { setCompanyId(id); setSection("empresas"); }

  const sectionTitles: Record<SideSection,string> = {
    dashboard:"Panel", empresas:"Empresas", mediciones:"Mediciones",
    validaciones:"Validaciones", subscriptions:"Suscripciones", config:"Configuración"
  };

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <style>{css}</style>
      <style>{"@keyframes _fsIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes _pulse{0%,100%{opacity:1}50%{opacity:0.35}}"}</style>
      {/* Logo injection for print */}
      <script dangerouslySetInnerHTML={{__html:`window.addEventListener('beforeprint',function(){document.querySelectorAll('img').forEach(function(i){if(i.alt==='CENVIT'||i.alt==='Cenvit')i.src=${JSON.stringify(LOGO_CENVIT)};if(i.alt==='Iván Viteri')i.src=${JSON.stringify(LOGO_IVAN)};});});`}}/>

      <Sidebar active={section} onSelect={s=>{setSection(s);setCompanyId(null);}} collapsed={sideCollapsed} onToggle={()=>setSideCollapsed(c=>!c)} onLogout={()=>setLoggedIn(false)}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,background:"linear-gradient(135deg,#041426,#071b33 42%,#0b2f56)"}}>
        {/* Topbar */}
        <header style={{background:"rgba(4,20,38,0.85)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"0 28px",height:52,display:"flex",alignItems:"center",gap:12,backdropFilter:"blur(12px)",flexShrink:0}}>
          {companyId&&<button onClick={()=>setCompanyId(null)} style={{background:"transparent",border:"none",color:"#94a3b8",fontSize:"0.8rem",cursor:"pointer",padding:"4px 0",fontWeight:700}}>Empresas</button>}
          {companyId&&<span style={{color:"rgba(255,255,255,0.2)"}}>›</span>}
          <span style={{fontSize:"0.88rem",fontWeight:700,color:"#f8fafc"}}>{companyId?COMPANIES.find(c=>c.id===companyId)?.nombre:sectionTitles[section]}</span>
          <div style={{flex:1,display:"flex",justifyContent:"center"}}>
            <div style={{position:"relative",width:"100%",maxWidth:300}}>
              <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:"0.78rem",pointerEvents:"none",color:"#475569"}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar empresa..." style={{width:"100%",padding:"6px 11px 6px 31px",borderRadius:999,border:`1px solid ${search?"rgba(56,189,248,0.35)":"rgba(255,255,255,0.09)"}`,background:"rgba(255,255,255,0.04)",color:"#f8fafc",fontSize:"0.78rem",boxSizing:"border-box",outline:"none",transition:"border-color 0.15s"}}/>
              {search.trim()&&(
                <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:"rgba(4,20,38,0.97)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:6,zIndex:200,boxShadow:"0 20px 48px rgba(0,0,0,0.55)"}}>
                  {found.length===0&&<div style={{padding:"10px 12px",fontSize:"0.76rem",color:"#475569"}}>Sin resultados para "{search}"</div>}
                  {found.map(c=>{const fsc=STATUS_CFG[c.status];return(
                    <button key={c.id} onClick={()=>{setSearch("");goCompany(c.id);}} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:9,border:"none",cursor:"pointer",background:"transparent",textAlign:"left"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(56,189,248,0.08)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:fsc.color,flexShrink:0}}/>
                      <span style={{flex:1,minWidth:0,fontSize:"0.79rem",fontWeight:700,color:"#f8fafc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nombre}</span>
                      <span style={{fontSize:"0.68rem",color:"#64748b",flexShrink:0}}>{c.sector}</span>
                      {c.lastScore!=null&&<span style={{fontSize:"0.72rem",fontWeight:900,color:scoreLevelColor(c.lastScore),flexShrink:0}}>{c.lastScore}%</span>}
                    </button>
                  );})}
                </div>
              )}
            </div>
          </div>
          <span style={{fontSize:"0.7rem",color:"#94a3b8",fontStyle:"italic",background:"rgba(249,115,22,0.08)",border:"1px solid rgba(249,115,22,0.2)",padding:"4px 12px",borderRadius:999}}>⚠ Demo — datos simulados</span>
          <div style={{position:"relative",cursor:"pointer",marginLeft:4,flexShrink:0}} onClick={()=>setShowBell(b=>!b)}>
            <span style={{fontSize:"1rem",color:showBell?"#38bdf8":"#64748b",transition:"color 0.15s"}}>🔔</span>
            <span style={{position:"absolute",top:-3,right:-3,width:13,height:13,borderRadius:"50%",background:"#f97316",border:"2px solid rgba(4,20,38,0.95)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.54rem",fontWeight:900,color:"white",lineHeight:"1"}}>1</span>
            {showBell&&(
              <div style={{position:"absolute",top:"calc(100% + 10px)",right:-8,width:292,background:"rgba(4,20,38,0.97)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"14px",zIndex:200,boxShadow:"0 20px 48px rgba(0,0,0,0.55)",cursor:"default"}} onClick={e=>e.stopPropagation()}>
                <div style={{fontSize:"0.63rem",fontWeight:900,letterSpacing:"0.12em",textTransform:"uppercase",color:"#475569",marginBottom:10,padding:"0 2px"}}>Notificaciones</div>
                <div style={{background:"rgba(249,115,22,0.07)",border:"1px solid rgba(249,115,22,0.22)",borderRadius:11,padding:"11px 12px",display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer"}} onClick={()=>{setShowBell(false);goCompany("hospital");}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(249,115,22,0.14)",border:"1px solid rgba(249,115,22,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",flexShrink:0}}>⏳</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"0.8rem",fontWeight:700,color:"#f8fafc",marginBottom:2}}>Hospital del Valle</div>
                    <div style={{fontSize:"0.72rem",color:"#94a3b8",lineHeight:1.4}}>Período cerrado · Pend. validación · 187/210 resp.</div>
                    <div style={{fontSize:"0.67rem",color:"#64748b",marginTop:3}}>Ayer 17:30</div>
                  </div>
                </div>
                <div style={{marginTop:10,textAlign:"center",fontSize:"0.71rem",color:"#334155",padding:"4px 0"}}>No hay más notificaciones</div>
              </div>
            )}
          </div>
          <div style={{width:28,height:28,borderRadius:"50%",overflow:"hidden",border:"1.5px solid rgba(56,189,248,0.3)",cursor:"pointer",flexShrink:0}}>
            <img src={LOGO_IVAN} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
        </header>

        {/* Content */}
        <main style={{flex:1,padding:"28px 32px",overflowY:"auto"}}>
          <div key={section+(companyId||"")} style={{animation:"_fsIn 0.2s ease both"}}>
          {companyId ? (
            <CompanyWorkflow cid={companyId} onBack={()=>setCompanyId(null)}/>
          ) : section==="dashboard" ? (
            <DashboardHome onGoCompany={goCompany}/>
          ) : section==="empresas" ? (
            <EmpresasSection onOpenCompany={goCompany}/>
          ) : section==="mediciones" ? (
            <MedicionesSection onOpenCompany={goCompany}/>
          ) : section==="validaciones" ? (
            <ValidacionesSection/>
          ) : section==="subscriptions" ? (
            <SubscriptionsSection/>
          ) : (
            <ConfigSection/>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><DemoRoot/></React.StrictMode>
);

void DIMENSIONS;
