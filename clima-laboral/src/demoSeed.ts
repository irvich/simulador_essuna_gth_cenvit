// ──────────────────────────────────────────────────────────────────────────────
// DATOS DE DEMOSTRACIÓN (FICTICIOS)
// Crea una empresa de ejemplo con respuestas simuladas repartidas en departamentos
// navales verosímiles y en 2 períodos semestrales, para mostrar el tablero y la
// comparación histórica. Todos los datos son inventados; no corresponden a personas
// ni organizaciones reales.
// ──────────────────────────────────────────────────────────────────────────────
import { DIMENSIONS, QUESTIONS } from "./questions";
import {
  closePeriod,
  createEmpresa,
  createPeriod,
  getAllEmpresas,
  saveDepartamentos,
  submitResponse,
} from "./storage";
import type { Answers, LikertValue } from "./types";

const EMPRESA_NOMBRE = "Base Naval Norte (DATOS FICTICIOS)";
const EMPRESA_USUARIO = "base-naval";
const EMPRESA_PASSWORD = "demo";

const DEPARTAMENTOS = [
  "Comando",
  "Operaciones",
  "Logística",
  "Sanidad Naval",
  "Comunicaciones",
  "Armamento",
  "Inteligencia",
  "Administración",
  "Mantenimiento",
];

// Media base (escala 1–5) por dimensión para el período anterior (2025-II).
const BASE_MEAN: Record<string, number> = {
  liderazgo: 3.4,
  comunicacion: 3.0,
  reconocimiento: 2.8,
  motivacion: 3.3,
  trabajo_en_equipo: 3.8,
  condiciones_seguridad: 4.0,
  desarrollo_crecimiento: 2.7,
  equidad: 3.1,
  cultura: 3.6,
  bienestar: 3.0,
};

// Mejora aplicada en el período actual (2026-I) para que se vea tendencia positiva.
const DELTA_2026: Record<string, number> = {
  liderazgo: 0.3,
  comunicacion: 0.4,
  reconocimiento: 0.5,
  motivacion: 0.2,
  trabajo_en_equipo: 0.1,
  condiciones_seguridad: 0.1,
  desarrollo_crecimiento: 0.5,
  equidad: 0.3,
  cultura: 0.2,
  bienestar: 0.4,
};

const COMENTARIOS = [
  "Se nota mejor comunicación con el mando este semestre.",
  "Falta reconocimiento al personal con más años de servicio.",
  "Las condiciones de seguridad son el punto más fuerte.",
  "Deberían abrir más oportunidades de capacitación y ascenso.",
  "El trabajo en equipo dentro del departamento es excelente.",
  "La carga de trabajo en Operaciones es muy alta.",
  "Agradezco las mejoras recientes en bienestar.",
  "Hace falta más equidad en la asignación de turnos.",
];

// RNG con semilla fija → datos reproducibles entre cargas.
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function clampLikert(x: number): LikertValue {
  return Math.max(1, Math.min(5, Math.round(x))) as LikertValue;
}

// Pregunta por dimensión (precomputado una vez).
const QUESTIONS_BY_DIM: Record<string, number[]> = (() => {
  const map: Record<string, number[]> = {};
  for (const d of DIMENSIONS) map[d.key] = QUESTIONS.filter((q) => q.dimension === d.key).map((q) => q.id);
  return map;
})();

function buildAnswers(rng: () => number, periodDelta: Record<string, number>, deptOffset: number): Answers {
  const gauss = () => {
    const u = Math.max(rng(), 1e-6), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const answers: Answers = {};
  for (const dim of DIMENSIONS) {
    const mean = (BASE_MEAN[dim.key] ?? 3.2) + (periodDelta[dim.key] ?? 0) + deptOffset;
    for (const qid of QUESTIONS_BY_DIM[dim.key]) {
      answers[qid] = clampLikert(mean + gauss() * 0.8);
    }
  }
  return answers;
}

async function seedPeriodo(
  empresaId: string,
  etiqueta: string,
  totalColaboradores: number,
  n: number,
  delta: Record<string, number>,
  rng: () => number,
  cerrar: boolean
): Promise<void> {
  const periodo = await createPeriod(empresaId, etiqueta, totalColaboradores);
  await saveDepartamentos(periodo.id, DEPARTAMENTOS);
  for (let i = 0; i < n; i++) {
    const dept = DEPARTAMENTOS[Math.floor(rng() * DEPARTAMENTOS.length)];
    // Offset estable por departamento (-0.3 .. +0.3)
    const deptIdx = DEPARTAMENTOS.indexOf(dept);
    const deptOffset = ((deptIdx % 7) - 3) * 0.1;
    const answers = buildAnswers(rng, delta, deptOffset);
    const comment = rng() < 0.22 ? COMENTARIOS[Math.floor(rng() * COMENTARIOS.length)] : undefined;
    await submitResponse(dept, answers, periodo.id, empresaId, comment);
  }
  if (cerrar) await closePeriod(periodo.id);
}

export async function seedBaseNavalDemo(): Promise<{ ok: boolean; message: string }> {
  const existentes = await getAllEmpresas();
  if (existentes.some((e) => e.nombre === EMPRESA_NOMBRE)) {
    return {
      ok: true,
      message: `Los datos de demostración ya estaban cargados. Ingresa como empresa con «${EMPRESA_USUARIO}» / «${EMPRESA_PASSWORD}».`,
    };
  }

  const empresa = await createEmpresa(EMPRESA_NOMBRE, EMPRESA_USUARIO, EMPRESA_PASSWORD);
  const rng = makeRng(20260115);

  // Período anterior (cerrado) y período actual (activo) → habilita comparación histórica.
  await seedPeriodo(empresa.id, "2025-II", 95, 38, {}, rng, true);
  await seedPeriodo(empresa.id, "2026-I", 95, 42, DELTA_2026, rng, false);

  return {
    ok: true,
    message: `✓ Datos cargados: «${EMPRESA_NOMBRE}» con 80 respuestas en 2 períodos. Ingresa como empresa con usuario «${EMPRESA_USUARIO}» / contraseña «${EMPRESA_PASSWORD}» para ver el tablero y la comparación.`,
  };
}
