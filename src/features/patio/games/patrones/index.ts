import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";

export const patronesDefinition: ExerciseDefinition = {
  id: "patrones",
  module: "patio",
  kind: "juego",
  title: "Matrices de patrones",
  description:
    "Descubre las reglas que siguen las figuras en cada fila y elige la pieza que falta. Doce matrices por sesión, sin prisa.",
  skills: ["razonamiento", "flexibilidad-cognitiva"],
  difficulty: { min: 1, max: 10 },
  estimatedMinutes: 8,
  adaptive: true,
};

export const patronesEntry: ExerciseEntry = {
  definition: patronesDefinition,
  load: () => import("./PatronesGame"),
};
