import React, { useEffect, useState } from "react";
import { scoreLevel, scoreLevelLabel, type DimScore } from "./shared";
import type { ActionRow } from "./types";

function buildRows(scores: DimScore[]): ActionRow[] {
  // Ordenar de menor a mayor puntaje: lo más crítico primero.
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
      };
    });
}

const PRIORITY_CLASS: Record<ActionRow["priority"], string> = {
  Alta: "pri-alta",
  Media: "pri-media",
  Baja: "pri-baja",
};

export function ActionMatrix({ scores }: { scores: DimScore[] }) {
  const [rows, setRows] = useState<ActionRow[]>(() => buildRows(scores));

  // Reconstruir cuando cambian los puntajes (p. ej. en el panel admin al recargar).
  useEffect(() => {
    setRows(buildRows(scores));
  }, [scores]);

  function update(index: number, field: keyof ActionRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  return (
    <div className="matrix-section">
      <div className="matrix-head">
        <div>
          <h2>Plan de Acción</h2>
        </div>
      </div>
      <p className="matrix-sub">
        Matriz técnica de mejora ordenada por prioridad (de lo más crítico a lo más sólido).
        Los campos son <strong>editables</strong>: ajusta responsables, plazos e indicadores según
        tu organización antes de exportar el informe a PDF.
      </p>

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
