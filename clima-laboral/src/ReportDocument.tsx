import React, { useMemo } from "react";
import { DIMENSIONS, QUESTIONS } from "./questions";
import { scoreLevelLabel, scoreTier, type DimScore } from "./shared";
import type { ActionRow, SurveyResponse } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// INFORME TÉCNICO DE CLIMA LABORAL — documento formal de 14 páginas (estilo CENVIT)
// Diseño institucional navy + ámbar, listo para imprimir / exportar a PDF en A4.
// El componente calcula todo a partir de las respuestas crudas para mantenerse
// desacoplado del dashboard interactivo.
// ──────────────────────────────────────────────────────────────────────────────

// ── Paleta institucional ───────────────────────────────────────────────────────
const NAVY = "#1e3a5f";
const NAVY_DEEP = "#14274a";
const GOLD = "#c89b2c";
const RED = "#b4532a";

function tierPrintColor(pct: number): string {
  const t = scoreTier(pct);
  return t === "critico" || t === "preventivo" ? GOLD : NAVY;
}
function tierBadge(pct: number): { label: string; bg: string; fg: string; bd: string } {
  const t = scoreTier(pct);
  switch (t) {
    case "excelente":
    case "favorable": return { label: scoreLevelLabel(pct), bg: "#eaf1ea", fg: "#1f6f43", bd: "#bcd9c4" };
    case "medio": return { label: scoreLevelLabel(pct), bg: "#eef2f8", fg: NAVY, bd: "#c7d4e6" };
    case "preventivo": return { label: scoreLevelLabel(pct), bg: "#f8f1dd", fg: "#8a6a1f", bd: "#e6d4a0" };
    default: return { label: scoreLevelLabel(pct), bg: "#f6e6dd", fg: RED, bd: "#e6c3ad" };
  }
}

function dimAvgPct(responses: SurveyResponse[], dimKey: string): number {
  const ids = QUESTIONS.filter((q) => q.dimension === dimKey).map((q) => q.id);
  let sum = 0, count = 0;
  for (const r of responses) for (const id of ids) {
    const v = r.answers[id];
    if (v !== undefined) { sum += v; count++; }
  }
  return count === 0 ? 0 : Math.round((sum / count / 5) * 100);
}
function globalPctOf(responses: SurveyResponse[]): number {
  let sum = 0, count = 0;
  for (const r of responses) for (const q of QUESTIONS) {
    const v = r.answers[q.id];
    if (v !== undefined) { sum += v; count++; }
  }
  return count === 0 ? 0 : Math.round((sum / count / 5) * 100);
}

export interface ReportDocumentProps {
  empresaNombre?: string;
  periodoLabel: string;
  prevLabel?: string;
  totalColaboradores?: number | null;
  responses: SurveyResponse[];
  prevResponses?: SurveyResponse[];
  benchmark: Record<string, number>;
  sectorLabel?: string;
  plan?: ActionRow[] | null;
  /** Serie histórica semestral opcional (etiqueta + índice global). */
  history?: Array<{ label: string; pct: number }>;
  consultor?: string;
  ciudad?: string;
  className?: string;
  /** Logos (ruta o data-URI base64). Permite incrustar en el demo de archivo único. */
  logoCenvit?: string;
  logoIvan?: string;
}

// Logos: ruta por defecto, sobreescribible con data-URI (demo de archivo único).
const LogoCtx = React.createContext<{ cenvit: string; ivan: string }>({
  cenvit: "logo-cenvit.png",
  ivan: "logo-ivan-viteri.jpg",
});

// ── Cabecera y pie corrientes ──────────────────────────────────────────────────
function PageChrome({ section }: { section: string }) {
  const logos = React.useContext(LogoCtx);
  return (
    <>
      <div className="rp-runhead">
        <div className="rp-runhead-logo">
          <img src={logos.cenvit} alt="CENVIT" className="rp-runhead-img" />
        </div>
        <div className="rp-runhead-section">
          {section}
          <span className="rp-runhead-rule" />
        </div>
        <div className="rp-runhead-logo rp-runhead-logo-right">
          <img src={logos.ivan} alt="Iván Viteri" className="rp-runhead-img" />
        </div>
      </div>
      <div className="rp-runfoot">
        <span>CENVIT | Psicología Laboral en acción · Informe técnico de clima laboral</span>
      </div>
    </>
  );
}

function Page({ section, children, cover = false }: { section?: string; children: React.ReactNode; cover?: boolean }) {
  return (
    <section className={`rp-page${cover ? " rp-page-cover" : ""}`}>
      {!cover && section && <PageChrome section={section} />}
      <div className={cover ? "rp-cover-body" : "rp-body"}>{children}</div>
    </section>
  );
}

function SectionTitle({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div className="rp-section-head">
      <h2 className="rp-h2"><span className="rp-h2-num">{n}.</span> {title}</h2>
      <p className="rp-section-sub">{subtitle}</p>
      <span className="rp-section-underline" />
    </div>
  );
}

function BarRow({ label, pct, max = 100 }: { label: string; pct: number; max?: number }) {
  return (
    <div className="rp-bar-row">
      <span className="rp-bar-label">{label}</span>
      <div className="rp-bar-track">
        <div className="rp-bar-fill" style={{ width: `${(pct / max) * 100}%`, background: tierPrintColor(pct) }} />
      </div>
      <span className="rp-bar-pct" style={{ color: tierPrintColor(pct) }}>{pct}%</span>
    </div>
  );
}

