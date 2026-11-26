/** API pública del módulo Bienestar. `src/app/bienestar` solo importa desde aquí. */

export { BIENESTAR_PRACTICES, findPractice, practicesByCategory, type PracticeEntry } from "./registry";
export { PRACTICE_CATEGORIES, type PracticeCategory } from "./domain/types";
export { CrisisResources } from "./components/crisis-resources";
export { PracticeIndex } from "./components/practice-index";
export { PracticeRunner } from "./components/practice-runner";
