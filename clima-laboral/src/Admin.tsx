import React, { useEffect, useMemo, useState } from "react";
import { ADMIN_PASSWORD } from "./config";
import { DIMENSIONS, QUESTIONS } from "./questions";
import {
  RadarChart,
  ScoreBar,
  scoreLevelColor,
  scoreLevelLabel,
  type DimScore,
} from "./shared";
import { ActionMatrix } from "./ActionMatrix";
import { clearLocalResponses, getAllResponses, storageMode } from "./storage";
import type { SurveyResponse } from "./types";

function dimensionAverage(responses: SurveyResponse[], dimKey: string): number {
  const dimQ = QUESTIONS.filter((q) => q.dimension === dimKey).map((q) => q.id);
  let sum = 0;
  let count = 0;
  for (const r of responses) {
    for (const qid of dimQ) {
      const v = r.answers[qid];
      if (v !== undefined) {
        sum += v;
        count += 1;
      }
    }
  }
  if (count === 0) return 0;
  return Math.round((sum / count / 5) * 100);
}

function globalAverage(responses: SurveyResponse[]): number {
  let sum = 0;
  let count = 0;
  for (const r of responses) {
    for (const q of QUESTIONS) {
      const v = r.answers[q.id];
      if (v !== undefined) {
        sum += v;
        count += 1;
      }
    }
  }
  if (count === 0) return 0;
  return Math.round((sum / count / 5) * 100);
}

