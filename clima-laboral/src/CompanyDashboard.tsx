import React, { useEffect, useState } from "react";
import { computePeriodSummary, HistoricalComparison, type PeriodSummary } from "./HistoricalComparison";
import { PeriodDashboard } from "./PeriodDashboard";
import { DIMENSIONS } from "./questions";
import {
  closePeriod,
  createPeriod,
  getPlanAccion,
  getPeriodsForCompany,
  getResponsesForPeriod,
  saveDepartamentos,
  savePlanAccion,
  updateEmpresaPassword,
} from "./storage";
import type { ActionRow, Empresa, Periodo, SurveyResponse } from "./types";

function loadMetas(empresaId: string): Partial<Record<string, number>> {
  try { return JSON.parse(localStorage.getItem(`metas_${empresaId}`) || "{}"); } catch { return {}; }
}
function persistMetas(empresaId: string, metas: Partial<Record<string, number>>): void {
  localStorage.setItem(`metas_${empresaId}`, JSON.stringify(metas));
}

function suggestLabel(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() < 6 ? "S1" : "S2"}`;
}

function surveyUrl(periodoId: string, empresaId: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}?periodo=${periodoId}&empresa=${empresaId}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function PlanBadge({ plan }: { plan: ActionRow[] }) {
  const completadas = plan.filter((r) => r.status === "completada").length;
  const enProgreso = plan.filter((r) => r.status === "en_progreso").length;
  const total = plan.length;
  const pct = total === 0 ? 0 : Math.round((completadas / total) * 100);
  const pctProgress = total === 0 ? 0 : Math.round(((completadas + enProgreso * 0.5) / total) * 100);
  const color = pct === 100 ? "#22c55e" : pct >= 50 ? "#d4af37" : "#94a3b8";
  const altasIncompletas = plan.filter((r) => r.priority === "alta" && r.status !== "completada").length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 120 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color, whiteSpace: "nowrap" }}>
          {completadas}/{total} completadas
        </span>
        {altasIncompletas > 0 && (
          <span style={{ fontSize: "0.67rem", fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: "rgba(248,113,113,0.15)", color: "#fca5a5", border: "1px solid rgba(248,113,113,0.3)", whiteSpace: "nowrap" }}>
            {altasIncompletas} alta
          </span>
        )}
      </div>
      <div style={{ width: 110, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${pctProgress}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

export function CompanyDashboard({
  empresa,
  onLogout,
}: {
  empresa: Empresa;
  onLogout: () => void;
}) {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newLabel, setNewLabel] = useState(suggestLabel());
  const [newTotal, setNewTotal] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [viewingPeriodo, setViewingPeriodo] = useState<Periodo | null>(null);
  const [viewingResponses, setViewingResponses] = useState<SurveyResponse[]>([]);
  const [viewingPlan, setViewingPlan] = useState<ActionRow[] | null>(null);
  const [viewingPrevResponses, setViewingPrevResponses] = useState<SurveyResponse[]>([]);
  const [viewingPrevLabel, setViewingPrevLabel] = useState("");
  const [viewingLoading, setViewingLoading] = useState(false);

  const [activeResponses, setActiveResponses] = useState<SurveyResponse[]>([]);
  const [activeLoading, setActiveLoading] = useState(false);

  const [copyOk, setCopyOk] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

  const [showPwChange, setShowPwChange] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [pwChanging, setPwChanging] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwOk, setPwOk] = useState(false);

  const [showDeptManager, setShowDeptManager] = useState(false);
  const [deptManagerList, setDeptManagerList] = useState<string[]>([]);
  const [deptManagerInput, setDeptManagerInput] = useState("");
  const [deptManagerSaving, setDeptManagerSaving] = useState(false);
  const [deptManagerError, setDeptManagerError] = useState("");
  const [deptManagerOk, setDeptManagerOk] = useState(false);

  const [showMetas, setShowMetas] = useState(false);
  const [dimTargets, setDimTargets] = useState<Partial<Record<string, number>>>({});
  const [metasDraft, setMetasDraft] = useState<Record<string, string>>({});

  const [showComparison, setShowComparison] = useState(false);
  const [comparisonSummaries, setComparisonSummaries] = useState<PeriodSummary[]>([]);
  const [comparisonPlans, setComparisonPlans] = useState<Map<string, ActionRow[]>>(new Map());
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Cache loaded plans keyed by periodoId to avoid re-fetching
  const [planCache, setPlanCache] = useState<Map<string, ActionRow[] | null>>(new Map());

  const activePeriodo = periodos.find((p) => p.estado === "activo") ?? null;
  const closedPeriodos = periodos.filter((p) => p.estado === "cerrado");

  async function loadPeriodos() {
    setLoading(true);
    setError("");
    try {
      setPeriodos(await getPeriodsForCompany(empresa.id));
    } catch {
      setError("No se pudieron cargar los períodos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPeriodos(); }, [empresa.id]);

  useEffect(() => {
    setDimTargets(loadMetas(empresa.id));
  }, [empresa.id]);

  useEffect(() => {
    if (!activePeriodo) { setActiveResponses([]); return; }
    setActiveLoading(true);
    getResponsesForPeriod(activePeriodo.id)
      .then(setActiveResponses)
      .catch(() => {})
      .finally(() => setActiveLoading(false));
  }, [activePeriodo?.id]);

  // Pre-fetch plans for closed periods in the background to show badges
  useEffect(() => {
    if (closedPeriodos.length === 0) return;
    closedPeriodos.forEach((p) => {
      if (planCache.has(p.id)) return;
      getPlanAccion(p.id)
        .then((plan) => setPlanCache((prev) => new Map(prev).set(p.id, plan)))
        .catch(() => setPlanCache((prev) => new Map(prev).set(p.id, null)));
    });
  }, [periodos]);

  async function handleCreate() {
    if (!newLabel.trim()) { setCreateError("Ingresa una etiqueta para el período."); return; }
    const total = parseInt(newTotal, 10);
    setCreating(true);
    setCreateError("");
    try {
      await createPeriod(empresa.id, newLabel.trim(), isNaN(total) ? undefined : total);
      setShowCreate(false);
      setNewLabel(suggestLabel());
      setNewTotal("");
      await loadPeriodos();
    } catch {
      setCreateError("No se pudo crear el período. Intenta de nuevo.");
    } finally {
      setCreating(false);
    }
  }

  async function handleClose(periodoId: string) {
    if (!confirm("¿Cerrar este período? Ya no se registrarán nuevas respuestas.")) return;
    setClosingId(periodoId);
    try {
      await closePeriod(periodoId);
      await loadPeriodos();
    } catch {
      setError("No se pudo cerrar el período.");
    } finally {
      setClosingId(null);
    }
  }

  async function handleView(periodo: Periodo) {
    setViewingLoading(true);
    try {
      // Find the immediately preceding closed period (by creation date)
      const allSorted = [...periodos].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const idx = allSorted.findIndex((p) => p.id === periodo.id);
      const prevPeriodo = idx > 0 ? allSorted[idx - 1] : null;

      const [responses, plan, prevResps] = await Promise.all([
        getResponsesForPeriod(periodo.id),
        planCache.has(periodo.id) ? Promise.resolve(planCache.get(periodo.id) ?? null) : getPlanAccion(periodo.id),
        prevPeriodo ? getResponsesForPeriod(prevPeriodo.id) : Promise.resolve([]),
      ]);
      setViewingResponses(responses);
      setViewingPlan(plan);
      setViewingPrevResponses(prevResps);
      setViewingPrevLabel(prevPeriodo?.etiqueta ?? "");
      setViewingPeriodo(periodo);
      if (!planCache.has(periodo.id)) {
        setPlanCache((prev) => new Map(prev).set(periodo.id, plan));
      }
    } catch {
      setError("No se pudieron cargar los resultados.");
    } finally {
      setViewingLoading(false);
    }
  }

  async function handleSavePlan(rows: ActionRow[]) {
    if (!viewingPeriodo) return;
    await savePlanAccion(viewingPeriodo.id, rows);
    setPlanCache((prev) => new Map(prev).set(viewingPeriodo.id, rows));
    setViewingPlan(rows);
  }

  function openDeptManager(periodo: typeof activePeriodo) {
    if (!periodo) return;
    setDeptManagerList(periodo.departamentos ?? []);
    setDeptManagerInput("");
    setDeptManagerError("");
    setDeptManagerOk(false);
    setShowDeptManager(true);
  }

  async function saveDeptManager() {
    if (!activePeriodo) return;
    setDeptManagerSaving(true);
    setDeptManagerError("");
    try {
      await saveDepartamentos(activePeriodo.id, deptManagerList);
      setDeptManagerOk(true);
      await loadPeriodos();
      setTimeout(() => { setShowDeptManager(false); setDeptManagerOk(false); }, 1200);
    } catch {
      setDeptManagerError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setDeptManagerSaving(false);
    }
  }

  function openMetas() {
    const loaded = loadMetas(empresa.id);
    setMetasDraft(
      Object.fromEntries(DIMENSIONS.map((d) => [d.key, loaded[d.key] != null ? String(loaded[d.key]) : ""]))
    );
    setShowMetas(true);
  }

  function handleSaveMetas() {
    const metas: Partial<Record<string, number>> = {};
    for (const [k, v] of Object.entries(metasDraft)) {
      const n = parseInt(v, 10);
      if (!isNaN(n) && n >= 0 && n <= 100) metas[k] = n;
    }
    persistMetas(empresa.id, metas);
    setDimTargets(metas);
    setShowMetas(false);
  }

  async function loadComparison() {
    setComparisonLoading(true);
    try {
      const results = await Promise.all(
        closedPeriodos.map(async (p) => {
          const [responses, plan] = await Promise.all([
            getResponsesForPeriod(p.id),
            planCache.has(p.id) ? Promise.resolve(planCache.get(p.id) ?? null) : getPlanAccion(p.id),
          ]);
          if (plan && !planCache.has(p.id)) {
            setPlanCache((prev) => new Map(prev).set(p.id, plan));
          }
          return { summary: computePeriodSummary(p, responses), plan, periodoId: p.id };
        })
      );
      setComparisonSummaries(results.map((r) => r.summary));
      const plans = new Map<string, ActionRow[]>();
      results.forEach(({ periodoId, plan }) => {
        if (plan) plans.set(periodoId, plan);
      });
      setComparisonPlans(plans);
      setShowComparison(true);
    } catch {
      setError("No se pudo cargar la comparación histórica.");
    } finally {
      setComparisonLoading(false);
    }
  }

  async function handlePwChange() {
    if (newPw.length < 6) { setPwError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (newPw !== newPwConfirm) { setPwError("Las contraseñas no coinciden."); return; }
    setPwChanging(true);
    setPwError("");
    try {
      await updateEmpresaPassword(empresa.id, newPw);
      setPwOk(true);
      setNewPw("");
      setNewPwConfirm("");
      setShowPwChange(false);
      setTimeout(() => setPwOk(false), 4000);
    } catch {
      setPwError("No se pudo actualizar la contraseña. Intenta de nuevo.");
    } finally {
      setPwChanging(false);
    }
  }

  async function shareUrl(url: string, empresaNombre: string) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Encuesta de Clima Laboral",
          text: `Completa la encuesta de clima laboral de ${empresaNombre}. Es confidencial y solo toma unos minutos.`,
          url,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(url).then(() => {
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 2500);
    });
  }

  if (viewingPeriodo) {
    return (
      <PeriodDashboard
        responses={viewingResponses}
        periodoLabel={viewingPeriodo.etiqueta}
        empresaNombre={empresa.nombre}
        totalColaboradores={viewingPeriodo.total_colaboradores}
        targets={dimTargets}
        prevResponses={viewingPrevResponses.length > 0 ? viewingPrevResponses : undefined}
        prevLabel={viewingPrevLabel || undefined}
        savedPlan={viewingPlan}
        onSavePlan={handleSavePlan}
        onBack={() => setViewingPeriodo(null)}
      />
    );
  }

  return (
    <div className="company-dash">
      <div className="company-dash-header">
        <div>
          <p className="eyebrow gold">Panel de Empresa</p>
          <h1 className="company-name">{empresa.nombre}</h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {pwOk && <span style={{ fontSize: "0.78rem", color: "#22c55e", fontWeight: 700 }}>✓ Contraseña actualizada</span>}
          <button
            className="admin-link"
            onClick={() => { setShowPwChange((v) => !v); setPwError(""); }}
          >
            Cambiar contraseña
          </button>
          <button className="btn-secondary" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </div>

      {showPwChange && (
        <div className="create-period-form" style={{ marginBottom: 20 }}>
          <label>Nueva contraseña (mínimo 6 caracteres)</label>
          <div className="create-period-form-row" style={{ flexWrap: "wrap" }}>
            <input
              className="org-input"
              type="password"
              placeholder="Nueva contraseña"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              style={{ flex: 1, minWidth: 160 }}
            />
            <input
              className="org-input"
              type="password"
              placeholder="Confirmar contraseña"
              value={newPwConfirm}
              onChange={(e) => setNewPwConfirm(e.target.value)}
              style={{ flex: 1, minWidth: 160 }}
            />
            <button className="btn-primary" onClick={handlePwChange} disabled={pwChanging}>
              {pwChanging ? "Guardando…" : "Actualizar"}
            </button>
            <button className="btn-secondary" onClick={() => { setShowPwChange(false); setPwError(""); }}>
              Cancelar
            </button>
          </div>
          {pwError && <p className="admin-error" style={{ marginTop: 8 }}>{pwError}</p>}
        </div>
      )}

      {error && <p className="admin-error" style={{ marginBottom: 16 }}>{error}</p>}

      {loading && (
        <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>Cargando…</p>
      )}

      {!loading && (
        <>
          {/* ── Active period ──────────────────────────────────── */}
          {activePeriodo ? (
            <div className="active-period-card">
              <h3>⚡ Período activo</h3>
              <div className="period-label-big">{activePeriodo.etiqueta}</div>
              <p className="period-meta">Iniciado el {fmtDate(activePeriodo.created_at)}</p>

              <div className="period-stats-row">
                <div className="period-stat">
                  <div className="period-stat-num">
                    {activeLoading ? "…" : activeResponses.length}
                  </div>
                  <div className="period-stat-label">Respuestas recibidas</div>
                </div>
                {activePeriodo.total_colaboradores && (
                  <div className="period-stat">
                    <div className="period-stat-num" style={{ color: (() => {
                      const pct = Math.round((activeResponses.length / activePeriodo.total_colaboradores!) * 100);
                      return pct >= 70 ? "#22c55e" : pct >= 40 ? "#d4af37" : "#f87171";
                    })() }}>
                      {activeLoading ? "…" : `${Math.round((activeResponses.length / activePeriodo.total_colaboradores) * 100)}%`}
                    </div>
                    <div className="period-stat-label">Tasa de respuesta</div>
                  </div>
                )}
                {activePeriodo.total_colaboradores && (
                  <div className="period-stat">
                    <div className="period-stat-num" style={{ color: "var(--muted)", fontSize: "1.4rem" }}>
                      {activePeriodo.total_colaboradores}
                    </div>
                    <div className="period-stat-label">Colaboradores esperados</div>
                  </div>
                )}
              </div>

              <div className="survey-link-box">
                <div className="survey-link-label">
                  Enlace para empleados — cópialo y compártelo:
                </div>
                <div className="survey-link-row">
                  <span className="survey-link-url">
                    {surveyUrl(activePeriodo.id, empresa.id)}
                  </span>
                  <button
                    className="btn-primary"
                    style={{ padding: "6px 14px", fontSize: "0.8rem", flexShrink: 0 }}
                    onClick={() => shareUrl(surveyUrl(activePeriodo.id, empresa.id), empresa.nombre)}
                  >
                    {copyOk ? "¡Copiado!" : "Compartir"}
                  </button>
                </div>
              </div>

              {showDeptManager && (
                <div className="create-period-form" style={{ marginBottom: 20 }}>
                  <label style={{ fontWeight: 700, marginBottom: 8, display: "block" }}>
                    Departamentos disponibles en la encuesta
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {deptManagerList.length === 0 && (
                      <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                        Sin departamentos definidos — se usará la lista por defecto.
                      </span>
                    )}
                    {deptManagerList.map((d, i) => (
                      <span key={i} className="dept-tag">
                        {d}
                        <button
                          onClick={() => setDeptManagerList((prev) => prev.filter((_, j) => j !== i))}
                          title="Eliminar"
                        >×</button>
                      </span>
                    ))}
                  </div>
                  <div className="create-period-form-row" style={{ flexWrap: "wrap" }}>
                    <input
                      className="org-input"
                      value={deptManagerInput}
                      onChange={(e) => setDeptManagerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && deptManagerInput.trim()) {
                          setDeptManagerList((prev) => [...prev, deptManagerInput.trim()]);
                          setDeptManagerInput("");
                        }
                      }}
                      placeholder="Nombre del departamento…"
                      style={{ flex: 1, minWidth: 200 }}
                    />
                    <button
                      className="btn-secondary"
                      disabled={!deptManagerInput.trim()}
                      onClick={() => {
                        if (deptManagerInput.trim()) {
                          setDeptManagerList((prev) => [...prev, deptManagerInput.trim()]);
                          setDeptManagerInput("");
                        }
                      }}
                    >+ Agregar</button>
                    <button className="btn-primary" onClick={saveDeptManager} disabled={deptManagerSaving}>
                      {deptManagerSaving ? "Guardando…" : deptManagerOk ? "¡Guardado!" : "Guardar"}
                    </button>
                    <button className="btn-secondary" onClick={() => setShowDeptManager(false)}>Cancelar</button>
                  </div>
                  {deptManagerError && <p className="admin-error" style={{ marginTop: 8 }}>{deptManagerError}</p>}
                  <p style={{ color: "var(--muted)", fontSize: "0.75rem", marginTop: 8 }}>
                    Los empleados verán estos departamentos al abrir la encuesta. Presiona Enter o "+ Agregar" para añadir uno.
                  </p>
                </div>
              )}

              {showMetas && (
                <div className="create-period-form" style={{ marginBottom: 20 }}>
                  <label style={{ fontWeight: 700, marginBottom: 8, display: "block" }}>
                    Metas por dimensión (0–100%)
                  </label>
                  <p style={{ color: "var(--muted)", fontSize: "0.76rem", marginBottom: 14, lineHeight: 1.55 }}>
                    Define el porcentaje objetivo para cada dimensión. El dashboard mostrará el gap entre el resultado actual y la meta con una línea punteada dorada.
                  </p>
                  <div className="metas-grid">
                    {DIMENSIONS.map((dim) => (
                      <div key={dim.key} className="meta-row">
                        <span className="meta-dim-name" style={{ color: dim.color }}>{dim.shortLabel}</span>
                        <input
                          className="org-input"
                          type="number"
                          min="0"
                          max="100"
                          value={metasDraft[dim.key] ?? ""}
                          onChange={(e) => setMetasDraft((prev) => ({ ...prev, [dim.key]: e.target.value }))}
                          placeholder="Sin meta"
                          style={{ width: 80, textAlign: "center", padding: "8px 10px" }}
                        />
                        <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>%</span>
                      </div>
                    ))}
                  </div>
                  <div className="create-period-form-row" style={{ marginTop: 14, flexWrap: "wrap" }}>
                    <button className="btn-primary" onClick={handleSaveMetas}>Guardar metas</button>
                    <button className="btn-secondary" onClick={() => setShowMetas(false)}>Cancelar</button>
                    {Object.keys(dimTargets).length > 0 && (
                      <button
                        className="btn-secondary"
                        style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.35)" }}
                        onClick={() => { persistMetas(empresa.id, {}); setDimTargets({}); setShowMetas(false); }}
                      >
                        Eliminar todas
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="active-period-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleView(activePeriodo)}
                  disabled={viewingLoading}
                >
                  {viewingLoading ? "Cargando…" : "Ver resultados en tiempo real"}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => openDeptManager(activePeriodo)}
                  style={{ fontSize: "0.82rem" }}
                >
                  🏢 Departamentos
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => { setShowDeptManager(false); openMetas(); }}
                  style={{ fontSize: "0.82rem" }}
                >
                  🎯 Metas
                  {Object.keys(dimTargets).length > 0 && (
                    <span style={{ marginLeft: 6, background: "rgba(212,175,55,0.25)", color: "#d4af37", borderRadius: 999, padding: "1px 7px", fontSize: "0.7rem", fontWeight: 800 }}>
                      {Object.keys(dimTargets).length}
                    </span>
                  )}
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleClose(activePeriodo.id)}
                  disabled={closingId === activePeriodo.id}
                  style={{ padding: "11px 18px" }}
                >
                  {closingId === activePeriodo.id ? "Cerrando…" : "Cerrar período"}
                </button>
              </div>
            </div>
          ) : (
            <div className="no-active-period">
              <p>No hay ningún período de medición activo.</p>
              {!showCreate ? (
                <button className="btn-primary" onClick={() => setShowCreate(true)}>
                  + Iniciar nueva medición
                </button>
              ) : (
                <div className="create-period-form">
                  <label>Etiqueta del período (ej: 2026-S1, Primer semestre 2026)</label>
                  <div className="create-period-form-row" style={{ flexWrap: "wrap" }}>
                    <input
                      className="org-input"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="ej: 2026-S1"
                      style={{ flex: 2, minWidth: 140 }}
                    />
                    <input
                      className="org-input"
                      type="number"
                      min="1"
                      value={newTotal}
                      onChange={(e) => setNewTotal(e.target.value)}
                      placeholder="Nº colaboradores (opcional)"
                      style={{ flex: 1, minWidth: 140 }}
                    />
                    <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                      {creating ? "Creando…" : "Crear"}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => { setShowCreate(false); setCreateError(""); setNewTotal(""); }}
                    >
                      Cancelar
                    </button>
                  </div>
                  {createError && <p className="admin-error" style={{ marginTop: 8 }}>{createError}</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Historical periods ─────────────────────────────── */}
          {closedPeriodos.length > 0 && (
            <div className="period-history">
              <h3>Historial de mediciones</h3>
              <div className="matrix-scroll">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Inicio</th>
                      <th>Cierre</th>
                      <th>Plan de mejora</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedPeriodos.map((p) => {
                      const plan = planCache.get(p.id);
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700 }}>{p.etiqueta}</td>
                          <td>{fmtDate(p.created_at)}</td>
                          <td>{p.cerrado_at ? fmtDate(p.cerrado_at) : "—"}</td>
                          <td>
                            {plan ? <PlanBadge plan={plan} /> : (
                              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Sin guardar</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn-secondary"
                              style={{ padding: "5px 14px", fontSize: "0.8rem" }}
                              onClick={() => handleView(p)}
                            >
                              Ver / editar plan
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {closedPeriodos.length === 0 && !activePeriodo && (
            <p className="period-history-empty">
              El historial de mediciones anteriores aparecerá aquí.
            </p>
          )}

          {closedPeriodos.length >= 2 && (
            <div className="comparison-trigger">
              {!showComparison ? (
                <button
                  className="btn-primary"
                  onClick={loadComparison}
                  disabled={comparisonLoading}
                  style={{ marginTop: 4 }}
                >
                  {comparisonLoading ? "Cargando comparación…" : "Ver comparación histórica"}
                </button>
              ) : (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowComparison(false)}
                    style={{ marginBottom: 4 }}
                  >
                    Ocultar comparación
                  </button>
                  <HistoricalComparison summaries={comparisonSummaries} plans={comparisonPlans} />
                </>
              )}
            </div>
          )}

          <p style={{ color: "var(--muted)", fontSize: "0.82rem", textAlign: "center", marginTop: 32 }}>
            Realiza la medición de clima laboral cada 6 meses para hacer seguimiento a la evolución de tu organización.
          </p>
        </>
      )}
    </div>
  );
}
