import { test } from "node:test";
import assert from "node:assert/strict";
import type { ReviewCard } from "../../../core/types.ts";
import { createCard } from "../../../core/spaced-repetition.ts";
import {
  answerCurrent,
  cardsForNewIdeas,
  createReviewSession,
  currentCardId,
  ideaCardId,
  isReviewFinished,
  parseIdeaCardId,
  selectTodayReview,
  summarizeReview,
  textIdsForCards,
} from "./review.ts";

const NOW = new Date("2026-11-25T10:00:00.000Z");
const ideas = [
  { id: "idea-a", prompt: "¿A?", answer: "A" },
  { id: "idea-b", prompt: "¿B?", answer: "B" },
];

test("ideaCardId y parseIdeaCardId son inversos", () => {
  const id = ideaCardId("la-caverna", "sombras-realidad");
  assert.equal(id, "lectura:la-caverna/sombras-realidad");
  assert.deepEqual(parseIdeaCardId(id), { textId: "la-caverna", ideaId: "sombras-realidad" });
  assert.equal(parseIdeaCardId("habilidades:x/y"), undefined);
  assert.equal(parseIdeaCardId("lectura:sin-separador"), undefined);
  assert.equal(parseIdeaCardId("lectura:texto/"), undefined);
});

test("cardsForNewIdeas crea tarjetas que vencen mañana y no duplica las existentes", () => {
  const existing = [createCard("lectura", "texto/idea-a", new Date("2026-11-01T00:00:00Z"))];
  const created = cardsForNewIdeas("texto", ideas, existing, NOW);
  assert.equal(created.length, 1);
  assert.equal(created[0].id, "lectura:texto/idea-b");
  assert.equal(created[0].deckId, "lectura");
  assert.equal(created[0].box, 1);
  assert.equal(created[0].dueAt, "2026-11-26T10:00:00.000Z");
  assert.deepEqual(cardsForNewIdeas("texto", ideas, [...existing, ...created], NOW), []);
});

function cardDue(itemId: string, dueAt: string, deckId = "lectura"): ReviewCard {
  return { ...createCard(deckId, itemId, NOW), dueAt };
}

test("selectTodayReview filtra por mazo, vencimiento, ordena por atraso y limita a 20", () => {
  const cards: ReviewCard[] = [
    cardDue("t/futura", "2026-12-01T00:00:00Z"),
    cardDue("t/otro-mazo", "2026-11-01T00:00:00Z", "habilidades"),
    cardDue("t/reciente", "2026-11-25T09:00:00Z"),
    cardDue("t/antigua", "2026-11-20T00:00:00Z"),
  ];
  const selected = selectTodayReview(cards, NOW);
  assert.deepEqual(
    selected.map((card) => card.id),
    ["lectura:t/antigua", "lectura:t/reciente"],
  );

  const many = Array.from({ length: 30 }, (_, i) => cardDue(`t/i${i}`, "2026-11-24T00:00:00Z"));
  assert.equal(selectTodayReview(many, NOW).length, 20);
  assert.equal(selectTodayReview(many, NOW, 50).length, 20, "nunca supera el límite diario");
  assert.equal(selectTodayReview(many, NOW, 5).length, 5);
});

test("textIdsForCards devuelve los textos sin repetir", () => {
  const cards = [cardDue("a/1", NOW.toISOString()), cardDue("a/2", NOW.toISOString()), cardDue("b/1", NOW.toISOString())];
  assert.deepEqual(textIdsForCards(cards), ["a", "b"]);
});

test("la sesión de repaso califica una vez y vuelve a preguntar los fallos al final", () => {
  const a = cardDue("t/a", "2026-11-24T00:00:00Z");
  const b = cardDue("t/b", "2026-11-24T00:00:00Z");
  let state = createReviewSession([a, b]);
  assert.equal(currentCardId(state), a.id);

  const first = answerCurrent(state, "incorrecto", NOW);
  state = first.state;
  assert.equal(first.updatedCard?.lapses, 1);
  assert.equal(first.updatedCard?.box, 1);
  assert.deepEqual(state.queue, [b.id, a.id], "el fallo vuelve al final");

  const second = answerCurrent(state, "correcto", NOW);
  state = second.state;
  assert.equal(second.updatedCard?.box, 2);

  const retry = answerCurrent(state, "incorrecto", NOW);
  state = retry.state;
  assert.equal(retry.updatedCard, undefined, "el reintento no vuelve a penalizar");
  assert.ok(isReviewFinished(state), "un fallo solo se reintenta una vez");
  assert.equal(state.cards[a.id].lapses, 1);

  assert.deepEqual(summarizeReview(state), { reviewed: 2, remembered: 1 });
  assert.deepEqual(answerCurrent(state, "correcto", NOW).state, state, "sin tarjetas no hace nada");
});
