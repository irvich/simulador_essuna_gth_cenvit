import type { DimensionConfig, Question } from "./types";

export const DIMENSIONS: DimensionConfig[] = [
  {
    key: "liderazgo",
    label: "Liderazgo",
    shortLabel: "Liderazgo",
    description: "Evalúa cómo perciben los colaboradores la gestión, conducta y apoyo de sus líderes.",
    color: "#38bdf8",
    colorSoft: "rgba(56, 189, 248, 0.16)",
    recommendation: {
      low: "El liderazgo requiere atención urgente. Se recomienda implementar programas de desarrollo de competencias directivas, establecer espacios de retroalimentación regular entre líderes y equipos, y revisar los estilos de conducción aplicados. La formación en liderazgo participativo y comunicación asertiva puede marcar una diferencia significativa.",
      medium: "El liderazgo muestra avances, pero hay áreas por fortalecer. Priorizar la escucha activa, la toma de decisiones transparente y el reconocimiento del trabajo del equipo contribuirá a consolidar la confianza y la cohesión.",
      high: "El liderazgo es percibido positivamente. Se recomienda mantener prácticas de retroalimentación continua y seguir promoviendo un liderazgo que inspire y desarrolle a los colaboradores.",
    },
  },
  {
    key: "comunicacion",
    label: "Comunicación",
    shortLabel: "Comunicación",
    description: "Mide la calidad, fluidez y efectividad de la comunicación dentro de la organización.",
    color: "#d4af37",
    colorSoft: "rgba(212, 175, 55, 0.16)",
    recommendation: {
      low: "La comunicación interna presenta deficiencias críticas. Se recomienda establecer protocolos formales de comunicación, realizar reuniones periódicas informativas por área, crear canales accesibles para consultas y fomentar una cultura donde la información fluya de manera transparente en todos los niveles.",
      medium: "La comunicación funciona, pero con brechas que afectan el desempeño. Reforzar los canales bidireccionales, capacitar a líderes en comunicación efectiva y asegurar que los mensajes institucionales lleguen con claridad a todos los colaboradores son pasos clave.",
      high: "La comunicación es efectiva y valorada. Para sostenerla, se sugiere revisar periódicamente los canales existentes y adaptar los mensajes a las necesidades cambiantes del equipo.",
    },
  },
  {
    key: "trabajo_en_equipo",
    label: "Trabajo en Equipo",
    shortLabel: "Trabajo Equipo",
    description: "Analiza la colaboración, cohesión y el espíritu de cuerpo entre los integrantes del equipo.",
    color: "#22c55e",
    colorSoft: "rgba(34, 197, 94, 0.16)",
    recommendation: {
      low: "El trabajo en equipo necesita intervención. Se recomienda organizar dinámicas de integración, revisar la distribución de tareas y responsabilidades, establecer objetivos compartidos claros y promover espacios de colaboración donde el apoyo mutuo sea una práctica habitual.",
      medium: "El trabajo en equipo tiene una base sólida, pero puede mejorarse. Fortalecer la confianza interpersonal, fomentar la co-responsabilidad en los resultados y celebrar los logros colectivos impulsará la cohesión del grupo.",
      high: "El trabajo en equipo es una fortaleza de la organización. Aprovechar este capital humano para enfrentar nuevos desafíos y seguir construyendo relaciones de confianza entre los colaboradores.",
    },
  },
  {
    key: "motivacion",
    label: "Motivación y Reconocimiento",
    shortLabel: "Motivación",
    description: "Examina el nivel de satisfacción, motivación y percepción de reconocimiento de los colaboradores.",
    color: "#a78bfa",
    colorSoft: "rgba(167, 139, 250, 0.16)",
    recommendation: {
      low: "La motivación y el reconocimiento son áreas críticas. Se recomienda implementar un sistema formal de reconocimiento al desempeño, revisar las condiciones y beneficios laborales, identificar las fuentes de insatisfacción y diseñar planes de carrera que den perspectiva de crecimiento a los colaboradores.",
      medium: "La motivación presenta niveles moderados. Crear instancias de reconocimiento público, vincular el trabajo individual con el propósito institucional y generar oportunidades de desarrollo profesional ayudarán a elevar el compromiso del equipo.",
      high: "Los colaboradores se sienten motivados y reconocidos. Mantener y enriquecer los mecanismos de reconocimiento, y seguir conectando el trabajo diario con el propósito misional de la organización.",
    },
  },
];

export const QUESTIONS: Question[] = [
  // Liderazgo
  { id: 1, dimension: "liderazgo", text: "Mi jefe directo me comunica claramente lo que se espera de mi trabajo." },
  { id: 2, dimension: "liderazgo", text: "Los líderes de la organización toman decisiones de manera justa y transparente." },
  { id: 3, dimension: "liderazgo", text: "Mi superior me apoya cuando enfrento dificultades en el trabajo." },
  { id: 4, dimension: "liderazgo", text: "Los líderes generan confianza y credibilidad en el equipo." },
  { id: 5, dimension: "liderazgo", text: "Mi jefe valora y toma en cuenta mis ideas y sugerencias." },

  // Comunicación
  { id: 6, dimension: "comunicacion", text: "La información que necesito para hacer mi trabajo llega de manera clara y oportuna." },
  { id: 7, dimension: "comunicacion", text: "Existe comunicación abierta entre los diferentes niveles de la organización." },
  { id: 8, dimension: "comunicacion", text: "Cuando hay cambios importantes, se me informa con anticipación." },
  { id: 9, dimension: "comunicacion", text: "Puedo expresar mis opiniones libremente sin temor a represalias." },
  { id: 10, dimension: "comunicacion", text: "Los canales de comunicación interna (reuniones, circulares, etc.) son efectivos y accesibles." },

  // Trabajo en Equipo
  { id: 11, dimension: "trabajo_en_equipo", text: "Mi equipo trabaja de manera coordinada para alcanzar los objetivos comunes." },
  { id: 12, dimension: "trabajo_en_equipo", text: "Existe un ambiente de respeto y compañerismo entre los miembros del equipo." },
  { id: 13, dimension: "trabajo_en_equipo", text: "Cuando surge un problema, el equipo se une para encontrar soluciones." },
  { id: 14, dimension: "trabajo_en_equipo", text: "Las responsabilidades y tareas se distribuyen de forma equitativa en mi equipo." },
  { id: 15, dimension: "trabajo_en_equipo", text: "Puedo contar con el apoyo de mis compañeros cuando lo necesito." },

  // Motivación y Reconocimiento
  { id: 16, dimension: "motivacion", text: "Me siento motivado/a para dar lo mejor de mí en mi trabajo." },
  { id: 17, dimension: "motivacion", text: "La organización reconoce y valora el buen desempeño de sus colaboradores." },
  { id: 18, dimension: "motivacion", text: "Siento que mi trabajo tiene un propósito e impacto positivo en la organización." },
  { id: 19, dimension: "motivacion", text: "Tengo oportunidades de desarrollo y crecimiento profesional en esta organización." },
  { id: 20, dimension: "motivacion", text: "Estoy satisfecho/a con las condiciones generales de trabajo que me ofrece la organización." },
];

export const LIKERT_LABELS: Record<number, string> = {
  1: "Totalmente en desacuerdo",
  2: "En desacuerdo",
  3: "Neutral",
  4: "De acuerdo",
  5: "Totalmente de acuerdo",
};
