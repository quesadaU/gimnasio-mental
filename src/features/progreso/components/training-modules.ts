import { activeModules } from "@/core/modules-registry";
import type { ModuleDefinition } from "@/core/types";

/** Módulos donde se entrena (todos los activos salvo el propio historial). Se deriva de MODULES. */
export function trainingModules(): ModuleDefinition[] {
  return activeModules().filter((module) => module.slug !== "progreso");
}
