import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";

export const deduccionDefinition: ExerciseDefinition = {
  id: "deduccion",
  module: "patio",
  kind: "juego",
  title: "Deducción: ¿quién vive dónde?",
  description:
    "Tres acertijos lógicos por sesión. Cruza las pistas, descarta posibilidades y llega a la única solución posible.",
  skills: ["razonamiento", "memoria-de-trabajo"],
  difficulty: { min: 1, max: 10 },
  estimatedMinutes: 10,
  adaptive: true,
};

export const deduccionEntry: ExerciseEntry = {
  definition: deduccionDefinition,
  load: () => import("./DeduccionGame"),
};
