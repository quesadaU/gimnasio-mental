/**
 * Ideas clave como tarjetas Leitner (mazo "lectura") y sesión de "repaso del día".
 * Se apoya en el núcleo (`core/spaced-repetition`); aquí solo se decide qué entra y en qué orden.
 */

import { cardKey, createCard, reviewCard, selectDueCards } from "../../../core/spaced-repetition.ts";
import type { ReviewCard, ReviewGrade } from "../../../core/types.ts";
import type { KeyIdea } from "./types.ts";

export const LECTURA_DECK_ID = "lectura";
/** Límite por sesión de repaso: acota la carga cognitiva y evita el repaso infinito. */
export const DAILY_REVIEW_LIMIT = 20;

const ITEM_SEPARATOR = "/";

export function ideaItemId(textId: string, ideaId: string): string {
  return `${textId}${ITEM_SEPARATOR}${ideaId}`;
}

export function ideaCardId(textId: string, ideaId: string): string {
  return cardKey(LECTURA_DECK_ID, ideaItemId(textId, ideaId));
}

/** Recupera texto e idea a partir del id de tarjeta `lectura:<texto>/<idea>`. */
export function parseIdeaCardId(cardId: string): { textId: string; ideaId: string } | undefined {
  const prefix = `${LECTURA_DECK_ID}:`;
  if (!cardId.startsWith(prefix)) return undefined;
  const item = cardId.slice(prefix.length);
  const separator = item.indexOf(ITEM_SEPARATOR);
  if (separator <= 0 || separator === item.length - 1) return undefined;
  return { textId: item.slice(0, separator), ideaId: item.slice(separator + 1) };
}

/**
 * Tarjetas nuevas para las ideas de un texto. No reinicia las que ya existen (releer un texto no
 * debe borrar el progreso de su repaso). Las nuevas vencen mañana: repasarlas en el acto, justo
 * después de leer, aporta poco espaciado.
 */
export function cardsForNewIdeas(
  textId: string,
  ideas: readonly KeyIdea[],
  existing: readonly ReviewCard[],
  now: Date,
): ReviewCard[] {
  const existingIds = new Set(existing.map((card) => card.id));
  const firstDue = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  return ideas
    .filter((idea) => !existingIds.has(ideaCardId(textId, idea.id)))
    .map((idea) => ({
      ...createCard(LECTURA_DECK_ID, ideaItemId(textId, idea.id), now),
      dueAt: firstDue,
    }));
}

/** Tarjetas del repaso de hoy: solo del mazo de lectura, vencidas, máximo `limit`. */
export function selectTodayReview(
  cards: readonly ReviewCard[],
  now: Date,
  limit = DAILY_REVIEW_LIMIT,
): ReviewCard[] {
  const deck = cards.filter((card) => card.deckId === LECTURA_DECK_ID);
  return selectDueCards(deck, now, Math.min(limit, DAILY_REVIEW_LIMIT));
}

/** Ids de texto distintos que hay que cargar para mostrar las tarjetas. */
export function textIdsForCards(cards: readonly ReviewCard[]): string[] {
  const ids = new Set<string>();
  for (const card of cards) {
    const parsed = parseIdeaCardId(card.id);
    if (parsed) ids.add(parsed.textId);
  }
  return [...ids];
}

/**
 * Estado de una sesión de repaso. Cada tarjeta se califica (Leitner) solo en su primer intento;
 * si se falla, vuelve una vez al final de la cola para recuperarla de nuevo en la misma sesión
 * (práctica, sin volver a penalizarla).
 */
export interface ReviewSessionState {
  queue: readonly string[];
  cards: Readonly<Record<string, ReviewCard>>;
  graded: Readonly<Record<string, ReviewGrade>>;
  retried: readonly string[];
}

export function createReviewSession(cards: readonly ReviewCard[]): ReviewSessionState {
  const byId: Record<string, ReviewCard> = {};
  for (const card of cards) byId[card.id] = card;
  return { queue: cards.map((card) => card.id), cards: byId, graded: {}, retried: [] };
}

export function currentCardId(state: ReviewSessionState): string | undefined {
  return state.queue[0];
}

export function isReviewFinished(state: ReviewSessionState): boolean {
  return state.queue.length === 0;
}

export interface ReviewStep {
  state: ReviewSessionState;
  /** Tarjeta actualizada que hay que persistir; `undefined` si era un reintento. */
  updatedCard?: ReviewCard;
}

export function answerCurrent(
  state: ReviewSessionState,
  grade: ReviewGrade,
  now: Date,
): ReviewStep {
  const [cardId, ...rest] = state.queue;
  if (cardId === undefined) return { state };

  const isFirstAttempt = state.graded[cardId] === undefined;
  const shouldRetry = grade === "incorrecto" && !state.retried.includes(cardId);
  const queue = shouldRetry ? [...rest, cardId] : rest;
  const retried = shouldRetry ? [...state.retried, cardId] : state.retried;

  if (!isFirstAttempt) {
    return { state: { ...state, queue, retried } };
  }

  const updatedCard = reviewCard(state.cards[cardId], grade, now);
  return {
    state: {
      queue,
      retried,
      cards: { ...state.cards, [cardId]: updatedCard },
      graded: { ...state.graded, [cardId]: grade },
    },
    updatedCard,
  };
}

export interface ReviewSummary {
  reviewed: number;
  remembered: number;
}

export function summarizeReview(state: ReviewSessionState): ReviewSummary {
  const grades = Object.values(state.graded);
  return {
    reviewed: grades.length,
    remembered: grades.filter((grade) => grade === "correcto").length,
  };
}
