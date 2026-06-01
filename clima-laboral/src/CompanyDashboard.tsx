import React, { useEffect, useState } from "react";
import { computePeriodSummary, HistoricalComparison, type PeriodSummary } from "./HistoricalComparison";
import { PeriodDashboard } from "./PeriodDashboard";
import {
  closePeriod,
  createPeriod,
  getPlanAccion,
  getPeriodsForCompany,
  getResponsesForPeriod,
  savePlanAccion,
  updateEmpresaPassword,
} from "./storage";
import type { ActionRow, Empresa, Periodo, SurveyResponse } from "./types";

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
  const total = plan.length;
  const pct = Math.round((completadas / total) * 100);
  const color = pct === 100 ? "#22c55e" : pct >= 50 ? "#d4af37" : "#94a3b8";
  return (
    <span style={{ fontSize: "0.75rem", fontWeight: 700, color, whiteSpace: "nowrap" }}>
      Plan: {completadas}/{total} ✓
    </span>
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
      const [responses, plan] = await Promise.all([
        getResponsesForPeriod(periodo.id),
        planCache.has(periodo.id) ? Promise.resolve(planCache.get(periodo.id) ?? null) : getPlanAccion(periodo.id),
      ]);
      setViewingResponses(responses);
      setViewingPlan(plan);
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

              <div className="active-period-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleView(activePeriodo)}
                  disabled={viewingLoading}
                >
                  {viewingLoading ? "Cargando…" : "Ver resultados en tiempo real"}
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
