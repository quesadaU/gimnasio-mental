import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";

export const secuenciasDefinition: ExerciseDefinition = {
  id: "secuencias",
  module: "patio",
  kind: "juego",
  title: "Secuencias: dígitos y casillas",
  description:
    "Recuerda secuencias de dígitos (en orden o al revés) o de casillas y repítelas. Practica la memoria a corto plazo y de trabajo.",
  skills: ["memoria-de-trabajo"],
  difficulty: { min: 1, max: 10 },
  estimatedMinutes: 6,
  adaptive: true,
};

export const secuenciasEntry: ExerciseEntry = {
  definition: secuenciasDefinition,
  load: () => import("./SecuenciasGame"),
};
