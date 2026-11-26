import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";

export const busquedaVisualDefinition: ExerciseDefinition = {
  id: "busqueda-visual",
  module: "patio",
  kind: "juego",
  title: "Búsqueda visual: encuentra la T",
  description:
    "Decide si hay una T entre letras parecidas. Practica la atención selectiva y la búsqueda sistemática.",
  skills: ["atencion-selectiva"],
  difficulty: { min: 1, max: 10 },
  estimatedMinutes: 4,
  adaptive: true,
};

export const busquedaVisualEntry: ExerciseEntry = {
  definition: busquedaVisualDefinition,
  load: () => import("./BusquedaVisualGame"),
};