export function ReportDocument(props: ReportDocumentProps) {
  const {
    empresaNombre, periodoLabel, prevLabel, totalColaboradores,
    responses, prevResponses, benchmark, sectorLabel, plan, history,
    consultor = "Psic. Lab. Iván Raúl Viteri Chávez, MBA",
    ciudad = "Guayaquil – Ecuador",
    className,
    logoCenvit = "logo-cenvit.png",
    logoIvan = "logo-ivan-viteri.jpg",
  } = props;

  const scores: DimScore[] = useMemo(
    () => DIMENSIONS.map((dim) => ({ dim, pct: dimAvgPct(responses, dim.key) })),
    [responses]
  );
  const prevScores: DimScore[] | undefined = useMemo(
    () => prevResponses && prevResponses.length > 0
      ? DIMENSIONS.map((dim) => ({ dim, pct: dimAvgPct(prevResponses, dim.key) }))
      : undefined,
    [prevResponses]
  );
  const globalPct = useMemo(() => globalPctOf(responses), [responses]);
  const prevGlobalPct = useMemo(
    () => prevResponses && prevResponses.length > 0 ? globalPctOf(prevResponses) : undefined,
    [prevResponses]
  );
  const variation = prevGlobalPct != null ? globalPct - prevGlobalPct : null;

  const participation = totalColaboradores && totalColaboradores > 0
    ? Math.round((responses.length / totalColaboradores) * 100) : null;

  const ranked = useMemo(() => [...scores].sort((a, b) => b.pct - a.pct), [scores]);
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const criticalDims = scores.filter((s) => s.pct < 65);

  // Variación por dimensión
  const dimDeltas = useMemo(() => scores.map((s) => {
    const prev = prevScores?.find((p) => p.dim.key === s.dim.key)?.pct;
    return { ...s, prev, delta: prev != null ? s.pct - prev : null };
  }), [scores, prevScores]);
  const improving = dimDeltas.filter((d) => d.delta != null && d.delta > 0).length;
  const declining = dimDeltas.filter((d) => d.delta != null && d.delta < 0).length;

  // Departamentos / áreas
  const departments = useMemo(() => {
    const map = new Map<string, SurveyResponse[]>();
    for (const r of responses) {
      const k = r.department || "Sin especificar";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    return Array.from(map.entries())
      .map(([name, list]) => ({
        name, count: list.length, pct: globalPctOf(list),
        dimScores: DIMENSIONS.map((dim) => ({ key: dim.key, pct: dimAvgPct(list, dim.key) })),
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [responses]);

  // Serie histórica (usa la provista o construye una mínima con prev + actual)
  const series = useMemo(() => {
    if (history && history.length >= 2) return history;
    const pts: Array<{ label: string; pct: number }> = [];
    if (prevGlobalPct != null) pts.push({ label: prevLabel || "Anterior", pct: prevGlobalPct });
    pts.push({ label: periodoLabel, pct: globalPct });
    return pts;
  }, [history, prevGlobalPct, prevLabel, periodoLabel, globalPct]);
  const cumulativeGain = series.length >= 2 ? series[series.length - 1].pct - series[0].pct : null;

  // Comentarios destacados (hallazgos cualitativos)
  const comments = useMemo(
    () => responses.map((r) => r.comment?.trim()).filter((c): c is string => !!c),
    [responses]
  );

  const fechaGen = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  // Riesgos derivados (dimensiones más bajas)
  const riskRows = useMemo(() => {
    const lows = [...scores].sort((a, b) => a.pct - b.pct).slice(0, 5);
    const consequence: Record<string, string> = {
      reconocimiento: "Desmotivación y menor compromiso",
      comunicacion: "Rumores, reprocesos y baja coordinación",
      equidad: "Quejas, conflictos y baja confianza",
      bienestar: "Desgaste, ausentismo y rotación",
      liderazgo: "Diferencias entre equipos y desgaste",
      desarrollo_crecimiento: "Fuga de talento y estancamiento",
      motivacion: "Caída del compromiso y la productividad",
      condiciones_seguridad: "Incidentes, errores y baja eficiencia",
      cultura: "Pérdida de cohesión e identidad",
      trabajo_en_equipo: "Silos y fricción entre áreas",
    };
    return lows.map((s) => {
      const level = s.pct < 60 ? "Alto" : s.pct < 68 ? "Medio-alto" : "Medio";
      return {
        dim: s.dim, pct: s.pct, level,
        consequence: consequence[s.dim.key] || "Afectación del clima organizacional",
        action: s.dim.actionTemplate.action[scoreTier(s.pct) === "critico" || scoreTier(s.pct) === "preventivo" ? "low" : "medium"],
      };
    });
  }, [scores]);

  const firstFive = DIMENSIONS.slice(0, 5);
  const lastFive = DIMENSIONS.slice(5);

  return (
    <LogoCtx.Provider value={{ cenvit: logoCenvit, ivan: logoIvan }}>
    <div className={`rp-document${className ? " " + className : ""}`}>
      <style>{reportCss}</style>

      {/* ─────────────── PÁGINA 1 · PORTADA ─────────────── */}
      <Page cover>
        <div className="rp-cover-top">
          <div className="rp-cover-logo-card">
            <img src={logoCenvit} alt="CENVIT" className="rp-cover-logo" />
          </div>
          <p className="rp-cover-org">CENTRO EDUCATIVO Y DE NEGOCIOS CON VISIÓN INTEGRAL DEL TALENTO HUMANO</p>
        </div>

        <div className="rp-cover-center">
          <p className="rp-cover-eyebrow">INFORME INSTITUCIONAL · CONSULTORÍA EN TALENTO HUMANO</p>
          <h1 className="rp-cover-title">Informe Técnico<br />de Clima Laboral</h1>
          <div className="rp-cover-diamond"><span /><span className="rp-cover-diamond-dot" /><span /></div>
          <p className="rp-cover-tagline">Diagnóstico organizacional · Análisis de resultados · Histórico semestral · Plan de mejora</p>

          <div className="rp-cover-prepared">
            <p className="rp-cover-prepared-label">PREPARADO PARA</p>
            <p className="rp-cover-prepared-name">{empresaNombre || "[Nombre de la empresa]"}</p>
          </div>

          <div className="rp-cover-kpis">
            <div className="rp-cover-kpi">
              <span className="rp-cover-kpi-num">{globalPct}%</span>
              <span className="rp-cover-kpi-label">ÍNDICE GLOBAL</span>
              <span className="rp-cover-kpi-sub">{scoreLevelLabel(globalPct)}</span>
            </div>
            <div className="rp-cover-kpi">
              <span className="rp-cover-kpi-num">{variation != null ? `${variation >= 0 ? "+" : ""}${variation}` : "—"}</span>
              <span className="rp-cover-kpi-label">VARIACIÓN SEMESTRAL</span>
              <span className="rp-cover-kpi-sub">Puntos vs. medición anterior</span>
            </div>
            <div className="rp-cover-kpi">
              <span className="rp-cover-kpi-num">{participation != null ? `${participation}%` : `${responses.length}`}</span>
              <span className="rp-cover-kpi-label">{participation != null ? "PARTICIPACIÓN" : "PARTICIPANTES"}</span>
              <span className="rp-cover-kpi-sub">{participation != null ? "Cobertura institucional" : "Respuestas recibidas"}</span>
            </div>
          </div>

          <div className="rp-cover-author">
            <img src={logoIvan} alt="Iván Viteri" className="rp-cover-author-logo" />
            <div className="rp-cover-author-text">
              <p className="rp-cover-author-label">ELABORADO POR</p>
              <p className="rp-cover-author-name">{consultor}</p>
              <p className="rp-cover-author-sub">Consultoría especializada de CENVIT · Psicología Laboral en acción</p>
            </div>
          </div>
        </div>

        <div className="rp-cover-foot">
          <span>{ciudad} · {fechaGen}</span>
          <span>Medición semestral · Documento de uso ejecutivo y técnico</span>
        </div>
      </Page>

      {/* ─────────────── PÁGINA 2 · CONTENIDO ─────────────── */}
      <Page section="CONTENIDO">
        <div className="rp-toc-head">
          <h2 className="rp-h2">· Contenido del informe</h2>
          <p className="rp-section-sub">Estructura técnica del diagnóstico de clima laboral y su seguimiento.</p>
        </div>
        <div className="rp-toc">
          {[
            ["01", "Resumen ejecutivo", "Síntesis gerencial y prioridades de intervención", "03"],
            ["02", "Ficha técnica y metodología", "Alcance, instrumento y periodicidad semestral", "04"],
            ["03", "Resultados generales", "Índice global y resultados por dimensión", "05"],
            ["04", "Histórico de comportamiento semestral", "Tendencia del clima y variación entre mediciones", "06"],
            ["05", "Análisis por dimensión I", "Desglose técnico de las primeras cinco dimensiones", "07"],
            ["06", "Análisis por dimensión II", "Desglose de las dimensiones restantes", "08"],
            ["07", "Resultados por áreas", "Comparativo organizacional y focos de atención", "09"],
            ["08", "Mapa de calor y hallazgos", "Comportamiento por áreas y percepciones", "10"],
            ["09", "Matriz de riesgos y priorización", "Riesgos del clima y respuesta recomendada", "11"],
            ["10", "Plan de mejora · 90 días", "Acciones, responsables, plazos e indicadores", "12"],
            ["11", "Ruta de implementación y seguimiento", "Cronograma y ciclo de medición semestral", "13"],
            ["12", "Conclusiones y recomendaciones", "Cierre técnico y consideraciones de entrega", "14"],
          ].map(([n, t, s, p]) => (
            <div key={n} className="rp-toc-item">
              <span className="rp-toc-num">{n}</span>
              <div className="rp-toc-text">
                <span className="rp-toc-title">{t}</span>
                <span className="rp-toc-sub">{s}</span>
              </div>
              <span className="rp-toc-page">{p}</span>
            </div>
          ))}
        </div>
        <div className="rp-note rp-note-navy">
          <p className="rp-note-title">NOTA SOBRE LA PERIODICIDAD</p>
          <p>Este informe forma parte de un sistema de medición semestral. Los resultados se interpretan no solo de manera puntual, sino en relación con las mediciones previas, lo que permite observar la evolución del clima organizacional y la efectividad de los planes de mejora aplicados.</p>
        </div>
      </Page>

      {/* ─────────────── PÁGINA 3 · RESUMEN EJECUTIVO ─────────────── */}
      <Page section="RESUMEN EJECUTIVO">
        <SectionTitle n={1} title="Resumen ejecutivo" subtitle="Síntesis gerencial del estudio y de las prioridades de intervención." />
        <p className="rp-p">
          El presente diagnóstico se desarrolla dentro de un esquema de <strong>medición semestral</strong>. El clima laboral global
          se ubica en un nivel <strong>{scoreLevelLabel(globalPct).toLowerCase()} ({globalPct}%)</strong>
          {variation != null && variation > 0 && ", con una tendencia de mejora sostenida frente a la medición anterior"}
          {variation != null && variation < 0 && ", con un retroceso respecto a la medición anterior que debe atenderse"}.
          Persisten fortalezas en <strong>{strongest.dim.label.toLowerCase()}</strong>, así como brechas prioritarias en{" "}
          <strong>{criticalDims.slice(0, 3).map((c) => c.dim.label.toLowerCase()).join(", ") || weakest.dim.label.toLowerCase()}</strong>.
        </p>

        <div className="rp-kpi-row">
          <div className="rp-kpi"><span className="rp-kpi-num">{globalPct}%</span><span className="rp-kpi-label">ÍNDICE GLOBAL</span><span className="rp-kpi-sub">{scoreLevelLabel(globalPct)}</span></div>
          <div className="rp-kpi"><span className="rp-kpi-num">{variation != null ? `${variation >= 0 ? "+" : ""}${variation}` : "—"}</span><span className="rp-kpi-label">VS. SEMESTRE ANTERIOR</span><span className="rp-kpi-sub">{variation != null && variation >= 0 ? "Tendencia positiva" : "A vigilar"}</span></div>
          <div className="rp-kpi"><span className="rp-kpi-num">{criticalDims.length}</span><span className="rp-kpi-label">BRECHAS CRÍTICAS</span><span className="rp-kpi-sub">{criticalDims.slice(0, 3).map((c) => c.dim.shortLabel).join(", ") || "—"}</span></div>
          <div className="rp-kpi"><span className="rp-kpi-num">{departments.length}</span><span className="rp-kpi-label">ÁREAS EVALUADAS</span><span className="rp-kpi-sub">Cobertura integral por áreas</span></div>
        </div>

        <div className="rp-two-col">
          <div className="rp-callout rp-callout-navy">
            <p className="rp-callout-title">FORTALEZAS PRINCIPALES</p>
            <ul className="rp-list">
              <li>{strongest.dim.label} alcanza {strongest.pct}% y es la principal base positiva del clima.</li>
              <li>{ranked[1].dim.label} ({ranked[1].pct}%) refuerza el desempeño general.</li>
              {variation != null && variation > 0 && <li>Mejora sostenida del índice global (+{variation} pts) en el semestre.</li>}
              <li>Base {strongest.pct >= 80 ? "cultural y de equipo" : "organizacional"} estable para implementar cambios.</li>
            </ul>
          </div>
          <div className="rp-callout rp-callout-gold">
            <p className="rp-callout-title">FACTORES CRÍTICOS</p>
            <ul className="rp-list">
              <li>{weakest.dim.label} ({weakest.pct}%): {weakest.dim.key === "reconocimiento" ? "valoración del esfuerzo insuficiente" : "principal brecha del estudio"}.</li>
              {criticalDims.slice(1, 3).map((c) => (
                <li key={c.dim.key}>{c.dim.label} en zona de atención ({c.pct}%).</li>
              ))}
              {declining > 0 && <li>{declining} dimensión(es) con retroceso semestral a vigilar.</li>}
            </ul>
          </div>
        </div>

        <div className="rp-note rp-note-navy">
          <p className="rp-note-title">INTERPRETACIÓN EJECUTIVA</p>
          <p>
            El resultado general {globalPct >= 65 ? "no describe una organización en crisis" : "exige una intervención decidida"}; la lectura semestral
            {variation != null && variation > 0 ? " muestra avances atribuibles a la gestión" : " marca el punto de partida del seguimiento"}.
            {declining > 0 ? " No obstante, algunas dimensiones presentan señales de retroceso que deben atenderse para no comprometer la tendencia del clima institucional." : " Conviene consolidar las fortalezas y cerrar las brechas detectadas antes de la próxima medición."}
          </p>
        </div>

        <h3 className="rp-h3">Prioridades inmediatas</h3>
        <div className="rp-prio-grid">
          {(plan && plan.length > 0 ? plan.slice(0, 4).map((p) => p.action) : [
            `Cerrar la brecha de ${weakest.dim.label.toLowerCase()}.`,
            "Definir un protocolo mínimo de comunicación por área.",
            "Institucionalizar un mecanismo sobrio de reconocimiento al desempeño.",
            "Vigilar el bienestar psicosocial antes de la próxima medición.",
          ]).map((txt, i) => (
            <div key={i} className="rp-prio"><span className="rp-prio-num">{i + 1}</span><span>{txt}</span></div>
          ))}
        </div>
      </Page>

      {/* ─────────────── PÁGINA 4 · FICHA TÉCNICA ─────────────── */}
      <Page section="FICHA TÉCNICA Y METODOLOGÍA">
        <SectionTitle n={2} title="Ficha técnica y metodología" subtitle="Alcance del estudio, instrumento y proceso de levantamiento con enfoque semestral." />
        <table className="rp-table rp-table-spec">
          <tbody>
            {[
              ["Tipo de estudio", "Descriptivo, transversal y aplicado a la realidad organizacional"],
              ["Periodicidad de medición", "Semestral · dos mediciones por año (I y II semestre)"],
              ["Población objetivo", "Personal directivo, administrativo y operativo"],
              ["Participantes", `${responses.length} colaboradores${totalColaboradores ? ` de ${totalColaboradores} convocados` : ""}`],
              ["Nivel de participación", participation != null ? `${participation}%` : "No determinado"],
              ["Instrumento", `Encuesta estructurada de ${QUESTIONS.length} ítems en escala Likert de 1 a 5`],
              ["Dimensiones evaluadas", `${DIMENSIONS.length} dimensiones del clima organizacional`],
              ["Técnicas complementarias", "Entrevistas semiestructuradas, observación y revisión documental"],
              ["Medición actual", periodoLabel],
              ["Responsable técnico", `CENVIT · ${consultor}`],
            ].map(([k, v]) => (
              <tr key={k}><td className="rp-spec-k">{k}</td><td className="rp-spec-v">{v}</td></tr>
            ))}
          </tbody>
        </table>

        <div className="rp-two-col">
          <div className="rp-callout rp-callout-navy">
            <p className="rp-callout-title">CRITERIOS DE CONFIDENCIALIDAD</p>
            <p className="rp-callout-text">La información se maneja bajo estricta reserva técnica. Los resultados se presentan de forma agregada, sin identificación individual de participantes. El informe se utiliza para fines de mejora y nunca para procesos disciplinarios.</p>
          </div>
          <div className="rp-callout rp-callout-gold">
            <p className="rp-callout-title">ESCALA DE INTERPRETACIÓN</p>
            <ul className="rp-scale-list">
              <li><span className="rp-scale-band" style={{ background: "#1f6f43" }} />90–100 · Excelente</li>
              <li><span className="rp-scale-band" style={{ background: "#4ade80" }} />80–89 · Favorable</li>
              <li><span className="rp-scale-band" style={{ background: NAVY }} />70–79 · Medio favorable</li>
              <li><span className="rp-scale-band" style={{ background: "#e0a93b" }} />65–69 · Preventivo</li>
              <li><span className="rp-scale-band" style={{ background: RED }} />&lt; 65 · Crítico / intervención prioritaria</li>
            </ul>
          </div>
        </div>

        <h3 className="rp-h3">Ruta metodológica</h3>
        <div className="rp-route">
          {[
            ["1", "Planificación", "Alcance, actores, calendario y responsables."],
            ["2", "Sensibilización", "Comunicación previa y garantía de reserva."],
            ["3", "Aplicación", "Encuesta, entrevistas y levantamiento."],
            ["4", "Procesamiento", "Depuración, tabulación y análisis."],
            ["5", "Comparación", "Contraste con la medición semestral previa."],
          ].map(([n, t, d]) => (
            <div key={n} className="rp-route-step">
              <span className="rp-route-num">{n}</span>
              <span className="rp-route-title">{t}</span>
              <span className="rp-route-desc">{d}</span>
            </div>
          ))}
        </div>
      </Page>

      {/* ─────────────── PÁGINA 5 · RESULTADOS GENERALES ─────────────── */}
      <Page section="RESULTADOS GENERALES">
        <SectionTitle n={3} title="Resultados generales" subtitle="Índice global de clima laboral y lectura técnica del resultado actual." />
        <div className="rp-global-card">
          <div className="rp-global-num">{globalPct}%</div>
          <div className="rp-global-text">
            <p className="rp-global-level">Nivel general: {scoreLevelLabel(globalPct).toLowerCase()}{globalPct < 70 ? " con intervención preventiva" : ""}</p>
            <p className="rp-global-desc">
              El índice global sugiere una organización {globalPct >= 65 ? "funcional, con condiciones adecuadas para intervenir sin afectar su estabilidad" : "que requiere atención prioritaria en sus dimensiones críticas"}.
              La mejora debe orientarse a consolidar {weakest.dim.label.toLowerCase()} y reforzar las dimensiones en zona de atención. Este resultado se analiza en detalle frente a su histórico en la sección 4.
            </p>
          </div>
        </div>

        <h3 className="rp-h3">Resultados por dimensión · {periodoLabel}</h3>
        <div className="rp-bar-list">
          {scores.map((s) => <BarRow key={s.dim.key} label={s.dim.label} pct={s.pct} />)}
        </div>

        <div className="rp-three-col">
          <div className="rp-mini-callout rp-mc-navy">
            <p className="rp-mc-title">MAYOR FORTALEZA</p>
            <p>{strongest.dim.label} alcanza {strongest.pct}% y se consolida como la principal base positiva del clima.</p>
          </div>
          <div className="rp-mini-callout rp-mc-gold">
            <p className="rp-mc-title">ALERTA PRINCIPAL</p>
            <p>{weakest.dim.label} alcanza {weakest.pct}%, reflejando la brecha más relevante del estudio.</p>
          </div>
          <div className="rp-mini-callout rp-mc-plain">
            <p className="rp-mc-title">BRECHA TRANSVERSAL</p>
            <p>{criticalDims.slice(0, 2).map((c) => c.dim.label.toLowerCase()).join(" y ") || "Dimensiones en zona media"} exigen coordinación entre gerencia, jefaturas y Talento Humano.</p>
          </div>
        </div>
      </Page>

      {/* ─────────────── PÁGINA 6 · HISTÓRICO SEMESTRAL ─────────────── */}
      <Page section="HISTÓRICO SEMESTRAL">
        <SectionTitle n={4} title="Histórico de comportamiento semestral" subtitle="Evolución del índice global de clima laboral a lo largo de las mediciones semestrales." />
        <div className="rp-hist-row">
          <div className="rp-hist-chart">
            <p className="rp-hist-chart-title">Índice global de clima laboral · {series[0]?.label} a {series[series.length - 1]?.label}</p>
            <HistoryChart series={series} />
          </div>
          <div className="rp-hist-side">
            {cumulativeGain != null && (
              <div className="rp-hist-kpi"><span className="rp-hist-kpi-num" style={{ color: cumulativeGain >= 0 ? "#1f6f43" : RED }}>{cumulativeGain >= 0 ? "+" : ""}{cumulativeGain}</span><span className="rp-hist-kpi-sub">puntos acumulados desde {series[0]?.label}</span></div>
            )}
            {variation != null && (
              <div className="rp-hist-kpi"><span className="rp-hist-kpi-num" style={{ color: variation >= 0 ? "#1f6f43" : RED }}>{variation >= 0 ? "+" : ""}{variation}</span><span className="rp-hist-kpi-sub">variación vs. {prevLabel || "semestre anterior"}</span></div>
            )}
            <div className="rp-hist-kpi"><span className="rp-hist-kpi-num">{series.length}</span><span className="rp-hist-kpi-sub">medición(es) semestral(es) registrada(s)</span></div>
          </div>
        </div>

        <h3 className="rp-h3">Variación por dimensión · {prevLabel || "anterior"} → {periodoLabel}</h3>
        <div className="rp-hist-row">
          <table className="rp-table rp-table-var">
            <thead><tr><th>Dimensión</th><th>{prevLabel || "Anterior"}</th><th>{periodoLabel.replace(/\s+/g, " ")}</th><th>Variación</th></tr></thead>
            <tbody>
              {dimDeltas.map((d) => (
                <tr key={d.dim.key}>
                  <td className="rp-var-dim">{d.dim.label}</td>
                  <td>{d.prev != null ? `${d.prev}%` : "—"}</td>
                  <td>{d.pct}%</td>
                  <td>{d.delta == null ? "—" : (
                    <span className={`rp-delta ${d.delta > 0 ? "up" : d.delta < 0 ? "down" : "same"}`}>
                      {d.delta > 0 ? "▲ +" : d.delta < 0 ? "▼ " : "= "}{d.delta}
                    </span>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="rp-callout rp-callout-gold rp-balance">
            <p className="rp-callout-title">BALANCE DEL SEMESTRE</p>
            <p className="rp-balance-line"><span className="rp-delta up">▲ {improving}</span> dimensiones mejoran</p>
            <p className="rp-balance-line"><span className="rp-delta down">▼ {declining}</span> dimensiones retroceden</p>
            <p className="rp-callout-text">La tendencia general es {improving >= declining ? "positiva" : "a vigilar"}, pero {declining > 0 ? "el retroceso de algunas dimensiones debe vigilarse" : "conviene consolidar los avances"} antes del próximo corte semestral.</p>
          </div>
        </div>

        <div className="rp-note rp-note-gold">
          <p className="rp-note-title">LECTURA DEL HISTÓRICO</p>
          <p>La medición semestral permite confirmar si los planes de mejora producen efectos reales sobre el clima. El seguimiento debe orientarse a proteger los avances logrados y a revertir las dimensiones que muestran señales de deterioro.</p>
        </div>
      </Page>

      {/* ─────────────── PÁGINA 7 · ANÁLISIS DIMENSIÓN I ─────────────── */}
      <Page section="ANÁLISIS POR DIMENSIÓN I">
        <SectionTitle n={5} title="Análisis por dimensión I" subtitle="Desglose técnico de las primeras cinco dimensiones, con su variación semestral." />
        <DimensionCards dims={firstFive} scores={scores} deltas={dimDeltas} />
        <div className="rp-note rp-note-navy">
          <p className="rp-note-title">LECTURA INTEGRADA</p>
          <p>Las primeras cinco dimensiones muestran {firstFive.some((d) => (scores.find((s) => s.dim.key === d.key)?.pct ?? 0) >= 75) ? "una base sólida en los factores de compromiso y colaboración" : "oportunidades de mejora en factores centrales del clima"}. La atención prioritaria recae sobre las dimensiones con menor puntaje y aquellas que retroceden frente al semestre anterior.</p>
        </div>
      </Page>

      {/* ─────────────── PÁGINA 8 · ANÁLISIS DIMENSIÓN II ─────────────── */}
      <Page section="ANÁLISIS POR DIMENSIÓN II">
        <SectionTitle n={6} title="Análisis por dimensión II" subtitle="Desglose técnico de las dimensiones restantes y lectura consolidada." />
        <DimensionCards dims={lastFive} scores={scores} deltas={dimDeltas} />
        <div className="rp-note rp-note-navy">
          <p className="rp-note-title">LECTURA INTEGRADA</p>
          <p>Las dimensiones restantes sostienen el desempeño general, pero aquellas en zona preventiva o con retroceso deben observarse de forma anticipada. Aunque no impliquen un deterioro grave, anticipan riesgos si no se actúa con oportunidad antes del próximo semestre.</p>
        </div>
      </Page>

      {/* ─────────────── PÁGINA 9 · RESULTADOS POR ÁREAS ─────────────── */}
      <Page section="RESULTADOS POR ÁREAS">
        <SectionTitle n={7} title="Resultados por áreas" subtitle="Comparativo organizacional e identificación de focos de atención." />
        <h3 className="rp-h3">Índice general por área</h3>
        <div className="rp-area-row">
          <div className="rp-bar-list rp-area-bars">
            {departments.map((d) => <BarRow key={d.name} label={d.name} pct={d.pct} />)}
          </div>
          <div className="rp-area-side">
            <div className="rp-mini-callout rp-mc-navy">
              <p className="rp-mc-title">ÁREAS CON MAYOR FORTALEZA</p>
              <p>{departments.slice(0, 3).map((d) => d.name).join(", ")} muestran los mejores resultados relativos y pueden funcionar como núcleos de apoyo para la implementación del plan.</p>
            </div>
            <div className="rp-mini-callout rp-mc-gold">
              <p className="rp-mc-title">FOCOS DE INTERVENCIÓN</p>
              <p>{departments.slice(-2).map((d) => d.name).join(" y ")} requieren acompañamiento prioritario, con participación visible de sus jefaturas.</p>
            </div>
          </div>
        </div>
        <table className="rp-table rp-table-area">
          <thead><tr><th>Área</th><th>Resultado</th><th>Nivel</th></tr></thead>
          <tbody>
            {departments.map((d) => {
              const b = tierBadge(d.pct);
              return (
                <tr key={d.name}>
                  <td className="rp-area-name">{d.name}</td>
                  <td>{d.pct}%</td>
                  <td><span className="rp-pill" style={{ background: b.bg, color: b.fg, borderColor: b.bd }}>{b.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Page>

      {/* ─────────────── PÁGINA 10 · MAPA DE CALOR ─────────────── */}
      <Page section="MAPA DE CALOR Y HALLAZGOS">
        <SectionTitle n={8} title="Mapa de calor y hallazgos cualitativos" subtitle="Comportamiento por áreas y síntesis de percepciones agregadas." />
        <h3 className="rp-h3">Mapa de calor por áreas y dimensiones críticas</h3>
        <HeatMap departments={departments} />
        <div className="rp-heat-legend">
          <span><span className="rp-heat-chip" style={{ background: "#cfe3d4" }} />80–100 favorable</span>
          <span><span className="rp-heat-chip" style={{ background: "#dde6f2" }} />70–79 medio favorable</span>
          <span><span className="rp-heat-chip" style={{ background: "#f6ead0" }} />65–69 preventivo</span>
          <span><span className="rp-heat-chip" style={{ background: "#f0d8cb" }} />&lt; 65 crítico</span>
        </div>
        <div className="rp-two-col">
          <div className="rp-callout rp-callout-navy">
            <p className="rp-callout-title">HALLAZGOS CUALITATIVOS</p>
            <ul className="rp-list">
              {comments.length > 0 ? comments.slice(0, 3).map((c, i) => (
                <li key={i}>{c.length > 120 ? c.slice(0, 117) + "…" : c}</li>
              )) : (
                <>
                  <li>La información no siempre llega a tiempo ni con la misma claridad a todas las áreas.</li>
                  <li>El personal valora el compañerismo, pero espera mayor reconocimiento del esfuerzo.</li>
                  <li>La experiencia laboral depende del estilo de cada jefatura.</li>
                </>
              )}
            </ul>
          </div>
          <div className="rp-callout rp-callout-gold">
            <p className="rp-callout-title">IMPLICACIÓN ORGANIZACIONAL</p>
            <p className="rp-callout-text">Las percepciones cualitativas confirman que las principales brechas no son aisladas: {weakest.dim.label.toLowerCase()}, comunicación y liderazgo se relacionan entre sí y pueden afectar la motivación, la coordinación y la permanencia del talento si no se gestionan con prontitud.</p>
          </div>
        </div>
      </Page>

      {/* ─────────────── PÁGINA 11 · MATRIZ DE RIESGOS ─────────────── */}
      <Page section="MATRIZ DE RIESGOS">
        <SectionTitle n={9} title="Matriz de riesgos y priorización" subtitle="Riesgos derivados del clima laboral y respuesta recomendada." />
        <div className="rp-risk-row">
          <RiskQuadrant scores={scores} />
          <div className="rp-risk-side">
            <div className="rp-callout rp-callout-gold">
              <p className="rp-callout-title">LECTURA DEL RIESGO</p>
              <p className="rp-callout-text">Los riesgos de mayor prioridad se concentran en {riskRows.slice(0, 3).map((r) => r.dim.label.toLowerCase()).join(", ")}. Estas variables inciden directamente sobre la confianza, la motivación y la coordinación operativa.</p>
            </div>
            <div className="rp-callout rp-callout-navy">
              <p className="rp-callout-title">CRITERIO TÉCNICO</p>
              <p className="rp-callout-text">Priorizar variables de alto impacto y alta recurrencia permite concentrar recursos y obtener resultados visibles antes del próximo corte semestral.</p>
            </div>
          </div>
        </div>
        <table className="rp-table rp-table-risk">
          <thead><tr><th>Riesgo</th><th>Nivel</th><th>Consecuencia probable</th><th>Acción recomendada</th></tr></thead>
          <tbody>
            {riskRows.map((r) => (
              <tr key={r.dim.key}>
                <td className="rp-risk-name">{r.dim.label}</td>
                <td><span className="rp-pill" style={{ background: r.level === "Alto" ? "#f6e6dd" : "#f8f1dd", color: r.level === "Alto" ? RED : "#8a6a1f", borderColor: r.level === "Alto" ? "#e6c3ad" : "#e6d4a0" }}>{r.level}</span></td>
                <td>{r.consequence}</td>
                <td>{r.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>

      {/* ─────────────── PÁGINA 12 · PLAN DE MEJORA ─────────────── */}
      <Page section="PLAN DE MEJORA">
        <SectionTitle n={10} title="Plan de mejora · 90 días" subtitle="Acciones estratégicas, responsables, plazos e indicadores para el semestre en curso." />
        <table className="rp-table rp-table-plan">
          <thead><tr><th>Acción prioritaria</th><th>Responsable</th><th>Plazo</th><th>Indicador</th></tr></thead>
          <tbody>
            {(plan && plan.length > 0 ? plan : buildDefaultPlan(riskRows)).map((p, i) => (
              <tr key={i}>
                <td className="rp-plan-action">{p.action}</td>
                <td>{p.responsible}</td>
                <td className="rp-plan-plazo">{formatDeadline(p.deadline)}</td>
                <td>{p.indicator}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="rp-three-col">
          <div className="rp-mini-callout rp-mc-navy"><p className="rp-mc-title">DIRECCIÓN VISIBLE</p><p>La alta dirección respalda el proceso, comunica prioridades y revisa periódicamente los avances del plan.</p></div>
          <div className="rp-mini-callout rp-mc-plain"><p className="rp-mc-title">MANDOS MEDIOS</p><p>Las jefaturas se entrenan y son acompañadas en liderazgo, coordinación y conversación de desempeño.</p></div>
          <div className="rp-mini-callout rp-mc-gold"><p className="rp-mc-title">INDICADORES</p><p>Las acciones se miden con evidencias e impacto, y se contrastan en la próxima medición semestral.</p></div>
        </div>
      </Page>

      {/* ─────────────── PÁGINA 13 · RUTA DE IMPLEMENTACIÓN ─────────────── */}
      <Page section="CRONOGRAMA Y CICLO SEMESTRAL">
        <SectionTitle n={11} title="Ruta de implementación y seguimiento" subtitle="Secuencia del plan y articulación con el ciclo de medición semestral." />
        <h3 className="rp-h3">Ciclo de medición semestral</h3>
        <div className="rp-cycle">
          <div className="rp-cycle-step"><span className="rp-cycle-label">{prevLabel || "Semestre anterior"}</span><span className="rp-cycle-sub">Medición anterior</span><span className="rp-cycle-val">{prevGlobalPct != null ? `${prevGlobalPct}%` : "—"}</span></div>
          <span className="rp-cycle-arrow">→</span>
          <div className="rp-cycle-step rp-cycle-current"><span className="rp-cycle-label">{periodoLabel}</span><span className="rp-cycle-sub">Medición actual</span><span className="rp-cycle-val">{globalPct}%</span></div>
          <span className="rp-cycle-arrow">→</span>
          <div className="rp-cycle-step"><span className="rp-cycle-label">Próximo semestre</span><span className="rp-cycle-sub">Próxima medición</span><span className="rp-cycle-val">Meta ≥ {Math.min(100, globalPct + 3)}%</span></div>
        </div>

        <h3 className="rp-h3">Hitos del plan dentro del semestre</h3>
        <div className="rp-milestones">
          {[
            ["0–15 días", "Socialización del histórico y acuerdos de acción."],
            ["30 días", "Reuniones por área y programa de reconocimiento."],
            ["60 días", "Formación a jefaturas y revisión de cargas."],
            ["90 días", "Medición pulso intermedia y ajuste del plan."],
          ].map(([d, t]) => (
            <div key={d} className="rp-milestone"><span className="rp-milestone-day">{d}</span><span className="rp-milestone-text">{t}</span></div>
          ))}
        </div>

        <h3 className="rp-h3">Indicadores de seguimiento sugeridos</h3>
        <div className="rp-prio-grid">
          {["Índice general de clima laboral", `Índice de ${weakest.dim.label.toLowerCase()}`, "Índice de comunicación interna", "Índice de bienestar psicosocial", "% de jefaturas capacitadas", "Cumplimiento del plan de acción"].map((t, i) => (
            <div key={i} className="rp-prio"><span className="rp-prio-num">{i + 1}</span><span>{t}</span></div>
          ))}
        </div>

        <div className="rp-note rp-note-gold">
          <p className="rp-note-title">RECOMENDACIÓN DE SEGUIMIENTO</p>
          <p>El sistema de medición semestral permite verificar si cada plan de mejora produce efectos reales sobre el clima. Se recomienda una medición pulso intermedia al día 90 y la aplicación completa en el siguiente semestre, comparando los resultados con el histórico para sostener la tendencia positiva.</p>
        </div>
      </Page>

      {/* ─────────────── PÁGINA 14 · CONCLUSIONES ─────────────── */}
      <Page section="CONCLUSIONES Y CIERRE">
        <SectionTitle n={12} title="Conclusiones y recomendaciones ejecutivas" subtitle="Cierre técnico del diagnóstico y consideraciones para la entrega a la empresa." />
        <div className="rp-concl">
          {[
            `El clima laboral general se ubica en nivel ${scoreLevelLabel(globalPct).toLowerCase()} (${globalPct}%)${variation != null && variation > 0 ? " y mantiene una tendencia de mejora frente a la medición anterior" : ""}.`,
            `Las mayores fortalezas corresponden a ${strongest.dim.label.toLowerCase()} y ${ranked[1].dim.label.toLowerCase()}, aspectos que deben preservarse como activos de la empresa.`,
            `Las principales brechas se concentran en ${criticalDims.slice(0, 3).map((c) => c.dim.label.toLowerCase()).join(", ") || weakest.dim.label.toLowerCase()}; ${declining > 0 ? "algunas dimensiones muestran retroceso semestral que exige atención" : "su cierre debe priorizarse en el plan de mejora"}.`,
            "Las diferencias entre áreas indican que la mejora no puede ser exclusivamente general; se requiere combinar acciones corporativas con apoyo focalizado.",
            "El seguimiento del clima debe sostenerse mediante el ciclo semestral, con indicadores, planes de acción y comparación sistemática frente al histórico.",
          ].map((t, i) => (
            <div key={i} className="rp-concl-item"><span className="rp-concl-num">{i + 1}</span><p>{t}</p></div>
          ))}
        </div>

        <div className="rp-two-col">
          <div className="rp-callout rp-callout-navy">
            <p className="rp-callout-title">RECOMENDACIONES GERENCIALES</p>
            <ul className="rp-list">
              <li>Aprobar el plan de mejora como iniciativa institucional.</li>
              <li>Asignar responsables y fechas concretas.</li>
              <li>Comunicar avances y el histórico de mejora.</li>
              <li>No utilizar el informe para fines sancionatorios.</li>
            </ul>
          </div>
          <div className="rp-callout rp-callout-gold">
            <p className="rp-callout-title">RECOMENDACIONES DE TALENTO HUMANO</p>
            <ul className="rp-list">
              <li>Acompañar a las jefaturas críticas.</li>
              <li>Integrar clima, capacitación y desempeño.</li>
              <li>Sostener el ciclo de medición semestral.</li>
              <li>Comparar siempre contra la medición previa.</li>
            </ul>
          </div>
        </div>

        <div className="rp-signoff">
          <p className="rp-signoff-label">Elaborado técnicamente por</p>
          <p className="rp-signoff-name">{consultor}</p>
          <p className="rp-signoff-sub">Consultoría especializada de CENVIT · Psicología Laboral en acción</p>
        </div>
      </Page>
    </div>
    </LogoCtx.Provider>
  );
}

// ── Sub-componentes ─────────────────────────────────────────────────────────────

function DimensionCards({ dims, scores, deltas }: {
  dims: typeof DIMENSIONS; scores: DimScore[]; deltas: Array<DimScore & { delta: number | null }>;
}) {
  return (
    <div className="rp-dim-grid">
      {dims.map((dim) => {
        const pct = scores.find((s) => s.dim.key === dim.key)?.pct ?? 0;
        const delta = deltas.find((d) => d.dim.key === dim.key)?.delta ?? null;
        const tier = scoreTier(pct);
        const note =
          tier === "critico" ? dim.recommendation.low :
          tier === "preventivo" || tier === "medio" ? dim.recommendation.medium :
          dim.recommendation.high;
        return (
          <div key={dim.key} className="rp-dim-card">
            <div className="rp-dim-card-head">
              <span className="rp-dim-card-name">{dim.label}</span>
              <span className="rp-dim-card-pct" style={{ color: tierPrintColor(pct) }}>{pct}%</span>
            </div>
            <div className="rp-dim-card-bar"><div style={{ width: `${pct}%`, background: tierPrintColor(pct) }} /></div>
            <p className="rp-dim-card-note">
              {delta != null && (
                <span className={`rp-delta ${delta > 0 ? "up" : delta < 0 ? "down" : "same"}`}>
                  {delta > 0 ? `+${delta} pts` : delta < 0 ? `${delta} pts` : "sin cambio"}
                </span>
              )}{" "}
              {note.length > 150 ? note.slice(0, 147) + "…" : note}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function HistoryChart({ series }: { series: Array<{ label: string; pct: number }> }) {
  const W = 360, H = 150, padL = 30, padR = 14, padT = 16, padB = 26;
  const cw = W - padL - padR, ch = H - padT - padB;
  const n = series.length;
  const vals = series.map((s) => s.pct);
  const min = Math.min(...vals, 55), max = Math.max(...vals, 80);
  const range = Math.max(10, max - min);
  const x = (i: number) => padL + (n <= 1 ? cw / 2 : (i / (n - 1)) * cw);
  const y = (v: number) => padT + ch - ((v - min) / range) * ch;
  const path = series.map((s, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(s.pct).toFixed(1)}`).join(" ");
  const area = `${path} L${x(n - 1).toFixed(1)},${(padT + ch).toFixed(1)} L${x(0).toFixed(1)},${(padT + ch).toFixed(1)} Z`;
  const gridVals = [min, Math.round((min + max) / 2), max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rp-svg" width="100%">
      {gridVals.map((gv) => (
        <g key={gv}>
          <line x1={padL} y1={y(gv)} x2={W - padR} y2={y(gv)} stroke="#e3e8ef" strokeWidth="1" />
          <text x={padL - 5} y={y(gv) + 3} textAnchor="end" fontSize="7" fill="#9aa3b2">{gv}</text>
        </g>
      ))}
      <path d={area} fill={NAVY} opacity="0.06" />
      <path d={path} fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {series.map((s, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(s.pct)} r="3.2" fill={i === n - 1 ? GOLD : NAVY} stroke="#fff" strokeWidth="1.2" />
          <text x={x(i)} y={y(s.pct) - 7} textAnchor="middle" fontSize="7" fontWeight="700" fill={NAVY}>{s.pct}%</text>
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="7" fill="#5b6675">{s.label}</text>
        </g>
      ))}
    </svg>
  );
}

function HeatMap({ departments }: { departments: Array<{ name: string; dimScores: Array<{ key: string; pct: number }> }> }) {
  // Selección de 6 dimensiones más representativas para que la tabla entre en A4
  const showKeys = ["liderazgo", "comunicacion", "reconocimiento", "trabajo_en_equipo", "condiciones_seguridad", "equidad"];
  const showDims = showKeys.map((k) => DIMENSIONS.find((d) => d.key === k)!).filter(Boolean);
  function heatBg(pct: number): string {
    if (pct >= 80) return "#cfe3d4";
    if (pct >= 70) return "#dde6f2";
    if (pct >= 65) return "#f6ead0";
    return "#f0d8cb";
  }
  return (
    <table className="rp-table rp-heatmap">
      <thead>
        <tr><th>Área</th>{showDims.map((d) => <th key={d.key}>{d.shortLabel}</th>)}</tr>
      </thead>
      <tbody>
        {departments.map((dep) => (
          <tr key={dep.name}>
            <td className="rp-heat-name">{dep.name}</td>
            {showDims.map((d) => {
              const pct = dep.dimScores.find((s) => s.key === d.key)?.pct ?? 0;
              return <td key={d.key} className="rp-heat-cell" style={{ background: heatBg(pct) }}>{pct}%</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RiskQuadrant({ scores }: { scores: DimScore[] }) {
  const W = 300, H = 240, pad = 30;
  // x = recurrencia/probabilidad (a menor puntaje, mayor recurrencia del problema) → x = 100 - pct
  // y = impacto organizacional (proxy: peso de la dimensión) — usamos severidad como impacto
  const pts = scores.map((s) => {
    const x = 100 - s.pct;            // recurrencia
    const impact = Math.max(0, 100 - s.pct) * 0.6 + 30; // impacto proxy
    return { dim: s.dim, x, y: impact, pct: s.pct };
  });
  const sx = (x: number) => pad + (x / 100) * (W - 2 * pad);
  const sy = (y: number) => H - pad - (y / 100) * (H - 2 * pad);
  const midX = pad + (W - 2 * pad) / 2, midY = pad + (H - 2 * pad) / 2;
  return (
    <div className="rp-risk-quad">
      <svg viewBox={`0 0 ${W} ${H}`} className="rp-svg" width="100%">
        <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="#fafbfc" stroke="#dfe4ec" />
        <rect x={midX} y={pad} width={(W - 2 * pad) / 2} height={(H - 2 * pad) / 2} fill="#f8f1dd" opacity="0.7" />
        <line x1={midX} y1={pad} x2={midX} y2={H - pad} stroke="#dfe4ec" strokeWidth="1" />
        <line x1={pad} y1={midY} x2={W - pad} y2={midY} stroke="#dfe4ec" strokeWidth="1" />
        <text x={pad + 4} y={pad + 12} fontSize="7.5" fill="#5b6675" fontWeight="700">Mantener</text>
        <text x={midX + 4} y={pad + 12} fontSize="7.5" fill="#8a6a1f" fontWeight="700">Prioridad alta</text>
        <text x={pad + 4} y={H - pad - 5} fontSize="7.5" fill="#5b6675" fontWeight="700">Monitorear</text>
        <text x={midX + 4} y={H - pad - 5} fontSize="7.5" fill="#5b6675" fontWeight="700">Intervenir</text>
        {pts.map((p) => (
          <g key={p.dim.key}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r="3.4" fill={p.pct < 65 ? GOLD : NAVY} />
            <text x={sx(p.x) + 5} y={sy(p.y) + 3} fontSize="7" fill="#1f2937">{p.dim.shortLabel}</text>
          </g>
        ))}
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="7" fill="#9aa3b2">Probabilidad / recurrencia</text>
      </svg>
      <span className="rp-risk-yaxis">Impacto organizacional</span>
    </div>
  );
}

function buildDefaultPlan(riskRows: Array<{ dim: typeof DIMENSIONS[number]; action: string }>): ActionRow[] {
  return riskRows.map((r, i) => ({
    dimension: r.dim.label,
    finding: "",
    level: "low",
    action: r.action,
    responsible: r.dim.actionTemplate.responsible,
    deadline: `${(i + 1) * 15} días`,
    indicator: r.dim.actionTemplate.indicator,
    priority: "Alta" as const,
    status: "pendiente" as const,
  }));
}

function formatDeadline(d: string): string {
  if (!d) return "—";
  if (/d[íi]as/i.test(d)) return d;
  const date = new Date(d);
  if (!isNaN(date.getTime())) return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return d;
}

// ──────────────────────────────────────────────────────────────────────────────
// Estilos del informe (scoped con prefijo rp-)
// ──────────────────────────────────────────────────────────────────────────────
const reportCss = `
.rp-document, .rp-document *, .rp-document *::before, .rp-document *::after { box-sizing: border-box; }
.rp-document {
  --navy: ${NAVY};
  --navy-deep: ${NAVY_DEEP};
  --gold: ${GOLD};
  --ink: #1f2937;
  --muted: #5b6675;
  --faint: #9aa3b2;
  --border: #d9dee7;
  --bg: #f4f6f9;
  --bg-navy: #eef2f8;
  --bg-gold: #f8f1dd;
  font-family: Inter, Arial, system-ui, sans-serif;
  color: var(--ink);
}
.rp-serif { font-family: Georgia, "Times New Roman", serif; }

/* ── Página ── */
.rp-page {
  position: relative;
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  margin: 0 auto 10mm;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  overflow: hidden;
  page-break-after: always;
  break-after: page;
}
.rp-body { padding: 26mm 18mm 22mm; }

/* ── Cabecera / pie corrientes ── */
.rp-runhead {
  position: absolute; top: 0; left: 0; right: 0; height: 22mm;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 18mm;
}
.rp-runhead-img { height: 13mm; width: auto; object-fit: contain; }
.rp-runhead-logo-right .rp-runhead-img { height: 11mm; }
.rp-runhead-section {
  font-size: 8pt; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--navy); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.rp-runhead-rule { display: block; width: 34px; height: 2px; background: var(--gold); }
.rp-runfoot {
  position: absolute; bottom: 0; left: 0; right: 0; height: 14mm;
  display: flex; align-items: center; padding: 0 18mm;
  border-top: 1px solid var(--border); font-size: 7pt; color: var(--faint);
}

/* ── Encabezados de sección ── */
.rp-section-head { margin-bottom: 12px; }
.rp-h2 { font-family: Georgia, serif; font-size: 21pt; color: var(--navy); font-weight: 700; margin: 0; }
.rp-h2-num { color: var(--gold); }
.rp-section-sub { font-size: 9pt; color: var(--muted); margin: 4px 0 6px; }
.rp-section-underline { display: block; width: 54px; height: 3px; background: var(--gold); border-radius: 2px; }
.rp-h3 { font-family: Georgia, serif; font-size: 11.5pt; color: var(--navy); font-weight: 700; margin: 16px 0 10px; }
.rp-p { font-size: 9.5pt; line-height: 1.65; color: #2c3744; margin: 0 0 14px; text-align: justify; }
.rp-p strong { color: var(--navy); }

/* ── KPIs ── */
.rp-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 6px 0 16px; }
.rp-kpi { background: var(--bg); border: 1px solid var(--border); border-top: 3px solid var(--gold); border-radius: 6px; padding: 12px 14px; }
.rp-kpi-num { display: block; font-size: 20pt; font-weight: 800; color: var(--navy); line-height: 1; font-family: Georgia, serif; }
.rp-kpi-label { display: block; font-size: 7pt; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink); margin-top: 6px; }
.rp-kpi-sub { display: block; font-size: 7pt; color: var(--muted); margin-top: 2px; }

/* ── Callouts ── */
.rp-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 4px 0 14px; }
.rp-three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 12px 0; }
.rp-callout { border-radius: 6px; padding: 12px 14px; border-left: 4px solid var(--navy); background: var(--bg-navy); }
.rp-callout-gold { border-left-color: var(--gold); background: var(--bg-gold); }
.rp-callout-navy { border-left-color: var(--navy); background: var(--bg-navy); }
.rp-callout-title { font-size: 8pt; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--navy); margin: 0 0 8px; }
.rp-callout-gold .rp-callout-title { color: #8a6a1f; }
.rp-callout-text { font-size: 8.5pt; line-height: 1.55; color: #2c3744; margin: 0; }
.rp-list { margin: 0; padding: 0; list-style: none; }
.rp-list li { position: relative; font-size: 8.5pt; line-height: 1.45; color: #2c3744; padding: 0 0 6px 14px; }
.rp-list li::before { content: ""; position: absolute; left: 0; top: 5px; width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }

.rp-mini-callout { border-radius: 6px; padding: 10px 12px; border-top: 3px solid var(--navy); background: var(--bg); border: 1px solid var(--border); }
.rp-mini-callout p { margin: 0; font-size: 8pt; line-height: 1.5; color: #2c3744; }
.rp-mc-title { font-size: 7.5pt !important; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--navy) !important; margin-bottom: 6px !important; }
.rp-mc-navy { border-top-color: var(--navy); }
.rp-mc-gold { border-top-color: var(--gold); }
.rp-mc-gold .rp-mc-title { color: #8a6a1f !important; }
.rp-mc-plain { border-top-color: var(--faint); }

.rp-note { border-radius: 6px; padding: 12px 16px; margin: 12px 0; background: var(--bg-navy); border: 1px solid #d4ddea; }
.rp-note-gold { background: var(--bg-gold); border-color: #e8dcb8; }
.rp-note-title { font-size: 8pt; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--navy); margin: 0 0 6px; }
.rp-note-gold .rp-note-title { color: #8a6a1f; }
.rp-note p { font-size: 8.5pt; line-height: 1.55; color: #2c3744; margin: 0; text-align: justify; }

/* ── Prioridades / route / milestones ── */
.rp-prio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
.rp-prio { display: flex; align-items: flex-start; gap: 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; font-size: 8.5pt; color: #2c3744; line-height: 1.4; }
.rp-prio-num { flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%; background: var(--navy); color: #fff; font-size: 8pt; font-weight: 800; display: flex; align-items: center; justify-content: center; }

.rp-route { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.rp-route-step { text-align: center; padding: 0 4px; }
.rp-route-num { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: var(--navy); color: #fff; font-weight: 800; font-size: 9pt; margin-bottom: 6px; }
.rp-route-title { display: block; font-size: 8.5pt; font-weight: 700; color: var(--navy); margin-bottom: 3px; }
.rp-route-desc { display: block; font-size: 7pt; color: var(--muted); line-height: 1.35; }

.rp-milestones { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.rp-milestone { border: 1px solid var(--border); border-top: 3px solid var(--gold); border-radius: 6px; padding: 10px; text-align: center; }
.rp-milestone-day { display: block; font-size: 9pt; font-weight: 800; color: var(--navy); margin-bottom: 5px; }
.rp-milestone-text { display: block; font-size: 7.5pt; color: var(--muted); line-height: 1.35; }

/* ── Barras ── */
.rp-bar-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
.rp-bar-row { display: grid; grid-template-columns: 130px 1fr 40px; align-items: center; gap: 10px; }
.rp-bar-label { font-size: 8.5pt; color: var(--ink); font-weight: 600; }
.rp-bar-track { height: 11px; background: #e7ebf1; border-radius: 6px; overflow: hidden; }
.rp-bar-fill { height: 100%; border-radius: 6px; }
.rp-bar-pct { font-size: 8.5pt; font-weight: 800; text-align: right; }

/* ── Tablas ── */
.rp-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
.rp-table thead th { background: var(--navy); color: #fff; text-align: left; padding: 8px 10px; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.04em; }
.rp-table tbody td { padding: 7px 10px; border-bottom: 1px solid #e7ebf1; color: #2c3744; vertical-align: top; }
.rp-table tbody tr:nth-child(even) { background: #fafbfc; }
.rp-table-spec tbody td { border-bottom: 1px solid #eef1f5; }
.rp-spec-k { width: 38%; font-weight: 700; color: var(--navy); }
.rp-table-var th:not(:first-child), .rp-table-var td:not(:first-child) { text-align: center; }
.rp-var-dim { font-weight: 700; color: var(--navy); }
.rp-area-name, .rp-risk-name, .rp-heat-name { font-weight: 700; color: var(--navy); }
.rp-plan-action { font-weight: 600; color: var(--ink); }
.rp-plan-plazo { white-space: nowrap; font-weight: 700; color: var(--navy); }

.rp-delta { font-weight: 800; font-size: 8pt; }
.rp-delta.up { color: #1f6f43; }
.rp-delta.down { color: ${RED}; }
.rp-delta.same { color: var(--faint); }

.rp-pill { display: inline-block; padding: 2px 9px; border-radius: 10px; border: 1px solid; font-size: 7pt; font-weight: 800; white-space: nowrap; }

/* ── Escala lista ── */
.rp-scale-list { margin: 0; padding: 0; list-style: none; }
.rp-scale-list li { font-size: 8pt; color: #2c3744; padding: 3px 0; display: flex; align-items: center; }
.rp-scale-band { display: inline-block; width: 14px; height: 9px; border-radius: 2px; margin-right: 8px; }

/* ── Resultados generales ── */
.rp-global-card { display: flex; align-items: center; gap: 22px; background: var(--bg-navy); border: 1px solid #d4ddea; border-radius: 8px; padding: 18px 22px; margin-bottom: 16px; }
.rp-global-num { font-family: Georgia, serif; font-size: 40pt; font-weight: 800; color: var(--navy); line-height: 1; flex-shrink: 0; }
.rp-global-level { font-size: 10pt; font-weight: 800; color: var(--navy); margin: 0 0 6px; }
.rp-global-desc { font-size: 8.5pt; line-height: 1.55; color: #2c3744; margin: 0; }

/* ── Análisis por dimensión (cards) ── */
.rp-dim-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.rp-dim-card { border: 1px solid var(--border); border-radius: 6px; padding: 12px 14px; background: #fff; }
.rp-dim-card-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.rp-dim-card-name { font-size: 10pt; font-weight: 800; color: var(--navy); }
.rp-dim-card-pct { font-size: 13pt; font-weight: 800; font-family: Georgia, serif; }
.rp-dim-card-bar { height: 7px; background: #e7ebf1; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
.rp-dim-card-bar > div { height: 100%; border-radius: 4px; }
.rp-dim-card-note { font-size: 7.8pt; line-height: 1.45; color: var(--muted); margin: 0; }

/* ── Histórico ── */
.rp-hist-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px; align-items: start; margin-bottom: 12px; }
.rp-hist-chart { border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; background: #fff; }
.rp-hist-chart-title { font-size: 8pt; font-weight: 700; color: var(--navy); margin: 0 0 6px; }
.rp-hist-side { display: flex; flex-direction: column; gap: 10px; }
.rp-hist-kpi { border: 1px solid var(--border); border-left: 4px solid var(--gold); border-radius: 6px; padding: 10px 12px; background: var(--bg); }
.rp-hist-kpi-num { display: block; font-size: 17pt; font-weight: 800; font-family: Georgia, serif; color: var(--navy); line-height: 1; }
.rp-hist-kpi-sub { display: block; font-size: 7.5pt; color: var(--muted); margin-top: 3px; }
.rp-balance { align-self: stretch; }
.rp-balance-line { font-size: 8.5pt; margin: 2px 0; color: #2c3744; }

/* ── Heatmap ── */
.rp-heatmap { margin-bottom: 10px; }
.rp-heatmap thead th { background: var(--navy); text-align: center; }
.rp-heatmap thead th:first-child { text-align: left; }
.rp-heat-cell { text-align: center; font-weight: 700; color: #2c3744; border-bottom: 2px solid #fff !important; }
.rp-heat-legend { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; font-size: 7.5pt; color: var(--muted); }
.rp-heat-legend span { display: flex; align-items: center; }
.rp-heat-chip { display: inline-block; width: 14px; height: 10px; border-radius: 2px; margin-right: 5px; }

/* ── Riesgo ── */
.rp-risk-row { display: grid; grid-template-columns: 1.1fr 1fr; gap: 14px; margin-bottom: 12px; align-items: start; }
.rp-risk-side { display: flex; flex-direction: column; gap: 10px; }
.rp-risk-quad { position: relative; padding-left: 16px; }
.rp-risk-yaxis { position: absolute; left: -4px; top: 50%; transform: rotate(-90deg) translateX(50%); transform-origin: left; font-size: 7pt; color: var(--muted); white-space: nowrap; }

/* ── Ciclo ── */
.rp-cycle { display: flex; align-items: stretch; gap: 8px; margin-bottom: 12px; }
.rp-cycle-step { flex: 1; border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center; background: var(--bg); }
.rp-cycle-current { border-color: var(--gold); border-width: 2px; background: var(--bg-gold); }
.rp-cycle-label { display: block; font-size: 9.5pt; font-weight: 800; color: var(--navy); }
.rp-cycle-sub { display: block; font-size: 7pt; color: var(--muted); margin: 2px 0 6px; }
.rp-cycle-val { display: block; font-size: 13pt; font-weight: 800; font-family: Georgia, serif; color: var(--navy); }
.rp-cycle-arrow { align-self: center; color: var(--gold); font-size: 14pt; font-weight: 800; }

/* ── Conclusiones ── */
.rp-concl { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.rp-concl-item { display: flex; gap: 12px; align-items: flex-start; border-bottom: 1px solid #eef1f5; padding-bottom: 8px; }
.rp-concl-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: var(--navy); color: #fff; font-weight: 800; font-size: 9pt; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; }
.rp-concl-item p { font-size: 9pt; line-height: 1.5; color: #2c3744; margin: 0; }
.rp-signoff { margin-top: 18px; padding-top: 14px; border-top: 2px solid var(--navy); }
.rp-signoff-label { font-size: 8pt; color: var(--muted); margin: 0 0 4px; }
.rp-signoff-name { font-size: 11pt; font-weight: 800; color: var(--navy); margin: 0; font-family: Georgia, serif; }
.rp-signoff-sub { font-size: 8pt; color: var(--muted); margin: 2px 0 0; }

/* ── TOC ── */
.rp-toc-head { margin-bottom: 14px; }
.rp-toc { display: flex; flex-direction: column; }
.rp-toc-item { display: flex; align-items: center; gap: 14px; padding: 9px 0; border-bottom: 1px solid #eef1f5; }
.rp-toc-num { font-family: Georgia, serif; font-size: 13pt; font-weight: 800; color: var(--gold); width: 26px; flex-shrink: 0; }
.rp-toc-text { flex: 1; display: flex; flex-direction: column; }
.rp-toc-title { font-size: 10pt; font-weight: 700; color: var(--navy); }
.rp-toc-sub { font-size: 7.5pt; color: var(--muted); }
.rp-toc-page { font-size: 9pt; font-weight: 700; color: var(--navy); }

/* ── SVG ── */
.rp-svg { display: block; }

/* ════════════════ PORTADA ════════════════ */
.rp-page-cover {
  background: linear-gradient(160deg, ${NAVY_DEEP} 0%, ${NAVY} 55%, #24507e 100%);
  color: #fff; display: flex; flex-direction: column;
}
.rp-cover-body { padding: 14mm 18mm; display: flex; flex-direction: column; height: 297mm; box-sizing: border-box; }
.rp-cover-top { text-align: center; }
.rp-cover-logo-card { background: #fff; border-radius: 12px; padding: 10px; width: 78px; height: 78px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; }
.rp-cover-logo { max-width: 100%; max-height: 100%; object-fit: contain; }
.rp-cover-org { font-size: 7pt; letter-spacing: 0.22em; color: var(--gold); font-weight: 700; line-height: 1.6; max-width: 360px; margin: 0 auto; }
.rp-cover-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.rp-cover-eyebrow { font-size: 8pt; letter-spacing: 0.24em; color: var(--gold); font-weight: 700; margin-bottom: 18px; }
.rp-cover-title { font-family: Georgia, serif; font-size: 34pt; font-weight: 400; line-height: 1.15; margin: 0; color: #fff; }
.rp-cover-diamond { display: flex; align-items: center; gap: 8px; margin: 16px 0; }
.rp-cover-diamond span:not(.rp-cover-diamond-dot) { width: 40px; height: 1px; background: rgba(212,175,55,0.6); }
.rp-cover-diamond-dot { width: 7px; height: 7px; background: var(--gold); transform: rotate(45deg); }
.rp-cover-tagline { font-size: 9pt; color: rgba(255,255,255,0.78); margin: 0 0 26px; }
.rp-cover-prepared { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 10px; padding: 14px 28px; margin-bottom: 30px; }
.rp-cover-prepared-label { font-size: 7pt; letter-spacing: 0.2em; color: var(--gold); font-weight: 700; margin: 0 0 5px; }
.rp-cover-prepared-name { font-family: Georgia, serif; font-size: 16pt; color: #fff; margin: 0; }
.rp-cover-kpis { display: flex; gap: 14px; width: 100%; justify-content: center; margin-bottom: 30px; }
.rp-cover-kpi { flex: 1; max-width: 150px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.16); border-top: 3px solid var(--gold); border-radius: 8px; padding: 14px 12px; text-align: left; }
.rp-cover-kpi-num { display: block; font-family: Georgia, serif; font-size: 21pt; font-weight: 800; color: #fff; line-height: 1; }
.rp-cover-kpi-label { display: block; font-size: 7pt; letter-spacing: 0.08em; color: var(--gold); font-weight: 800; margin-top: 7px; }
.rp-cover-kpi-sub { display: block; font-size: 6.5pt; color: rgba(255,255,255,0.6); margin-top: 3px; }
.rp-cover-author { display: flex; align-items: center; gap: 14px; justify-content: center; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.16); }
.rp-cover-author-logo { width: 50px; height: 50px; object-fit: contain; background: #fff; border-radius: 10px; padding: 4px; }
.rp-cover-author-text { text-align: left; }
.rp-cover-author-label { font-size: 7pt; letter-spacing: 0.18em; color: var(--gold); font-weight: 700; margin: 0 0 3px; }
.rp-cover-author-name { font-size: 11pt; font-weight: 800; color: #fff; margin: 0; font-family: Georgia, serif; }
.rp-cover-author-sub { font-size: 7.5pt; color: rgba(255,255,255,0.7); margin: 2px 0 0; }
.rp-cover-foot { display: flex; justify-content: space-between; font-size: 7pt; color: rgba(255,255,255,0.55); border-top: 1px solid rgba(255,255,255,0.14); padding-top: 10px; }

/* ── Vista en pantalla (no impresión) ── */
.rp-document.rp-screen { background: #5b6675; padding: 16px 0; }
`;
