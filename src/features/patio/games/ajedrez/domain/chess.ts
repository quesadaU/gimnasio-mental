/**
 * Reglas de ajedrez en TypeScript puro, sin dependencias (ADR-0001, punto 8).
 *
 * Alcance: lectura y escritura de FEN, generación de movimientos legales (incluidos enroque,
 * captura al paso y promoción), detección de jaque, mate y ahogado, y aplicación de jugadas UCI.
 * Es suficiente para validar puzzles tácticos y animar la respuesta del rival. No implementa
 * reglas de tablas por repetición ni por 50 movimientos (irrelevantes en un puzzle corto).
 *
 * Casillas: índice 0..63, `rank * 8 + file`, con rank 0 = fila 1 y file 0 = columna a.
 */

export type Color = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export type PromotionPiece = "q" | "r" | "b" | "n";

export interface Piece {
  color: Color;
  type: PieceType;
}

export interface CastlingRights {
  K: boolean;
  Q: boolean;
  k: boolean;
  q: boolean;
}

export interface Position {
  board: readonly (Piece | null)[];
  turn: Color;
  castling: CastlingRights;
  /** Casilla de captura al paso (la que salta el peón), o null. */
  enPassant: number | null;
  halfmove: number;
  fullmove: number;
}

export type MoveFlag = "normal" | "doble" | "al-paso" | "enroque-corto" | "enroque-largo";

export interface Move {
  from: number;
  to: number;
  piece: PieceType;
  color: Color;
  captured?: PieceType;
  promotion?: PromotionPiece;
  flag: MoveFlag;
}

const FILES = "abcdefgh";

export function fileOf(square: number): number {
  return square & 7;
}

export function rankOf(square: number): number {
  return square >> 3;
}

export function squareName(square: number): string {
  return `${FILES[fileOf(square)]}${rankOf(square) + 1}`;
}

export function parseSquare(name: string): number | null {
  if (!/^[a-h][1-8]$/.test(name)) return null;
  return (name.charCodeAt(1) - 49) * 8 + (name.charCodeAt(0) - 97);
}

export function opposite(color: Color): Color {
  return color === "w" ? "b" : "w";
}

// ---------------------------------------------------------------------------------------------
// FEN
// ---------------------------------------------------------------------------------------------

export class FenError extends Error {}

export function parseFen(fen: string): Position {
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4 || parts.length > 6) throw new FenError("FEN con número de campos incorrecto");
  const [placement, turn, castling, ep, half = "0", full = "1"] = parts;

  const rows = placement.split("/");
  if (rows.length !== 8) throw new FenError("FEN: se esperaban 8 filas");
  const board: (Piece | null)[] = new Array(64).fill(null);
  rows.forEach((row, index) => {
    const rank = 7 - index;
    let file = 0;
    for (const char of row) {
      if (/[1-8]/.test(char)) {
        file += Number(char);
      } else if (/[pnbrqkPNBRQK]/.test(char)) {
        if (file > 7) throw new FenError(`FEN: fila ${8 - index} demasiado larga`);
        const color: Color = char === char.toUpperCase() ? "w" : "b";
        board[rank * 8 + file] = { color, type: char.toLowerCase() as PieceType };
        file += 1;
      } else {
        throw new FenError(`FEN: carácter no válido "${char}"`);
      }
    }
    if (file !== 8) throw new FenError(`FEN: la fila ${8 - index} no tiene 8 casillas`);
  });

  for (const color of ["w", "b"] as const) {
    const kings = board.filter((p) => p?.type === "k" && p.color === color).length;
    if (kings !== 1) throw new FenError("FEN: cada bando debe tener exactamente un rey");
  }
  if (board.some((p, sq) => p?.type === "p" && (rankOf(sq) === 0 || rankOf(sq) === 7))) {
    throw new FenError("FEN: hay peones en la primera u octava fila");
  }

  if (turn !== "w" && turn !== "b") throw new FenError("FEN: turno no válido");
  if (!/^(-|[KQkq]{1,4})$/.test(castling)) throw new FenError("FEN: enroque no válido");

  let enPassant: number | null = null;
  if (ep !== "-") {
    enPassant = parseSquare(ep);
    if (enPassant === null || (rankOf(enPassant) !== 2 && rankOf(enPassant) !== 5)) {
      throw new FenError("FEN: casilla al paso no válida");
    }
  }

  const position: Position = {
    board,
    turn,
    castling: {
      K: castling.includes("K"),
      Q: castling.includes("Q"),
      k: castling.includes("k"),
      q: castling.includes("q"),
    },
    enPassant,
    halfmove: Number.parseInt(half, 10) || 0,
    fullmove: Number.parseInt(full, 10) || 1,
  };

  if (isSquareAttacked(position, kingSquare(position, opposite(turn)), turn)) {
    throw new FenError("FEN: el bando que no mueve está en jaque");
  }
  return position;
}

