# ESTADO DEL SOFTWARE — Medidor de Clima Laboral CENVIT

> Documento de estado y respaldo del proyecto.
> Última actualización: 2026-11-05
> Autor del software: Iván Viteri (CENVIT GTH · Psicología Laboral)

---

## 1. Descripción

**Medidor de Clima Laboral CENVIT** es una aplicación web para diagnosticar el
ambiente de trabajo de una organización mediante una encuesta anónima, consolidar
los resultados en tableros visuales y generar un plan de acción e informe.

Está pensada para uso de consultoría: CENVIT administra varias empresas cliente,
cada empresa realiza mediciones periódicas (semestrales) y cada colaborador
responde la encuesta desde su propio dispositivo mediante un enlace o código QR.

El repositorio contiene **dos aplicaciones** que comparten el mismo código base:

| App | Entrada | Qué es |
|-----|---------|--------|
| **App real** (`App.tsx`) | `app.html` → `main.tsx` | Aplicación de producción multi-empresa (login, períodos, encuesta, resultados, plan de acción). |
| **Demo del panel** (`demo.tsx`) | `index.html` / `demo.html` | Panel-demostración del consultor, con datos simulados, para mostrar a clientes. |

---

## 2. Tecnologías

- **Lenguaje:** TypeScript
- **Framework UI:** React 19
- **Bundler / dev server:** Vite 8
- **Estilos:** CSS-in-JS (estilos inline + hoja en `src/styles.ts`; sin Tailwind).
- **Base de datos (opcional):** Supabase (PostgreSQL) vía su API REST.
  Si no hay credenciales, la app usa un **backend local** en `localStorage`.
- **Códigos QR:** librería local `qrcode` (generación offline, sin servicios externos).
- **Gráficos:** SVG propio (medidores, anillos, radar, áreas de tendencia).
- **Despliegue:** GitHub Pages (workflow de Actions) y/o Vercel (`vercel.json`).
- **Dependencias (versiones fijas):** `react` 19.2.6, `react-dom` 19.2.6,
  `qrcode` 1.5.4; dev: `vite` 8.0.14, `typescript` 6.0.3, `@vitejs/plugin-react` 6.0.2.

---

## 3. Estructura

Raíz del proyecto: `clima-laboral/`

| Archivo / carpeta | Qué hace |
|-------------------|----------|
| `index.html` / `demo.html` | Entrada del **demo** (carga `src/demo.tsx`). |
| `app.html` | Entrada de la **app real** (carga `src/main.tsx`). |
| `vite.config.ts` | Build por defecto (demo); define el `base` para GitHub Pages. |
| `vite.app.config.ts` | Build de la app real → carpeta `dist-app/`. |
| `vite.demo.config.ts` | Build del demo autónomo en un solo HTML (IIFE). |
| `vercel.json` / `tsconfig.json` | Despliegue en Vercel / configuración TypeScript. |
| `.env.example` | Plantilla de variables de entorno (sin valores reales). |
| `package.json` | Scripts y dependencias con versiones fijas. |
| `public/` | Logos de CENVIT e Iván Viteri (recursos estáticos). |
| `scripts/renderReport.tsx` | Render del informe a HTML estático con datos de muestra. |
| **`src/`** | Código fuente: |
| `src/main.tsx` | Punto de montaje de la app real. |
| `src/App.tsx` | App real: ruteo de pantallas (landing, login, panel, encuesta, gracias, admin). |
| `src/Admin.tsx` | Panel del consultor: gestión de empresas, portafolio y **carga de datos de demostración**. |
| `src/demoSeed.ts` | Generador de datos ficticios (empresa, 2 períodos y ~80 respuestas simuladas). |
| `src/CompanyDashboard.tsx` | Panel de la empresa: período activo, enlace, **QR local y cartel**, participación, historial, plan. |
| `src/PeriodDashboard.tsx` | Tablero del período (índice global, radar, dimensiones, comentarios) y **exportar informe PDF**. |
| `src/HistoricalComparison.tsx` | Comparación entre períodos (tendencias). |
| `src/ActionMatrix.tsx` | Matriz editable del plan de acción por dimensión. |
| `src/ReportDocument.tsx` | Documento de informe imprimible/exportable (destino del PDF). |
| `src/questions.ts` | Instrumento: **10 dimensiones y ~50 preguntas** (Likert 1–5) y departamentos. |
| `src/types.ts` | Tipos TypeScript (Empresa, Periodo, SurveyResponse, ActionRow, etc.). |
| `src/storage.ts` | Capa de datos: Supabase **o** backend local (localStorage). |
| `src/config.ts` | Lee variables de entorno de Supabase y la contraseña de administración. |
| `src/shared.tsx` / `src/styles.ts` | Utilidades/componentes compartidos y hoja de estilos. |
| `src/demo.tsx` | Demo del panel del consultor (datos simulados). |
| `src/logoData.ts` | Carga de logos. |

---

## 4. Lo que ya funciona (terminado y probado)

- **Instrumento de medición** — 10 dimensiones, ~50 preguntas, escala Likert 1–5.
- **Encuesta en línea para el colaborador** — flujo por dimensiones, departamento,
  comentario anónimo, pantalla de agradecimiento, anti-duplicado por dispositivo.
