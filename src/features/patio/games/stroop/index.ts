import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";

export const stroopDefinition: ExerciseDefinition = {
  id: "stroop",
  module: "patio",
  kind: "juego",
  title: "Stroop: palabra y color",
  description:
    "Responde al color de la tinta (o a la posición) e ignora lo que dice la palabra. Practica el control de la interferencia.",
  skills: ["control-inhibitorio", "atencion-selectiva"],
  difficulty: { min: 1, max: 10 },
  estimatedMinutes: 4,
  adaptive: true,
};

export const stroopEntry: ExerciseEntry = {
  definition: stroopDefinition,
  load: () => import("./StroopGame"),
};