export function toFen(position: Position): string {
  const rows: string[] = [];
  for (let rank = 7; rank >= 0; rank--) {
    let row = "";
    let empty = 0;
    for (let file = 0; file < 8; file++) {
      const piece = position.board[rank * 8 + file];
      if (!piece) {
        empty += 1;
        continue;
      }
      if (empty) row += String(empty);
      empty = 0;
      row += piece.color === "w" ? piece.type.toUpperCase() : piece.type;
    }
    if (empty) row += String(empty);
    rows.push(row);
  }
  const c = position.castling;
  const castling = `${c.K ? "K" : ""}${c.Q ? "Q" : ""}${c.k ? "k" : ""}${c.q ? "q" : ""}` || "-";
  const ep = position.enPassant === null ? "-" : squareName(position.enPassant);
  return `${rows.join("/")} ${position.turn} ${castling} ${ep} ${position.halfmove} ${position.fullmove}`;
}

// ---------------------------------------------------------------------------------------------
// Ataques
// ---------------------------------------------------------------------------------------------

const KNIGHT_STEPS: readonly [number, number][] = [
  [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2],
];
const KING_STEPS: readonly [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];
const ROOK_DIRS: readonly [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BISHOP_DIRS: readonly [number, number][] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

function offset(square: number, df: number, dr: number): number | null {
  const file = fileOf(square) + df;
  const rank = rankOf(square) + dr;
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return rank * 8 + file;
}

export function kingSquare(position: Position, color: Color): number {
  const index = position.board.findIndex((p) => p?.type === "k" && p.color === color);
  if (index < 0) throw new Error(`No hay rey ${color}`);
  return index;
}

/** ¿Ataca alguna pieza de `by` la casilla `square`? */
export function isSquareAttacked(position: Position, square: number, by: Color): boolean {
  const board = position.board;
  const pawnDir = by === "w" ? -1 : 1; // el peón atacante está una fila "detrás" de la casilla
  for (const df of [-1, 1]) {
    const from = offset(square, df, pawnDir);
    const piece = from === null ? null : board[from];
    if (piece && piece.color === by && piece.type === "p") return true;
  }
  for (const [df, dr] of KNIGHT_STEPS) {
    const from = offset(square, df, dr);
    const piece = from === null ? null : board[from];
    if (piece && piece.color === by && piece.type === "n") return true;
  }
  for (const [df, dr] of KING_STEPS) {
    const from = offset(square, df, dr);
    const piece = from === null ? null : board[from];
    if (piece && piece.color === by && piece.type === "k") return true;
  }
  const sliders: [readonly [number, number][], PieceType][] = [
    [ROOK_DIRS, "r"],
    [BISHOP_DIRS, "b"],
  ];
  for (const [dirs, type] of sliders) {
    for (const [df, dr] of dirs) {
      let current = offset(square, df, dr);
      while (current !== null) {
        const piece = board[current];
        if (piece) {
          if (piece.color === by && (piece.type === type || piece.type === "q")) return true;
          break;
        }
        current = offset(current, df, dr);
      }
    }
  }
  return false;
}

export function isInCheck(position: Position, color: Color = position.turn): boolean {
  return isSquareAttacked(position, kingSquare(position, color), opposite(color));
}

// ---------------------------------------------------------------------------------------------
// Generación de movimientos
// ---------------------------------------------------------------------------------------------

const PROMOTIONS: readonly PromotionPiece[] = ["q", "r", "b", "n"];

function pseudoLegalMoves(position: Position): Move[] {
  const moves: Move[] = [];
  const { board, turn } = position;

  for (let from = 0; from < 64; from++) {
    const piece = board[from];
    if (!piece || piece.color !== turn) continue;

    const push = (to: number, flag: MoveFlag = "normal", captured?: PieceType) => {
      moves.push({ from, to, piece: piece.type, color: turn, captured, flag });
    };

    switch (piece.type) {
      case "p": {
        const dir = turn === "w" ? 1 : -1;
        const startRank = turn === "w" ? 1 : 6;
        const lastRank = turn === "w" ? 7 : 0;
        const addPawn = (to: number, flag: MoveFlag, captured?: PieceType) => {
          if (rankOf(to) === lastRank) {
            for (const promotion of PROMOTIONS) {
              moves.push({ from, to, piece: "p", color: turn, captured, promotion, flag });
            }
          } else {
            push(to, flag, captured);
          }
        };
        const one = offset(from, 0, dir);
        if (one !== null && !board[one]) {
          addPawn(one, "normal");
          const two = offset(from, 0, 2 * dir);
          if (rankOf(from) === startRank && two !== null && !board[two]) push(two, "doble");
        }
        for (const df of [-1, 1]) {
          const to = offset(from, df, dir);
          if (to === null) continue;
          const target = board[to];
          if (target && target.color !== turn) addPawn(to, "normal", target.type);
          else if (!target && to === position.enPassant) push(to, "al-paso", "p");
        }
        break;
      }
      case "n":
      case "k": {
        const steps = piece.type === "n" ? KNIGHT_STEPS : KING_STEPS;
        for (const [df, dr] of steps) {
          const to = offset(from, df, dr);
          if (to === null) continue;
          const target = board[to];
          if (!target) push(to);
          else if (target.color !== turn) push(to, "normal", target.type);
        }
        if (piece.type === "k") addCastling(position, from, moves);
        break;
      }
      default: {
        const dirs =
          piece.type === "r" ? ROOK_DIRS : piece.type === "b" ? BISHOP_DIRS : [...ROOK_DIRS, ...BISHOP_DIRS];
        for (const [df, dr] of dirs) {
          let to = offset(from, df, dr);
          while (to !== null) {
            const target = board[to];
            if (!target) {
              push(to);
            } else {
              if (target.color !== turn) push(to, "normal", target.type);
              break;
            }
            to = offset(to, df, dr);
          }
        }
      }
    }
  }
  return moves;
}

function addCastling(position: Position, from: number, moves: Move[]): void {
  const { board, turn, castling } = position;
  const home = turn === "w" ? 4 : 60;
  if (from !== home) return;
  const enemy = opposite(turn);
  if (isSquareAttacked(position, home, enemy)) return;

  const rook = (square: number) => {
    const piece = board[square];
    return piece?.type === "r" && piece.color === turn;
  };
  const canShort = turn === "w" ? castling.K : castling.k;
  const canLong = turn === "w" ? castling.Q : castling.q;

  if (
    canShort &&
    rook(home + 3) &&
    !board[home + 1] &&
    !board[home + 2] &&
    !isSquareAttacked(position, home + 1, enemy) &&
    !isSquareAttacked(position, home + 2, enemy)
  ) {
    moves.push({ from, to: home + 2, piece: "k", color: turn, flag: "enroque-corto" });
  }
  if (
    canLong &&
    rook(home - 4) &&
    !board[home - 1] &&
    !board[home - 2] &&
    !board[home - 3] &&
    !isSquareAttacked(position, home - 1, enemy) &&
    !isSquareAttacked(position, home - 2, enemy)
  ) {
    moves.push({ from, to: home - 2, piece: "k", color: turn, flag: "enroque-largo" });
  }
}

/** Aplica un movimiento (se asume generado por `legalMoves`) y devuelve una posición nueva. */
export function applyMove(position: Position, move: Move): Position {
  const board = position.board.slice();
  const moving = board[move.from];
  if (!moving) throw new Error(`No hay pieza en ${squareName(move.from)}`);

  board[move.from] = null;
  if (move.flag === "al-paso") {
    const capturedSquare = move.to + (move.color === "w" ? -8 : 8);
    board[capturedSquare] = null;
  }
  board[move.to] = move.promotion ? { color: moving.color, type: move.promotion } : moving;

  if (move.flag === "enroque-corto") {
    board[move.from + 1] = board[move.from + 3];
    board[move.from + 3] = null;
  } else if (move.flag === "enroque-largo") {
    board[move.from - 1] = board[move.from - 4];
    board[move.from - 4] = null;
  }

  const castling = { ...position.castling };
  if (moving.type === "k") {
    if (moving.color === "w") castling.K = castling.Q = false;
    else castling.k = castling.q = false;
  }
  const touchCorner = (square: number) => {
    if (square === 0) castling.Q = false;
    if (square === 7) castling.K = false;
    if (square === 56) castling.q = false;
    if (square === 63) castling.k = false;
  };
  touchCorner(move.from);
  touchCorner(move.to);

  return {
    board,
    turn: opposite(position.turn),
    castling,
    enPassant: move.flag === "doble" ? (move.from + move.to) / 2 : null,
    halfmove: moving.type === "p" || move.captured ? 0 : position.halfmove + 1,
    fullmove: position.turn === "b" ? position.fullmove + 1 : position.fullmove,
  };
}

export function legalMoves(position: Position): Move[] {
  return pseudoLegalMoves(position).filter((move) => {
    const next = applyMove(position, move);
    return !isSquareAttacked(next, kingSquare(next, move.color), next.turn);
  });
}

export function legalMovesFrom(position: Position, from: number): Move[] {
  return legalMoves(position).filter((move) => move.from === from);
}

export type GameStatus = "en-juego" | "jaque" | "mate" | "ahogado";

export function gameStatus(position: Position): GameStatus {
  const check = isInCheck(position);
  const hasMoves = legalMoves(position).length > 0;
  if (!hasMoves) return check ? "mate" : "ahogado";
  return check ? "jaque" : "en-juego";
}

export function isCheckmate(position: Position): boolean {
  return gameStatus(position) === "mate";
}

// ---------------------------------------------------------------------------------------------
// UCI
// ---------------------------------------------------------------------------------------------

export function moveToUci(move: Move): string {
  return `${squareName(move.from)}${squareName(move.to)}${move.promotion ?? ""}`;
}

/** Busca la jugada legal que corresponde a un UCI ("e2e4", "e7e8q"). Devuelve null si es ilegal. */
export function findUciMove(position: Position, uci: string): Move | null {
  const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci);
  if (!match) return null;
  const from = parseSquare(match[1]);
  const to = parseSquare(match[2]);
  const promotion = match[3] as PromotionPiece | undefined;
  return (
    legalMoves(position).find(
      (move) => move.from === from && move.to === to && move.promotion === promotion,
    ) ?? null
  );
}

