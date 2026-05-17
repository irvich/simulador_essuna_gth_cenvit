export type ChoiceKey = "A" | "B" | "C" | "D";

export interface Choice {
  key: ChoiceKey;
  text: string;
}

export interface Question {
  id: number;
  topic: string;
  question: string;
  answer: ChoiceKey;
  choices: Choice[];
}

export const QUESTIONS: Question[] = [
  {
    "id": 1,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "En una institución pública, la planificación del talento humano cumple principalmente la función de:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Sustituir los procesos de selección por decisiones discrecionales."
      },
      {
        "key": "B",
        "text": "Anticipar la cantidad y calidad de personal requerido para cumplir la misión institucional."
      },
      {
        "key": "C",
        "text": "Eliminar la necesidad de evaluar el desempeño del personal."
      },
      {
        "key": "D",
        "text": "Garantizar ascensos automáticos por antigüedad."
      }
    ]
  },
  {
    "id": 2,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "Cuando se afirma que la planificación debe ubicar a la persona correcta en el puesto correcto y en el momento oportuno, se está resaltando la relación entre:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Remuneración, vacaciones y permisos."
      },
      {
        "key": "B",
        "text": "Sanción disciplinaria, destitución y cesación."
      },
      {
        "key": "C",
        "text": "Necesidad institucional, perfil de puesto y oportunidad de provisión."
      },
      {
        "key": "D",
        "text": "Antigüedad, parentesco y disponibilidad personal."
      }
    ]
  },
  {
    "id": 3,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "La descripción de puestos se diferencia de la valoración de puestos porque la primera:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Describe funciones, misión, responsabilidades y productos del cargo."
      },
      {
        "key": "B",
        "text": "Evalúa el comportamiento personal del ocupante."
      },
      {
        "key": "C",
        "text": "Determina el salario final de cada servidor."
      },
      {
        "key": "D",
        "text": "Decide la separación del personal por bajo rendimiento."
      }
    ]
  },
  {
    "id": 4,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "La valoración de puestos debe centrarse en:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Las necesidades económicas del ocupante del cargo."
      },
      {
        "key": "B",
        "text": "La simpatía del jefe inmediato hacia el servidor."
      },
      {
        "key": "C",
        "text": "El valor relativo del puesto según responsabilidad, complejidad e impacto."
      },
      {
        "key": "D",
        "text": "La cantidad de años que una persona lleva en la institución."
      }
    ]
  },
  {
    "id": 5,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "Un perfil de puesto técnicamente elaborado debe contener, como mínimo:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Únicamente la denominación del cargo y el sueldo."
      },
      {
        "key": "B",
        "text": "Formación, experiencia, conocimientos, competencias y condiciones del puesto."
      },
      {
        "key": "C",
        "text": "Datos familiares, referencias personales y preferencias políticas."
      },
      {
        "key": "D",
        "text": "Solo las funciones que el servidor desea realizar."
      }
    ]
  },
  {
    "id": 6,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "El método de valoración por puntos es considerado más técnico porque:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Asigna puntajes a factores previamente definidos del puesto."
      },
      {
        "key": "B",
        "text": "Permite valorar únicamente la antigüedad del servidor."
      },
      {
        "key": "C",
        "text": "Depende exclusivamente del criterio verbal del jefe inmediato."
      },
      {
        "key": "D",
        "text": "Evita describir las funciones del cargo."
      }
    ]
  },
  {
    "id": 7,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "La reclasificación de un puesto de personal fijo se justifica cuando:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "El jefe desea premiar informalmente a un colaborador."
      },
      {
        "key": "B",
        "text": "Se pretende evitar un concurso de méritos y oposición."
      },
      {
        "key": "C",
        "text": "Existen cambios reales, permanentes y verificables en funciones, responsabilidad o complejidad."
      },
      {
        "key": "D",
        "text": "El servidor solicita un aumento salarial sin cambios en sus funciones."
      }
    ]
  },
  {
    "id": 8,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "En el levantamiento de perfiles de puesto, la fuente más adecuada de información es:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Rumores internos sobre el cargo."
      },
      {
        "key": "B",
        "text": "Únicamente el nombre del puesto en el distributivo."
      },
      {
        "key": "C",
        "text": "Análisis de funciones, procesos, productos, entrevistas y normativa aplicable."
      },
      {
        "key": "D",
        "text": "Preferencias personales del candidato."
      }
    ]
  },
  {
    "id": 9,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "La clasificación de puestos aporta a la gestión institucional porque:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Ordena los cargos por niveles, familias o grupos ocupacionales para facilitar decisiones de talento humano."
      },
      {
        "key": "B",
        "text": "Sustituye el régimen disciplinario."
      },
      {
        "key": "C",
        "text": "Permite nombrar personal sin requisitos."
      },
      {
        "key": "D",
        "text": "Elimina la necesidad de capacitación."
      }
    ]
  },
  {
    "id": 10,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "Desde el enfoque de Chiavenato, la planificación de talento humano se relaciona con:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "La improvisación administrativa para cubrir emergencias."
      },
      {
        "key": "B",
        "text": "La eliminación de competencias laborales."
      },
      {
        "key": "C",
        "text": "La reducción del talento humano a un simple gasto contable."
      },
      {
        "key": "D",
        "text": "La anticipación y organización de personas necesarias para alcanzar objetivos."
      }
    ]
  },
  {
    "id": 11,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "En el sector público, una vacante orgánica debe entenderse como:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Cualquier necesidad informal de ayuda en una oficina."
      },
      {
        "key": "B",
        "text": "Un puesto creado verbalmente por el jefe de área."
      },
      {
        "key": "C",
        "text": "Una asignación temporal sin relación con la estructura."
      },
      {
        "key": "D",
        "text": "Un espacio formal dentro de la estructura institucional, normalmente vinculado a financiamiento y perfil."
      }
    ]
  },
  {
    "id": 12,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "Las competencias laborales integran principalmente:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Solo títulos académicos."
      },
      {
        "key": "B",
        "text": "Preferencias personales y afinidades sociales."
      },
      {
        "key": "C",
        "text": "Conocimientos, habilidades, actitudes y comportamientos aplicables al desempeño."
      },
      {
        "key": "D",
        "text": "Únicamente fuerza física. II. Reclutamiento y selección de personal"
      }
    ]
  },
  {
    "id": 13,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "La diferencia central entre reclutamiento y selección es que el reclutamiento:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Atrae candidatos potenciales, mientras la selección escoge al más idóneo."
      },
      {
        "key": "B",
        "text": "Clasifica puestos, mientras la selección elimina perfiles."
      },
      {
        "key": "C",
        "text": "Califica el desempeño anual, mientras la selección paga remuneraciones."
      },
      {
        "key": "D",
        "text": "Sanciona faltas, mientras la selección concede permisos."
      }
    ]
  },
  {
    "id": 14,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "Una ventaja del reclutamiento interno es que:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Elimina la necesidad de verificar requisitos."
      },
      {
        "key": "B",
        "text": "Aprovecha experiencia institucional y puede fortalecer la motivación del personal."
      },
      {
        "key": "C",
        "text": "Impide la carrera administrativa."
      },
      {
        "key": "D",
        "text": "Siempre garantiza innovación externa."
      }
    ]
  },
  {
    "id": 15,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "El reclutamiento externo resulta útil cuando la institución:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Pretende anular el perfil del puesto."
      },
      {
        "key": "B",
        "text": "Necesita incorporar competencias nuevas que no se encuentran disponibles internamente."
      },
      {
        "key": "C",
        "text": "Desea evitar toda competencia entre aspirantes."
      },
      {
        "key": "D",
        "text": "Busca nombrar personal sin proceso técnico."
      }
    ]
  },
  {
    "id": 16,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "En un proceso de selección, la revisión documental sirve para:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Determinar automáticamente la idoneidad psicológica."
      },
      {
        "key": "B",
        "text": "Comprobar el cumplimiento de requisitos formales y habilitantes."
      },
      {
        "key": "C",
        "text": "Evitar entrevistas y pruebas técnicas."
      },
      {
        "key": "D",
        "text": "Reemplazar todas las pruebas posteriores."
      }
    ]
  },
  {
    "id": 17,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "Las pruebas psicotécnicas se aplican principalmente para evaluar:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Únicamente la capacidad económica del postulante."
      },
      {
        "key": "B",
        "text": "La antigüedad en otra institución."
      },
      {
        "key": "C",
        "text": "Aptitudes, rasgos, razonamiento, competencias o características psicológicas relacionadas con el puesto."
      },
      {
        "key": "D",
        "text": "El parentesco con autoridades."
      }
    ]
  },
  {
    "id": 18,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "En una entrevista por competencias, el método STAR permite analizar:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Sueldo, tareas, ascenso y retiro."
      },
      {
        "key": "B",
        "text": "Sanción, trámite, apelación y recurso."
      },
      {
        "key": "C",
        "text": "Situación, tarea, acción y resultado de una experiencia concreta."
      },
      {
        "key": "D",
        "text": "Sector, tiempo, archivo y registro."
      }
    ]
  },
  {
    "id": 19,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "Una pregunta adecuada para entrevista por competencias sería:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "¿Le cae bien el jefe de la institución?"
      },
      {
        "key": "B",
        "text": "¿Cuál es su signo zodiacal?"
      },
      {
        "key": "C",
        "text": "¿Aceptaría cualquier sueldo sin preguntar?"
      },
      {
        "key": "D",
        "text": "Relate una situación en la que resolvió un conflicto bajo presión y explique qué hizo."
      }
    ]
  },
  {
    "id": 20,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "La toma de decisión en selección debe sustentarse en:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Impresiones personales no documentadas."
      },
      {
        "key": "B",
        "text": "Afinidad política o social."
      },
      {
        "key": "C",
        "text": "Evidencias comparables frente al perfil, resultados de pruebas y entrevistas técnicas."
      },
      {
        "key": "D",
        "text": "Recomendaciones familiares."
      }
    ]
  },
  {
    "id": 21,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "En el ingreso a Fuerzas Armadas, las pruebas médicas, físicas y psicológicas son relevantes porque:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Sustituyen la necesidad de valores institucionales."
      },
      {
        "key": "B",
        "text": "Son solo requisitos decorativos."
      },
      {
        "key": "C",
        "text": "Permiten omitir la verificación documental."
      },
      {
        "key": "D",
        "text": "La carrera militar exige aptitud integral para la formación, disciplina y actos del servicio."
      }
    ]
  },
  {
    "id": 22,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "El entrevistador en un proceso técnico de selección debe:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Seleccionar al candidato con mayor simpatía personal."
      },
      {
        "key": "B",
        "text": "Evitar profundizar en competencias."
      },
      {
        "key": "C",
        "text": "Improvisar preguntas diferentes sin relación con el perfil."
      },
      {
        "key": "D",
        "text": "Mantener objetividad, estructurar preguntas y registrar evidencias relevantes."
      }
    ]
  },
  {
    "id": 23,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "La corporalidad del candidato durante una entrevista debe interpretarse como:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "La única prueba válida para decidir la selección."
      },
      {
        "key": "B",
        "text": "Una forma de reemplazar la entrevista estructurada."
      },
      {
        "key": "C",
        "text": "Un elemento irrelevante en cualquier caso."
      },
      {
        "key": "D",
        "text": "Una evidencia complementaria que debe contrastarse con otros datos."
      }
    ]
  },
  {
    "id": 24,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "Una técnica adecuada para reducir sesgos durante entrevistas consiste en:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Usar una rúbrica o guía estructurada de evaluación."
      },
      {
        "key": "B",
        "text": "Preguntar solo aspectos personales ajenos al puesto."
      },
      {
        "key": "C",
        "text": "Cambiar los criterios según cada candidato."
      },
      {
        "key": "D",
        "text": "Evitar tomar notas."
      }
    ]
  },
  {
    "id": 25,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "La motivación en selección debe analizarse porque permite identificar:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Si el postulante conoce la misión, se ajusta al cargo y muestra compromiso con la institución."
      },
      {
        "key": "B",
        "text": "Si puede escoger libremente sus superiores."
      },
      {
        "key": "C",
        "text": "Si el postulante tiene más amistades internas."
      },
      {
        "key": "D",
        "text": "Si desea evitar toda exigencia laboral. III. Capacitación, formación, desarrollo e inducción"
      }
    ]
  },
  {
    "id": 26,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "La inducción de personal tiene como finalidad principal:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Integrar al nuevo miembro a la institución, su cultura, normas, funciones y responsabilidades."
      },
      {
        "key": "B",
        "text": "Separar al trabajador antes de iniciar funciones."
      },
      {
        "key": "C",
        "text": "Evitar la capacitación técnica."
      },
      {
        "key": "D",
        "text": "Eliminar el período de adaptación."
      }
    ]
  },
  {
    "id": 27,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "La capacitación se diferencia del desarrollo porque la capacitación se orienta principalmente a:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Mejorar competencias necesarias para el desempeño actual."
      },
      {
        "key": "B",
        "text": "Sustituir la evaluación del desempeño."
      },
      {
        "key": "C",
        "text": "Asignar grados militares."
      },
      {
        "key": "D",
        "text": "Eliminar todo plan de carrera."
      }
    ]
  },
  {
    "id": 28,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "El desarrollo de personal se enfoca especialmente en:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Corregir exclusivamente errores de nómina."
      },
      {
        "key": "B",
        "text": "Preparar a la persona para responsabilidades futuras y crecimiento profesional."
      },
      {
        "key": "C",
        "text": "Evitar la formación institucional."
      },
      {
        "key": "D",
        "text": "Suspender beneficios laborales."
      }
    ]
  },
  {
    "id": 29,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "El diagnóstico de necesidades de capacitación debe partir de:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Brechas entre competencias requeridas y desempeño real observado."
      },
      {
        "key": "B",
        "text": "Preferencias personales del capacitador."
      },
      {
        "key": "C",
        "text": "Temas de moda sin relación con el cargo."
      },
      {
        "key": "D",
        "text": "Cursos disponibles sin análisis institucional."
      }
    ]
  },
  {
    "id": 30,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "Un objetivo de capacitación bien formulado debe indicar:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Únicamente la fecha de inicio."
      },
      {
        "key": "B",
        "text": "Las preferencias personales del grupo."
      },
      {
        "key": "C",
        "text": "Qué competencia o resultado se espera alcanzar y bajo qué criterio verificable."
      },
      {
        "key": "D",
        "text": "Solo el nombre del instructor."
      }
    ]
  },
  {
    "id": 31,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "En el diseño de un programa de capacitación, deben considerarse:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Solo el número de diapositivas."
      },
      {
        "key": "B",
        "text": "Objetivos, contenidos, metodología, recursos, duración y evaluación."
      },
      {
        "key": "C",
        "text": "Únicamente el lugar del evento."
      },
      {
        "key": "D",
        "text": "La afinidad del capacitador con los participantes."
      }
    ]
  },
  {
    "id": 32,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "Un costo directo de capacitación puede ser:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Honorarios del instructor, materiales o alquiler de aula."
      },
      {
        "key": "B",
        "text": "Pérdida de tiempo no registrada por falta de planificación."
      },
      {
        "key": "C",
        "text": "Rumores internos del personal."
      },
      {
        "key": "D",
        "text": "Rotación de autoridades."
      }
    ]
  },
  {
    "id": 33,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "Un costo indirecto de capacitación se relaciona con:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "El color del material didáctico."
      },
      {
        "key": "B",
        "text": "La firma del instructor únicamente."
      },
      {
        "key": "C",
        "text": "El tiempo en que el servidor se ausenta temporalmente de sus funciones para formarse."
      },
      {
        "key": "D",
        "text": "El nombre del certificado."
      }
    ]
  },
  {
    "id": 34,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "Evaluar la transferencia de la capacitación significa verificar si:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "El certificado fue impreso a color."
      },
      {
        "key": "B",
        "text": "El instructor habló rápido."
      },
      {
        "key": "C",
        "text": "El aula fue suficientemente grande."
      },
      {
        "key": "D",
        "text": "El participante aplica en su puesto lo aprendido durante el proceso formativo."
      }
    ]
  },
  {
    "id": 35,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "En la formación militar, además del conocimiento técnico, es indispensable fortalecer:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Aspectos recreativos sin relación con la misión."
      },
      {
        "key": "B",
        "text": "Únicamente preferencias individuales."
      },
      {
        "key": "C",
        "text": "Solo habilidades comerciales."
      },
      {
        "key": "D",
        "text": "Disciplina, valores, doctrina, liderazgo y espíritu de cuerpo."
      }
    ]
  },
  {
    "id": 36,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "Una desventaja de capacitar sin diagnóstico previo es que:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Se pueden invertir recursos en temas que no responden a necesidades reales."
      },
      {
        "key": "B",
        "text": "Reduce todo costo institucional."
      },
      {
        "key": "C",
        "text": "Garantiza ascensos inmediatos."
      },
      {
        "key": "D",
        "text": "Siempre mejora automáticamente el desempeño."
      }
    ]
  },
  {
    "id": 37,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "El impacto de la capacitación debe analizarse porque permite determinar:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Si el curso fue más largo que otros."
      },
      {
        "key": "B",
        "text": "Si el capacitador usó muchas imágenes."
      },
      {
        "key": "C",
        "text": "Si el proceso aportó a resultados, desempeño, productividad, calidad o servicio."
      },
      {
        "key": "D",
        "text": "Si todos los participantes se hicieron amigos. IV. Evaluación del desempeño"
      }
    ]
  },
  {
    "id": 38,
    "topic": "IV. Evaluación del desempeño",
    "question": "La evaluación del desempeño es un proceso que permite:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Eliminar el perfil del puesto."
      },
      {
        "key": "B",
        "text": "Medir de forma sistemática el cumplimiento de funciones, resultados y competencias."
      },
      {
        "key": "C",
        "text": "Decidir sin evidencias."
      },
      {
        "key": "D",
        "text": "Reemplazar la planificación institucional."
      }
    ]
  },
  {
    "id": 39,
    "topic": "IV. Evaluación del desempeño",
    "question": "La importancia de la evaluación del desempeño radica en que:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "No requiere indicadores."
      },
      {
        "key": "B",
        "text": "Debe aplicarse solo cuando existe conflicto."
      },
      {
        "key": "C",
        "text": "Sirve únicamente para sancionar."
      },
      {
        "key": "D",
        "text": "Permite retroalimentar, mejorar, reconocer méritos y tomar decisiones de talento humano."
      }
    ]
  },
  {
    "id": 40,
    "topic": "IV. Evaluación del desempeño",
    "question": "La evaluación de período de prueba se diferencia de la periódica porque:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Elimina la retroalimentación."
      },
      {
        "key": "B",
        "text": "Verifica la adaptación inicial y cumplimiento esperado al ingresar o ascender."
      },
      {
        "key": "C",
        "text": "No requiere relación con el puesto."
      },
      {
        "key": "D",
        "text": "Se aplica solo al personal jubilado."
      }
    ]
  },
  {
    "id": 41,
    "topic": "IV. Evaluación del desempeño",
    "question": "El perfil óptimo en evaluación del desempeño sirve para:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Comparar el desempeño real con el estándar esperado del puesto."
      },
      {
        "key": "B",
        "text": "Evitar indicadores de gestión."
      },
      {
        "key": "C",
        "text": "Reemplazar el contrato o nombramiento."
      },
      {
        "key": "D",
        "text": "Determinar amistades internas."
      }
    ]
  },
  {
    "id": 42,
    "topic": "IV. Evaluación del desempeño",
    "question": "Un indicador de gestión adecuado debe ser:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Inmodificable aunque cambien las funciones."
      },
      {
        "key": "B",
        "text": "General, ambiguo y sin evidencia."
      },
      {
        "key": "C",
        "text": "Medible, pertinente, verificable y vinculado al objetivo o producto del puesto."
      },
      {
        "key": "D",
        "text": "Basado únicamente en opinión personal."
      }
    ]
  },
  {
    "id": 43,
    "topic": "IV. Evaluación del desempeño",
    "question": "La planificación de la evaluación de desempeño incluye:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Definir criterios, cronograma, responsables, instrumentos e indicadores."
      },
      {
        "key": "B",
        "text": "Aplicar calificaciones sin avisar ni documentar."
      },
      {
        "key": "C",
        "text": "Usar únicamente percepciones subjetivas."
      },
      {
        "key": "D",
        "text": "Evitar comunicación a los evaluados."
      }
    ]
  },
  {
    "id": 44,
    "topic": "IV. Evaluación del desempeño",
    "question": "La ejecución de una evaluación de desempeño debe apoyarse en:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Preferencias personales del evaluador."
      },
      {
        "key": "B",
        "text": "Rumores de pasillo."
      },
      {
        "key": "C",
        "text": "Evidencias de resultados, cumplimiento de funciones y conductas observables."
      },
      {
        "key": "D",
        "text": "Información ajena al cargo."
      }
    ]
  },
  {
    "id": 45,
    "topic": "IV. Evaluación del desempeño",
    "question": "El sesgo de halo ocurre cuando el evaluador:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Contrasta evidencias del puesto."
      },
      {
        "key": "B",
        "text": "Usa indicadores objetivos."
      },
      {
        "key": "C",
        "text": "Aplica una rúbrica estructurada."
      },
      {
        "key": "D",
        "text": "Permite que una característica positiva o negativa influya indebidamente en toda la calificación."
      }
    ]
  },
  {
    "id": 46,
    "topic": "IV. Evaluación del desempeño",
    "question": "La retroalimentación posterior a la evaluación debe ser:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Únicamente verbal y sin registro cuando hay brechas."
      },
      {
        "key": "B",
        "text": "Irrelevante para el evaluado."
      },
      {
        "key": "C",
        "text": "Humillante, imprecisa y sin datos."
      },
      {
        "key": "D",
        "text": "Clara, respetuosa, basada en evidencias y orientada a mejora."
      }
    ]
  },
  {
    "id": 47,
    "topic": "IV. Evaluación del desempeño",
    "question": "Los resultados de la evaluación del desempeño pueden utilizarse para:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Planes de mejora, capacitación, reconocimiento, movilidad o decisiones administrativas."
      },
      {
        "key": "B",
        "text": "Eliminar automáticamente derechos laborales."
      },
      {
        "key": "C",
        "text": "Sustituir el régimen jurídico aplicable."
      },
      {
        "key": "D",
        "text": "Modificar funciones sin procedimiento."
      }
    ]
  },
  {
    "id": 48,
    "topic": "IV. Evaluación del desempeño",
    "question": "La evaluación por competencias se centra en:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Solo cumplimiento de horario."
      },
      {
        "key": "B",
        "text": "Conductas observables relacionadas con conocimientos, habilidades y actitudes requeridas."
      },
      {
        "key": "C",
        "text": "Únicamente número de años de servicio."
      },
      {
        "key": "D",
        "text": "Aspectos personales sin relación laboral."
      }
    ]
  },
  {
    "id": 49,
    "topic": "IV. Evaluación del desempeño",
    "question": "La evaluación por resultados mide principalmente:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Preferencias externas al trabajo."
      },
      {
        "key": "B",
        "text": "Origen familiar del servidor."
      },
      {
        "key": "C",
        "text": "Carisma personal sin evidencias."
      },
      {
        "key": "D",
        "text": "Metas, productos, indicadores y cumplimiento de objetivos."
      }
    ]
  },
  {
    "id": 50,
    "topic": "IV. Evaluación del desempeño",
    "question": "Un plan de mejora posterior a una evaluación debe contener:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "La eliminación del puesto."
      },
      {
        "key": "B",
        "text": "Solo una advertencia informal."
      },
      {
        "key": "C",
        "text": "Brechas identificadas, acciones, responsables, plazos y criterios de seguimiento."
      },
      {
        "key": "D",
        "text": "Una sanción automática sin análisis. V. Ley Orgánica del Servicio Público y administración pública"
      }
    ]
  },
  {
    "id": 51,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "La LOSEP regula principalmente:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Únicamente contratos mercantiles privados."
      },
      {
        "key": "B",
        "text": "Solo el régimen penal militar."
      },
      {
        "key": "C",
        "text": "Exclusivamente comercio exterior."
      },
      {
        "key": "D",
        "text": "El servicio público, la carrera administrativa, talento humano, remuneraciones y régimen disciplinario del sector público."
      }
    ]
  },
  {
    "id": 52,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "Se considera servidora o servidor público a la persona que:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Realiza actividades informales sin vínculo institucional."
      },
      {
        "key": "B",
        "text": "No tiene relación con el Estado."
      },
      {
        "key": "C",
        "text": "Trabaja únicamente en empresas privadas familiares."
      },
      {
        "key": "D",
        "text": "Trabaja, presta servicios o ejerce cargo, función o dignidad dentro del sector público."
      }
    ]
  },
  {
    "id": 53,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "El ingreso a un puesto de carrera en el servicio público se fundamenta principalmente en:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Concurso de méritos y oposición, salvo excepciones legales."
      },
      {
        "key": "B",
        "text": "Designación familiar directa."
      },
      {
        "key": "C",
        "text": "Sorteo entre interesados."
      },
      {
        "key": "D",
        "text": "Recomendación política sin requisitos."
      }
    ]
  },
  {
    "id": 54,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "El principio de mérito en el servicio público exige que:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "La selección se base en requisitos, capacidades, evaluación objetiva y transparencia."
      },
      {
        "key": "B",
        "text": "Se favorezca al candidato más cercano al evaluador."
      },
      {
        "key": "C",
        "text": "Se priorice siempre el parentesco."
      },
      {
        "key": "D",
        "text": "Se omita toda evaluación."
      }
    ]
  },
  {
    "id": 55,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "El nepotismo se configura cuando una autoridad:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Convoca a concurso público."
      },
      {
        "key": "B",
        "text": "Evalúa a servidores con indicadores."
      },
      {
        "key": "C",
        "text": "Nombra o contrata a parientes dentro de los grados prohibidos por la ley en la misma entidad o bajo su influencia."
      },
      {
        "key": "D",
        "text": "Aprueba planes de capacitación."
      }
    ]
  },
  {
    "id": 56,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "Una inhabilidad para ejercer cargo público es:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Un tipo de licencia remunerada."
      },
      {
        "key": "B",
        "text": "Una competencia técnica deseable."
      },
      {
        "key": "C",
        "text": "Una forma de capacitación."
      },
      {
        "key": "D",
        "text": "Una condición legal que impide ocupar o continuar en un puesto público."
      }
    ]
  },
  {
    "id": 57,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "Una prohibición para el servidor público se refiere a:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Beneficios irrenunciables."
      },
      {
        "key": "B",
        "text": "Actividades obligatorias de capacitación."
      },
      {
        "key": "C",
        "text": "Conductas que la ley impide realizar por afectar la función pública."
      },
      {
        "key": "D",
        "text": "Estructuras de puestos."
      }
    ]
  },
  {
    "id": 58,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "Las licencias, permisos y comisiones de servicio deben concederse:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Conforme a causales, requisitos, tiempo y procedimiento previstos en la normativa."
      },
      {
        "key": "B",
        "text": "Sin considerar continuidad del servicio."
      },
      {
        "key": "C",
        "text": "Por simple acuerdo verbal sin registro."
      },
      {
        "key": "D",
        "text": "Siempre de forma indefinida."
      }
    ]
  },
  {
    "id": 59,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "El traslado, traspaso o cambio administrativo debe respetar:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "La eliminación de la UATH."
      },
      {
        "key": "B",
        "text": "Necesidad institucional, normativa aplicable, motivación y derechos del servidor."
      },
      {
        "key": "C",
        "text": "Criterios de castigo sin procedimiento."
      },
      {
        "key": "D",
        "text": "Únicamente la voluntad informal de un compañero."
      }
    ]
  },
  {
    "id": 60,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "El régimen disciplinario en la LOSEP busca:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Corregir y sancionar incumplimientos respetando debido proceso."
      },
      {
        "key": "B",
        "text": "Sustituir toda evaluación de desempeño."
      },
      {
        "key": "C",
        "text": "Eliminar el derecho a la defensa."
      },
      {
        "key": "D",
        "text": "Permitir sanciones arbitrarias."
      }
    ]
  },
  {
    "id": 61,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "La cesación de funciones se refiere a:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "El inicio obligatorio de vacaciones."
      },
      {
        "key": "B",
        "text": "Una técnica de entrevista."
      },
      {
        "key": "C",
        "text": "Un método de valoración de puestos."
      },
      {
        "key": "D",
        "text": "La terminación legal de la relación del servidor con la institución pública."
      }
    ]
  },
  {
    "id": 62,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "La Unidad de Administración del Talento Humano o su equivalente tiene como rol:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Sustituir a todos los órganos de control."
      },
      {
        "key": "B",
        "text": "Eliminar registros de personal."
      },
      {
        "key": "C",
        "text": "Nombrar personal sin autoridad competente."
      },
      {
        "key": "D",
        "text": "Gestionar técnicamente procesos de talento humano conforme a la ley y políticas institucionales."
      }
    ]
  },
  {
    "id": 63,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "El subsistema de planificación del talento humano en el sector público permite:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Reemplazar la evaluación del desempeño."
      },
      {
        "key": "B",
        "text": "Evitar toda justificación técnica."
      },
      {
        "key": "C",
        "text": "Crear puestos sin financiamiento ni perfil."
      },
      {
        "key": "D",
        "text": "Determinar necesidades de personal según estructura, procesos, presupuesto y objetivos."
      }
    ]
  },
  {
    "id": 64,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "El subsistema de clasificación de puestos permite:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Conceder vacaciones automáticamente."
      },
      {
        "key": "B",
        "text": "Ordenar los cargos conforme a funciones, responsabilidades, requisitos y grupos ocupacionales."
      },
      {
        "key": "C",
        "text": "Aplicar sanciones penales."
      },
      {
        "key": "D",
        "text": "Designar autoridades por parentesco."
      }
    ]
  },
  {
    "id": 65,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "La formación y capacitación en el régimen del servicio público deben orientarse a:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Mejorar competencias, calidad del servicio y cumplimiento de objetivos institucionales."
      },
      {
        "key": "B",
        "text": "Evitar la profesionalización."
      },
      {
        "key": "C",
        "text": "Sustituir las funciones institucionales."
      },
      {
        "key": "D",
        "text": "Aumentar cursos sin relación con el puesto. VI. Código del Trabajo"
      }
    ]
  },
  {
    "id": 66,
    "topic": "VI. Código del Trabajo",
    "question": "El Código del Trabajo regula principalmente:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Únicamente procesos electorales."
      },
      {
        "key": "B",
        "text": "Relaciones laborales entre empleadores y trabajadores, incluyendo derechos y obligaciones."
      },
      {
        "key": "C",
        "text": "Solo concursos de méritos y oposición."
      },
      {
        "key": "D",
        "text": "Exclusivamente la carrera militar."
      }
    ]
  },
  {
    "id": 67,
    "topic": "VI. Código del Trabajo",
    "question": "En términos generales, el contrato de trabajo implica:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Servicio gratuito sin subordinación."
      },
      {
        "key": "B",
        "text": "Prestación de servicios lícitos y personales, dependencia y remuneración."
      },
      {
        "key": "C",
        "text": "Nombramiento militar por grado."
      },
      {
        "key": "D",
        "text": "Relación comercial sin prestación personal."
      }
    ]
  },
  {
    "id": 68,
    "topic": "VI. Código del Trabajo",
    "question": "La capacidad para contratar en materia laboral se refiere a:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "El número de cursos realizados."
      },
      {
        "key": "B",
        "text": "La clasificación del riesgo laboral."
      },
      {
        "key": "C",
        "text": "La aptitud legal para obligarse válidamente en una relación de trabajo."
      },
      {
        "key": "D",
        "text": "La fuerza física del trabajador únicamente."
      }
    ]
  },
  {
    "id": 69,
    "topic": "VI. Código del Trabajo",
    "question": "Uno de los efectos principales del contrato de trabajo es:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Anular descansos obligatorios."
      },
      {
        "key": "B",
        "text": "Eliminar la obligación de remunerar."
      },
      {
        "key": "C",
        "text": "Convertir automáticamente al trabajador en militar."
      },
      {
        "key": "D",
        "text": "Generar derechos y obligaciones para empleador y trabajador."
      }
    ]
  },
  {
    "id": 70,
    "topic": "VI. Código del Trabajo",
    "question": "La jornada máxima de trabajo busca:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Eliminar vacaciones."
      },
      {
        "key": "B",
        "text": "Limitar razonablemente el tiempo de prestación de servicios y proteger la salud del trabajador."
      },
      {
        "key": "C",
        "text": "Sustituir la remuneración."
      },
      {
        "key": "D",
        "text": "Permitir trabajo indefinido sin descanso."
      }
    ]
  },
  {
    "id": 71,
    "topic": "VI. Código del Trabajo",
    "question": "Los descansos obligatorios y vacaciones tienen como finalidad:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Proteger la recuperación física y mental del trabajador y garantizar condiciones dignas."
      },
      {
        "key": "B",
        "text": "Eliminar la continuidad laboral."
      },
      {
        "key": "C",
        "text": "Impedir la productividad."
      },
      {
        "key": "D",
        "text": "Reducir arbitrariamente la remuneración."
      }
    ]
  },
  {
    "id": 72,
    "topic": "VI. Código del Trabajo",
    "question": "Los salarios, sueldos, bonificaciones y remuneraciones adicionales forman parte de:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Las sanciones disciplinarias."
      },
      {
        "key": "B",
        "text": "La compensación económica que recibe el trabajador por su relación laboral."
      },
      {
        "key": "C",
        "text": "Los grados militares."
      },
      {
        "key": "D",
        "text": "Los métodos de entrevista."
      }
    ]
  },
  {
    "id": 73,
    "topic": "VI. Código del Trabajo",
    "question": "La terminación del contrato de trabajo debe responder a:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Decisiones informales sin sustento."
      },
      {
        "key": "B",
        "text": "Preferencias personales sin obligación legal."
      },
      {
        "key": "C",
        "text": "Causales y procedimientos previstos en la normativa laboral."
      },
      {
        "key": "D",
        "text": "Una evaluación psicológica aislada."
      }
    ]
  },
  {
    "id": 74,
    "topic": "VI. Código del Trabajo",
    "question": "La diferencia general entre desahucio y despido es que:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "El desahucio siempre es una sanción penal."
      },
      {
        "key": "B",
        "text": "El despido solo existe en la carrera militar."
      },
      {
        "key": "C",
        "text": "El desahucio es aviso formal de terminación en casos permitidos; el despido es terminación unilateral del empleador."
      },
      {
        "key": "D",
        "text": "Ambos son exactamente lo mismo en todo caso."
      }
    ]
  },
  {
    "id": 75,
    "topic": "VI. Código del Trabajo",
    "question": "El fondo de reserva se relaciona con:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Una prueba de selección."
      },
      {
        "key": "B",
        "text": "Un beneficio económico generado por el tiempo de servicio, conforme a la normativa aplicable."
      },
      {
        "key": "C",
        "text": "Un tipo de riesgo físico."
      },
      {
        "key": "D",
        "text": "La estructura de grados navales. VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas"
      }
    ]
  },
  {
    "id": 76,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "La Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas regula:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Únicamente contratos privados de comercio."
      },
      {
        "key": "B",
        "text": "Carrera militar, selección, formación, grados, situación militar, disciplina y separación del personal militar."
      },
      {
        "key": "C",
        "text": "Solo vacaciones del personal civil."
      },
      {
        "key": "D",
        "text": "Exclusivamente impuestos municipales."
      }
    ]
  },
  {
    "id": 77,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "Los principios y valores institucionales militares cumplen la función de:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Eliminar la jerarquía."
      },
      {
        "key": "B",
        "text": "Sustituir toda norma jurídica."
      },
      {
        "key": "C",
        "text": "Permitir decisiones arbitrarias."
      },
      {
        "key": "D",
        "text": "Orientar la conducta individual y colectiva hacia la misión, disciplina y fortalecimiento institucional."
      }
    ]
  },
  {
    "id": 78,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "La disciplina militar debe entenderse como:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Ausencia de responsabilidad individual."
      },
      {
        "key": "B",
        "text": "Libertad absoluta sin subordinación."
      },
      {
        "key": "C",
        "text": "Obediencia ciega a cualquier orden ilegal."
      },
      {
        "key": "D",
        "text": "Observancia de la Constitución, leyes, reglamentos, jerarquía y órdenes legítimas relacionadas con el servicio."
      }
    ]
  },
  {
    "id": 79,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "El honor militar se vincula principalmente con:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Beneficio personal por encima de la misión."
      },
      {
        "key": "B",
        "text": "Ausencia de valores profesionales."
      },
      {
        "key": "C",
        "text": "Evasión de responsabilidades."
      },
      {
        "key": "D",
        "text": "Conducta recta, coherencia en el cumplimiento del deber y dignidad institucional."
      }
    ]
  },
  {
    "id": 80,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "La lealtad en el ámbito militar implica fidelidad hacia:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Grupos informales externos."
      },
      {
        "key": "B",
        "text": "Beneficios económicos particulares."
      },
      {
        "key": "C",
        "text": "La Patria, la institución, superiores, pares y subordinados, dentro del marco legal."
      },
      {
        "key": "D",
        "text": "Intereses personales contrarios a la misión."
      }
    ]
  },
  {
    "id": 81,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "El personal militar en formación comprende:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Únicamente servidores civiles de nombramiento permanente."
      },
      {
        "key": "B",
        "text": "Trabajadores privados bajo Código del Trabajo."
      },
      {
        "key": "C",
        "text": "Funcionarios de elección popular."
      },
      {
        "key": "D",
        "text": "Aspirantes a oficiales y aspirantes a tropa en escuelas de formación militar."
      }
    ]
  },
  {
    "id": 82,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "La clasificación general del personal militar profesional comprende principalmente:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Usuarios externos y clientes."
      },
      {
        "key": "B",
        "text": "Docentes particulares y estudiantes civiles."
      },
      {
        "key": "C",
        "text": "Oficiales y tropa."
      },
      {
        "key": "D",
        "text": "Contratistas civiles y proveedores."
      }
    ]
  },
  {
    "id": 83,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "El personal militar de arma se caracteriza porque:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Solo realiza funciones contables privadas."
      },
      {
        "key": "B",
        "text": "Carece de formación militar."
      },
      {
        "key": "C",
        "text": "No participa en la misión institucional."
      },
      {
        "key": "D",
        "text": "Su preparación fundamental le permite comandar, conducir o ejecutar operaciones militares."
      }
    ]
  },
  {
    "id": 84,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "El personal militar técnico o de servicios cumple principalmente funciones de:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Trabajo eventual sin estructura."
      },
      {
        "key": "B",
        "text": "Actividad comercial ajena a la defensa."
      },
      {
        "key": "C",
        "text": "Representación sindical obligatoria."
      },
      {
        "key": "D",
        "text": "Apoyo técnico, logístico, administrativo o de servicios a las operaciones e institución."
      }
    ]
  },
  {
    "id": 85,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "El personal militar especialista se caracteriza por:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "No formar parte del régimen militar."
      },
      {
        "key": "B",
        "text": "Aportar formación profesional o técnica específica para apoyar operaciones y actividades institucionales."
      },
      {
        "key": "C",
        "text": "No estar sujeto a disciplina."
      },
      {
        "key": "D",
        "text": "Ingresar sin requisitos académicos."
      }
    ]
  },
  {
    "id": 86,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "La situación militar se refiere a:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "El tipo de contrato privado."
      },
      {
        "key": "B",
        "text": "La ubicación geográfica sin relación jurídica."
      },
      {
        "key": "C",
        "text": "La condición jurídica y administrativa en que puede encontrarse el personal militar según la ley."
      },
      {
        "key": "D",
        "text": "El estado civil del servidor."
      }
    ]
  },
  {
    "id": 87,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "El órgano regular es importante porque:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Elimina la motivación de informes."
      },
      {
        "key": "B",
        "text": "Canaliza solicitudes y trámites siguiendo la línea jerárquica y el conducto formal."
      },
      {
        "key": "C",
        "text": "Sustituye a la normativa disciplinaria."
      },
      {
        "key": "D",
        "text": "Permite saltar siempre la cadena de mando."
      }
    ]
  },
  {
    "id": 88,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "Las prohibiciones militares buscan proteger:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Intereses personales ajenos al servicio."
      },
      {
        "key": "B",
        "text": "Improvisación administrativa."
      },
      {
        "key": "C",
        "text": "Ausencia de control institucional."
      },
      {
        "key": "D",
        "text": "Disciplina, jerarquía, imagen institucional, seguridad y cumplimiento de la misión."
      }
    ]
  },
  {
    "id": 89,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "La separación del personal militar debe responder a:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Causales, procedimientos y autoridades competentes establecidos por la normativa aplicable."
      },
      {
        "key": "B",
        "text": "Votación de compañeros sin proceso."
      },
      {
        "key": "C",
        "text": "Decisión de cualquier subordinado."
      },
      {
        "key": "D",
        "text": "Rumores o criterios informales."
      }
    ]
  },
  {
    "id": 90,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "En el régimen militar, la jerarquía permite:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Anular toda responsabilidad por órdenes ejecutadas."
      },
      {
        "key": "B",
        "text": "Sustituir la misión constitucional."
      },
      {
        "key": "C",
        "text": "Eliminar el liderazgo."
      },
      {
        "key": "D",
        "text": "Ordenar grados, responsabilidades, mando, subordinación y disciplina institucional. VIII. Seguridad e higiene laboral y riesgos laborales"
      }
    ]
  },
  {
    "id": 91,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "La seguridad laboral se orienta principalmente a:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Evitar la identificación de peligros."
      },
      {
        "key": "B",
        "text": "Incrementar riesgos sin control."
      },
      {
        "key": "C",
        "text": "Prevenir accidentes de trabajo mediante control de actos y condiciones inseguras."
      },
      {
        "key": "D",
        "text": "Eliminar equipos de protección."
      }
    ]
  },
  {
    "id": 92,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "La higiene laboral se enfoca principalmente en:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Realizar entrevistas por competencias."
      },
      {
        "key": "B",
        "text": "Sancionar sin investigación."
      },
      {
        "key": "C",
        "text": "Valorar puestos administrativos."
      },
      {
        "key": "D",
        "text": "Prevenir enfermedades profesionales mediante control de agentes físicos, químicos, biológicos o ambientales."
      }
    ]
  },
  {
    "id": 93,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "La diferencia entre peligro y riesgo es que:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "El peligro es una fuente con potencial de daño; el riesgo es la probabilidad y consecuencia de que ese daño ocurra."
      },
      {
        "key": "B",
        "text": "El riesgo siempre es inexistente."
      },
      {
        "key": "C",
        "text": "Ambos conceptos son totalmente opuestos al trabajo."
      },
      {
        "key": "D",
        "text": "El peligro solo existe en oficinas administrativas."
      }
    ]
  },
  {
    "id": 94,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "La exposición se refiere a:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "La clasificación salarial del puesto."
      },
      {
        "key": "B",
        "text": "El contacto de una persona con un peligro o factor de riesgo."
      },
      {
        "key": "C",
        "text": "El grado militar del servidor."
      },
      {
        "key": "D",
        "text": "La entrevista de salida."
      }
    ]
  },
  {
    "id": 95,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "La vulnerabilidad en seguridad laboral expresa:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "El método de reclutamiento externo."
      },
      {
        "key": "B",
        "text": "El número de vacaciones disponibles."
      },
      {
        "key": "C",
        "text": "La remuneración del trabajador."
      },
      {
        "key": "D",
        "text": "El nivel de susceptibilidad de una persona, proceso o instalación frente a un daño."
      }
    ]
  },
  {
    "id": 96,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "Una acción subestándar es:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Un permiso laboral remunerado."
      },
      {
        "key": "B",
        "text": "Una condición segura del ambiente."
      },
      {
        "key": "C",
        "text": "Una conducta insegura realizada por una persona, como no usar equipo de protección requerido."
      },
      {
        "key": "D",
        "text": "Un método de valoración de puestos."
      }
    ]
  },
  {
    "id": 97,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "Una condición subestándar es:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Una competencia laboral avanzada."
      },
      {
        "key": "B",
        "text": "Una situación insegura del ambiente, equipo o instalación, como un piso resbaloso sin señalización."
      },
      {
        "key": "C",
        "text": "Una conducta ejemplar del trabajador."
      },
      {
        "key": "D",
        "text": "Un plan de capacitación bien diseñado."
      }
    ]
  },
  {
    "id": 98,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "Un incidente laboral se diferencia del accidente porque:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "El incidente pudo causar daño, pero no necesariamente produjo lesión o pérdida."
      },
      {
        "key": "B",
        "text": "No tiene relación con prevención."
      },
      {
        "key": "C",
        "text": "Siempre produce muerte."
      },
      {
        "key": "D",
        "text": "Es igual a una enfermedad profesional crónica."
      }
    ]
  },
  {
    "id": 99,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "Las medidas de control de riesgos deben priorizarse preferentemente en:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Únicamente documentos administrativos."
      },
      {
        "key": "B",
        "text": "La fuente, luego el medio y finalmente el individuo mediante EPP cuando corresponda."
      },
      {
        "key": "C",
        "text": "Solo la señalética, sin evaluar el peligro."
      },
      {
        "key": "D",
        "text": "Solo el individuo, sin corregir la fuente."
      }
    ]
  },
  {
    "id": 100,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "La matriz de riesgos laborales sirve para:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Determinar grados militares."
      },
      {
        "key": "B",
        "text": "Reemplazar el contrato de trabajo."
      },
      {
        "key": "C",
        "text": "Seleccionar personal por entrevista."
      },
      {
        "key": "D",
        "text": "Identificar peligros, evaluar riesgos y definir medidas de control."
      }
    ]
  },
  {
    "id": 101,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "El marco legal de planificación del talento humano en el sector público exige que la necesidad de personal se sustente principalmente en:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Preferencias personales del jefe de área y disponibilidad informal de candidatos."
      },
      {
        "key": "B",
        "text": "Estructura institucional, presupuesto, normativa aplicable, procesos y objetivos institucionales."
      },
      {
        "key": "C",
        "text": "Únicamente el número de oficinas existentes."
      },
      {
        "key": "D",
        "text": "La antigüedad de los servidores sin considerar funciones ni financiamiento."
      }
    ]
  },
  {
    "id": 102,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "Un método de clasificación de puestos agrupa cargos tomando en cuenta principalmente:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "La afinidad personal entre servidores."
      },
      {
        "key": "B",
        "text": "La fecha de ingreso del ocupante del cargo."
      },
      {
        "key": "C",
        "text": "Funciones, responsabilidades, requisitos, nivel jerárquico y naturaleza del trabajo."
      },
      {
        "key": "D",
        "text": "La voluntad del servidor de cambiar de dependencia."
      }
    ]
  },
  {
    "id": 103,
    "topic": "I. Planificación del Talento Humano, descripción, valoración y clasificación de puestos",
    "question": "La metodología de levantamiento de perfiles de puesto debe iniciar preferentemente con:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Análisis de procesos, productos, responsabilidades y normativa relacionada con el puesto."
      },
      {
        "key": "B",
        "text": "Asignación directa de funciones sin documentación."
      },
      {
        "key": "C",
        "text": "Selección del candidato antes de definir el perfil."
      },
      {
        "key": "D",
        "text": "Copia exacta de perfiles de otras instituciones sin adaptación."
      }
    ]
  },
  {
    "id": 104,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "En un proceso de selección, una prueba técnica se diferencia de una prueba psicotécnica porque la primera evalúa principalmente:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Rasgos de personalidad ajenos al puesto."
      },
      {
        "key": "B",
        "text": "La apariencia física del postulante."
      },
      {
        "key": "C",
        "text": "El parentesco con servidores de la institución."
      },
      {
        "key": "D",
        "text": "Conocimientos, habilidades o destrezas específicas requeridas para el cargo."
      }
    ]
  },
  {
    "id": 105,
    "topic": "II. Reclutamiento y selección de personal",
    "question": "La lectura de imágenes y cuerpo en una entrevista debe utilizarse de manera ética como:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Base única para aceptar o descartar al postulante."
      },
      {
        "key": "B",
        "text": "Información complementaria que requiere contraste con evidencias, pruebas y criterios técnicos."
      },
      {
        "key": "C",
        "text": "Sustituto de la verificación de requisitos."
      },
      {
        "key": "D",
        "text": "Criterio suficiente para modificar el perfil del puesto."
      }
    ]
  },
  {
    "id": 106,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "Una herramienta adecuada para diagnosticar necesidades de capacitación es:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Elegir cursos por popularidad en redes sociales."
      },
      {
        "key": "B",
        "text": "Asignar capacitaciones sin revisar brechas."
      },
      {
        "key": "C",
        "text": "Analizar evaluaciones de desempeño, entrevistas, observación del trabajo y requerimientos del cargo."
      },
      {
        "key": "D",
        "text": "Reducir el plan de formación a una sola charla anual."
      }
    ]
  },
  {
    "id": 107,
    "topic": "III. Capacitación, formación, desarrollo e inducción",
    "question": "El desarrollo de un programa de capacitación para una empresa o institución debe concluir con:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Evaluación de aprendizaje, transferencia al puesto e impacto en resultados."
      },
      {
        "key": "B",
        "text": "Entrega de certificados sin medición de resultados."
      },
      {
        "key": "C",
        "text": "Cambio automático de puesto para todos los participantes."
      },
      {
        "key": "D",
        "text": "Suspensión de la evaluación del desempeño."
      }
    ]
  },
  {
    "id": 108,
    "topic": "IV. Evaluación del desempeño",
    "question": "El marco legal de evaluación del desempeño en el servicio público exige que el proceso sea:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Improvisado y sin conocimiento del evaluado."
      },
      {
        "key": "B",
        "text": "Basado únicamente en afinidad personal."
      },
      {
        "key": "C",
        "text": "Aplicado solo cuando se desea sancionar."
      },
      {
        "key": "D",
        "text": "Planificado, documentado, objetivo, periódico y vinculado a funciones e indicadores."
      }
    ]
  },
  {
    "id": 109,
    "topic": "IV. Evaluación del desempeño",
    "question": "La obtención de resultados de evaluación de desempeño debe permitir principalmente:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Identificar brechas, fortalezas, necesidades de mejora y decisiones de talento humano."
      },
      {
        "key": "B",
        "text": "Eliminar el derecho a conocer la calificación."
      },
      {
        "key": "C",
        "text": "Asignar resultados sin indicadores."
      },
      {
        "key": "D",
        "text": "Reemplazar la planificación institucional."
      }
    ]
  },
  {
    "id": 110,
    "topic": "IV. Evaluación del desempeño",
    "question": "La utilidad e impacto de los resultados de evaluación se evidencia cuando la institución:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Archiva las calificaciones sin analizarlas."
      },
      {
        "key": "B",
        "text": "Usa la evaluación para castigos no motivados."
      },
      {
        "key": "C",
        "text": "Diseña acciones de mejora, capacitación, reconocimiento y fortalecimiento del servicio."
      },
      {
        "key": "D",
        "text": "Evita comunicar los resultados al servidor evaluado."
      }
    ]
  },
  {
    "id": 111,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "La definición de sector público comprende, en términos generales:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Solo empresas privadas con fines de lucro."
      },
      {
        "key": "B",
        "text": "Organismos, entidades e instituciones del Estado y otras entidades previstas por la normativa."
      },
      {
        "key": "C",
        "text": "Únicamente trabajadores sujetos al Código del Trabajo."
      },
      {
        "key": "D",
        "text": "Actividades personales sin vínculo institucional."
      }
    ]
  },
  {
    "id": 112,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "El ejercicio de un cargo público implica que la servidora o servidor debe:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Actuar según intereses particulares por encima del servicio."
      },
      {
        "key": "B",
        "text": "Delegar siempre sus responsabilidades sin control."
      },
      {
        "key": "C",
        "text": "Evitar rendir cuentas sobre sus actuaciones."
      },
      {
        "key": "D",
        "text": "Cumplir funciones con legalidad, responsabilidad, eficiencia, probidad y orientación al interés público."
      }
    ]
  },
  {
    "id": 113,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "El subsistema de selección de personal en el servicio público busca garantizar:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Procesos objetivos, transparentes y basados en mérito, oposición y cumplimiento de requisitos."
      },
      {
        "key": "B",
        "text": "Ingreso por recomendación informal."
      },
      {
        "key": "C",
        "text": "Nombramientos sin perfil de puesto."
      },
      {
        "key": "D",
        "text": "Eliminación de la revisión documental."
      }
    ]
  },
  {
    "id": 114,
    "topic": "V. Ley Orgánica del Servicio Público y administración pública",
    "question": "Los organismos de administración de talento humano y remuneraciones cumplen un papel clave porque:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Sustituyen toda responsabilidad de la autoridad nominadora."
      },
      {
        "key": "B",
        "text": "Permiten contratar sin presupuesto."
      },
      {
        "key": "C",
        "text": "Aplican técnicamente las políticas, subsistemas y normas de gestión del talento humano."
      },
      {
        "key": "D",
        "text": "Eliminan la necesidad de expedientes de personal."
      }
    ]
  },
  {
    "id": 115,
    "topic": "VI. Código del Trabajo",
    "question": "Las utilidades laborales se relacionan con:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Una sanción disciplinaria impuesta al trabajador."
      },
      {
        "key": "B",
        "text": "La participación de los trabajadores en beneficios económicos generados por el empleador, conforme a la ley."
      },
      {
        "key": "C",
        "text": "Un tipo de entrevista de selección."
      },
      {
        "key": "D",
        "text": "La clasificación militar del personal."
      }
    ]
  },
  {
    "id": 116,
    "topic": "VI. Código del Trabajo",
    "question": "La jubilación laboral se vincula principalmente con:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "La eliminación de todos los derechos adquiridos."
      },
      {
        "key": "B",
        "text": "Un permiso ocasional sin relación con el tiempo de servicio."
      },
      {
        "key": "C",
        "text": "Una técnica de evaluación psicotécnica."
      },
      {
        "key": "D",
        "text": "Un beneficio o situación derivada del cumplimiento de requisitos de edad, tiempo de servicio o normativa aplicable."
      }
    ]
  },
  {
    "id": 117,
    "topic": "VI. Código del Trabajo",
    "question": "La duración máxima de la jornada de trabajo y los descansos obligatorios protegen principalmente:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "La salud, recuperación, seguridad y condiciones dignas de la persona trabajadora."
      },
      {
        "key": "B",
        "text": "La posibilidad de trabajar sin límite."
      },
      {
        "key": "C",
        "text": "La eliminación de vacaciones."
      },
      {
        "key": "D",
        "text": "La sustitución de la remuneración por descansos."
      }
    ]
  },
  {
    "id": 118,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "Los grados militares cumplen la función de:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Eliminar la subordinación y la disciplina."
      },
      {
        "key": "B",
        "text": "Sustituir la misión constitucional de las Fuerzas Armadas."
      },
      {
        "key": "C",
        "text": "Ordenar jerarquía, mando, responsabilidades, carrera y disciplina institucional."
      },
      {
        "key": "D",
        "text": "Permitir que cualquier subordinado emita órdenes superiores."
      }
    ]
  },
  {
    "id": 119,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "Una inhabilidad en el régimen de personal militar debe entenderse como:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "Un premio por desempeño destacado."
      },
      {
        "key": "B",
        "text": "Una condición legal o reglamentaria que impide ingresar, permanecer o ejercer determinada situación militar."
      },
      {
        "key": "C",
        "text": "Una licencia recreativa."
      },
      {
        "key": "D",
        "text": "Un método de capacitación operativa."
      }
    ]
  },
  {
    "id": 120,
    "topic": "VII. Ley Orgánica de Personal y Disciplina de las Fuerzas Armadas",
    "question": "La clasificación general del personal militar permite:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Eliminar la formación y especialización."
      },
      {
        "key": "B",
        "text": "Confundir funciones operativas, técnicas y administrativas."
      },
      {
        "key": "C",
        "text": "Nombrar personal sin requisitos."
      },
      {
        "key": "D",
        "text": "Diferenciar roles, formación, responsabilidades y tipos de servicio dentro de la institución militar."
      }
    ]
  },
  {
    "id": 121,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "La identificación de riesgos laborales consiste en:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Reconocer peligros presentes en tareas, instalaciones, equipos o procesos que pueden causar daño."
      },
      {
        "key": "B",
        "text": "Aplicar sanciones sin investigación."
      },
      {
        "key": "C",
        "text": "Seleccionar personal por afinidad."
      },
      {
        "key": "D",
        "text": "Eliminar la matriz de riesgos."
      }
    ]
  },
  {
    "id": 122,
    "topic": "VIII. Seguridad e higiene laboral y riesgos laborales",
    "question": "La vulnerabilidad aumenta cuando:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Existen controles eficaces y capacitación adecuada."
      },
      {
        "key": "B",
        "text": "El peligro ha sido eliminado desde la fuente."
      },
      {
        "key": "C",
        "text": "La persona, proceso o instalación tiene menor capacidad de resistir o responder ante un daño."
      },
      {
        "key": "D",
        "text": "La exposición al peligro es inexistente."
      }
    ]
  },
  {
    "id": 123,
    "topic": "Definiciones de Riesgo Laboral",
    "question": "Un accidente mayor se caracteriza por:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Ser un trámite administrativo sin impacto preventivo."
      },
      {
        "key": "B",
        "text": "No generar consecuencias relevantes."
      },
      {
        "key": "C",
        "text": "Ser siempre igual a un incidente menor."
      },
      {
        "key": "D",
        "text": "Tener potencial de producir consecuencias graves, múltiples afectaciones o daños significativos a personas, instalaciones o ambiente."
      }
    ]
  },
  {
    "id": 124,
    "topic": "Definiciones de Riesgo Laboral",
    "question": "Una enfermedad profesional se diferencia de un accidente de trabajo porque generalmente:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "No tiene relación con el trabajo."
      },
      {
        "key": "B",
        "text": "Se desarrolla por exposición laboral a factores de riesgo durante un periodo de tiempo."
      },
      {
        "key": "C",
        "text": "Ocurre únicamente por falta de entrevistas."
      },
      {
        "key": "D",
        "text": "Siempre se produce de forma instantánea y visible."
      }
    ]
  },
  {
    "id": 125,
    "topic": "Definiciones de Riesgo Laboral",
    "question": "Las acciones subestándar y condiciones subestándar son importantes en prevención porque:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Permiten identificar causas inmediatas relacionadas con comportamientos inseguros y ambientes peligrosos."
      },
      {
        "key": "B",
        "text": "Sustituyen la obligación de investigar incidentes."
      },
      {
        "key": "C",
        "text": "Solo sirven para calcular remuneraciones."
      },
      {
        "key": "D",
        "text": "Eliminan la necesidad de controles."
      }
    ]
  },
  {
    "id": 126,
    "topic": "Clasificación de los Riesgos, definición, identificación y evaluación",
    "question": "Los factores de riesgo laborales pueden clasificarse, entre otros, en:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Únicamente administrativos y salariales."
      },
      {
        "key": "B",
        "text": "Solo personales y familiares."
      },
      {
        "key": "C",
        "text": "Físicos, químicos, biológicos, ergonómicos, psicosociales, mecánicos o de seguridad."
      },
      {
        "key": "D",
        "text": "Exclusivamente militares."
      }
    ]
  },
  {
    "id": 127,
    "topic": "Clasificación de los Riesgos, definición, identificación y evaluación",
    "question": "Un método de análisis y valoración de riesgos debe permitir:",
    "answer": "D",
    "choices": [
      {
        "key": "A",
        "text": "Ignorar la probabilidad y consecuencias del daño."
      },
      {
        "key": "B",
        "text": "Seleccionar personal sin perfil."
      },
      {
        "key": "C",
        "text": "Evitar todo registro documental."
      },
      {
        "key": "D",
        "text": "Estimar nivel de riesgo según probabilidad, exposición, consecuencia y controles existentes."
      }
    ]
  },
  {
    "id": 128,
    "topic": "Clasificación de los Riesgos, definición, identificación y evaluación",
    "question": "La evaluación de riesgos laborales sirve para priorizar:",
    "answer": "A",
    "choices": [
      {
        "key": "A",
        "text": "Medidas de control según gravedad, probabilidad y nivel de exposición."
      },
      {
        "key": "B",
        "text": "Ascensos automáticos por antigüedad."
      },
      {
        "key": "C",
        "text": "Entrevistas por competencias."
      },
      {
        "key": "D",
        "text": "Bonificaciones sin sustento."
      }
    ]
  },
  {
    "id": 129,
    "topic": "Clasificación de los Riesgos, definición, identificación y evaluación",
    "question": "La selección de equipos de protección personal debe basarse principalmente en:",
    "answer": "B",
    "choices": [
      {
        "key": "A",
        "text": "El color más llamativo del equipo."
      },
      {
        "key": "B",
        "text": "El tipo de riesgo, nivel de exposición, tarea, ajuste al usuario y normas técnicas aplicables."
      },
      {
        "key": "C",
        "text": "La preferencia estética del trabajador."
      },
      {
        "key": "D",
        "text": "La eliminación de controles en la fuente y el medio."
      }
    ]
  },
  {
    "id": 130,
    "topic": "Clasificación de los Riesgos, definición, identificación y evaluación",
    "question": "Una matriz de riesgos laborales es útil porque integra:",
    "answer": "C",
    "choices": [
      {
        "key": "A",
        "text": "Solo nombres de trabajadores sin relación preventiva."
      },
      {
        "key": "B",
        "text": "Únicamente remuneraciones y vacaciones."
      },
      {
        "key": "C",
        "text": "Peligros, factores de riesgo, evaluación, nivel de riesgo, controles y responsables."
      },
      {
        "key": "D",
        "text": "Preguntas de entrevista sin indicadores."
      }
    ]
  }
];
