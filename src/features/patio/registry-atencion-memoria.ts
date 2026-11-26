import type { ExerciseEntry } from "@/components/exercise/contract";
import { busquedaVisualEntry } from "./games/busqueda-visual";
import { goNoGoEntry } from "./games/go-no-go";
import { nBackEntry } from "./games/n-back";
import { paresEntry } from "./games/pares";
import { secuenciasEntry } from "./games/secuencias";
import { stroopEntry } from "./games/stroop";

/**
 * Juegos de atención y memoria. Cada entrada solo trae metadatos: el componente se carga con
 * `load()` (import dinámico), así que este registro no arrastra el código de los juegos.
 */
export const atencionMemoriaEntries: readonly ExerciseEntry[] = [
  stroopEntry,
  nBackEntry,
  goNoGoEntry,
  busquedaVisualEntry,
  secuenciasEntry,
  paresEntry,
];
