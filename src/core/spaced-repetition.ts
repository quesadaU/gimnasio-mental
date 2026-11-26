/**
 * Repetición espaciada con sistema Leitner de 5 cajas. Un acierto promueve la tarjeta a la
 * caja siguiente (intervalo mayor); un fallo la devuelve a la caja 1. Los fallos deben
 * repetirse también dentro de la misma sesión; eso lo decide la UI, no este módulo.
 */

import type { IsoDateTime, ReviewCard, ReviewGrade } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const LEITNER_INTERVAL_DAYS: readonly number[] = [1, 3, 7, 14, 30];
export const LEITNER_BOXES = LEITNER_INTERVAL_DAYS.length;

export function cardKey(deckId: string, itemId: string): string {
  return `${deckId}:${itemId}`;
}

export function createCard(deckId: string, itemId: string, now: Date): ReviewCard {
  const timestamp = now.toISOString();
  return {
    id: cardKey(deckId, itemId),
    deckId,
    box: 1,
    dueAt: timestamp,
    reviews: 0,
    lapses: 0,
    updatedAt: timestamp,
  };
}

export function reviewCard(card: ReviewCard, grade: ReviewGrade, now: Date): ReviewCard {
  const box = grade === "correcto" ? Math.min(card.box + 1, LEITNER_BOXES) : 1;
  const timestamp = now.toISOString();
  return {
    ...card,
    box,
    dueAt: addDays(now, intervalDays(box)),
    lastReviewedAt: timestamp,
    reviews: card.reviews + 1,
    lapses: card.lapses + (grade === "incorrecto" ? 1 : 0),
    updatedAt: timestamp,
  };
}

export function isDue(card: ReviewCard, now: Date): boolean {
  return Date.parse(card.dueAt) <= now.getTime();
}

/** Tarjetas vencidas, primero las más atrasadas; `limit` acota la carga de la sesión. */
export function selectDueCards(
  cards: readonly ReviewCard[],
  now: Date,
  limit = 20,
): ReviewCard[] {
  return cards
    .filter((card) => isDue(card, now))
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt) || a.box - b.box)
    .slice(0, Math.max(0, limit));
}

/** Una tarjeta se considera consolidada cuando alcanza la última caja. */
export function isMastered(card: ReviewCard): boolean {
  return card.box >= LEITNER_BOXES;
}

function intervalDays(box: number): number {
  const index = Math.min(Math.max(box, 1), LEITNER_BOXES) - 1;
  return LEITNER_INTERVAL_DAYS[index];
}

function addDays(date: Date, days: number): IsoDateTime {
  return new Date(date.getTime() + days * DAY_MS).toISOString();
}
