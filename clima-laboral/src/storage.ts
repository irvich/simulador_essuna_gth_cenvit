import { IS_SUPABASE_ENABLED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Answers, Empresa, Periodo, SurveyResponse } from "./types";

export const storageMode: "supabase" | "local" = IS_SUPABASE_ENABLED ? "supabase" : "local";

// ── Helpers ───────────────────────────────────────────────────────────────────

function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
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

// ── Company auth ──────────────────────────────────────────────────────────────

export async function loginEmpresa(usuario: string, password: string): Promise<Empresa | null> {
  const data = (await sbRpc("login_empresa", { p_usuario: usuario, p_password: password })) as Empresa[];
  return data?.length > 0 ? data[0] : null;
}

// ── Company management (admin) ────────────────────────────────────────────────

export async function getAllEmpresas(): Promise<Empresa[]> {
  const res = await sbFetch("/empresas?select=id,nombre,usuario,created_at&order=nombre.asc");
  return res.json();
}

export async function getEmpresaById(empresaId: string): Promise<Empresa | null> {
  const res = await sbFetch(`/empresas?id=eq.${empresaId}&select=id,nombre,usuario,created_at`);
  const data = (await res.json()) as Empresa[];
  return data.length > 0 ? data[0] : null;
}

export async function createEmpresa(nombre: string, usuario: string, password: string): Promise<Empresa> {
  const password_hash = await sha256(password);
  const res = await sbFetch("/empresas", {
    method: "POST",
    body: JSON.stringify({ nombre, usuario, password_hash }),
  });
  const data = (await res.json()) as Empresa[];
  return data[0];
}

// ── Periods ───────────────────────────────────────────────────────────────────

export async function getPeriodsForCompany(empresaId: string): Promise<Periodo[]> {
  const res = await sbFetch(`/periodos?empresa_id=eq.${empresaId}&order=created_at.desc`);
  return res.json();
}

export async function getPeriodById(periodoId: string): Promise<Periodo | null> {
  const res = await sbFetch(`/periodos?id=eq.${periodoId}`);
  const data = (await res.json()) as Periodo[];
  return data.length > 0 ? data[0] : null;
}

export async function createPeriod(empresaId: string, etiqueta: string): Promise<Periodo> {
  const res = await sbFetch("/periodos", {
    method: "POST",
    body: JSON.stringify({ empresa_id: empresaId, etiqueta, estado: "activo" }),
  });
  const data = (await res.json()) as Periodo[];
  return data[0];
}

export async function closePeriod(periodoId: string): Promise<void> {
  await sbFetch(`/periodos?id=eq.${periodoId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ estado: "cerrado", cerrado_at: new Date().toISOString() }),
  });
}

// ── Responses ─────────────────────────────────────────────────────────────────

export async function getResponsesForPeriod(periodoId: string): Promise<SurveyResponse[]> {
  const res = await sbFetch(`/respuestas?periodo_id=eq.${periodoId}&order=created_at.desc`);
  const rows = (await res.json()) as Array<{
    id: string;
    created_at: string;
    departamento: string;
    respuestas: Answers;
  }>;
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    department: r.departamento,
    answers: r.respuestas,
  }));
}

export async function submitResponse(
  department: string,
  answers: Answers,
  periodoId?: string,
  empresaId?: string
): Promise<void> {
  if (IS_SUPABASE_ENABLED && periodoId && empresaId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/respuestas`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        periodo_id: periodoId,
        empresa_id: empresaId,
        departamento: department,
        respuestas: answers,
      }),
    });
    if (!res.ok) throw new Error(`Supabase insert error: ${res.status}`);
  } else {
    localSave({ id: uuid(), createdAt: new Date().toISOString(), department, answers });
  }
}

// ── Local storage (demo mode) ─────────────────────────────────────────────────

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
