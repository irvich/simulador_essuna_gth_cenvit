export type DimensionKey =
  | "liderazgo"
  | "comunicacion"
  | "trabajo_en_equipo"
  | "motivacion";

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

export interface DimensionConfig {
  key: DimensionKey;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  colorSoft: string;
  recommendation: Recommendation;
}

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export type Answers = Record<number, LikertValue>;
