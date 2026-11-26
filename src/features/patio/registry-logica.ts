import type { ExerciseEntry } from "@/components/exercise/contract";
import { ajedrezEntry } from "./games/ajedrez";
import { deduccionEntry } from "./games/deduccion";
import { patronesEntry } from "./games/patrones";
import { sudokuEntry } from "./games/sudoku";

/** Juegos de lógica del Patio. Cada entrada solo trae metadatos; el componente se carga con import(). */
export const logicaEntries: readonly ExerciseEntry[] = [ajedrezEntry, sudokuEntry, patronesEntry, deduccionEntry];