- **Enlace, QR local y cartel imprimible** — URL única por empresa/período, copiar,
  WhatsApp, correo, **código QR generado localmente (offline)** y cartel A4.
- **Tablero de resultados** — índice global, radar de 10 dimensiones, barras,
  nivel, comentarios y anillo de participación.
- **Comparación histórica** entre períodos / tendencia semestral.
- **Plan de acción** editable y persistente por período.
- **Exportar informe PDF** — botón en el tablero del período que imprime el informe
  formal (`ReportDocument.tsx`) vía diálogo de impresión / «Guardar como PDF».
- **Panel de administración** — alta/gestión de empresas, portafolio por cliente, y
  botón **«Cargar datos de demostración»** (empresa Base Naval Norte, 2 períodos, ~80
  respuestas) para ver tablero y comparación sin configurar nada.
- **Seguridad del panel admin** — la contraseña se lee **solo** de
  `VITE_ADMIN_PASSWORD`; si no está definida, el panel queda deshabilitado con aviso.
- **Modo local sin backend** — toda la app funciona guardando en el navegador.
- **Build e integración continua** — compila limpio; workflow de GitHub Pages.

Probado con navegador headless (2026-11-05): login admin por variable de entorno,
carga de datos demo, login de empresa, QR local (data URL) y bloqueo del panel admin
cuando falta la contraseña. Sin errores de consola.

---

## 5. Lo que está a medias

- **Base de datos (Supabase)** — código cliente escrito y probado contra el esquema,
  pero **el proyecto Supabase aún no está creado/credenciado**. Sin las variables de
  entorno, la app corre en modo local (datos no compartidos entre dispositivos).
  *Falta:* crear el proyecto, ejecutar el SQL (documentado en `src/config.ts`) y
  cargar `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PASSWORD`.
- **Anti-duplicado de respuestas** — hoy se controla con `localStorage` del
  dispositivo; *falta* un mecanismo robusto (token por colaborador).
- **Versión instalable para servidores** — hay despliegue web (Pages/Vercel);
  *falta* un empaquetado para auto-hospedaje (imagen Docker o guía de servidor propio).

---

## 6. Lo pendiente (checklist de módulos solicitados)

| Módulo | Estado |
|--------|--------|
| Cuestionario de clima | ✅ Terminado (10 dimensiones, ~50 preguntas) |
| Encuesta en línea | ✅ Terminado (enlace + QR local + cartel) |
| Base de datos | 🟡 Código listo; **falta crear/credenciar Supabase** |
| Tablero de resultados | ✅ Terminado (radar, tendencias, comentarios) |
| Informe automático | ✅ Integrado (botón «Exportar informe PDF» en el tablero) |
| Carga de datos ficticios | ✅ Terminado (botón en Administración) |
| Versión instalable para servidores | 🟡 Web (Pages/Vercel) listo; falta empaquetado self-host |

Leyenda: ✅ listo · 🟡 a medias · ⬜ no iniciado.

---

## 7. Cómo ejecutarlo (local)

Requisitos: **Node.js 20+** y npm.

```bash
cd clima-laboral
npm install

# APP REAL (login de empresa, panel, encuesta)
npm run dev:app      # → http://localhost:5173/app.html

# DEMO del panel del consultor (opcional)
npm run dev          # → http://localhost:5173/
```

**Accesos en modo local (sin Supabase):**
- Empresa de prueba: usuario `demo` / contraseña `demo`.
- **Administración:** requiere definir `VITE_ADMIN_PASSWORD` (ver abajo). Sin esa
  variable el panel de administración queda deshabilitado (por seguridad).
- Datos de demostración: dentro de Administración, botón **«Cargar datos de
  demostración»**. Crea la empresa *Base Naval Norte (DATOS FICTICIOS)* — ingresa
  luego como empresa con `base-naval` / `demo` para ver el tablero y la comparación.

**Variables de entorno:** copia `.env.example` a `.env.local` y define
`VITE_ADMIN_PASSWORD` (y, para base de datos real, las de Supabase). Reinicia el
servidor de desarrollo.

**Compilar para producción:**
```bash
npm run build:app   # app real  → dist-app/
npm run build       # demo      → dist/
```

---

## 8. Errores conocidos o problemas detectados

- **Modo local = un solo navegador:** sin Supabase, los datos (empresas, períodos,
  respuestas) viven solo en el navegador donde se crearon; no se comparten entre
  dispositivos. Para medición real multi-dispositivo es obligatorio Supabase.
- **Administración deshabilitada sin `VITE_ADMIN_PASSWORD`:** es el comportamiento
  esperado (seguridad). Para usar el panel y la carga de datos demo hay que definir
  esa variable en `.env.local` (desarrollo) o como secreto del despliegue.
- **Dependencias:** versiones fijadas para builds reproducibles (ver sección 2).
- **Chequeo de tipos:** el build (Vite/esbuild) compila correctamente; un `tsc`
  estricto puede reportar advertencias de tipos de React según el entorno.
- **Anti-duplicado limitado:** ver sección 5 (control solo por `localStorage`).
- **Tamaño del bundle:** ~505 kB (incluye `qrcode`); aviso de Vite por superar 500 kB,
  sin impacto funcional.

---

*Este documento describe el estado del software a la fecha indicada y documenta el
respaldo. No se eliminó código existente.*
