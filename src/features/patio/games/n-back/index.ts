import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";

export const nBackDefinition: ExerciseDefinition = {
  id: "n-back",
  module: "patio",
  kind: "juego",
  title: "N-back de letras",
  description:
    "Avisa cuando una letra coincide con la de hace n posiciones. Practica mantener y actualizar información en la memoria de trabajo.",
  skills: ["memoria-de-trabajo", "atencion-sostenida"],
  difficulty: { min: 1, max: 10 },
  estimatedMinutes: 7,
  adaptive: true,
};

export const nBackEntry: ExerciseEntry = {
  definition: nBackDefinition,
  load: () => import("./NBackGame"),
};
