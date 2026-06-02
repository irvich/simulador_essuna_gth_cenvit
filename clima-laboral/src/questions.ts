import type { DimensionConfig, Question } from "./types";

export const DEPARTMENTS: string[] = [
  "Administración",
  "Operaciones",
  "Recursos Humanos / Talento Humano",
  "Finanzas",
  "Logística",
  "Tecnología / Sistemas",
  "Otro",
];

export const DIMENSIONS: DimensionConfig[] = [
  {
    key: "liderazgo",
    label: "Liderazgo",
    shortLabel: "Liderazgo",
    description: "Cómo perciben los colaboradores la gestión, conducta y apoyo de sus líderes.",
    color: "#38bdf8",
    colorSoft: "rgba(56, 189, 248, 0.16)",
    recommendation: {
      low: "El liderazgo requiere atención urgente. Implementar programas de desarrollo de competencias directivas, establecer retroalimentación regular entre líderes y equipos, y revisar los estilos de conducción. La formación en liderazgo participativo y comunicación asertiva es prioritaria.",
      medium: "El liderazgo muestra avances, pero hay áreas por fortalecer. Priorizar la escucha activa, la toma de decisiones transparente y el reconocimiento del trabajo del equipo consolidará la confianza.",
      high: "El liderazgo es percibido positivamente. Mantener prácticas de retroalimentación continua y seguir promoviendo un liderazgo que inspire y desarrolle a los colaboradores.",
    },
    actionTemplate: {
      action: {
        low: "Programa de desarrollo de competencias directivas y sesiones de feedback estructurado.",
        medium: "Talleres de liderazgo participativo y rutinas de reconocimiento al equipo.",
        high: "Mentoría de líderes y consolidación de buenas prácticas de conducción.",
      },
      indicator: "% de líderes capacitados / índice de satisfacción con la jefatura",
      responsible: "Jefatura de Talento Humano",
    },
  },
  {
    key: "comunicacion",
    label: "Comunicación",
    shortLabel: "Comunicación",
    description: "Calidad, fluidez y efectividad de la comunicación dentro de la organización.",
    color: "#d4af37",
    colorSoft: "rgba(212, 175, 55, 0.16)",
    recommendation: {
      low: "La comunicación interna presenta deficiencias críticas. Establecer protocolos formales de comunicación, reuniones periódicas por área, canales accesibles para consultas y fomentar una cultura de información transparente en todos los niveles.",
      medium: "La comunicación funciona, pero con brechas. Reforzar los canales bidireccionales, capacitar a líderes en comunicación efectiva y asegurar que los mensajes institucionales lleguen con claridad.",
      high: "La comunicación es efectiva y valorada. Revisar periódicamente los canales existentes y adaptarlos a las necesidades cambiantes del equipo.",
    },
    actionTemplate: {
      action: {
        low: "Definir protocolo de comunicación interna y canales formales (boletines, reuniones, intranet).",
        medium: "Capacitación en comunicación efectiva y encuestas rápidas de claridad de mensajes.",
        high: "Auditoría periódica de canales y optimización continua.",
      },
      indicator: "% de colaboradores que reciben la información a tiempo",
      responsible: "Comunicación Interna / TTHH",
    },
  },
  {
    key: "trabajo_en_equipo",
    label: "Trabajo en Equipo",
    shortLabel: "T. Equipo",
    description: "Colaboración, cohesión y espíritu de cuerpo entre los integrantes del equipo.",
    color: "#22c55e",
    colorSoft: "rgba(34, 197, 94, 0.16)",
    recommendation: {
      low: "El trabajo en equipo necesita intervención. Organizar dinámicas de integración, revisar la distribución de tareas, establecer objetivos compartidos claros y promover espacios de colaboración con apoyo mutuo.",
      medium: "El trabajo en equipo tiene base sólida, pero puede mejorarse. Fortalecer la confianza interpersonal, la co-responsabilidad en los resultados y celebrar los logros colectivos.",
      high: "El trabajo en equipo es una fortaleza. Aprovechar este capital humano para nuevos desafíos y seguir construyendo relaciones de confianza.",
    },
    actionTemplate: {
      action: {
        low: "Dinámicas de integración y revisión de la distribución de cargas y roles.",
        medium: "Definición de objetivos compartidos y reconocimiento de logros colectivos.",
        high: "Proyectos transversales que aprovechen la cohesión existente.",
      },
      indicator: "Índice de colaboración / cumplimiento de metas de equipo",
      responsible: "Jefes de Área",
    },
  },
  {
    key: "motivacion",
    label: "Motivación y Reconocimiento",
    shortLabel: "Motivación",
    description: "Nivel de satisfacción, motivación y percepción de reconocimiento de los colaboradores.",
    color: "#a78bfa",
    colorSoft: "rgba(167, 139, 250, 0.16)",
    recommendation: {
      low: "Motivación y reconocimiento son áreas críticas. Implementar un sistema formal de reconocimiento al desempeño, revisar condiciones y beneficios, identificar fuentes de insatisfacción y diseñar planes de carrera.",
      medium: "La motivación presenta niveles moderados. Crear instancias de reconocimiento público, vincular el trabajo con el propósito institucional y generar oportunidades de desarrollo.",
      high: "Los colaboradores se sienten motivados y reconocidos. Mantener y enriquecer los mecanismos de reconocimiento y conectar el trabajo con el propósito misional.",
    },
    actionTemplate: {
      action: {
        low: "Diseñar sistema formal de reconocimiento y revisar beneficios e incentivos.",
        medium: "Programa de reconocimiento público y vinculación con el propósito institucional.",
        high: "Enriquecer incentivos y planes de reconocimiento ya existentes.",
      },
      indicator: "Índice de satisfacción / rotación de personal",
      responsible: "Talento Humano",
    },
  },
  {
    key: "condiciones_seguridad",
    label: "Condiciones y Seguridad Laboral",
    shortLabel: "Cond. y Seg.",
    description: "Condiciones físicas del entorno, recursos disponibles y seguridad e higiene en el trabajo.",
    color: "#fb923c",
    colorSoft: "rgba(251, 146, 60, 0.16)",
    recommendation: {
      low: "Las condiciones y la seguridad laboral son deficientes. Realizar una evaluación de riesgos, mejorar el entorno físico, dotar de recursos y equipos de protección, y reforzar protocolos de seguridad e higiene.",
      medium: "Las condiciones son aceptables pero mejorables. Atender los puntos de riesgo identificados, mantener los equipos al día y reforzar la cultura de prevención.",
      high: "Las condiciones y la seguridad son valoradas positivamente. Sostener los estándares mediante inspecciones periódicas y mejora continua del entorno.",
    },
    actionTemplate: {
      action: {
        low: "Evaluación de riesgos laborales y plan de mejora del entorno físico y EPP.",
        medium: "Atención de hallazgos de seguridad y mantenimiento preventivo de recursos.",
        high: "Inspecciones periódicas y mejora continua de condiciones.",
      },
      indicator: "N.º de incidentes / cumplimiento de la matriz de riesgos",
      responsible: "Seguridad y Salud Ocupacional",
    },
  },
  {
    key: "desarrollo_crecimiento",
    label: "Desarrollo y Crecimiento",
    shortLabel: "Desarrollo",
    description: "Oportunidades de formación, desarrollo profesional y crecimiento dentro de la organización.",
    color: "#f472b6",
    colorSoft: "rgba(244, 114, 182, 0.16)",
    recommendation: {
      low: "Las oportunidades de desarrollo son percibidas como insuficientes. Diseñar planes de capacitación basados en necesidades reales, establecer rutas de carrera y vincular la formación con el desempeño.",
      medium: "El desarrollo profesional avanza, pero requiere estructura. Formalizar planes de carrera, diversificar la capacitación y dar seguimiento al impacto de la formación.",
      high: "El desarrollo y crecimiento son bien valorados. Mantener la inversión en formación y abrir nuevas oportunidades de crecimiento interno.",
    },
    actionTemplate: {
      action: {
        low: "Diagnóstico de necesidades de capacitación y diseño de rutas de carrera.",
        medium: "Formalizar planes de carrera y medir el impacto de la formación.",
        high: "Ampliar oportunidades de crecimiento y promoción interna.",
      },
      indicator: "Horas de capacitación per cápita / promociones internas",
      responsible: "Capacitación y Desarrollo",
    },
  },
];

