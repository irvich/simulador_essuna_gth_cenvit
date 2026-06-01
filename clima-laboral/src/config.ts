// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE LA APLICACIÓN
// ──────────────────────────────────────────────────────────────────────────────
//
// MODO DEMO (por defecto):
//   Si dejas SUPABASE_URL y SUPABASE_ANON_KEY vacíos, la app guarda las
//   respuestas en el navegador (localStorage). Sirve para probar todo en un
//   mismo dispositivo, pero NO comparte datos entre personas/dispositivos.
//
// MODO PRODUCCIÓN (para las 100 personas en sus propios dispositivos):
//   1. Crea una cuenta gratuita en https://supabase.com
//   2. Crea un proyecto nuevo.
//   3. En el SQL Editor de Supabase, ejecuta:
//
//        create table respuestas (
//          id uuid primary key default gen_random_uuid(),
//          created_at timestamptz default now(),
//          department text,
//          answers jsonb
//        );
//        alter table respuestas enable row level security;
//        create policy "insert_publico" on respuestas for insert with check (true);
//        create policy "lectura_publica" on respuestas for select using (true);
//
//   4. En Project Settings → API copia "Project URL" y "anon public key".
//   5. Pégalos abajo entre las comillas y vuelve a desplegar.
//
// ──────────────────────────────────────────────────────────────────────────────

export const SUPABASE_URL = "";
export const SUPABASE_ANON_KEY = "";

/** Contraseña simple para acceder al panel administrativo. Cámbiala. */
export const ADMIN_PASSWORD = "cenvit2026";

/** Nombre de la tabla en Supabase. */
export const SUPABASE_TABLE = "respuestas";

export const IS_SUPABASE_ENABLED = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";
