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
- **Framework UI:** React 18
- **Bundler / dev server:** Vite
- **Estilos:** CSS-in-JS mediante estilos inline y una hoja de estilos en
  `src/styles.ts` (sin Tailwind ni CSS modules).
- **Base de datos (opcional):** Supabase (PostgreSQL) vía su API REST.
  Si no hay credenciales, la app usa un **backend local** en `localStorage`.
- **Gráficos:** SVG propio (sin librerías externas): medidores, anillos,
  radar, áreas de tendencia, sparklines.
- **Despliegue:** GitHub Pages (workflow de Actions) y/o Vercel (`vercel.json`).
- **Dependencias (package.json):** `react`, `react-dom`, `typescript`, `vite`,
  `@vitejs/plugin-react`. Sin dependencias de terceros para gráficos, estado ni UI.

---

## 3. Estructura

Raíz del proyecto: `clima-laboral/`

| Archivo / carpeta | Qué hace |
|-------------------|----------|
| `index.html` | Entrada del **demo** (carga `src/demo.tsx`). |
| `demo.html` | Entrada alternativa del demo. |
| `app.html` | Entrada de la **app real** (carga `src/main.tsx`). |
| `vite.config.ts` | Build por defecto (demo); define el `base` para GitHub Pages. |
| `vite.app.config.ts` | Build de la app real → carpeta `dist-app/`. |
| `vite.demo.config.ts` | Build del demo autónomo en un solo HTML (IIFE). |
| `vercel.json` | Configuración de despliegue en Vercel. |
| `tsconfig.json` | Configuración de TypeScript (modo estricto). |
| `.env.example` | Plantilla de variables de entorno (sin valores reales). |
| `package.json` | Scripts y dependencias. |
| `public/` | Logos de CENVIT e Iván Viteri (recursos estáticos). |
| `scripts/renderReport.tsx` | Script para renderizar el informe a HTML estático con datos de muestra. |
| **`src/`** | Código fuente: |
| `src/main.tsx` | Punto de montaje de la app real (renderiza `App`). |
| `src/App.tsx` | App real: ruteo de pantallas (landing, login, panel, encuesta, gracias, admin). |
| `src/Admin.tsx` | Panel del consultor CENVIT: gestión de empresas, períodos y portafolio. |
| `src/CompanyDashboard.tsx` | Panel de la empresa: período activo, enlace/QR, participación, historial, plan. |
| `src/PeriodDashboard.tsx` | Tablero de resultados de un período (índice global, radar, dimensiones, comentarios). |
| `src/HistoricalComparison.tsx` | Comparación entre períodos (tendencias). |
| `src/ActionMatrix.tsx` | Matriz editable del plan de acción por dimensión. |
| `src/ReportDocument.tsx` | Documento de informe imprimible/exportable. |
| `src/questions.ts` | Instrumento: **10 dimensiones y ~50 preguntas** (Likert 1–5) y lista de departamentos. |
| `src/types.ts` | Tipos TypeScript (Empresa, Periodo, SurveyResponse, ActionRow, etc.). |
| `src/storage.ts` | Capa de datos: Supabase **o** backend local (localStorage). |
| `src/config.ts` | Lee variables de entorno de Supabase y la contraseña de administración. |
| `src/shared.tsx` | Componentes y utilidades compartidas (radar, niveles, colores). |
| `src/styles.ts` | Hoja de estilos global de la app real. |
| `src/demo.tsx` | Demo del panel del consultor (datos simulados). |
| `src/logoData.ts` | Carga de logos (la variante `logoData.local.ts` está ignorada). |

---

## 4. Lo que ya funciona (terminado y probado)

- **Instrumento de medición** — 10 dimensiones, ~50 preguntas, escala Likert 1–5,
  con recomendaciones y plantillas de acción por dimensión (`questions.ts`).
- **Encuesta en línea para el colaborador** — flujo por dimensiones, selección de
  departamento, comentario anónimo opcional, pantalla de agradecimiento y control
  básico anti-duplicado por dispositivo (`App.tsx`).
- **Enlace y QR por empresa/período** — generación de URL única
  (`?periodo=…&empresa=…`), botones de copiar, WhatsApp y correo, **código QR** y
  **cartel imprimible** de invitación (`CompanyDashboard.tsx`).
- **Tablero de resultados** — índice global, radar de 10 dimensiones, barras por
  dimensión, nivel (favorable/moderado/crítico), comentarios y anillo de
  participación (`PeriodDashboard.tsx`).
- **Comparación histórica** entre períodos / tendencia semestral
  (`HistoricalComparison.tsx`).
- **Plan de acción** editable y persistente por período (`ActionMatrix.tsx`).
- **Panel de administración del consultor** — alta y gestión de empresas, vista de
  portafolio con el índice de clima más reciente de cada cliente (`Admin.tsx`).