export const QUESTIONS: Question[] = [
  // ── Liderazgo ──────────────────────────────────────────────
  { id: 1, dimension: "liderazgo", text: "Mi jefe directo me comunica claramente lo que se espera de mi trabajo." },
  { id: 2, dimension: "liderazgo", text: "Los líderes de la organización toman decisiones de manera justa y transparente." },
  { id: 3, dimension: "liderazgo", text: "Mi superior me apoya cuando enfrento dificultades en el trabajo." },
  { id: 4, dimension: "liderazgo", text: "Los líderes generan confianza y credibilidad en el equipo." },
  { id: 5, dimension: "liderazgo", text: "Mi jefe valora y toma en cuenta mis ideas y sugerencias." },
  { id: 6, dimension: "liderazgo", text: "Recibo retroalimentación útil de mi superior sobre mi desempeño." },
  { id: 7, dimension: "liderazgo", text: "Mi jefe predica con el ejemplo y es coherente entre lo que dice y hace." },

  // ── Comunicación ───────────────────────────────────────────
  { id: 8, dimension: "comunicacion", text: "La información que necesito para hacer mi trabajo llega de manera clara y oportuna." },
  { id: 9, dimension: "comunicacion", text: "Existe comunicación abierta entre los diferentes niveles de la organización." },
  { id: 10, dimension: "comunicacion", text: "Cuando hay cambios importantes, se me informa con anticipación." },
  { id: 11, dimension: "comunicacion", text: "Puedo expresar mis opiniones libremente sin temor a represalias." },
  { id: 12, dimension: "comunicacion", text: "Los canales de comunicación interna son efectivos y accesibles." },
  { id: 13, dimension: "comunicacion", text: "Las instrucciones que recibo son claras y evitan confusiones." },
  { id: 14, dimension: "comunicacion", text: "Mis inquietudes y consultas reciben respuesta en un tiempo razonable." },

  // ── Trabajo en Equipo ──────────────────────────────────────
  { id: 15, dimension: "trabajo_en_equipo", text: "Mi equipo trabaja de manera coordinada para alcanzar los objetivos comunes." },
  { id: 16, dimension: "trabajo_en_equipo", text: "Existe un ambiente de respeto y compañerismo entre los miembros del equipo." },
  { id: 17, dimension: "trabajo_en_equipo", text: "Cuando surge un problema, el equipo se une para encontrar soluciones." },
  { id: 18, dimension: "trabajo_en_equipo", text: "Las responsabilidades y tareas se distribuyen de forma equitativa." },
  { id: 19, dimension: "trabajo_en_equipo", text: "Puedo contar con el apoyo de mis compañeros cuando lo necesito." },
  { id: 20, dimension: "trabajo_en_equipo", text: "Existe confianza para compartir información y conocimientos en mi equipo." },
  { id: 21, dimension: "trabajo_en_equipo", text: "Los conflictos dentro del equipo se resuelven de manera constructiva." },

  // ── Motivación y Reconocimiento ────────────────────────────
  { id: 22, dimension: "motivacion", text: "Me siento motivado/a para dar lo mejor de mí en mi trabajo." },
  { id: 23, dimension: "motivacion", text: "La organización reconoce y valora el buen desempeño de sus colaboradores." },
  { id: 24, dimension: "motivacion", text: "Siento que mi trabajo tiene un propósito e impacto positivo en la organización." },
  { id: 25, dimension: "motivacion", text: "El reconocimiento que recibo es justo y proporcional a mi esfuerzo." },
  { id: 26, dimension: "motivacion", text: "Estoy satisfecho/a con las condiciones generales de trabajo." },
  { id: 27, dimension: "motivacion", text: "Me siento orgulloso/a de pertenecer a esta organización." },
  { id: 28, dimension: "motivacion", text: "Recomendaría a otras personas trabajar en esta organización." },

  // ── Condiciones y Seguridad Laboral ────────────────────────
  { id: 29, dimension: "condiciones_seguridad", text: "Cuento con los recursos y herramientas necesarios para hacer mi trabajo." },
  { id: 30, dimension: "condiciones_seguridad", text: "El espacio físico donde trabajo es adecuado y cómodo." },
  { id: 31, dimension: "condiciones_seguridad", text: "La organización se preocupa por mi seguridad y salud en el trabajo." },
  { id: 32, dimension: "condiciones_seguridad", text: "Conozco los protocolos de seguridad e higiene de mi área." },
  { id: 33, dimension: "condiciones_seguridad", text: "Dispongo de los equipos de protección necesarios para mis funciones." },
  { id: 34, dimension: "condiciones_seguridad", text: "La carga de trabajo que manejo es razonable y sostenible." },
  { id: 35, dimension: "condiciones_seguridad", text: "Existe un equilibrio adecuado entre mi vida laboral y personal." },

  // ── Desarrollo y Crecimiento ───────────────────────────────
  { id: 36, dimension: "desarrollo_crecimiento", text: "Tengo oportunidades de desarrollo y crecimiento profesional aquí." },
  { id: 37, dimension: "desarrollo_crecimiento", text: "La organización me ofrece capacitación útil para mi trabajo." },
  { id: 38, dimension: "desarrollo_crecimiento", text: "Conozco las posibilidades de ascenso o promoción en mi carrera." },
  { id: 39, dimension: "desarrollo_crecimiento", text: "La formación que recibo me ayuda a mejorar mi desempeño." },
  { id: 40, dimension: "desarrollo_crecimiento", text: "La organización apoya mis metas de crecimiento profesional." },
  { id: 41, dimension: "desarrollo_crecimiento", text: "Se me asignan retos que me permiten aprender y mejorar." },
  { id: 42, dimension: "desarrollo_crecimiento", text: "Percibo que el mérito y el esfuerzo son la base para crecer aquí." },
];

export const QUESTIONS_PER_DIMENSION = 7;

export const LIKERT_LABELS: Record<number, string> = {
  1: "Totalmente en desacuerdo",
  2: "En desacuerdo",
  3: "Neutral",
  4: "De acuerdo",
  5: "Totalmente de acuerdo",
};
