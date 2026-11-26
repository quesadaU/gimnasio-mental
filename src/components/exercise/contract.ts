import type { ComponentType } from "react";
import type { DifficultyLevel, ExerciseDefinition, SessionResult } from "@/core/types";

export interface ExerciseProps {
  definition: ExerciseDefinition;
  initialLevel: DifficultyLevel;
  onFinish(result: SessionResult): void;
  onExit(): void;
}

export interface ExerciseEntry {
  definition: ExerciseDefinition;
  load: () => Promise<{ default: ComponentType<ExerciseProps> }>;
}
