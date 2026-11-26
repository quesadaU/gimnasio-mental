import type { ExerciseEntry } from "@/components/exercise/contract";
import type { ExerciseDefinition } from "@/core/types";

export const sudokuDefinition: ExerciseDefinition = {
  id: "sudoku",
  module: "patio",
  kind: "juego",
  title: "Sudoku",
  description:
    "Un sudoku por sesión, siempre con solución única y sin límite de tiempo. Usa notas para llevar los candidatos y comprueba cuando quieras.",
  skills: ["razonamiento", "memoria-de-trabajo"],
  difficulty: { min: 1, max: 10 },
  estimatedMinutes: 15,
  adaptive: true,
};

export const sudokuEntry: ExerciseEntry = {
  definition: sudokuDefinition,
  load: () => import("./SudokuGame"),
};
