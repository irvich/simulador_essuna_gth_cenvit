import React, { useEffect, useState } from "react";
import { scoreLevel, scoreLevelLabel, type DimScore } from "./shared";
import type { ActionRow } from "./types";

function buildRows(scores: DimScore[]): ActionRow[] {
  return [...scores]
    .sort((a, b) => a.pct - b.pct)
    .map(({ dim, pct }) => {
      const level = scoreLevel(pct);
      const priority: ActionRow["priority"] =
        pct < 60 ? "Alta" : pct < 80 ? "Media" : "Baja";
      return {
        dimension: dim.label,
        finding: `${dim.label} obtuvo ${pct}% (${scoreLevelLabel(pct)}).`,
        level: scoreLevelLabel(pct),
        action: dim.actionTemplate.action[level],
        responsible: dim.actionTemplate.responsible,
        deadline: priority === "Alta" ? "30 días" : priority === "Media" ? "90 días" : "180 días",
        indicator: dim.actionTemplate.indicator,
        priority,
        status: "pendiente",
      };
    });
}

const PRIORITY_CLASS: Record<ActionRow["priority"], string> = {
  Alta: "pri-alta",
  Media: "pri-media",
  Baja: "pri-baja",
};

const STATUS_LABELS: Record<ActionRow["status"], string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};

const STATUS_CLASS: Record<ActionRow["status"], string> = {
  pendiente: "status-pendiente",
  en_progreso: "status-en-progreso",
  completada: "status-completada",
};

export function ActionMatrix({
  scores,
  initialRows,
  onSave,
}: {
  scores: DimScore[];
  initialRows?: ActionRow[] | null;
  onSave?: (rows: ActionRow[]) => Promise<void>;
}) {
  const [rows, setRows] = useState<ActionRow[]>(() =>
    initialRows?.length ? initialRows : buildRows(scores)
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(initialRows?.length ? new Date() : null);
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (initialRows?.length) {
      setRows(initialRows);
      setSavedAt(new Date());
      setDirty(false);
    } else {
      setRows(buildRows(scores));
    }
  }, [scores, initialRows]);

  function update(index: number, field: keyof ActionRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    setDirty(true);
    setSaveError("");
  }

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    setSaveError("");
    try {
      await onSave(rows);
      setSavedAt(new Date());
      setDirty(false);
    } catch {
      setSaveError("No se pudo guardar el plan. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const completadas = rows.filter((r) => r.status === "completada").length;
  const enProgreso = rows.filter((r) => r.status === "en_progreso").length;

  return (
    <div className="matrix-section">
      <div className="matrix-head">
        <div>
          <h2>Plan de Acción</h2>
          {onSave && (
            <div className="plan-progress-inline">
              <span className={`status-badge status-completada`}>{completadas} completadas</span>
              <span className={`status-badge status-en-progreso`}>{enProgreso} en progreso</span>
              <span className={`status-badge status-pendiente`}>{rows.length - completadas - enProgreso} pendientes</span>
            </div>
          )}
        </div>
        {onSave && (
          <div className="plan-save-area">
            {savedAt && !dirty && (
              <span className="plan-saved-label">
                ✓ Guardado {savedAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              className={dirty ? "btn-primary" : "btn-secondary"}
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "9px 18px", fontSize: "0.85rem" }}
            >
              {saving ? "Guardando…" : dirty ? "Guardar cambios" : "Guardar plan"}
            </button>
          </div>
        )}
      </div>
      <p className="matrix-sub">
        Matriz técnica de mejora ordenada por prioridad.
        Los campos son <strong>editables</strong>: ajusta responsables, plazos e indicadores.
        {onSave && " Actualiza el estado de cada acción conforme avanza la implementación."}
      </p>
      {saveError && <p className="admin-error" style={{ marginBottom: 12 }}>{saveError}</p>}

      <div className="matrix-scroll">
        <table className="matrix">
          <thead>
            <tr>
              <th>Dimensión</th>
              <th>Hallazgo</th>
              <th>Acción de mejora</th>
              <th>Responsable</th>
              <th>Plazo</th>
              <th>Indicador de seguimiento</th>
              <th>Prioridad</th>
              {onSave && <th>Estado</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.dimension}>
                <td className="dim-cell">{row.dimension}</td>
                <td style={{ minWidth: 150 }}>
                  <textarea
                    className="matrix-textarea"
                    value={row.finding}
                    onChange={(e) => update(i, "finding", e.target.value)}
                  />
                </td>
                <td style={{ minWidth: 200 }}>
                  <textarea
                    className="matrix-textarea"
                    value={row.action}
                    onChange={(e) => update(i, "action", e.target.value)}
                  />
                </td>
                <td style={{ minWidth: 130 }}>
                  <input
                    className="matrix-input"
                    value={row.responsible}
                    onChange={(e) => update(i, "responsible", e.target.value)}
                  />
                </td>
                <td style={{ minWidth: 90 }}>
                  <input
                    className="matrix-input"
                    value={row.deadline}
                    onChange={(e) => update(i, "deadline", e.target.value)}
                  />
                </td>
                <td style={{ minWidth: 170 }}>
                  <textarea
                    className="matrix-textarea"
                    value={row.indicator}
                    onChange={(e) => update(i, "indicator", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="matrix-select"
                    value={row.priority}
                    onChange={(e) => update(i, "priority", e.target.value)}
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                  <div style={{ marginTop: 6 }}>
                    <span className={`pri-badge ${PRIORITY_CLASS[row.priority]}`}>{row.priority}</span>
                  </div>
                </td>
                {onSave && (
                  <td style={{ minWidth: 120 }}>
                    <select
                      className="matrix-select"
                      value={row.status}
                      onChange={(e) => update(i, "status", e.target.value)}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En progreso</option>
                      <option value="completada">Completada</option>
                    </select>
                    <div style={{ marginTop: 6 }}>
                      <span className={`status-badge ${STATUS_CLASS[row.status]}`}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
