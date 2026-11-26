import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";

export const ajedrezDefinition: ExerciseDefinition = {
  id: "ajedrez",
  module: "patio",
  kind: "juego",
  title: "Ajedrez: tácticas",
  description:
    "Seis puzzles por sesión: mates, horquillas, clavadas y otros motivos. Calcula antes de mover; el nivel elige la dificultad del puzzle.",
  skills: ["razonamiento", "atencion-selectiva"],
  difficulty: { min: 1, max: 10 },
  estimatedMinutes: 10,
  adaptive: true,
};

export const ajedrezEntry: ExerciseEntry = {
  definition: ajedrezDefinition,
  load: () => import("./AjedrezGame"),
};
