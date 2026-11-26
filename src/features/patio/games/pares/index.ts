import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";

export const paresDefinition: ExerciseDefinition = {
  id: "pares",
  module: "patio",
  kind: "juego",
  title: "Parejas: memoria de lugares",
  description:
    "Destapa cartas de dos en dos y encuentra las parejas. Practica recordar dónde está cada cosa.",
  skills: ["memoria-de-trabajo", "atencion-sostenida"],
  difficulty: { min: 1, max: 10 },
  estimatedMinutes: 6,
  adaptive: true,
};

export const paresEntry: ExerciseEntry = {
  definition: paresDefinition,
  load: () => import("./ParesGame"),
};
