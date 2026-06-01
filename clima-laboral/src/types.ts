export type DimensionKey =
  | "liderazgo"
  | "comunicacion"
  | "trabajo_en_equipo"
  | "motivacion"
  | "condiciones_seguridad"
  | "desarrollo_crecimiento";

export interface Question {
  id: number;
  dimension: DimensionKey;
  text: string;
}

export interface Recommendation {
  low: string;
  medium: string;
  high: string;
}

/** Acciones sugeridas para la matriz del plan de acción (por dimensión). */
export interface ActionTemplate {
  /** Acción concreta de mejora sugerida segun el nivel. */
  action: { low: string; medium: string; high: string };
  /** Indicador o KPI para dar seguimiento. */
  indicator: string;
  /** Responsable típico de la acción. */
  responsible: string;
}

export interface DimensionConfig {
  key: DimensionKey;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  colorSoft: string;
  recommendation: Recommendation;
  actionTemplate: ActionTemplate;
}

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export type Answers = Record<number, LikertValue>;

/** Una respuesta enviada por un participante de la organización. */
export interface SurveyResponse {
  id: string;
  createdAt: string;
  department: string;
  answers: Answers;
  comment?: string;
}

/** Fila editable de la matriz del plan de acción. */
export interface ActionRow {
  dimension: string;
  finding: string;
  level: string;
  action: string;
  responsible: string;
  deadline: string;
  indicator: string;
  priority: "Alta" | "Media" | "Baja";
  status: "pendiente" | "en_progreso" | "completada";
}

export interface Empresa {
  id: string;
  nombre: string;
  usuario: string;
  created_at?: string;
}

export interface Periodo {
  id: string;
  empresa_id: string;
  etiqueta: string;
  estado: "activo" | "cerrado";
  created_at: string;
  cerrado_at: string | null;
  total_colaboradores?: number | null;
  departamentos?: string[] | null;
}
