import type { ExerciseEntry } from "@/components/exercise/contract";
import type { CognitiveSkill } from "@/core/types";

export type PatioGroupId = "atencion" | "memoria" | "logica";

export interface PatioGroup {
  id: PatioGroupId;
  title: string;
  description: string;
  skills: readonly CognitiveSkill[];
}

/** Agrupación del catálogo por habilidad. Un juego va al grupo de su primera habilidad. */
export const PATIO_GROUPS: readonly PatioGroup[] = [
  {
    id: "atencion",
    title: "Atención",
    description: "Mantener el foco, filtrar distracciones y frenar respuestas automáticas.",
    skills: ["atencion-sostenida", "atencion-selectiva", "control-inhibitorio"],
  },
  {
    id: "memoria",
    title: "Memoria",
    description: "Retener y manipular información durante unos segundos.",
    skills: ["memoria-de-trabajo", "recuperacion"],
  },
  {
    id: "logica",
    title: "Lógica",
    description: "Razonar paso a paso, planificar varias jugadas y comprobar hipótesis.",
    skills: ["razonamiento", "flexibilidad-cognitiva"],
  },
];

export const SKILL_LABEL: Record<CognitiveSkill, string> = {
  "atencion-sostenida": "Atención sostenida",
  "atencion-selectiva": "Atención selectiva",
  "memoria-de-trabajo": "Memoria de trabajo",
  "control-inhibitorio": "Control inhibitorio",
  "flexibilidad-cognitiva": "Flexibilidad cognitiva",
  razonamiento: "Razonamiento",
  "comprension-lectora": "Comprensión lectora",
  recuperacion: "Recuperación",
  "regulacion-emocional": "Regulación emocional",
};

export function groupOf(entry: ExerciseEntry): PatioGroupId {
  for (const skill of entry.definition.skills) {
    const group = PATIO_GROUPS.find((g) => g.skills.includes(skill));
    if (group) return group.id;
  }
  return "logica";
}

export function entriesByGroup(
  entries: readonly ExerciseEntry[],
): { group: PatioGroup; entries: ExerciseEntry[] }[] {
  return PATIO_GROUPS.map((group) => ({
    group,
    entries: entries.filter((entry) => groupOf(entry) === group.id),
  }));
}
