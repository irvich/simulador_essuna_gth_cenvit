import {
  IS_SUPABASE_ENABLED,
  SUPABASE_ANON_KEY,
  SUPABASE_TABLE,
  SUPABASE_URL,
} from "./config";
import type { Answers, SurveyResponse } from "./types";

const LOCAL_KEY = "clima_laboral_respuestas";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

// ── localStorage (modo demo) ──────────────────────────────────────────────────
function localGetAll(): SurveyResponse[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as SurveyResponse[]) : [];
  } catch {
    return [];
  }
}

function localSave(response: SurveyResponse): void {
  const all = localGetAll();
  all.push(response);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

// ── Supabase (modo producción) — vía REST, sin dependencias ───────────────────
async function supabaseInsert(response: SurveyResponse): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      department: response.department,
      answers: response.answers,
    }),
  });
  if (!res.ok) {
    throw new Error(`Supabase insert falló: ${res.status} ${await res.text()}`);
  }
}

async function supabaseGetAll(): Promise<SurveyResponse[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Supabase lectura falló: ${res.status}`);
  }
  const rows = (await res.json()) as Array<{
    id: string;
    created_at: string;
    department: string;
    answers: Answers;
  }>;
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    department: r.department,
    answers: r.answers,
  }));
}

// ── API pública ───────────────────────────────────────────────────────────────
export async function submitResponse(department: string, answers: Answers): Promise<void> {
  const response: SurveyResponse = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    department,
    answers,
  };

  if (IS_SUPABASE_ENABLED) {
    await supabaseInsert(response);
  } else {
    localSave(response);
  }
}

export async function getAllResponses(): Promise<SurveyResponse[]> {
  if (IS_SUPABASE_ENABLED) {
    return supabaseGetAll();
  }
  return localGetAll();
}

export function clearLocalResponses(): void {
  localStorage.removeItem(LOCAL_KEY);
}

export const storageMode: "supabase" | "local" = IS_SUPABASE_ENABLED ? "supabase" : "local";
