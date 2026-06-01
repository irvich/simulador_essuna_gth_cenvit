// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN — PLATAFORMA MULTI-EMPRESA DE CLIMA LABORAL
// ──────────────────────────────────────────────────────────────────────────────
//
// PASO 1: Crea una cuenta gratuita en https://supabase.com y un proyecto nuevo.
//
// PASO 2: En el SQL Editor del proyecto, ejecuta este script completo:
//
//   -- Extensión para hashing SHA-256 (necesaria para login de empresa)
//   CREATE EXTENSION IF NOT EXISTS pgcrypto;
//
//   -- Tabla de empresas clientes
//   CREATE TABLE empresas (
//     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     nombre TEXT NOT NULL,
//     usuario TEXT UNIQUE NOT NULL,
//     password_hash TEXT NOT NULL,
//     created_at TIMESTAMPTZ DEFAULT NOW()
//   );
//
//   -- Tabla de períodos de medición (cada 6 meses aprox.)
//   CREATE TABLE periodos (
//     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
//     etiqueta TEXT NOT NULL,          -- ej: "2025-S1", "2026-S2"
//     estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo','cerrado')),
//     created_at TIMESTAMPTZ DEFAULT NOW(),
//     cerrado_at TIMESTAMPTZ
//   );
//
//   -- Tabla de respuestas de empleados
//   CREATE TABLE respuestas (
//     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     periodo_id UUID REFERENCES periodos(id) ON DELETE CASCADE,
//     empresa_id UUID REFERENCES empresas(id),
//     departamento TEXT NOT NULL,
//     respuestas JSONB NOT NULL,
//     created_at TIMESTAMPTZ DEFAULT NOW()
//   );
//
//   -- Función de login: compara la contraseña con su hash SHA-256
//   CREATE OR REPLACE FUNCTION login_empresa(p_usuario TEXT, p_password TEXT)
//   RETURNS TABLE (id UUID, nombre TEXT, usuario TEXT)
//   LANGUAGE plpgsql SECURITY DEFINER AS $$
//   BEGIN
//     RETURN QUERY SELECT e.id, e.nombre, e.usuario FROM empresas e
//     WHERE e.usuario = p_usuario
//       AND e.password_hash = encode(digest(p_password,'sha256'),'hex');
//   END;
//   $$;
//
//   -- Políticas de acceso público (el control de acceso se hace en la UI)
//   ALTER TABLE empresas   ENABLE ROW LEVEL SECURITY;
//   ALTER TABLE periodos   ENABLE ROW LEVEL SECURITY;
//   ALTER TABLE respuestas ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "anon_read"   ON empresas   FOR SELECT USING (true);
//   CREATE POLICY "anon_insert" ON empresas   FOR INSERT WITH CHECK (true);
//   CREATE POLICY "anon_read"   ON periodos   FOR SELECT USING (true);
//   CREATE POLICY "anon_insert" ON periodos   FOR INSERT WITH CHECK (true);
//   CREATE POLICY "anon_update" ON periodos   FOR UPDATE USING (true);
//   CREATE POLICY "anon_read"   ON respuestas FOR SELECT USING (true);
//   CREATE POLICY "anon_insert" ON respuestas FOR INSERT WITH CHECK (true);
//
//   -- Columnas opcionales (agregar después de crear las tablas base)
//   ALTER TABLE periodos ADD COLUMN IF NOT EXISTS plan_accion JSONB;
//   ALTER TABLE periodos ADD COLUMN IF NOT EXISTS total_colaboradores INTEGER;
//
// PASO 3: En Project Settings → API, copia "Project URL" y "anon public key".
//         Pégalos a continuación y vuelve a desplegar.
//
// ──────────────────────────────────────────────────────────────────────────────

export const SUPABASE_URL = "";
export const SUPABASE_ANON_KEY = "";

/** Contraseña para el panel administrativo de CENVIT. Cámbiala antes de desplegar. */
export const ADMIN_PASSWORD = "cenvit2026";

export const IS_SUPABASE_ENABLED = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";
