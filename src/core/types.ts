/**
 * Contratos compartidos del núcleo. Sin dependencias de React, Next ni APIs del navegador.
 * Todo lo persistido es serializable a JSON y está preparado para sincronizarse con un backend:
 * ids estables (UUID), fechas ISO 8601 en UTC y eventos de sesión inmutables.
 */

export type Uuid = string;
export type IsoDateTime = string;

export type ModuleSlug =
  | "patio"
  | "lectura"
  | "habilidades"
  | "bienestar"
  | "progreso"
  | "recompensas"
  | "rankings";

export type ModuleStatus = "activo" | "proximamente";

export interface ModuleDefinition {
  slug: ModuleSlug;
  title: string;
  description: string;
  href: `/${string}`;
  status: ModuleStatus;
}

export type CognitiveSkill =
  | "atencion-sostenida"
  | "atencion-selectiva"
  | "memoria-de-trabajo"
  | "control-inhibitorio"
  | "flexibilidad-cognitiva"
  | "razonamiento"
  | "comprension-lectora"
  | "recuperacion"
  | "regulacion-emocional";

export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 10;

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface DifficultyRange {
  min: DifficultyLevel;
  max: DifficultyLevel;
}

export type ExerciseKind = "juego" | "lectura" | "leccion" | "practica";

/** Metadatos de un ejercicio. La implementación (UI) vive en su feature y se carga de forma diferida. */
export interface ExerciseDefinition {
  id: string;
  module: ModuleSlug;
  kind: ExerciseKind;
  title: string;
  description: string;
  skills: readonly CognitiveSkill[];
  difficulty: DifficultyRange;
  estimatedMinutes: number;
  adaptive: boolean;
}

export type SessionOutcome = "completada" | "abandonada";

/** Evento inmutable que se emite al terminar una sesión. Es la unidad de sincronización futura. */
export interface SessionResult {
  id: Uuid;
  schemaVersion: number;
  exerciseId: string;
  module: ModuleSlug;
  contentId?: string;
  startedAt: IsoDateTime;
  endedAt: IsoDateTime;
  outcome: SessionOutcome;
  difficultyStart: DifficultyLevel;
  difficultyEnd: DifficultyLevel;
  trials: number;
  correct: number;
  meanReactionMs?: number;
  score: number;
}

export type ReviewGrade = "correcto" | "incorrecto";

export interface ReviewCard {
  id: string;
  deckId: string;
  box: number;
  dueAt: IsoDateTime;
  lastReviewedAt?: IsoDateTime;
  reviews: number;
  lapses: number;
  updatedAt: IsoDateTime;
}

export interface DifficultyRecord {
  exerciseId: string;
  level: DifficultyLevel;
  updatedAt: IsoDateTime;
}

export const SESSION_SCHEMA_VERSION = 1;

/** Estado local completo. Su versión de esquema vive en el sobre de almacenamiento (ver storage.ts). */
export interface ProgressSnapshot {
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  sessions: SessionResult[];
  difficulty: Record<string, DifficultyRecord>;
  reviewCards: Record<string, ReviewCard>;
}

/**
 * Puerto de persistencia. Asíncrono para que el adaptador local (localStorage/IndexedDB)
 * y uno remoto (API con cuentas) sean intercambiables sin cambiar a los consumidores.
 */
export interface ProgressStore {
  getSnapshot(): Promise<ProgressSnapshot>;
  recordSession(result: SessionResult): Promise<void>;
  listSessions(filter?: { module?: ModuleSlug; exerciseId?: string }): Promise<SessionResult[]>;
  getDifficulty(exerciseId: string): Promise<DifficultyLevel | undefined>;
  setDifficulty(exerciseId: string, level: DifficultyLevel): Promise<void>;
  listReviewCards(deckId: string): Promise<ReviewCard[]>;
  upsertReviewCards(cards: readonly ReviewCard[]): Promise<void>;
  reset(): Promise<void>;
}

/** Contenido (puzzles, textos, lecciones, meditaciones) como datos tipados, separado del código. */
export interface ContentPack<TItem> {
  id: string;
  module: ModuleSlug;
  version: number;
  locale: "es";
  title: string;
  items: readonly TItem[];
}

export type ContentLoader<TItem> = () => Promise<ContentPack<TItem>>;
