import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReportDocument } from "../src/ReportDocument";
import { QUESTIONS } from "../src/questions";
import type { SurveyResponse, LikertValue } from "../src/types";

// Seeded sample data (mirrors demo.tsx, simplified)
let _s = 123456789;
function rng() { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; }
function gauss(m: number, sd: number) { const u = Math.max(rng(), 1e-6), v = rng(); return m + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function cl(x: number): LikertValue { return Math.max(1, Math.min(5, Math.round(x))) as LikertValue; }

const DIM_BASE: Record<string, number> = {
  liderazgo: 3.6, comunicacion: 3.2, reconocimiento: 2.9, motivacion: 3.9, trabajo_en_equipo: 4.1,
  condiciones_seguridad: 3.7, desarrollo_crecimiento: 3.3, equidad: 3.05, cultura: 4.0, bienestar: 3.45,
};
const DEPTS = [
  { name: "Gerencia", bias: 0.65, n: 8 }, { name: "Administración", bias: 0.35, n: 16 },
  { name: "Talento Humano", bias: 0.28, n: 10 }, { name: "Financiero", bias: 0.12, n: 14 },
  { name: "Comercial", bias: -0.18, n: 20 }, { name: "Operaciones", bias: -0.38, n: 22 },
  { name: "Logística", bias: -0.55, n: 13 },
];
const COMMENTS = [
  "La información no siempre llega a tiempo a todas las áreas.",
  "El equipo es excelente y hay mucho compañerismo.",
  "Falta mayor reconocimiento del esfuerzo diario.",
];
function make(bias: number, withC: boolean): SurveyResponse[] {
  const out: SurveyResponse[] = []; let id = 0;
  for (const d of DEPTS) for (let i = 0; i < d.n; i++) {
    const answers: Record<number, LikertValue> = {};
    for (const q of QUESTIONS) answers[q.id] = cl(gauss((DIM_BASE[q.dimension] ?? 3.2) + d.bias + bias, 0.9));
    out.push({ id: `r${id++}`, createdAt: new Date().toISOString(), department: d.name, answers, comment: withC && rng() < 0.3 ? COMMENTS[Math.floor(rng() * COMMENTS.length)] : undefined });
  }
  return out;
}

const cur = make(0, true);
const prev = make(-0.11, false);
const dir = process.cwd();
const html = renderToStaticMarkup(
  React.createElement(ReportDocument, {
    empresaNombre: "Empresa Demostración S.A.",
    periodoLabel: "2026 · I Semestre",
    prevLabel: "2025 · II Semestre",
    totalColaboradores: 120,
    responses: cur,
    prevResponses: prev,
    benchmark: {},
    sectorLabel: "General (Latinoamérica)",
    plan: null,
    history: [
      { label: "2024-I", pct: 62 }, { label: "2024-II", pct: 65 }, { label: "2025-I", pct: 66 },
      { label: "2025-II", pct: 68 }, { label: "2026-I", pct: 70 },
    ],
    logoCenvit: `file://${dir}/public/logo-cenvit.png`,
    logoIvan: `file://${dir}/public/logo-ivan-viteri.jpg`,
  })
);

process.stdout.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:0}body{margin:0}</style></head><body>${html}</body></html>`);
