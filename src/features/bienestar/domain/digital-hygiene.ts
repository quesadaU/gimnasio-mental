/**
 * Higiene digital: autoobservación sin puntuaciones ni etiquetas, y micro-retos con seguimiento
 * local. No hay rachas que se "rompan": cada día marcado cuenta y dejar un reto está bien.
 */

import type { DigitalChallenge, FrequencyAnswer, SelfCheckQuestion } from "./types.ts";

export const CHALLENGES_STORAGE_KEY = "bienestar:retos";
export const CHALLENGES_SCHEMA_VERSION = 1;
export const MAX_CHALLENGE_HISTORY = 50;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SelfCheckReflection {
  questionId: string;
  reflection: string;
  suggestedChallengeId: string;
}

/** Devuelve solo reflexiones para lo que la persona marca como frecuente. Sin total ni categoría. */
export function reflectOnAnswers(
  questions: readonly SelfCheckQuestion[],
  answers: Readonly<Record<string, FrequencyAnswer | undefined>>,
): SelfCheckReflection[] {
  return questions
    .filter((question) => {
      const answer = answers[question.id];
      return answer === "a-menudo" || answer === "casi-siempre";
    })
    .map((question) => ({
      questionId: question.id,
      reflection: question.reflection,
      suggestedChallengeId: question.suggestedChallengeId,
    }));
}

export function suggestedChallengeIds(reflections: readonly SelfCheckReflection[]): string[] {
  return [...new Set(reflections.map((reflection) => reflection.suggestedChallengeId))];
}

export type ChallengeStatus = "activo" | "terminado" | "dejado";

export interface ChallengeProgress {
  challengeId: string;
  startedAt: string;
  durationDays: number;
  /** Días (AAAA-MM-DD, hora local) en los que la persona marcó que lo hizo. */
  checkins: string[];
  status: ChallengeStatus;
  endedAt?: string;
}

export interface ChallengesData {
  items: ChallengeProgress[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isChallengeProgress(value: unknown): value is ChallengeProgress {
  return (
    isRecord(value) &&
    typeof value.challengeId === "string" &&
    typeof value.startedAt === "string" &&
    typeof value.durationDays === "number" &&
    Array.isArray(value.checkins) &&
    value.checkins.every((day) => typeof day === "string") &&
    (value.status === "activo" || value.status === "terminado" || value.status === "dejado") &&
    (value.endedAt === undefined || typeof value.endedAt === "string")
  );
}

export function isChallengesData(value: unknown): value is ChallengesData {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isChallengeProgress);
}

export const challengesSchema = {
  version: CHALLENGES_SCHEMA_VERSION,
  migrations: {},
  validate: isChallengesData,
};

export function emptyChallenges(): ChallengesData {
  return { items: [] };
}

/** Fecha local AAAA-MM-DD; el día "cuenta" según el reloj de la persona, no en UTC. */
export function localDay(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function activeChallenge(data: ChallengesData, challengeId: string): ChallengeProgress | undefined {
  return data.items.find((item) => item.challengeId === challengeId && item.status === "activo");
}

export function startChallenge(data: ChallengesData, challenge: DigitalChallenge, now: Date): ChallengesData {
  if (activeChallenge(data, challenge.id)) return data;
  const progress: ChallengeProgress = {
    challengeId: challenge.id,
    startedAt: now.toISOString(),
    durationDays: challenge.durationDays,
    checkins: [],
    status: "activo",
  };
  return { items: [progress, ...data.items].slice(0, MAX_CHALLENGE_HISTORY) };
}

/** Marca hoy como hecho (idempotente). Si se completan los días del reto, pasa a "terminado". */
export function checkIn(data: ChallengesData, challengeId: string, now: Date): ChallengesData {
  const today = localDay(now);
  return mapActive(data, challengeId, (item) => {
    if (item.checkins.includes(today)) return item;
    const checkins = [...item.checkins, today];
    const done = checkins.length >= item.durationDays;
    return {
      ...item,
      checkins,
      status: done ? "terminado" : "activo",
      ...(done ? { endedAt: now.toISOString() } : {}),
    };
  });
}

export function leaveChallenge(data: ChallengesData, challengeId: string, now: Date): ChallengesData {
  return mapActive(data, challengeId, (item) => ({ ...item, status: "dejado", endedAt: now.toISOString() }));
}

export interface ChallengeSummary {
  dayNumber: number;
  daysMarked: number;
  durationDays: number;
  markedToday: boolean;
  /** El periodo del reto ya pasó (aunque no se marcaran todos los días; no se penaliza). */
  periodOver: boolean;
}

export function summarize(progress: ChallengeProgress, now: Date): ChallengeSummary {
  const start = new Date(progress.startedAt);
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayNumber = Math.max(1, Math.round((nowMidnight - startMidnight) / DAY_MS) + 1);
  return {
    dayNumber,
    daysMarked: progress.checkins.length,
    durationDays: progress.durationDays,
    markedToday: progress.checkins.includes(localDay(now)),
    periodOver: dayNumber > progress.durationDays,
  };
}

function mapActive(
  data: ChallengesData,
  challengeId: string,
  change: (item: ChallengeProgress) => ChallengeProgress,
): ChallengesData {
  let changed = false;
  const items = data.items.map((item) => {
    if (changed || item.challengeId !== challengeId || item.status !== "activo") return item;
    changed = true;
    return change(item);
  });
  return changed ? { items } : data;
}
