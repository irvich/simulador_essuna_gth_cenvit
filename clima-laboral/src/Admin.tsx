import React, { useEffect, useState } from "react";
import { ADMIN_PASSWORD, IS_SUPABASE_ENABLED } from "./config";
import { PeriodDashboard } from "./PeriodDashboard";
import {
  clearLocalResponses,
  createEmpresa,
  getAllEmpresas,
  getAllResponses,
  getPlanAccion,
  getPeriodsForCompany,
  getResponsesForPeriod,
  savePlanAccion,
  updateEmpresaPassword,
} from "./storage";
import type { ActionRow, Empresa, Periodo, SurveyResponse } from "./types";

type AdminView = "companies" | "periods" | "results";

export function Admin({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [loginError, setLoginError] = useState("");

  // Demo mode (no Supabase)
  const [demoResponses, setDemoResponses] = useState<SurveyResponse[]>([]);
  const [demoLoading, setDemoLoading] = useState(false);

  // Supabase mode state
  const [adminView, setAdminView] = useState<AdminView>("companies");
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [empresaPeriodos, setEmpresaPeriodos] = useState<Periodo[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [periodoResponses, setPeriodoResponses] = useState<SurveyResponse[]>([]);
  const [periodoPlan, setPeriodoPlan] = useState<ActionRow[] | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  // Reset password (admin)
  const [resetingId, setResetingId] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetOkId, setResetOkId] = useState<string | null>(null);

  // Create empresa form
  const [showForm, setShowForm] = useState(false);
  const [fNombre, setFNombre] = useState("");
  const [fUsuario, setFUsuario] = useState("");
  const [fPassword, setFPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  function tryLogin() {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setLoginError(""); }
    else setLoginError("Contraseña incorrecta.");
  }

  useEffect(() => {
    if (!authed) return;
    if (IS_SUPABASE_ENABLED) {
      loadEmpresas();
    } else {
      loadDemo();
    }
  }, [authed]);

  async function loadDemo() {
    setDemoLoading(true);
    try { setDemoResponses(await getAllResponses()); }
    catch { /* ignore */ }
    finally { setDemoLoading(false); }
  }

  async function loadEmpresas() {
    setDataLoading(true);
    setDataError("");
    try { setEmpresas(await getAllEmpresas()); }
    catch { setDataError("No se pudieron cargar las empresas. Verifica la configuración de Supabase."); }
    finally { setDataLoading(false); }
  }

  async function handleSelectEmpresa(emp: Empresa) {
    setSelectedEmpresa(emp);
    setAdminView("periods");
    setDataLoading(true);
    setDataError("");
    try { setEmpresaPeriodos(await getPeriodsForCompany(emp.id)); }
    catch { setDataError("No se pudieron cargar los períodos."); }
    finally { setDataLoading(false); }
  }

  async function handleSelectPeriodo(p: Periodo) {
    setSelectedPeriodo(p);
    setAdminView("results");
    setDataLoading(true);
    setDataError("");
    try {
      const [responses, plan] = await Promise.all([
        getResponsesForPeriod(p.id),
        getPlanAccion(p.id),
      ]);
      setPeriodoResponses(responses);
      setPeriodoPlan(plan);
    } catch { setDataError("No se pudieron cargar las respuestas."); }
    finally { setDataLoading(false); }
  }

  async function handleResetPassword(empId: string) {
    if (!resetPw || resetPw.length < 6) { setResetError("Mínimo 6 caracteres."); return; }
    setResetError("");
    try {
      await updateEmpresaPassword(empId, resetPw);
      setResetingId(null);
      setResetPw("");
      setResetOkId(empId);
      setTimeout(() => setResetOkId(null), 3000);
    } catch {
      setResetError("No se pudo actualizar la contraseña.");
    }
  }

  async function handleCreateEmpresa() {
    if (!fNombre.trim() || !fUsuario.trim() || !fPassword.trim()) {
      setFormError("Completa todos los campos.");
      return;
    }
    setCreating(true);
    setFormError("");
    try {
      await createEmpresa(fNombre.trim(), fUsuario.trim(), fPassword.trim());
      setFNombre(""); setFUsuario(""); setFPassword("");
      setShowForm(false);
      await loadEmpresas();
    } catch {
      setFormError("No se pudo crear la empresa. El usuario puede estar en uso.");
    } finally {
      setCreating(false);
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="admin-login">
        <h1>Panel Administrativo</h1>
        <p>Acceso para consultores CENVIT. Ingresa la contraseña para continuar.</p>
        <input
          className="org-input"
          type="password"
          placeholder="Contraseña"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && tryLogin()}
        />
        {loginError && <p className="admin-error">{loginError}</p>}
        <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={tryLogin}>Ingresar</button>
          <button className="btn-secondary" onClick={onExit}>Volver</button>
        </div>
      </div>
    );
  }

  // ── Demo mode ─────────────────────────────────────────────────────────────
  if (!IS_SUPABASE_ENABLED) {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <button className="btn-secondary" onClick={onExit}>← Volver al inicio</button>
        </div>
        <div className="results-header">
          <p className="eyebrow gold">Panel Administrativo · Modo Demo</p>
          <h1 className="results-title">Resultados (localStorage)</h1>
          <p className="results-meta">Los datos solo existen en este navegador. Configura Supabase para modo multi-empresa.</p>
        </div>
        {demoLoading ? (
          <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>Cargando…</p>
        ) : (
          <PeriodDashboard responses={demoResponses} periodoLabel="Demo" />
        )}
        <div className="results-actions no-print" style={{ marginTop: 20 }}>
          <button className="btn-secondary" onClick={loadDemo}>Actualizar datos</button>
          <button className="btn-secondary" onClick={onExit}>Volver al inicio</button>
          <button
            className="btn-danger"
            onClick={() => {
              if (confirm("¿Borrar todas las respuestas guardadas en este navegador?")) {
                clearLocalResponses();
                loadDemo();
              }
            }}
          >
            Borrar datos locales
          </button>
        </div>
      </div>
    );
  }

  // ── Period results ────────────────────────────────────────────────────────
  if (adminView === "results" && selectedPeriodo && selectedEmpresa) {
    if (dataLoading) {
      return (
        <p style={{ color: "var(--muted)", textAlign: "center", padding: 60 }}>Cargando resultados…</p>
      );
    }
    return (
      <PeriodDashboard
        responses={periodoResponses}
        periodoLabel={selectedPeriodo.etiqueta}
        empresaNombre={selectedEmpresa.nombre}
        totalColaboradores={selectedPeriodo.total_colaboradores}
        savedPlan={periodoPlan}
        onSavePlan={async (rows) => {
          await savePlanAccion(selectedPeriodo.id, rows);
          setPeriodoPlan(rows);
        }}
        onBack={() => { setAdminView("periods"); setSelectedPeriodo(null); setPeriodoPlan(null); }}
      />
    );
  }

  // ── Company periods ───────────────────────────────────────────────────────
  if (adminView === "periods" && selectedEmpresa) {
    return (
      <div className="results-wrap">
        <button
          className="btn-secondary no-print"
          onClick={() => { setAdminView("companies"); setSelectedEmpresa(null); setEmpresaPeriodos([]); }}
          style={{ marginBottom: 20 }}
        >
          ← Todas las empresas
        </button>

        <div className="results-header">
          <p className="eyebrow gold">Panel Administrativo</p>
          <h1 className="results-title">{selectedEmpresa.nombre}</h1>
          <p className="results-meta">Usuario: @{selectedEmpresa.usuario}</p>
        </div>

        {dataError && <p className="admin-error">{dataError}</p>}
        {dataLoading && <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>Cargando períodos…</p>}

        {!dataLoading && empresaPeriodos.length === 0 && (
          <div className="empty-state">
            <div className="big">📭</div>
            <p>Esta empresa aún no tiene períodos de medición.</p>
          </div>
        )}

        {!dataLoading && empresaPeriodos.length > 0 && (
          <div className="breakdown-card">
            <h2>Períodos de medición</h2>
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
                  {empresaPeriodos.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{p.etiqueta}</td>
                      <td>{new Date(p.created_at).toLocaleDateString("es-ES")}</td>
                      <td>{p.cerrado_at ? new Date(p.cerrado_at).toLocaleDateString("es-ES") : "—"}</td>
                      <td>
                        <span className={`estado-badge ${p.estado === "activo" ? "estado-activo" : "estado-cerrado"}`}>
                          {p.estado === "activo" ? "Activo" : "Cerrado"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: "5px 14px", fontSize: "0.8rem" }}
                          onClick={() => handleSelectPeriodo(p)}
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

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button className="btn-secondary" onClick={onExit}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  // ── Companies list ────────────────────────────────────────────────────────
  return (
    <div className="results-wrap">
      <div className="results-header">
        <p className="eyebrow gold">Panel Administrativo</p>
        <h1 className="results-title">Gestión de Empresas</h1>
      </div>

      {dataError && <p className="admin-error">{dataError}</p>}

      {/* Create form */}
      {showForm && (
        <div className="create-empresa-form">
          <h3>Nueva empresa</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre de la empresa</label>
              <input
                className="org-input"
                value={fNombre}
                onChange={(e) => setFNombre(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="form-field">
              <label>Usuario (para login)</label>
              <input
                className="org-input"
                value={fUsuario}
                onChange={(e) => setFUsuario(e.target.value)}
                placeholder="acme"
                autoCapitalize="none"
              />
            </div>
          </div>
          <div className="form-field" style={{ marginBottom: 14 }}>
            <label>Contraseña</label>
            <input
              className="org-input"
              type="password"
              value={fPassword}
              onChange={(e) => setFPassword(e.target.value)}
              placeholder="Contraseña segura"
            />
          </div>
          {formError && <p className="admin-error">{formError}</p>}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="btn-primary" onClick={handleCreateEmpresa} disabled={creating}>
              {creating ? "Creando…" : "Crear empresa"}
            </button>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setFormError(""); }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <div style={{ marginBottom: 20 }}>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Agregar empresa</button>
        </div>
      )}

      {dataLoading && (
        <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>Cargando empresas…</p>
      )}

      {!dataLoading && empresas.length === 0 && (
        <div className="empty-state">
          <div className="big">🏢</div>
          <p>Aún no hay empresas registradas.</p>
          <p style={{ marginTop: 8 }}>Agrega la primera empresa con el botón de arriba.</p>
        </div>
      )}

      {!dataLoading && (
        <div className="empresa-list">
          {empresas.map((emp) => (
            <div key={emp.id} className="empresa-card" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div className="empresa-name">{emp.nombre}</div>
                  <div className="empresa-usuario">@{emp.usuario}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {resetOkId === emp.id && <span style={{ fontSize: "0.76rem", color: "#22c55e", fontWeight: 700 }}>✓ Contraseña actualizada</span>}
                  <button
                    className="admin-link"
                    onClick={() => { setResetingId(resetingId === emp.id ? null : emp.id); setResetPw(""); setResetError(""); }}
                    style={{ fontSize: "0.76rem" }}
                  >
                    {resetingId === emp.id ? "Cancelar" : "Restablecer contraseña"}
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: "7px 18px", fontSize: "0.85rem" }}
                    onClick={() => handleSelectEmpresa(emp)}
                  >
                    Ver períodos →
                  </button>
                </div>
              </div>
              {resetingId === emp.id && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    className="org-input"
                    type="password"
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                    value={resetPw}
                    onChange={(e) => { setResetPw(e.target.value); setResetError(""); }}
                    style={{ flex: 1, minWidth: 200, padding: "8px 12px", fontSize: "0.88rem" }}
                  />
                  <button className="btn-primary" onClick={() => handleResetPassword(emp.id)} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                    Guardar
                  </button>
                  {resetError && <span className="admin-error" style={{ fontSize: "0.78rem" }}>{resetError}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
        <button className="btn-secondary" onClick={loadEmpresas}>Actualizar</button>
        <button className="btn-secondary" onClick={onExit}>Volver al inicio</button>
      </div>
    </div>
  );
}
