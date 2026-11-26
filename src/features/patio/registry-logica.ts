import type { ExerciseEntry } from "@/components/exercise/contract";
import { ajedrezEntry } from "./games/ajedrez";

/**
 * Juegos de lógica del Patio. Cada entrada solo trae metadatos; el componente se carga con import().
 * Pendientes (ver docs/ESTADO.md): sudoku, patrones y deducción tienen dominio y pruebas, pero falta su componente.
 */
export const logicaEntries: readonly ExerciseEntry[] = [ajedrezEntry];
