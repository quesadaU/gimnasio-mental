/**
 * Exportar / importar el ProgressSnapshot como JSON (copia de seguridad manual, fase 0 local-first).
 * La importación FUSIONA con los datos actuales en vez de sustituirlos, para no perder nada:
 *   - sesiones: se añaden las que no existen (recordSession ya es idempotente por id);
 *   - dificultad y tarjetas: gana el registro con `updatedAt` más reciente.
 * Toda entrada se valida aquí porque el archivo viene de fuera de la app.
 */

import {
  MAX_DIFFICULTY,
  MIN_DIFFICULTY,
  type DifficultyRecord,
  type ModuleSlug,
  type ProgressSnapshot,
  type ReviewCard,
  type SessionResult,
} from "../../../core/types.ts";
import { compareIso } from "./summary.ts";

export const BACKUP_FORMAT = "gimnasio-mental/progreso";
/** Límite defensivo del archivo importado (el estado local no debería pasar de unos 2 MB). */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

const MODULE_SLUGS: readonly ModuleSlug[] = [
  "patio",
  "lectura",
  "habilidades",
  "bienestar",
  "progreso",
  "recompensas",
  "rankings",
];

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  /** Versión del esquema del snapshot (PROGRESS_SCHEMA_VERSION en el momento de exportar). */
  v: number;
  exportedAt: string;
  data: ProgressSnapshot;
}

export function createBackup(snapshot: ProgressSnapshot, schemaVersion: number, now: Date): BackupFile {
  return { format: BACKUP_FORMAT, v: schemaVersion, exportedAt: now.toISOString(), data: snapshot };
}

export function backupFileName(now: Date): string {
  return `gimnasio-mental-progreso-${now.toISOString().slice(0, 10)}.json`;
}

export type ParseBackupResult =
  | { ok: true; snapshot: ProgressSnapshot }
  | { ok: false; error: ParseBackupError };

export type ParseBackupError = "demasiado-grande" | "json-invalido" | "formato-desconocido" | "version-futura";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIso(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function isDifficultyValue(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_DIFFICULTY &&
    value <= MAX_DIFFICULTY
  );
}

export function isValidSession(value: unknown): value is SessionResult {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 100 &&
    typeof value.schemaVersion === "number" &&
    typeof value.exerciseId === "string" &&
    MODULE_SLUGS.includes(value.module as ModuleSlug) &&
    (value.contentId === undefined || typeof value.contentId === "string") &&
    isIso(value.startedAt) &&
    isIso(value.endedAt) &&
    (value.outcome === "completada" || value.outcome === "abandonada") &&
    isDifficultyValue(value.difficultyStart) &&
    isDifficultyValue(value.difficultyEnd) &&
    isNonNegativeNumber(value.trials) &&
    isNonNegativeNumber(value.correct) &&
    (value.meanReactionMs === undefined || isNonNegativeNumber(value.meanReactionMs)) &&
    typeof value.score === "number" &&
    Number.isFinite(value.score)
  );
}

function isValidDifficultyRecord(value: unknown): value is DifficultyRecord {
  return (
    isRecord(value) &&
    typeof value.exerciseId === "string" &&
    isDifficultyValue(value.level) &&
    isIso(value.updatedAt)
  );
}

function isValidReviewCard(value: unknown): value is ReviewCard {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.deckId === "string" &&
    typeof value.box === "number" &&
    Number.isInteger(value.box) &&
    value.box >= 1 &&
    isIso(value.dueAt) &&
    (value.lastReviewedAt === undefined || isIso(value.lastReviewedAt)) &&
    isNonNegativeNumber(value.reviews) &&
    isNonNegativeNumber(value.lapses) &&
    isIso(value.updatedAt)
  );
}

/**
 * Valida un archivo de copia. Acepta el formato propio ({ format, v, data }) o un snapshot "desnudo".
 * Los elementos individuales inválidos se descartan; si la estructura general no cuadra, se rechaza.
 */
export function parseBackup(text: string, currentSchemaVersion: number): ParseBackupResult {
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, error: "demasiado-grande" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "json-invalido" };
  }
  if (!isRecord(parsed)) return { ok: false, error: "formato-desconocido" };

  let data: unknown = parsed;
  if (parsed.format === BACKUP_FORMAT) {
    if (typeof parsed.v !== "number" || !Number.isInteger(parsed.v)) {
      return { ok: false, error: "formato-desconocido" };
    }
    if (parsed.v > currentSchemaVersion) return { ok: false, error: "version-futura" };
    data = parsed.data;
  }

  if (
    !isRecord(data) ||
    !Array.isArray(data.sessions) ||
    !isRecord(data.difficulty) ||
    !isRecord(data.reviewCards)
  ) {
    return { ok: false, error: "formato-desconocido" };
  }

  const fallbackIso = new Date(0).toISOString();
  const difficulty: Record<string, DifficultyRecord> = {};
  for (const record of Object.values(data.difficulty)) {
    if (isValidDifficultyRecord(record)) difficulty[record.exerciseId] = record;
  }
  const reviewCards: Record<string, ReviewCard> = {};
  for (const card of Object.values(data.reviewCards)) {
    if (isValidReviewCard(card)) reviewCards[card.id] = card;
  }

  return {
    ok: true,
    snapshot: {
      createdAt: isIso(data.createdAt) ? data.createdAt : fallbackIso,
      updatedAt: isIso(data.updatedAt) ? data.updatedAt : fallbackIso,
      sessions: data.sessions.filter(isValidSession),
      difficulty,
      reviewCards,
    },
  };
}

export interface ImportPlan {
  /** Sesiones nuevas, en orden cronológico (las más antiguas primero, por el límite FIFO). */
  sessions: SessionResult[];
  difficulty: DifficultyRecord[];
  reviewCards: ReviewCard[];
}

export function planImport(current: ProgressSnapshot, incoming: ProgressSnapshot): ImportPlan {
  const knownIds = new Set(current.sessions.map((session) => session.id));
  const seen = new Set<string>();
  const sessions = incoming.sessions
    .filter((session) => {
      if (knownIds.has(session.id) || seen.has(session.id)) return false;
      seen.add(session.id);
      return true;
    })
    .sort((a, b) => compareIso(a.endedAt, b.endedAt));

  const difficulty = Object.values(incoming.difficulty).filter((record) => {
    const existing = current.difficulty[record.exerciseId];
    return !existing || compareIso(record.updatedAt, existing.updatedAt) > 0;
  });

  const reviewCards = Object.values(incoming.reviewCards).filter((card) => {
    const existing = current.reviewCards[card.id];
    return !existing || compareIso(card.updatedAt, existing.updatedAt) > 0;
  });

  return { sessions, difficulty, reviewCards };
}

export function isEmptyPlan(plan: ImportPlan): boolean {
  return plan.sessions.length === 0 && plan.difficulty.length === 0 && plan.reviewCards.length === 0;
}
