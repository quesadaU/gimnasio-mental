import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";

export const goNoGoDefinition: ExerciseDefinition = {
  id: "go-no-go",
  module: "patio",
  kind: "juego",
  title: "Go / No-go: pulsa o frena",
  description:
    "Pulsa con cada letra y frena con la X. Practica detener a tiempo una respuesta que se ha vuelto automática.",
  skills: ["control-inhibitorio", "atencion-sostenida"],
  difficulty: { min: 1, max: 10 },
  estimatedMinutes: 4,
  adaptive: true,
};

export const goNoGoEntry: ExerciseEntry = {
  definition: goNoGoDefinition,
  load: () => import("./GoNoGoGame"),
};
