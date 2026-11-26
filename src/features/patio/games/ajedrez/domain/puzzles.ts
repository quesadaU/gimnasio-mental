/**
 * Puzzles tácticos: tipos, selección por nivel y comprobación de la respuesta del usuario.
 *
 * Una solución es una línea UCI que empieza el bando que mueve en el FEN: índices pares son del
 * usuario, impares del rival (se animan automáticamente). En los temas de mate se acepta
 * cualquier jugada que mantenga el mate forzado, porque una solución distinta también es correcta.
 */

import {
  applyMove,
  findUciMove,
  isCheckmate,
  legalMoves,
  matingMoves,
  moveToUci,
  parseFen,
  type Move,
  type Position,
} from "./chess.ts";

export type ChessTheme =
  | "mate-en-1"
  | "mate-en-2"
  | "horquilla"
  | "clavada"
  | "enfilada"
  | "ataque-descubierto"
  | "promocion"
  | "pieza-indefensa";

export interface ChessPuzzle {
  id: string;
  fen: string;
  solution: readonly string[];
  alternatives?: readonly (readonly string[])[];
  theme: ChessTheme;
  /** Dificultad estimada, escala tipo Elo (600-1800). Define el nivel adaptativo. */
  rating: number;
}

export const THEME_LABEL: Record<ChessTheme, string> = {
  "mate-en-1": "Mate en 1",
  "mate-en-2": "Mate en 2",
  horquilla: "Horquilla",
  clavada: "Clavada",
  enfilada: "Enfilada",
  "ataque-descubierto": "Ataque descubierto",
  promocion: "Promoción",
  "pieza-indefensa": "Pieza indefensa",
};

export const THEME_HINT: Record<ChessTheme, string> = {
  "mate-en-1": "Busca una jugada que dé jaque y deje al rey sin casillas de escape.",
  "mate-en-2": "Primero limita al rey o fuerza su respuesta; el mate llega en la segunda jugada.",
  horquilla: "Una sola pieza puede atacar a la vez a dos piezas valiosas. ¿Dónde?",
  clavada: "Hay una pieza que no puede moverse sin dejar a su rey en jaque. Atácala.",
  enfilada: "Da jaque en línea: cuando el rey se aparte, la pieza de detrás queda expuesta.",
  "ataque-descubierto": "Mueve la pieza que tapa una línea y crea dos amenazas a la vez.",
  promocion: "Un peón está a punto de coronar. Piensa qué pieza conviene elegir.",
  "pieza-indefensa": "Revisa qué piezas rivales no están protegidas.",
};

const MATE_DEPTH: Partial<Record<ChessTheme, number>> = { "mate-en-1": 1, "mate-en-2": 2 };

export function mateDepth(theme: ChessTheme): number | undefined {
  return MATE_DEPTH[theme];
}

/** Nivel 1-10 ↔ rating: cada nivel cubre una franja de 125 puntos desde 600. */
export function ratingForLevel(level: number): number {
  return 600 + (Math.min(10, Math.max(1, level)) - 1) * 125;
}

/** Elige el puzzle no usado con el rating más cercano al del nivel; desempata con `random`. */
export function pickPuzzle(
  puzzles: readonly ChessPuzzle[],
  level: number,
  usedIds: ReadonlySet<string>,
  random: () => number = Math.random,
): ChessPuzzle | undefined {
  const pool = puzzles.filter((puzzle) => !usedIds.has(puzzle.id));
  if (pool.length === 0) return undefined;
  const target = ratingForLevel(level);
  const distance = (puzzle: ChessPuzzle) => Math.abs(puzzle.rating - target);
  const best = Math.min(...pool.map(distance));
  // Tolerancia de media franja para variar entre puzzles de dificultad equivalente.
  const candidates = pool.filter((puzzle) => distance(puzzle) <= best + 62);
  return candidates[Math.floor(random() * candidates.length) % candidates.length];
}

export type MoveVerdict =
  | { kind: "ilegal" }
  | { kind: "incorrecta" }
  | { kind: "correcta"; position: Position; finished: boolean };

/**
 * Evalúa la jugada del usuario en el paso `ply` (par) de la línea, partiendo de `position`.
 * `line` es la línea efectivamente jugada hasta ahora (puede divergir de la solución en mates).
 */
export function judgeMove(
  puzzle: ChessPuzzle,
  position: Position,
  playedLine: readonly string[],
  uci: string,
): MoveVerdict {
  const move = findUciMove(position, uci);
  if (!move) return { kind: "ilegal" };
  const next = applyMove(position, move);
  const depth = mateDepth(puzzle.theme);

  if (depth !== undefined) {
    const movesLeft = depth - playedLine.length / 2;
    if (isCheckmate(next)) return { kind: "correcta", position: next, finished: true };
    if (movesLeft <= 1) return { kind: "incorrecta" };
    const keepsMate = matingMoves(position, movesLeft).some((m) => moveToUci(m) === uci);
    return keepsMate ? { kind: "correcta", position: next, finished: false } : { kind: "incorrecta" };
  }

  const candidateLines = [puzzle.solution, ...(puzzle.alternatives ?? [])];
  const attempt = [...playedLine, uci];
  const matching = candidateLines.filter((line) => attempt.every((step, i) => line[i] === step));
  if (matching.length === 0) return { kind: "incorrecta" };
  const finished = matching.some((line) => line.length === attempt.length);
  return { kind: "correcta", position: next, finished };
}

/** Respuesta del rival: la de la solución si sigue aplicando; si no, una defensa legal. */
export function opponentReply(
  puzzle: ChessPuzzle,
  position: Position,
  playedLine: readonly string[],
): Move | null {
  const candidateLines = [puzzle.solution, ...(puzzle.alternatives ?? [])];
  for (const line of candidateLines) {
    if (playedLine.every((step, i) => line[i] === step) && line.length > playedLine.length) {
      const scripted = findUciMove(position, line[playedLine.length]);
      if (scripted) return scripted;
    }
  }
  const replies = legalMoves(position);
  if (replies.length === 0) return null;
  // Sin guion: la defensa que no permite mate inmediato, si existe; si no, la primera.
  const depth = mateDepth(puzzle.theme);
  if (depth !== undefined) {
    const resilient = replies.find((reply) => matingMoves(applyMove(position, reply), 1, true).length === 0);
    if (resilient) return resilient;
  }
  return replies[0];
}

/** Primera jugada del usuario según la solución, para la pista "mostrar jugada". */
export function solutionMoveAt(puzzle: ChessPuzzle, playedLine: readonly string[]): string | undefined {
  const lines = [puzzle.solution, ...(puzzle.alternatives ?? [])];
  const line = lines.find((l) => playedLine.every((step, i) => l[i] === step));
  if (line) return line[playedLine.length];
  if (mateDepth(puzzle.theme) !== undefined) {
    const position = playedLine.reduce<Position>((pos, uci) => {
      const move = findUciMove(pos, uci);
      return move ? applyMove(pos, move) : pos;
    }, parseFen(puzzle.fen));
    const depth = (mateDepth(puzzle.theme) ?? 1) - playedLine.length / 2;
    const mate = matingMoves(position, depth, true)[0];
    return mate ? moveToUci(mate) : undefined;
  }
  return undefined;
}

/** Número de jugadas del usuario en la solución principal. */
export function userMoveCount(puzzle: ChessPuzzle): number {
  return Math.ceil(puzzle.solution.length / 2);
}
