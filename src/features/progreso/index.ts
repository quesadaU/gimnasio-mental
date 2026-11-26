/** API pública del módulo Progreso. Lo único que puede importar src/app. */
export { ProgressDashboard } from "./components/progress-dashboard";
export { RecommendedSession } from "./components/recommended-session";
export { trainingModules } from "./components/training-modules";
export { summarizeProgress, recentSessions, sessionMinutes } from "./domain/summary.ts";
export type { ProgressSummary, ModuleSummary } from "./domain/summary.ts";
export { recommendNextModule } from "./domain/recommendation.ts";
export type { Recommendation } from "./domain/recommendation.ts";