- **Modo local sin backend** — toda la app funciona guardando en el navegador,
  sin necesidad de configurar Supabase (ideal para probar o demostrar).
- **Demo del panel del consultor** con datos simulados (`demo.tsx`), publicado.
- **Build e integración continua** — compila limpio; workflow de GitHub Pages que
  publica la app real y el demo.

---

## 5. Lo que está a medias

- **Base de datos (Supabase)** — todo el código cliente está escrito y probado
  contra el esquema, **pero el proyecto Supabase aún no está creado/credenciado**.
  Mientras no se configuren las variables de entorno, la app corre en modo local
  (los datos no se comparten entre dispositivos). *Falta:* crear el proyecto,
  ejecutar el SQL del esquema y cargar las 3 variables de entorno.
- **Informe automático (`ReportDocument.tsx`)** — el documento está construido y
  hay un script de render con datos de muestra; *falta* un botón de exportar a PDF
  integrado en el flujo de la app real y pruebas con datos reales.
- **Carga de datos ficticios** — el demo trae datos simulados, pero la app real no
  tiene todavía un botón de "sembrar datos de prueba" para un período real.
- **Anti-duplicado de respuestas** — hoy se controla con `localStorage` del
  dispositivo; *falta* un mecanismo robusto (token por colaborador) para evitar
  respuestas repetidas desde navegadores distintos.
- **Versión instalable para servidores** — hay despliegue a GitHub Pages y Vercel;
  *falta* un empaquetado para auto-hospedaje (p. ej. imagen Docker o instrucciones
  de servidor propio).

---

## 6. Lo pendiente (checklist de módulos solicitados)

| Módulo | Estado |
|--------|--------|
| Cuestionario de clima | ✅ Terminado (10 dimensiones, ~50 preguntas) |
| Encuesta en línea | ✅ Terminado (enlace + QR + cartel) |
| Base de datos | 🟡 Código listo; **falta crear/credenciar Supabase** |
| Tablero de resultados | ✅ Terminado (radar, tendencias, comentarios) |
| Informe automático | 🟡 Documento listo; falta exportar a PDF en el flujo real |
| Carga de datos ficticios | 🟡 Existe en el demo; falta botón de siembra en la app real |
| Versión instalable para servidores | 🟡 Web (Pages/Vercel) listo; falta empaquetado self-host |

Leyenda: ✅ listo · 🟡 a medias · ⬜ no iniciado.

---

## 7. Cómo ejecutarlo (local)

Requisitos: **Node.js 20+** y npm.

```bash
# 1. Entrar a la carpeta del proyecto
cd clima-laboral

# 2. Instalar dependencias
npm install

# 3a. Levantar la APP REAL (login de empresa, panel, encuesta)
npm run dev:app
#    → abre la URL que muestra Vite (p. ej. http://localhost:5173/app.html)

# 3b. (Opcional) Levantar el DEMO del panel del consultor
npm run dev
#    → http://localhost:5173/
```

**Accesos en modo local (sin Supabase):**
- Empresa de prueba: usuario `demo` / contraseña `demo`
- Administración (consultor): contraseña `cenvit2026`

**Para activar la base de datos real (Supabase):**
1. Copia `.env.example` a `.env.local` y completa `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` y `VITE_ADMIN_PASSWORD`.
2. Crea el proyecto en supabase.com y ejecuta el SQL del esquema (documentado en
   `src/config.ts`).
3. Reinicia el servidor de desarrollo.

**Compilar para producción:**
```bash
npm run build:app   # app real  → dist-app/
npm run build       # demo      → dist/
```

---

## 8. Errores conocidos o problemas detectados

- **Contraseña de administración por defecto:** `src/config.ts` usa `cenvit2026`
  como valor por defecto si no se define `VITE_ADMIN_PASSWORD`. **Debe cambiarse
  antes de producción** (configurarla como variable de entorno).
- **Modo local = un solo navegador:** sin Supabase, los datos (empresas, períodos,
  respuestas) viven solo en el navegador donde se crearon; no se comparten entre
  dispositivos. Para medición real multi-dispositivo es obligatorio Supabase.
- **El QR usa un servicio externo** (`api.qrserver.com`): requiere conexión a
  internet para mostrarse; si no hay red, el enlace de texto sigue disponible.
- **Dependencias con versión `latest`:** `package.json` fija `latest` en varias
  dependencias; conviene fijar versiones exactas para builds reproducibles.
- **Chequeo de tipos:** el build (Vite/esbuild) compila correctamente, pero un
  `tsc` estricto puede reportar advertencias de tipos de React según el entorno.
- **Anti-duplicado limitado:** ver sección 5 (control solo por `localStorage`).

---

*Este documento describe el estado del software a la fecha indicada. No modifica el
código: solo lo documenta para respaldo.*
