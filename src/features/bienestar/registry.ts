/**
 * Registro de prácticas de Bienestar. Añadir una práctica = añadir una entrada aquí (y su
 * componente en `components/`). La ruta `/bienestar/[practica]` se genera a partir de `slug`.
 * Los componentes se cargan de forma diferida: nada de esto se importa de forma estática.
 */

import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";
import type { PracticeCategory } from "./domain/types";

export interface PracticeEntry extends ExerciseEntry {
  slug: string;
  category: PracticeCategory;
  /** Para qué sirve, en lenguaje honesto y sin promesas. */
  purpose: string;
  durationLabel: string;
}

function definition(
  id: string,
  title: string,
  description: string,
  estimatedMinutes: number,
  skills: ExerciseDefinition["skills"],
): ExerciseDefinition {
  return {
    id,
    module: "bienestar",
    kind: "practica",
    title,
    description,
    skills,
    difficulty: { min: 1, max: 1 },
    estimatedMinutes,
    adaptive: false,
  };
}

export const BIENESTAR_PRACTICES: readonly PracticeEntry[] = [
  {
    slug: "respiracion",
    category: "calmar-el-cuerpo",
    durationLabel: "2, 3 o 5 min",
    purpose:
      "Respirar despacio, con la exhalación algo más larga, ayuda a muchas personas a notar el cuerpo más tranquilo. Ritmos suaves, sin retener el aire mucho rato.",
    definition: definition(
      "bienestar-respiracion",
      "Respiración guiada",
      "Respiración lenta acompañada de una guía visual o en texto.",
      3,
      ["regulacion-emocional"],
    ),
    load: () => import("./components/breathing-practice"),
  },
  {
    slug: "pausa-60-segundos",
    category: "calmar-el-cuerpo",
    durationLabel: "Alrededor de 1 min",
    purpose:
      "Un minuto para volver al aquí y ahora a través de los sentidos (5-4-3-2-1). Útil cuando la cabeza va muy deprisa.",
    definition: definition(
      "bienestar-pausa-60",
      "Pausa de 60 segundos",
      "Ejercicio de anclaje 5-4-3-2-1 con los sentidos.",
      1,
      ["regulacion-emocional", "atencion-sostenida"],
    ),
    load: () => import("./components/grounding-practice"),
  },
  {
    slug: "atencion-respiracion",
    category: "atencion-plena",
    durationLabel: "3, 5 o 10 min",
    purpose:
      "Practicar darte cuenta de cuándo la mente se va y volver a la respiración. No se trata de dejar la mente en blanco.",
    definition: definition(
      "bienestar-atencion-respiracion",
      "Atención a la respiración",
      "Meditación guiada en texto con temporizador.",
      5,
      ["atencion-sostenida", "regulacion-emocional"],
    ),
    load: () => import("./components/meditation-practice").then((module) => ({ default: module.BreathAwarenessPractice })),
  },
  {
    slug: "escaneo-corporal",
    category: "atencion-plena",
    durationLabel: "3, 5 o 10 min",
    purpose:
      "Recorrer el cuerpo con la atención para notar sensaciones sin intentar cambiarlas. Puedes saltarte cualquier zona.",
    definition: definition(
      "bienestar-escaneo-corporal",
      "Escaneo corporal",
      "Recorrido guiado por el cuerpo, en texto y con temporizador.",
      5,
      ["atencion-sostenida", "regulacion-emocional"],
    ),
    load: () => import("./components/meditation-practice").then((module) => ({ default: module.BodyScanPractice })),
  },
  {
    slug: "registro-emocional",
    category: "emociones",
    durationLabel: "5 a 10 min",
    purpose:
      "Ponerle nombre a lo que sientes y, si quieres, mirar la situación desde otro ángulo. Lo que escribas se queda solo en este dispositivo.",
    definition: definition(
      "bienestar-registro-emocional",
      "Registro emocional",
      "Etiquetado emocional y reevaluación guiada, guardado solo en tu dispositivo.",
      7,
      ["regulacion-emocional"],
    ),
    load: () => import("./components/journal-practice"),
  },
  {
    slug: "higiene-digital",
    category: "higiene-digital",
    durationLabel: "5 min y retos de 1 o 7 días",
    purpose:
      "Observar sin juzgarte cómo usas las pantallas y la IA, y probar un pequeño cambio durante un día o una semana.",
    definition: definition(
      "bienestar-higiene-digital",
      "Higiene digital",
      "Autoobservación breve y micro-retos con seguimiento local.",
      5,
      ["atencion-sostenida"],
    ),
    load: () => import("./components/digital-hygiene-practice"),
  },
];

export function findPractice(slug: string): PracticeEntry | undefined {
  return BIENESTAR_PRACTICES.find((practice) => practice.slug === slug);
}

export function practicesByCategory(category: PracticeCategory): PracticeEntry[] {
  return BIENESTAR_PRACTICES.filter((practice) => practice.category === category);
}
