import type { DimensionConfig, Question } from "./types";

export const DEPARTMENTS: string[] = [
  "Gerencia",
  "Administración",
  "Talento Humano",
  "Financiero",
  "Comercial",
  "Operaciones",
  "Logística",
  "Otro",
];

// ──────────────────────────────────────────────────────────────────────────────
// MODELO DE 10 DIMENSIONES — Instrumento de clima laboral CENVIT
// Escala Likert 1–5 (acuerdo). Medición semestral (I y II semestre por año).
// ──────────────────────────────────────────────────────────────────────────────

export const DIMENSIONS: DimensionConfig[] = [
  {
    key: "liderazgo",
    label: "Liderazgo",
    shortLabel: "Liderazgo",
    description: "Percepción de la gestión, cercanía y acompañamiento de las jefaturas hacia sus equipos.",
    color: "#38bdf8",
    colorSoft: "rgba(56, 189, 248, 0.16)",
    recommendation: {
      low: "El liderazgo requiere intervención. Establecer estándares mínimos de conducción, capacitar a mandos medios en retroalimentación y acompañamiento, y homologar prácticas entre jefaturas para reducir la dependencia del estilo individual de cada líder.",
      medium: "El liderazgo muestra avances pero con diferencias entre áreas. Reforzar la escucha activa, la retroalimentación periódica y la coherencia entre lo que se comunica y lo que se hace consolidará la confianza.",
      high: "El liderazgo es percibido como un activo. Mantener rutinas de feedback y mentoría entre líderes para sostener la cohesión y desarrollar a los colaboradores.",
    },
    actionTemplate: {
      action: {
        low: "Programa de formación en liderazgo y feedback para mandos medios; definición de estándares mínimos de conducción.",
        medium: "Rutinas de retroalimentación estructurada y acompañamiento a jefaturas con menor puntaje.",
        high: "Mentoría entre líderes y consolidación de buenas prácticas de conducción.",
      },
      indicator: "% de jefaturas capacitadas / índice de satisfacción con la jefatura",
      responsible: "CENVIT / Talento Humano",
    },
  },
  {
    key: "comunicacion",
    label: "Comunicación interna",
    shortLabel: "Comunic.",
    description: "Claridad, oportunidad y bidireccionalidad de la información dentro de la organización.",
    color: "#d4af37",
    colorSoft: "rgba(212, 175, 55, 0.16)",
    recommendation: {
      low: "La comunicación interna presenta deficiencias críticas. Protocolizar canales y mensajes clave, instaurar reuniones breves de coordinación por área y asegurar que la información institucional llegue con la misma claridad a todos los niveles.",
      medium: "La comunicación funciona con brechas. Reforzar los canales bidireccionales, definir responsables de difusión por área y verificar que los mensajes lleguen a tiempo a toda la organización.",
      high: "La comunicación es efectiva y valorada. Revisar periódicamente los canales y adaptarlos a las necesidades cambiantes de los equipos.",
    },
    actionTemplate: {
      action: {
        low: "Protocolo de comunicación interna: canales formales, mensajes clave, reuniones breves y responsables por área.",
        medium: "Reuniones semanales de coordinación y verificación de claridad de mensajes mediante pulsos rápidos.",
        high: "Auditoría periódica de canales y optimización continua.",
      },
      indicator: "% de colaboradores que reciben la información a tiempo",
      responsible: "Talento Humano / Jefaturas",
    },
  },
  {
    key: "reconocimiento",
    label: "Reconocimiento",
    shortLabel: "Reconoc.",
    description: "Percepción de valoración justa y oportuna del esfuerzo y los logros del colaborador.",
    color: "#f472b6",
    colorSoft: "rgba(244, 114, 182, 0.16)",
    recommendation: {
      low: "El reconocimiento es insuficiente y suele ser la principal brecha del clima. Institucionalizar un mecanismo sobrio y constante de reconocimiento al desempeño, combinando retroalimentación positiva inmediata con instancias formales periódicas.",
      medium: "El reconocimiento existe pero es percibido como irregular. Estandarizar criterios, dar visibilidad a los logros de equipo y capacitar a las jefaturas en reconocimiento oportuno.",
      high: "El reconocimiento es percibido como justo. Mantener la constancia y vincularlo a los indicadores de desempeño para sostener la motivación.",
    },
    actionTemplate: {
      action: {
        low: "Programa mensual de reconocimiento al desempeño con criterios claros y retroalimentación positiva estructurada.",
        medium: "Estandarizar criterios de reconocimiento y dar visibilidad institucional a los logros.",
        high: "Vincular el reconocimiento al sistema de desempeño y mantener su periodicidad.",
      },
      indicator: "N.º de reconocimientos otorgados / percepción de valoración del esfuerzo",
      responsible: "Talento Humano",
    },
  },
  {
    key: "motivacion",
    label: "Motivación y compromiso",
    shortLabel: "Motivac.",
    description: "Nivel de energía, identificación y voluntad de aporte del colaborador hacia su trabajo y la organización.",
    color: "#a78bfa",
    colorSoft: "rgba(167, 139, 250, 0.16)",
    recommendation: {
      low: "La motivación y el compromiso están comprometidos. Atender los factores de fondo (reconocimiento, carga, desarrollo y liderazgo), reconectar el trabajo con su propósito e involucrar a los colaboradores en las decisiones que les afectan.",
      medium: "Existe identificación con la institución, pero sensible a las brechas críticas. Reforzar el propósito del trabajo, la participación y los espacios de aporte para consolidar el compromiso.",
      high: "El compromiso es alto y constituye una base sólida. Canalizarlo hacia nuevos desafíos y cuidar los factores que lo sostienen.",
    },
    actionTemplate: {
      action: {
        low: "Plan de fortalecimiento del compromiso: conexión con el propósito, participación e intervención sobre brechas críticas asociadas.",
        medium: "Espacios de participación y aporte; reforzar el sentido del trabajo por área.",
        high: "Canalizar el compromiso hacia retos y proyectos de mejora institucional.",
      },
      indicator: "Índice de motivación / rotación voluntaria",
      responsible: "Gerencia / Talento Humano",
    },
  },
  {
    key: "trabajo_en_equipo",
    label: "Trabajo en equipo",
    shortLabel: "T. Equipo",
    description: "Colaboración, coordinación y confianza entre los integrantes de los equipos de trabajo.",
    color: "#22c55e",
    colorSoft: "rgba(34, 197, 94, 0.16)",
    recommendation: {
      low: "El trabajo en equipo necesita intervención. Clarificar objetivos compartidos, revisar la distribución de tareas y promover dinámicas de integración con co-responsabilidad sobre los resultados.",
      medium: "El trabajo en equipo tiene base sólida pero mejorable. Fortalecer la confianza interpersonal, la resolución constructiva de conflictos y la celebración de logros colectivos.",
      high: "El trabajo en equipo es una fortaleza del estudio. Aprovechar este capital para liderar la implementación del plan de mejora y socializar buenas prácticas.",
    },
    actionTemplate: {
      action: {
        low: "Dinámicas de integración, objetivos compartidos y revisión de la distribución de cargas entre el equipo.",
        medium: "Fortalecer la confianza y el manejo constructivo de conflictos dentro de los equipos.",
        high: "Usar a los equipos sólidos como núcleos de apoyo para el plan de mejora.",
      },
      indicator: "Índice de colaboración / cohesión de equipos",
      responsible: "Jefaturas / Talento Humano",
    },
  },
  {
    key: "condiciones_seguridad",
    label: "Condiciones laborales",
    shortLabel: "Condic.",
    description: "Adecuación de recursos, espacio físico, seguridad y organización del trabajo.",
    color: "#2dd4bf",
    colorSoft: "rgba(45, 212, 191, 0.16)",
    recommendation: {
      low: "Las condiciones laborales requieren atención. Revisar recursos, herramientas, organización del trabajo y cumplimiento de seguridad e higiene en las áreas con mayor afectación.",
      medium: "Las condiciones son estables con oportunidades de mejora. Conviene revisar recursos, ergonomía y organización del trabajo para sostener el avance.",
      high: "Las condiciones laborales son percibidas como adecuadas. Mantener los estándares y atender de forma preventiva los focos puntuales.",
    },
    actionTemplate: {
      action: {
        low: "Revisión de recursos, espacio físico, seguridad e higiene y organización del trabajo en áreas críticas.",
        medium: "Mejora de ergonomía, equipamiento y organización del trabajo.",
        high: "Mantenimiento de estándares y monitoreo preventivo de condiciones.",
      },
      indicator: "% de áreas con condiciones adecuadas / incidentes reportados",
      responsible: "Gerencia / Seguridad y Salud",
    },
  },
  {
    key: "desarrollo_crecimiento",
    label: "Desarrollo profesional",
    shortLabel: "Desarr.",
    description: "Oportunidades de formación, aprendizaje y crecimiento profesional dentro de la organización.",
    color: "#fb923c",
    colorSoft: "rgba(251, 146, 60, 0.16)",
    recommendation: {
      low: "El desarrollo profesional es percibido como limitado. Diseñar planes de carrera, un programa de capacitación por área y criterios transparentes de promoción basados en mérito.",
      medium: "Se perciben oportunidades moderadas de formación y crecimiento. Estructurar planes de desarrollo individual y dar claridad a las rutas de promoción consolidará la percepción.",
      high: "El desarrollo profesional es valorado. Mantener la inversión en formación y vincularla a las metas de carrera de los colaboradores.",
    },
    actionTemplate: {
      action: {
        low: "Planes de carrera, programa de capacitación trimestral por área y criterios transparentes de promoción.",
        medium: "Planes de desarrollo individual y claridad en las rutas de promoción.",
        high: "Sostener la inversión en formación vinculada a metas de carrera.",
      },
      indicator: "% de colaboradores con plan de desarrollo individual",
      responsible: "Talento Humano",
    },
  },
  {
    key: "equidad",
    label: "Equidad organizacional",
    shortLabel: "Equidad",
    description: "Percepción de justicia en cargas, asignación de tareas, oportunidades y trato dentro de la organización.",
    color: "#60a5fa",
    colorSoft: "rgba(96, 165, 250, 0.16)",
    recommendation: {
      low: "La percepción de inequidad es un riesgo activo. Revisar criterios de asignación de cargas y oportunidades, transparentar las reglas de decisión y atender las diferencias de trato percibidas entre áreas.",
      medium: "Persisten dudas sobre la justicia en cargas y asignación de tareas. Clarificar criterios y comunicar las reglas de decisión reducirá la percepción de inequidad.",
      high: "La equidad es percibida como adecuada. Mantener la transparencia en los criterios y monitorear focos puntuales por área.",
    },
    actionTemplate: {
      action: {
        low: "Revisión de cargas laborales, criterios de asignación de tareas y oportunidades internas; transparentar reglas de decisión.",
        medium: "Comunicar criterios de asignación y oportunidades para reducir la percepción de inequidad.",
        high: "Sostener la transparencia y monitorear focos por área.",
      },
      indicator: "Índice de percepción de equidad / quejas por trato o asignación",
      responsible: "Gerencia / Talento Humano",
    },
  },
  {
    key: "cultura",
    label: "Cultura organizacional",
    shortLabel: "Cultura",
    description: "Identidad institucional, valores compartidos y sentido de pertenencia del colaborador.",
    color: "#facc15",
    colorSoft: "rgba(250, 204, 21, 0.16)",
    recommendation: {
      low: "La identidad institucional es débil. Reforzar la difusión de la misión, los valores y la historia de la organización, y alinear las prácticas cotidianas con el discurso institucional.",
      medium: "La cultura aporta cohesión pero puede consolidarse. Hacer visibles los valores en las decisiones del día a día y reconocer las conductas que los encarnan.",
      high: "La cultura organizacional es sólida y estable; aporta cohesión al colectivo. Preservarla como un activo estratégico de la empresa.",
    },
    actionTemplate: {
      action: {
        low: "Difusión de misión, valores e identidad institucional; alineación de prácticas cotidianas con el discurso.",
        medium: "Hacer visibles los valores en las decisiones y reconocer conductas que los encarnan.",
        high: "Preservar la cultura como activo estratégico y vehículo de cambio.",
      },
      indicator: "Índice de pertenencia / alineación con valores institucionales",
      responsible: "Gerencia / Talento Humano",
    },
  },
  {
    key: "bienestar",
    label: "Bienestar psicosocial",
    shortLabel: "Bienestar",
    description: "Equilibrio, manejo de la presión y salud emocional del colaborador en su entorno de trabajo.",
    color: "#34d399",
    colorSoft: "rgba(52, 211, 153, 0.16)",
    recommendation: {
      low: "El bienestar psicosocial muestra señales de deterioro. Monitorear carga, presión y balance laboral, reforzar pausas y apoyo, y activar medidas preventivas frente al desgaste antes de la próxima medición.",
      medium: "El bienestar es aceptable pero a vigilar de forma preventiva. Atender la carga percibida y el balance vida-trabajo evitará riesgos de desgaste.",
      high: "El bienestar psicosocial es adecuado. Mantener las prácticas de balance y apoyo, y vigilar de forma preventiva los focos de presión.",
    },
    actionTemplate: {
      action: {
        low: "Plan de bienestar psicosocial focalizado: monitoreo de carga, pausas, apoyo y balance vida-trabajo.",
        medium: "Atender la carga percibida y reforzar el balance vida-trabajo de forma preventiva.",
        high: "Sostener las prácticas de balance y apoyo; monitoreo preventivo de focos de presión.",
      },
      indicator: "Índice de bienestar / carga percibida y ausentismo",
      responsible: "Talento Humano / Seguridad y Salud",
    },
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// 52 ÍTEMS — escala Likert 1–5 (1 = totalmente en desacuerdo, 5 = totalmente de acuerdo)
// ──────────────────────────────────────────────────────────────────────────────

export const QUESTIONS: Question[] = [
  // ── Liderazgo (6) ──────────────────────────────────────────
  { id: 1, dimension: "liderazgo", text: "Mi jefatura directa me brinda acompañamiento y apoyo cuando lo necesito." },
  { id: 2, dimension: "liderazgo", text: "Recibo retroalimentación útil y oportuna sobre mi desempeño." },
  { id: 3, dimension: "liderazgo", text: "Mi jefatura toma decisiones de forma clara y coherente." },
  { id: 4, dimension: "liderazgo", text: "Existe coherencia entre lo que mi jefatura dice y lo que hace." },
  { id: 5, dimension: "liderazgo", text: "Mi jefatura promueve un trato respetuoso dentro del equipo." },
  { id: 6, dimension: "liderazgo", text: "Las jefaturas de la organización mantienen un estándar de conducción similar." },

  // ── Comunicación interna (5) ───────────────────────────────
  { id: 7, dimension: "comunicacion", text: "La información que necesito para mi trabajo llega de forma clara y oportuna." },
  { id: 8, dimension: "comunicacion", text: "Cuando hay cambios importantes, se me informa con anticipación." },
  { id: 9, dimension: "comunicacion", text: "Puedo expresar mis opiniones libremente sin temor a represalias." },
  { id: 10, dimension: "comunicacion", text: "Los canales de comunicación interna son efectivos y accesibles." },
  { id: 11, dimension: "comunicacion", text: "La comunicación fluye adecuadamente entre las distintas áreas." },

  // ── Reconocimiento (5) ─────────────────────────────────────
  { id: 12, dimension: "reconocimiento", text: "La organización reconoce y valora el buen desempeño de sus colaboradores." },
  { id: 13, dimension: "reconocimiento", text: "El reconocimiento que recibo es justo y proporcional a mi esfuerzo." },
  { id: 14, dimension: "reconocimiento", text: "Mi jefatura reconoce mis logros de manera oportuna." },
  { id: 15, dimension: "reconocimiento", text: "Existen mecanismos claros para reconocer el aporte de las personas." },
  { id: 16, dimension: "reconocimiento", text: "Siento que mi trabajo es tomado en cuenta por la organización." },

  // ── Motivación y compromiso (5) ────────────────────────────
  { id: 17, dimension: "motivacion", text: "Me siento motivado/a para dar lo mejor de mí en mi trabajo." },
  { id: 18, dimension: "motivacion", text: "Siento que mi trabajo tiene un propósito e impacto positivo." },
  { id: 19, dimension: "motivacion", text: "Me siento orgulloso/a de pertenecer a esta organización." },
  { id: 20, dimension: "motivacion", text: "Estoy dispuesto/a a esforzarme más allá de lo estrictamente requerido." },
  { id: 21, dimension: "motivacion", text: "Recomendaría a otras personas trabajar en esta organización." },

  // ── Trabajo en equipo (5) ──────────────────────────────────
  { id: 22, dimension: "trabajo_en_equipo", text: "Mi equipo trabaja de manera coordinada para alcanzar objetivos comunes." },
  { id: 23, dimension: "trabajo_en_equipo", text: "Existe un ambiente de respeto y compañerismo entre los miembros del equipo." },
  { id: 24, dimension: "trabajo_en_equipo", text: "Puedo contar con el apoyo de mis compañeros cuando lo necesito." },
  { id: 25, dimension: "trabajo_en_equipo", text: "Los conflictos dentro del equipo se resuelven de manera constructiva." },
  { id: 26, dimension: "trabajo_en_equipo", text: "Existe confianza para compartir información y conocimientos en mi equipo." },

  // ── Condiciones laborales (5) ──────────────────────────────
  { id: 27, dimension: "condiciones_seguridad", text: "Cuento con los recursos y herramientas necesarios para hacer mi trabajo." },
  { id: 28, dimension: "condiciones_seguridad", text: "El espacio físico donde trabajo es adecuado y seguro." },
  { id: 29, dimension: "condiciones_seguridad", text: "La organización se preocupa por mi seguridad y salud en el trabajo." },
  { id: 30, dimension: "condiciones_seguridad", text: "La carga de trabajo que manejo es razonable y sostenible." },
  { id: 31, dimension: "condiciones_seguridad", text: "La organización del trabajo en mi área es adecuada." },

  // ── Desarrollo profesional (5) ─────────────────────────────
  { id: 32, dimension: "desarrollo_crecimiento", text: "Tengo oportunidades de desarrollo y crecimiento profesional aquí." },
  { id: 33, dimension: "desarrollo_crecimiento", text: "La organización me ofrece capacitación útil para mi trabajo." },
  { id: 34, dimension: "desarrollo_crecimiento", text: "Conozco las posibilidades de ascenso o promoción en mi carrera." },
  { id: 35, dimension: "desarrollo_crecimiento", text: "La organización apoya mis metas de crecimiento profesional." },
  { id: 36, dimension: "desarrollo_crecimiento", text: "Se me asignan retos que me permiten aprender y mejorar." },

  // ── Equidad organizacional (5) ─────────────────────────────
  { id: 37, dimension: "equidad", text: "Las cargas de trabajo se distribuyen de forma justa en mi área." },
  { id: 38, dimension: "equidad", text: "Las oportunidades internas se asignan con criterios justos y transparentes." },
  { id: 39, dimension: "equidad", text: "Recibo un trato equitativo en comparación con mis compañeros." },
  { id: 40, dimension: "equidad", text: "Las reglas y decisiones se aplican de manera imparcial." },
  { id: 41, dimension: "equidad", text: "Percibo que el mérito y el esfuerzo son la base para crecer aquí." },

  // ── Cultura organizacional (5) ─────────────────────────────
  { id: 42, dimension: "cultura", text: "Conozco y comparto la misión y los valores de la organización." },
  { id: 43, dimension: "cultura", text: "Las prácticas cotidianas son coherentes con los valores institucionales." },
  { id: 44, dimension: "cultura", text: "Me identifico con la forma de ser y de trabajar de esta organización." },
  { id: 45, dimension: "cultura", text: "Existe un sentido de pertenencia compartido entre los colaboradores." },
  { id: 46, dimension: "cultura", text: "La organización mantiene una identidad clara y estable." },

  // ── Bienestar psicosocial (6) ──────────────────────────────
  { id: 47, dimension: "bienestar", text: "Logro mantener un equilibrio adecuado entre mi vida laboral y personal." },
  { id: 48, dimension: "bienestar", text: "El nivel de presión en mi trabajo es manejable." },
  { id: 49, dimension: "bienestar", text: "Cuento con espacios o pausas suficientes durante mi jornada." },
  { id: 50, dimension: "bienestar", text: "La organización se preocupa por el bienestar emocional de su personal." },
  { id: 51, dimension: "bienestar", text: "Rara vez siento desgaste o agotamiento por mi trabajo." },
  { id: 52, dimension: "bienestar", text: "Dispongo de apoyo cuando atravieso una situación difícil." },
];

export const LIKERT_LABELS: Record<number, string> = {
  1: "Totalmente en desacuerdo",
  2: "En desacuerdo",
  3: "Neutral",
  4: "De acuerdo",
  5: "Totalmente de acuerdo",
};