export function Admin({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllResponses();
      setResponses(data);
    } catch (e) {
      setError("No se pudieron cargar las respuestas. Revisa la configuración de Supabase.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  function tryLogin() {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("Contraseña incorrecta.");
    }
  }

  const scores: DimScore[] = useMemo(
    () => DIMENSIONS.map((dim) => ({ dim, pct: dimensionAverage(responses, dim.key) })),
    [responses]
  );

  const globalPct = useMemo(() => globalAverage(responses), [responses]);

  const departments = useMemo(() => {
    const map = new Map<string, SurveyResponse[]>();
    for (const r of responses) {
      const key = r.department || "Sin especificar";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries())
      .map(([name, list]) => ({ name, count: list.length, pct: globalAverage(list) }))
      .sort((a, b) => b.count - a.count);
  }, [responses]);

  const strongest = useMemo(
    () => [...scores].sort((a, b) => b.pct - a.pct)[0],
    [scores]
  );
  const weakest = useMemo(
    () => [...scores].sort((a, b) => a.pct - b.pct)[0],
    [scores]
  );

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="admin-login">
        <h1>Panel Administrativo</h1>
        <p>Acceso restringido. Ingresa la contraseña para ver los resultados consolidados de la organización.</p>
        <input
          className="org-input"
          type="password"
          placeholder="Contraseña"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && tryLogin()}
        />
        {error && <p className="admin-error">{error}</p>}
        <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={tryLogin}>Ingresar</button>
          <button className="btn-secondary" onClick={onExit}>Volver</button>
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!loading && responses.length === 0) {
    return (
      <div className="results-wrap">
        <div className="results-header">
          <p className="eyebrow gold">Panel Administrativo</p>
          <h1 className="results-title">Resultados de la Organización</h1>
          <p className="results-meta">
            Modo de datos:{" "}
            <span className={`mode-pill ${storageMode === "supabase" ? "mode-supabase" : "mode-local"}`}>
              {storageMode === "supabase" ? "Supabase (en línea)" : "Local (este dispositivo)"}
            </span>
          </p>
        </div>
        <div className="empty-state">
          <div className="big">📭</div>
          <p>Aún no hay respuestas registradas.</p>
          <p style={{ marginTop: 8 }}>Comparte el enlace de la encuesta con tu equipo para empezar a recolectar datos.</p>
          <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn-secondary" onClick={load}>Actualizar</button>
            <button className="btn-secondary" onClick={onExit}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="results-wrap">
      <div className="results-header">
        <p className="eyebrow gold">Panel Administrativo</p>
        <h1 className="results-title">Resultados de la Organización</h1>
        <p className="results-meta">
          Modo de datos:{" "}
          <span className={`mode-pill ${storageMode === "supabase" ? "mode-supabase" : "mode-local"}`}>
            {storageMode === "supabase" ? "Supabase (en línea)" : "Local (este dispositivo)"}
          </span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="admin-statbar">
        <div className="stat-card">
          <div className="stat-num" style={{ color: "#38bdf8" }}>{responses.length}</div>
          <div className="stat-label">Respuestas</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: scoreLevelColor(globalPct) }}>{globalPct}%</div>
          <div className="stat-label">Índice global</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: strongest?.dim.color, fontSize: "1.05rem", paddingTop: 6 }}>
            {strongest?.dim.shortLabel}
          </div>
          <div className="stat-label">Más fuerte ({strongest?.pct}%)</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: weakest?.dim.color, fontSize: "1.05rem", paddingTop: 6 }}>
            {weakest?.dim.shortLabel}
          </div>
          <div className="stat-label">Más débil ({weakest?.pct}%)</div>
        </div>
      </div>

      {/* Global index bar */}
      <div className="global-card">
        <p className="global-label">Índice Global de Clima Laboral · {responses.length} participante(s)</p>
        <div className="global-score" style={{ color: scoreLevelColor(globalPct) }}>{globalPct}%</div>
        <div
          className="level-badge"
          style={{
            background: scoreLevelColor(globalPct) + "22",
            borderColor: scoreLevelColor(globalPct) + "55",
            color: scoreLevelColor(globalPct),
          }}
        >
          {scoreLevelLabel(globalPct)}
        </div>
        <div className="global-bar-track">
          <div className="global-bar-fill" style={{ width: `${globalPct}%`, background: scoreLevelColor(globalPct) }} />
        </div>
        <div className="global-legend">
          <span style={{ color: "#f87171" }}>0–59% Crítico</span>
          <span style={{ color: "#d4af37" }}>60–79% Regular</span>
          <span style={{ color: "#22c55e" }}>80–100% Bueno</span>
        </div>
      </div>

      {/* Radar + breakdown */}
      <div className="chart-grid">
        <div className="radar-card">
          <h2>Perfil por Dimensión (promedio)</h2>
          <div className="radar-wrap"><RadarChart scores={scores} /></div>
        </div>
        <div className="breakdown-card">
          <h2>Promedio por Dimensión</h2>
          <div className="breakdown-list">
            {scores.map(({ dim, pct }) => (
              <div key={dim.key} className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-name" style={{ color: dim.color }}>{dim.label}</span>
                  <span className="breakdown-pct" style={{ color: scoreLevelColor(pct) }}>
                    {pct}% — {scoreLevelLabel(pct)}
                  </span>
                </div>
                <ScoreBar pct={pct} color={dim.color} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department breakdown */}
      <div className="breakdown-card">
        <h2>Resultados por Departamento</h2>
        <div className="matrix-scroll">
          <table className="dept-table">
            <thead>
              <tr>
                <th>Departamento</th>
                <th>Participantes</th>
                <th>Índice global</th>
                <th>Nivel</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.name}>
                  <td style={{ fontWeight: 700 }}>{d.name}</td>
                  <td>{d.count}</td>
                  <td style={{ color: scoreLevelColor(d.pct), fontWeight: 700 }}>{d.pct}%</td>
                  <td>{scoreLevelLabel(d.pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action matrix */}
      <ActionMatrix scores={scores} />

      {/* Actions */}
      <div className="results-actions no-print">
        <button className="btn-export" onClick={() => window.print()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Exportar informe PDF
        </button>
        <button className="btn-secondary" onClick={load}>Actualizar datos</button>
        <button className="btn-secondary" onClick={onExit}>Volver al inicio</button>
        {storageMode === "local" && (
          <button
            className="btn-danger"
            onClick={() => {
              if (confirm("¿Borrar todas las respuestas guardadas en este dispositivo? Esta acción no se puede deshacer.")) {
                clearLocalResponses();
                load();
              }
            }}
          >
            Borrar datos locales
          </button>
        )}
      </div>
    </div>
  );
}
