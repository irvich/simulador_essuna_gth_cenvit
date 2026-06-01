import React, { useEffect, useState } from "react";
import { PeriodDashboard } from "./PeriodDashboard";
import {
  closePeriod,
  createPeriod,
  getPeriodsForCompany,
  getResponsesForPeriod,
} from "./storage";
import type { Empresa, Periodo, SurveyResponse } from "./types";

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
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [viewingPeriodo, setViewingPeriodo] = useState<Periodo | null>(null);
  const [viewingResponses, setViewingResponses] = useState<SurveyResponse[]>([]);
  const [viewingLoading, setViewingLoading] = useState(false);

  const [activeResponses, setActiveResponses] = useState<SurveyResponse[]>([]);
  const [activeLoading, setActiveLoading] = useState(false);

  const [copyOk, setCopyOk] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

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

  async function handleCreate() {
    if (!newLabel.trim()) { setCreateError("Ingresa una etiqueta para el período."); return; }
    setCreating(true);
    setCreateError("");
    try {
      await createPeriod(empresa.id, newLabel.trim());
      setShowCreate(false);
      setNewLabel(suggestLabel());
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
      setViewingResponses(await getResponsesForPeriod(periodo.id));
      setViewingPeriodo(periodo);
    } catch {
      setError("No se pudieron cargar los resultados.");
    } finally {
      setViewingLoading(false);
    }
  }

  function copyUrl(url: string) {
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
        <button className="btn-secondary" onClick={onLogout}>Cerrar sesión</button>
      </div>

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
                    onClick={() => copyUrl(surveyUrl(activePeriodo.id, empresa.id))}
                  >
                    {copyOk ? "¡Copiado!" : "Copiar"}
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
                  <div className="create-period-form-row">
                    <input
                      className="org-input"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="ej: 2026-S1"
                      style={{ flex: 1 }}
                    />
                    <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                      {creating ? "Creando…" : "Crear"}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => { setShowCreate(false); setCreateError(""); }}
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
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedPeriodos.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700 }}>{p.etiqueta}</td>
                        <td>{fmtDate(p.created_at)}</td>
                        <td>{p.cerrado_at ? fmtDate(p.cerrado_at) : "—"}</td>
                        <td>
                          <span className="estado-badge estado-cerrado">Cerrado</span>
                        </td>
                        <td>
                          <button
                            className="btn-secondary"
                            style={{ padding: "5px 14px", fontSize: "0.8rem" }}
                            onClick={() => handleView(p)}
                          >
                            Ver resultados
                          </button>
                        </td>
                      </tr>
                    ))}
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

          <p style={{ color: "var(--muted)", fontSize: "0.82rem", textAlign: "center", marginTop: 32 }}>
            Realiza la medición de clima laboral cada 6 meses para hacer seguimiento a la evolución de tu organización.
          </p>
        </>
      )}
    </div>
  );
}
