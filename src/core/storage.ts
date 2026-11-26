/**
 * Persistencia local versionada y segura:
 * - SSR-safe: en el servidor no se toca `window` y las escrituras son no-op.
 * - Todo acceso a localStorage va en try/catch (modo privado, cuota llena, almacenamiento bloqueado).
 * - Los datos se guardan en un sobre `{ v, data }` y se migran paso a paso hasta la versión actual.
 * - Nunca se sobrescriben datos de una versión futura ni datos corruptos sin respaldarlos antes.
 */

import { isDifficultyLevel } from "./adaptive-difficulty";
import type {
  DifficultyLevel,
  ModuleSlug,
  ProgressSnapshot,
  ProgressStore,
  ReviewCard,
  SessionResult,
} from "./types";

const KEY_PREFIX = "gm:";

export type Migration = (data: unknown) => unknown;

/** `migrations[n]` transforma datos de la versión n a la n + 1. */
export interface VersionedSchema<T> {
  version: number;
  migrations: Readonly<Record<number, Migration>>;
  validate: (data: unknown) => data is T;
}

export type ReadStatus =
  | "ok"
  | "vacio"
  | "migrado"
  | "invalido"
  | "version-futura"
  | "no-disponible";

export interface ReadResult<T> {
  status: ReadStatus;
  value?: T;
}

interface Envelope {
  v: number;
  data: unknown;
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    const probe = `${KEY_PREFIX}__probe__`;
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function isPersistenceAvailable(): boolean {
  return getLocalStorage() !== null;
}

function isEnvelope(value: unknown): value is Envelope {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger((value as Envelope).v) &&
    "data" in value
  );
}

function migrate<T>(envelope: Envelope, schema: VersionedSchema<T>): unknown {
  let data = envelope.data;
  for (let version = envelope.v; version < schema.version; version++) {
    const step = schema.migrations[version];
    if (!step) throw new Error(`Falta la migración ${version} -> ${version + 1}`);
    data = step(data);
  }
  return data;
}

export function readVersioned<T>(key: string, schema: VersionedSchema<T>): ReadResult<T> {
  const storage = getLocalStorage();
  if (!storage) return { status: "no-disponible" };

  let raw: string | null;
  try {
    raw = storage.getItem(KEY_PREFIX + key);
  } catch {
    return { status: "no-disponible" };
  }
  if (raw === null) return { status: "vacio" };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isEnvelope(parsed)) return { status: "invalido" };
    if (parsed.v > schema.version) return { status: "version-futura" };

    const data = migrate(parsed, schema);
    if (!schema.validate(data)) return { status: "invalido" };
    return { status: parsed.v === schema.version ? "ok" : "migrado", value: data };
  } catch {
    return { status: "invalido" };
  }
}

export function writeVersioned<T>(key: string, version: number, data: T): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    const envelope: Envelope = { v: version, data };
    storage.setItem(KEY_PREFIX + key, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    storage.removeItem(KEY_PREFIX + key);
    return true;
  } catch {
    return false;
  }
}

function backupRaw(key: string): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    const raw = storage.getItem(KEY_PREFIX + key);
    if (raw !== null) storage.setItem(`${KEY_PREFIX}${key}:respaldo`, raw);
  } catch {
    /* El respaldo es best-effort; si falla no se bloquea la app. */
  }
}

export const PROGRESS_KEY = "progress";
export const PROGRESS_SCHEMA_VERSION = 1;
export const MAX_STORED_SESSIONS = 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isProgressSnapshot(value: unknown): value is ProgressSnapshot {
  return (
    isRecord(value) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    Array.isArray(value.sessions) &&
    isRecord(value.difficulty) &&
    isRecord(value.reviewCards)
  );
}

export const progressSchema: VersionedSchema<ProgressSnapshot> = {
  version: PROGRESS_SCHEMA_VERSION,
  migrations: {},
  validate: isProgressSnapshot,
};

export function emptySnapshot(now: Date): ProgressSnapshot {
  const timestamp = now.toISOString();
  return { createdAt: timestamp, updatedAt: timestamp, sessions: [], difficulty: {}, reviewCards: {} };
}

export interface LocalProgressStoreOptions {
  now?: () => Date;
  maxSessions?: number;
}

/**
 * Adaptador local del puerto ProgressStore. Mantiene una copia en memoria, de modo que la app
 * funciona aunque no haya persistencia (se pierde al recargar). Si los datos guardados son de una
 * versión futura, trabaja en solo lectura para no destruirlos.
 */
export function createLocalProgressStore(options: LocalProgressStoreOptions = {}): ProgressStore {
  const now = options.now ?? (() => new Date());
  const maxSessions = options.maxSessions ?? MAX_STORED_SESSIONS;
  let cache: ProgressSnapshot | null = null;
  let readOnly = false;

  function load(): ProgressSnapshot {
    if (cache) return cache;
    const result = readVersioned(PROGRESS_KEY, progressSchema);
    if (result.status === "migrado" && result.value) {
      writeVersioned(PROGRESS_KEY, PROGRESS_SCHEMA_VERSION, result.value);
    } else if (result.status === "invalido") {
      backupRaw(PROGRESS_KEY);
    } else if (result.status === "version-futura") {
      readOnly = true;
    }
    cache = result.value ?? emptySnapshot(now());
    return cache;
  }

  type SnapshotChanges = Partial<Pick<ProgressSnapshot, "sessions" | "difficulty" | "reviewCards">>;

  function commit(changes: SnapshotChanges): void {
    cache = { ...load(), ...changes, updatedAt: now().toISOString() };
    if (!readOnly) writeVersioned(PROGRESS_KEY, PROGRESS_SCHEMA_VERSION, cache);
  }

  return {
    async getSnapshot() {
      return structuredClone(load());
    },

    async recordSession(result: SessionResult) {
      const snapshot = load();
      if (snapshot.sessions.some((session) => session.id === result.id)) return;
      commit({ sessions: [...snapshot.sessions, structuredClone(result)].slice(-maxSessions) });
    },

    async listSessions(filter?: { module?: ModuleSlug; exerciseId?: string }) {
      const sessions = load().sessions.filter(
        (session) =>
          (!filter?.module || session.module === filter.module) &&
          (!filter?.exerciseId || session.exerciseId === filter.exerciseId),
      );
      return structuredClone(sessions);
    },

    async getDifficulty(exerciseId: string) {
      const level = load().difficulty[exerciseId]?.level;
      return isDifficultyLevel(level) ? level : undefined;
    },

    async setDifficulty(exerciseId: string, level: DifficultyLevel) {
      const record = { exerciseId, level, updatedAt: now().toISOString() };
      commit({ difficulty: { ...load().difficulty, [exerciseId]: record } });
    },

    async listReviewCards(deckId: string) {
      const cards = Object.values(load().reviewCards).filter((card) => card.deckId === deckId);
      return structuredClone(cards);
    },

    async upsertReviewCards(cards: readonly ReviewCard[]) {
      const reviewCards = { ...load().reviewCards };
      for (const card of cards) reviewCards[card.id] = { ...card };
      commit({ reviewCards });
    },

    async reset() {
      if (readOnly) return;
      removeKey(PROGRESS_KEY);
      cache = emptySnapshot(now());
    },
  };
}
