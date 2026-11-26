/**
 * Práctica de recuperación con Leitner (src/core/spaced-repetition) y repaso intercalado.
 * - La calificación de la tarjeta usa SOLO el primer intento de la sesión.
 * - Los fallos se vuelven a preguntar al final de la misma sesión (máx. MAX_REINTENTOS veces).
 * - El repaso del día mezcla rutas (práctica intercalada) y se limita a 20 tarjetas.
 */

import { cardKey, createCard, reviewCard, selectDueCards } from "../../../core/spaced-repetition.ts";
import type { ReviewCard } from "../../../core/types.ts";

export const LIMITE_REPASO = 20;
export const MAX_REINTENTOS = 2;

export function itemIdDePregunta(leccionId: string, preguntaId: string): string {
  return `${leccionId}.${preguntaId}`;
}

export function cardIdDePregunta(deckId: string, leccionId: string, preguntaId: string): string {
  return cardKey(deckId, itemIdDePregunta(leccionId, preguntaId));
}

/** Separa `habilidades:<ruta>:<leccion>.<pregunta>` en mazo e ítem (el ítem no contiene «:»). */
export function separarCardId(cardId: string): { deckId: string; itemId: string } {
  const corte = cardId.lastIndexOf(":");
  return { deckId: cardId.slice(0, corte), itemId: cardId.slice(corte + 1) };
}

/** Aplica una respuesta a la tarjeta (la crea si es la primera vez). */
export function calificarTarjeta(
  existente: ReviewCard | undefined,
  deckId: string,
  itemId: string,
  correcto: boolean,
  ahora: Date,
): ReviewCard {
  const base = existente ?? createCard(deckId, itemId, ahora);
  return reviewCard(base, correcto ? "correcto" : "incorrecto", ahora);
}

/**
 * Ordena alternando mazos (round-robin), manteniendo el orden relativo dentro de cada mazo.
 * Así dos tarjetas seguidas son de rutas distintas siempre que sea posible.
 */
export function intercalarPorMazo<T extends { deckId: string }>(tarjetas: readonly T[]): T[] {
  const colas = new Map<string, T[]>();
  for (const tarjeta of tarjetas) {
    const cola = colas.get(tarjeta.deckId);
    if (cola) cola.push(tarjeta);
    else colas.set(tarjeta.deckId, [tarjeta]);
  }
  const resultado: T[] = [];
  const listas = [...colas.values()];
  while (resultado.length < tarjetas.length) {
    for (const lista of listas) {
      const siguiente = lista.shift();
      if (siguiente) resultado.push(siguiente);
    }
  }
  return resultado;
}

/**
 * Tarjetas para el repaso del día: vencidas, con contenido disponible, como máximo `limite`
 * (primero las más atrasadas) e intercaladas por ruta.
 */
export function seleccionarRepaso(
  tarjetas: readonly ReviewCard[],
  ahora: Date,
  idsDisponibles: ReadonlySet<string>,
  limite = LIMITE_REPASO,
): ReviewCard[] {
  const conContenido = tarjetas.filter((tarjeta) => idsDisponibles.has(tarjeta.id));
  return intercalarPorMazo(selectDueCards(conContenido, ahora, limite));
}

export interface ColaRecuperacion {
  pendientes: readonly string[];
  /** Resultado del primer intento de cada ítem: es lo que califica la tarjeta. */
  primerIntento: Readonly<Record<string, boolean>>;
  reintentos: Readonly<Record<string, number>>;
}

export function crearCola(ids: readonly string[]): ColaRecuperacion {
  return { pendientes: [...ids], primerIntento: {}, reintentos: {} };
}

export function actualDeCola(cola: ColaRecuperacion): string | undefined {
  return cola.pendientes[0];
}

/** Registra la respuesta al ítem actual. Un fallo lo reencola al final mientras queden reintentos. */
export function responderCola(cola: ColaRecuperacion, correcto: boolean): ColaRecuperacion {
  const [actual, ...resto] = cola.pendientes;
  if (actual === undefined) return cola;
  const yaCalificado = Object.prototype.hasOwnProperty.call(cola.primerIntento, actual);
  const primerIntento = yaCalificado ? cola.primerIntento : { ...cola.primerIntento, [actual]: correcto };
  const usados = cola.reintentos[actual] ?? 0;
  if (!correcto && usados < MAX_REINTENTOS) {
    return {
      pendientes: [...resto, actual],
      primerIntento,
      reintentos: { ...cola.reintentos, [actual]: usados + 1 },
    };
  }
  return { pendientes: resto, primerIntento, reintentos: cola.reintentos };
}

export function colaTerminada(cola: ColaRecuperacion): boolean {
  return cola.pendientes.length === 0;
}

/** Tarjetas a guardar a partir de los primeros intentos de la sesión. */
export function tarjetasCalificadas(
  cola: ColaRecuperacion,
  existentes: readonly ReviewCard[],
  deckDe: (cardId: string) => { deckId: string; itemId: string },
  ahora: Date,
): ReviewCard[] {
  const porId = new Map(existentes.map((tarjeta) => [tarjeta.id, tarjeta]));
  return Object.entries(cola.primerIntento).map(([cardId, correcto]) => {
    const { deckId, itemId } = deckDe(cardId);
    return calificarTarjeta(porId.get(cardId), deckId, itemId, correcto, ahora);
  });
}