/** Aplica una línea UCI completa. Lanza un error indicando la primera jugada ilegal. */
export function applyUciLine(position: Position, line: readonly string[]): Position {
  let current = position;
  line.forEach((uci, index) => {
    const move = findUciMove(current, uci);
    if (!move) throw new Error(`Jugada ilegal en el índice ${index}: ${uci} (${toFen(current)})`);
    current = applyMove(current, move);
  });
  return current;
}

// ---------------------------------------------------------------------------------------------
// Material y búsqueda de mate
// ---------------------------------------------------------------------------------------------

const PIECE_VALUE: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

/** Material de `color` menos el del rival, en peones. */
export function materialBalance(position: Position, color: Color): number {
  return position.board.reduce((sum, piece) => {
    if (!piece) return sum;
    const value = PIECE_VALUE[piece.type];
    return sum + (piece.color === color ? value : -value);
  }, 0);
}

/**
 * ¿Puede el bando al que le toca forzar el mate en como máximo `depth` jugadas propias?
 * Búsqueda exhaustiva: apta para depth ≤ 2 en el navegador y ≤ 3 en pruebas.
 */
export function forcesMate(position: Position, depth: number): boolean {
  return matingMoves(position, depth, true).length > 0;
}

/** Jugadas que fuerzan mate en ≤ depth. Con `firstOnly` se detiene en la primera encontrada. */
export function matingMoves(position: Position, depth: number, firstOnly = false): Move[] {
  if (depth < 1) return [];
  const found: Move[] = [];
  for (const move of legalMoves(position)) {
    const next = applyMove(position, move);
    const replies = legalMoves(next);
    let mates: boolean;
    if (replies.length === 0) {
      mates = isInCheck(next);
    } else if (depth === 1) {
      mates = false;
    } else {
      mates = replies.every((reply) => forcesMate(applyMove(next, reply), depth - 1));
    }
    if (mates) {
      found.push(move);
      if (firstOnly) break;
    }
  }
  return found;
}

