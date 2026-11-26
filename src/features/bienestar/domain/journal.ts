/**
 * Modelo del registro emocional. Los datos son de la persona y se quedan en su dispositivo
 * (clave `gm:bienestar:diario`). Aquí no se interpreta ni se puntúa lo que siente nadie.
 */

export const JOURNAL_STORAGE_KEY = "bienestar:diario";
export const JOURNAL_SCHEMA_VERSION = 1;
export const MAX_JOURNAL_ENTRIES = 500;
export const MAX_EMOTIONS_PER_ENTRY = 3;
export const MAX_TEXT_LENGTH = 2000;
export const INTENSITY_MIN = 0;
export const INTENSITY_MAX = 10;

export interface JournalEntry {
  id: string;
  createdAt: string;
  /** Ids de emociones del paquete de contenido. */
  emotions: string[];
  intensity: number;
  situation: string;
  thought: string;
  reappraisal?: {
    promptId: string;
    answer: string;
  };
  /** Intensidad tras la reevaluación, si la persona quiere anotarla. Solo para ella. */
  intensityAfter?: number;
}

export interface JournalData {
  entries: JournalEntry[];
}

export interface JournalDraft {
  emotions: readonly string[];
  intensity: number;
  situation: string;
  thought: string;
  reappraisalPromptId?: string;
  reappraisalAnswer?: string;
  intensityAfter?: number;
}

export type DraftIssue = "sin-emocion" | "demasiadas-emociones" | "intensidad-invalida" | "texto-largo";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIntensity(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= INTENSITY_MIN && value <= INTENSITY_MAX;
}

export function isJournalEntry(value: unknown): value is JournalEntry {
  if (!isRecord(value)) return false;
  const reappraisalOk =
    value.reappraisal === undefined ||
    (isRecord(value.reappraisal) &&
      typeof value.reappraisal.promptId === "string" &&
      typeof value.reappraisal.answer === "string");
  return (
    typeof value.id === "string" &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.emotions) &&
    value.emotions.every((emotion) => typeof emotion === "string") &&
    isIntensity(value.intensity) &&
    typeof value.situation === "string" &&
    typeof value.thought === "string" &&
    reappraisalOk &&
    (value.intensityAfter === undefined || isIntensity(value.intensityAfter))
  );
}

export function isJournalData(value: unknown): value is JournalData {
  return isRecord(value) && Array.isArray(value.entries) && value.entries.every(isJournalEntry);
}

/** Esquema compatible con `VersionedSchema<JournalData>` de `@/core/storage`. */
export const journalSchema = {
  version: JOURNAL_SCHEMA_VERSION,
  migrations: {},
  validate: isJournalData,
};

export function emptyJournal(): JournalData {
  return { entries: [] };
}

export function validateDraft(draft: JournalDraft): DraftIssue[] {
  const issues: DraftIssue[] = [];
  if (draft.emotions.length === 0) issues.push("sin-emocion");
  if (draft.emotions.length > MAX_EMOTIONS_PER_ENTRY) issues.push("demasiadas-emociones");
  if (!isIntensity(draft.intensity) || (draft.intensityAfter !== undefined && !isIntensity(draft.intensityAfter))) {
    issues.push("intensidad-invalida");
  }
  const texts = [draft.situation, draft.thought, draft.reappraisalAnswer ?? ""];
  if (texts.some((text) => text.length > MAX_TEXT_LENGTH)) issues.push("texto-largo");
  return issues;
}

/** Construye una entrada a partir de un borrador válido. `id` y `now` se inyectan para mantener la pureza. */
export function createEntry(draft: JournalDraft, id: string, now: Date): JournalEntry {
  const issues = validateDraft(draft);
  if (issues.length > 0) throw new Error(`Borrador no válido: ${issues.join(", ")}`);
  const answer = draft.reappraisalAnswer?.trim() ?? "";
  const entry: JournalEntry = {
    id,
    createdAt: now.toISOString(),
    emotions: [...draft.emotions],
    intensity: draft.intensity,
    situation: draft.situation.trim(),
    thought: draft.thought.trim(),
  };
  if (draft.reappraisalPromptId && answer.length > 0) {
    entry.reappraisal = { promptId: draft.reappraisalPromptId, answer };
  }
  if (draft.intensityAfter !== undefined) entry.intensityAfter = draft.intensityAfter;
  return entry;
}

/** Añade una entrada al principio (más reciente primero) y respeta el máximo guardado. */
export function addEntry(data: JournalData, entry: JournalEntry, max = MAX_JOURNAL_ENTRIES): JournalData {
  const withoutDuplicate = data.entries.filter((existing) => existing.id !== entry.id);
  return { entries: [entry, ...withoutDuplicate].slice(0, Math.max(1, max)) };
}

export function removeEntry(data: JournalData, id: string): JournalData {
  return { entries: data.entries.filter((entry) => entry.id !== id) };
}

/** Documento de exportación legible por la persona. No incluye nada que no esté ya en sus entradas. */
export function buildExport(data: JournalData, now: Date): string {
  return JSON.stringify(
    {
      tipo: "gimnasio-mental/registro-emocional",
      version: JOURNAL_SCHEMA_VERSION,
      exportadoEn: now.toISOString(),
      entradas: data.entries,
    },
    null,
    2,
  );
}

export function exportFileName(now: Date): string {
  return `registro-emocional-${now.toISOString().slice(0, 10)}.json`;
}
