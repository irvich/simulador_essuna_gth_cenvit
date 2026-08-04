import { IS_SUPABASE_ENABLED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { ActionRow, Answers, Empresa, Periodo, SurveyResponse } from "./types";

export const storageMode: "supabase" | "local" = IS_SUPABASE_ENABLED ? "supabase" : "local";

// ── Helpers ───────────────────────────────────────────────────────────────────

function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function nowIso(): string {
  return new Date().toISOString();
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sbFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...((opts.headers as Record<string, string>) ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase ${res.status}: ${body}`);
  }
  return res;
}

async function sbRpc(fn: string, params: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`RPC ${fn} failed: ${await res.text()}`);
  return res.json();
}

// ── Backend local (localStorage) ───────────────────────────────────────────────
// Se usa automáticamente cuando NO hay credenciales de Supabase. Permite operar la
// aplicación completa (empresas, períodos, respuestas y plan de acción) sin backend,
// guardando todo en el navegador. Ideal para probar el flujo o para uso mono-equipo.
// Limitación: los datos viven solo en ESTE navegador; no se comparten entre dispositivos.

const LK = {
  empresas: "cl_local_empresas",
  periodos: "cl_local_periodos",
  respuestas: "cl_local_respuestas",
};

interface LocalEmpresa extends Empresa {
  password_hash: string;
}
interface LocalPeriodo extends Periodo {
  plan_accion?: ActionRow[] | null;
}
interface LocalRespuesta {
  id: string;
  periodo_id: string;
  empresa_id: string;
  department: string;
  answers: Answers;
  comment?: string;
  createdAt: string;
}

function lread<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}
function lwrite<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Crea una empresa de ejemplo la primera vez, para poder ingresar de inmediato. */
async function ensureLocalSeed(): Promise<void> {
  const emps = lread<LocalEmpresa>(LK.empresas);
  if (emps.length > 0) return;
  const hash = await sha256("demo");
  lwrite<LocalEmpresa>(LK.empresas, [
    {
      id: uuid(),
      nombre: "Empresa Demo",
      usuario: "demo",
      password_hash: hash,
      created_at: nowIso(),
    },
  ]);
}

function stripHash(e: LocalEmpresa): Empresa {
  const { password_hash, ...rest } = e;
  void password_hash;
  return rest;
}

// ── Company auth ──────────────────────────────────────────────────────────────

export async function loginEmpresa(usuario: string, password: string): Promise<Empresa | null> {
  if (!IS_SUPABASE_ENABLED) {
    await ensureLocalSeed();
    const hash = await sha256(password);
    const found = lread<LocalEmpresa>(LK.empresas).find(
      (e) => e.usuario === usuario && e.password_hash === hash
    );
    return found ? stripHash(found) : null;
  }
  const data = (await sbRpc("login_empresa", { p_usuario: usuario, p_password: password })) as Empresa[];
  return data?.length > 0 ? data[0] : null;
}

// ── Company management (admin) ────────────────────────────────────────────────

export async function getAllEmpresas(): Promise<Empresa[]> {
  if (!IS_SUPABASE_ENABLED) {
    await ensureLocalSeed();
    return lread<LocalEmpresa>(LK.empresas)
      .map(stripHash)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  const res = await sbFetch("/empresas?select=id,nombre,usuario,created_at&order=nombre.asc");
  return res.json();
}

export async function getEmpresaById(empresaId: string): Promise<Empresa | null> {
  if (!IS_SUPABASE_ENABLED) {
    const found = lread<LocalEmpresa>(LK.empresas).find((e) => e.id === empresaId);
    return found ? stripHash(found) : null;
  }
  const res = await sbFetch(`/empresas?id=eq.${empresaId}&select=id,nombre,usuario,created_at`);
  const data = (await res.json()) as Empresa[];
  return data.length > 0 ? data[0] : null;
}

export async function updateEmpresaPassword(empresaId: string, newPassword: string): Promise<void> {
  const password_hash = await sha256(newPassword);
  if (!IS_SUPABASE_ENABLED) {
    const emps = lread<LocalEmpresa>(LK.empresas);
    const idx = emps.findIndex((e) => e.id === empresaId);
    if (idx >= 0) {
      emps[idx].password_hash = password_hash;
      lwrite(LK.empresas, emps);
    }
    return;
  }
  await sbFetch(`/empresas?id=eq.${empresaId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ password_hash }),
  });
}

export async function createEmpresa(nombre: string, usuario: string, password: string): Promise<Empresa> {
  const password_hash = await sha256(password);
  if (!IS_SUPABASE_ENABLED) {
    const emps = lread<LocalEmpresa>(LK.empresas);
    if (emps.some((e) => e.usuario === usuario)) {
      throw new Error("Ya existe una empresa con ese usuario.");
    }
    const nueva: LocalEmpresa = { id: uuid(), nombre, usuario, password_hash, created_at: nowIso() };
    lwrite(LK.empresas, [...emps, nueva]);
    return stripHash(nueva);
  }
  const res = await sbFetch("/empresas", {
    method: "POST",
    body: JSON.stringify({ nombre, usuario, password_hash }),
  });
  const data = (await res.json()) as Empresa[];
  return data[0];
}

// ── Periods ───────────────────────────────────────────────────────────────────