// ---------------------------------------------------------------------------------------------
// Notación para personas (algebraica en español) y descripciones para lectores de pantalla
// ---------------------------------------------------------------------------------------------

const SAN_LETTER: Record<PieceType, string> = { p: "", n: "C", b: "A", r: "T", q: "D", k: "R" };

export const PIECE_NAME: Record<PieceType, string> = {
  p: "peón",
  n: "caballo",
  b: "alfil",
  r: "torre",
  q: "dama",
  k: "rey",
};

export function colorName(color: Color): string {
  return color === "w" ? "blancas" : "negras";
}

/** Notación algebraica abreviada en español (C = caballo, A = alfil, T = torre, D = dama, R = rey). */
export function toSan(position: Position, move: Move): string {
  let san: string;
  if (move.flag === "enroque-corto") san = "O-O";
  else if (move.flag === "enroque-largo") san = "O-O-O";
  else {
    const capture = move.captured ? "x" : "";
    const target = squareName(move.to);
    if (move.piece === "p") {
      const prefix = capture ? FILES[fileOf(move.from)] : "";
      const promo = move.promotion ? `=${SAN_LETTER[move.promotion]}` : "";
      san = `${prefix}${capture}${target}${promo}`;
    } else {
      const rivals = legalMoves(position).filter(
        (other) => other.piece === move.piece && other.to === move.to && other.from !== move.from,
      );
      let disambiguation = "";
      if (rivals.length > 0) {
        const sameFile = rivals.some((other) => fileOf(other.from) === fileOf(move.from));
        const sameRank = rivals.some((other) => rankOf(other.from) === rankOf(move.from));
        if (!sameFile) disambiguation = FILES[fileOf(move.from)];
        else if (!sameRank) disambiguation = String(rankOf(move.from) + 1);
        else disambiguation = squareName(move.from);
      }
      san = `${SAN_LETTER[move.piece]}${disambiguation}${capture}${target}`;
    }
  }
  const status = gameStatus(applyMove(position, move));
  return san + (status === "mate" ? "#" : status === "jaque" ? "+" : "");
}

/** Frase completa para anunciar una jugada por aria-live. */
export function describeMove(position: Position, move: Move): string {
  const next = applyMove(position, move);
  const status = gameStatus(next);
  let text: string;
  if (move.flag === "enroque-corto") text = "Enroque corto";
  else if (move.flag === "enroque-largo") text = "Enroque largo";
  else {
    const piece = PIECE_NAME[move.piece];
    const from = squareName(move.from);
    const to = squareName(move.to);
    text = move.captured
      ? `${capitalize(piece)} de ${from} captura ${PIECE_NAME[move.captured]} en ${to}`
      : `${capitalize(piece)} de ${from} a ${to}`;
    if (move.flag === "al-paso") text += " (captura al paso)";
    if (move.promotion) text += `, corona ${PIECE_NAME[move.promotion]}`;
  }
  if (status === "mate") text += ". Jaque mate";
  else if (status === "jaque") text += ". Jaque";
  else if (status === "ahogado") text += ". Ahogado";
  return text;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
