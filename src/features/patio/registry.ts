import type { ExerciseEntry } from "@/components/exercise/contract";
import { atencionMemoriaEntries } from "./registry-atencion-memoria";
import { logicaEntries } from "./registry-logica";

export const PATIO_ENTRIES: readonly ExerciseEntry[] = [...atencionMemoriaEntries, ...logicaEntries];