export async function getPeriodsForCompany(empresaId: string): Promise<Periodo[]> {
  if (!IS_SUPABASE_ENABLED) {
    return lread<LocalPeriodo>(LK.periodos)
      .filter((p) => p.empresa_id === empresaId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
  const res = await sbFetch(`/periodos?empresa_id=eq.${empresaId}&order=created_at.desc`);
  return res.json();
}

export async function getPeriodById(periodoId: string): Promise<Periodo | null> {
  if (!IS_SUPABASE_ENABLED) {
    return lread<LocalPeriodo>(LK.periodos).find((p) => p.id === periodoId) ?? null;
  }
  const res = await sbFetch(`/periodos?id=eq.${periodoId}`);
  const data = (await res.json()) as Periodo[];
  return data.length > 0 ? data[0] : null;
}

export async function createPeriod(empresaId: string, etiqueta: string, totalColaboradores?: number): Promise<Periodo> {
  if (!IS_SUPABASE_ENABLED) {
    const nuevo: LocalPeriodo = {
      id: uuid(),
      empresa_id: empresaId,
      etiqueta,
      estado: "activo",
      created_at: nowIso(),
      cerrado_at: null,
      total_colaboradores: totalColaboradores && totalColaboradores > 0 ? totalColaboradores : null,
      departamentos: null,
      plan_accion: null,
    };
    lwrite(LK.periodos, [...lread<LocalPeriodo>(LK.periodos), nuevo]);
    return nuevo;
  }
  const body: Record<string, unknown> = { empresa_id: empresaId, etiqueta, estado: "activo" };
  if (totalColaboradores && totalColaboradores > 0) body.total_colaboradores = totalColaboradores;
  const res = await sbFetch("/periodos", { method: "POST", body: JSON.stringify(body) });
  const data = (await res.json()) as Periodo[];
  return data[0];
}

function localPatchPeriodo(periodoId: string, patch: Partial<LocalPeriodo>): void {
  const periodos = lread<LocalPeriodo>(LK.periodos);
  const idx = periodos.findIndex((p) => p.id === periodoId);
  if (idx >= 0) {
    periodos[idx] = { ...periodos[idx], ...patch };
    lwrite(LK.periodos, periodos);
  }
}

export async function saveDepartamentos(periodoId: string, departamentos: string[]): Promise<void> {
  if (!IS_SUPABASE_ENABLED) {
    localPatchPeriodo(periodoId, { departamentos });
    return;
  }
  await sbFetch(`/periodos?id=eq.${periodoId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ departamentos }),
  });
}

export async function closePeriod(periodoId: string): Promise<void> {
  if (!IS_SUPABASE_ENABLED) {
    localPatchPeriodo(periodoId, { estado: "cerrado", cerrado_at: nowIso() });
    return;
  }
  await sbFetch(`/periodos?id=eq.${periodoId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ estado: "cerrado", cerrado_at: nowIso() }),
  });
}

// ── Plan de acción (persistido en periodos.plan_accion) ───────────────────────

export async function savePlanAccion(periodoId: string, plan: ActionRow[]): Promise<void> {
  if (!IS_SUPABASE_ENABLED) {
    localPatchPeriodo(periodoId, { plan_accion: plan });
    return;
  }
  await sbFetch(`/periodos?id=eq.${periodoId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ plan_accion: plan }),
  });
}

export async function getPlanAccion(periodoId: string): Promise<ActionRow[] | null> {
  if (!IS_SUPABASE_ENABLED) {
    return lread<LocalPeriodo>(LK.periodos).find((p) => p.id === periodoId)?.plan_accion ?? null;
  }
  const res = await sbFetch(`/periodos?id=eq.${periodoId}&select=plan_accion`);
  const data = (await res.json()) as Array<{ plan_accion: ActionRow[] | null }>;
  return data[0]?.plan_accion ?? null;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export async function getResponsesForPeriod(periodoId: string): Promise<SurveyResponse[]> {
  if (!IS_SUPABASE_ENABLED) {
    return lread<LocalRespuesta>(LK.respuestas)
      .filter((r) => r.periodo_id === periodoId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        department: r.department,
        answers: r.answers,
        comment: r.comment,
      }));
  }
  const res = await sbFetch(`/respuestas?periodo_id=eq.${periodoId}&order=created_at.desc`);
  const rows = (await res.json()) as Array<{
    id: string;
    created_at: string;
    departamento: string;
    respuestas: Answers;
    comentario?: string | null;
  }>;
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    department: r.departamento,
    answers: r.respuestas,
    comment: r.comentario ?? undefined,
  }));
}

export async function submitResponse(
  department: string,
  answers: Answers,
  periodoId?: string,
  empresaId?: string,
  comment?: string
): Promise<void> {
  if (IS_SUPABASE_ENABLED && periodoId && empresaId) {
    const body: Record<string, unknown> = {
      periodo_id: periodoId,
      empresa_id: empresaId,
      departamento: department,
      respuestas: answers,
    };
    if (comment && comment.trim()) body.comentario = comment.trim();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/respuestas`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Supabase insert error: ${res.status}`);
  } else if (!IS_SUPABASE_ENABLED && periodoId && empresaId) {
    // Modo local: respuesta ligada a período/empresa (flujo de encuesta real)
    const all = lread<LocalRespuesta>(LK.respuestas);
    all.push({
      id: uuid(),
      periodo_id: periodoId,
      empresa_id: empresaId,
      department,
      answers,
      comment: comment?.trim() || undefined,
      createdAt: nowIso(),
    });
    lwrite(LK.respuestas, all);
  } else {
    localSave({ id: uuid(), createdAt: nowIso(), department, answers, comment: comment?.trim() || undefined });
  }
}

// ── Local storage (modo demo suelto, sin período) ─────────────────────────────

const LOCAL_KEY = "clima_laboral_respuestas";

function localGetAll(): SurveyResponse[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]") as SurveyResponse[];
  } catch {
    return [];
  }
}

function localSave(r: SurveyResponse): void {
  const all = localGetAll();
  all.push(r);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

export function clearLocalResponses(): void {
  localStorage.removeItem(LOCAL_KEY);
}

export async function getAllResponses(): Promise<SurveyResponse[]> {
  return localGetAll();
}
