/** API pública del módulo Patio. `src/app/patio` solo importa desde aquí. */
import { PATIO_ENTRIES } from "./registry";

export { PATIO_ENTRIES };
export {
  PATIO_GROUPS,
  SKILL_LABEL,
  entriesByGroup,
  groupOf,
  type PatioGroup,
  type PatioGroupId,
} from "./components/catalog";
export { PatioCatalog } from "./components/PatioCatalog";
export { ExerciseRunner } from "./components/ExerciseRunner";

export function findPatioDefinition(id: string) {
  return PATIO_ENTRIES.find((entry) => entry.definition.id === id)?.definition;
}
