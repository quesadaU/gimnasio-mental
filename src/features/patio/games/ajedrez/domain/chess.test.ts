import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FenError,
  applyMove,
  applyUciLine,
  describeMove,
  findUciMove,
  gameStatus,
  isInCheck,
  legalMoves,
  matingMoves,
  moveToUci,
  parseFen,
  toFen,
  toSan,
  type Position,
} from "./chess.ts";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function perft(position: Position, depth: number): number {
  if (depth === 0) return 1;
  const moves = legalMoves(position);
  if (depth === 1) return moves.length;
  let nodes = 0;
  for (const move of moves) nodes += perft(applyMove(position, move), depth - 1);
  return nodes;
}

function uciSet(fen: string): Set<string> {
  return new Set(legalMoves(parseFen(fen)).map(moveToUci));
}

describe("FEN", () => {
  it("lee y reescribe la posición inicial sin pérdidas", () => {
    assert.equal(toFen(parseFen(START)), START);
  });

  it("rechaza FEN mal formados", () => {
    assert.throws(() => parseFen("8/8/8/8/8/8/8 w - - 0 1"), FenError);
    assert.throws(() => parseFen("rnbqkbnr/pppppppp/9/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"), FenError);
    assert.throws(() => parseFen("8/8/8/8/8/8/8/K7 w - - 0 1"), FenError, "sin rey negro");
    assert.throws(() => parseFen("k7/8/8/8/8/8/8/K6P w - - 0 1"), FenError, "peón en octava");
    assert.throws(() => parseFen("k7/8/8/8/8/8/8/K7 x - - 0 1"), FenError, "turno");
  });

  it("rechaza posiciones en las que el bando que no mueve está en jaque", () => {
    assert.throws(() => parseFen("k7/8/8/8/8/8/8/R5K1 w - - 0 1"), FenError);
  });
});

describe("perft (recuento de nodos frente a valores de referencia publicados)", () => {
  it("posición inicial hasta profundidad 3", () => {
    const start = parseFen(START);
    assert.equal(perft(start, 1), 20);
    assert.equal(perft(start, 2), 400);
    assert.equal(perft(start, 3), 8902);
  });

  it("Kiwipete (enroques, clavadas, al paso, promociones) hasta profundidad 2", () => {
    const kiwipete = parseFen("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    assert.equal(perft(kiwipete, 1), 48);
    assert.equal(perft(kiwipete, 2), 2039);
  });

  it("posición 3 de la wiki de programación de ajedrez (al paso con jaque descubierto) hasta profundidad 4", () => {
    const position = parseFen("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
    assert.equal(perft(position, 1), 14);
    assert.equal(perft(position, 2), 191);
    assert.equal(perft(position, 3), 2812);
    assert.equal(perft(position, 4), 43238);
  });

  it("posición 4 (promociones y enroque bajo ataque) hasta profundidad 3", () => {
    const position = parseFen("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1");
    assert.equal(perft(position, 1), 6);
    assert.equal(perft(position, 2), 264);
    assert.equal(perft(position, 3), 9467);
  });

  it("posición 5 hasta profundidad 2", () => {
    const position = parseFen("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8");
    assert.equal(perft(position, 1), 44);
    assert.equal(perft(position, 2), 1486);
  });
});

describe("enroque", () => {
  it("permite ambos enroques cuando el camino está libre", () => {
    const moves = uciSet("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    assert.ok(moves.has("e1g1"));
    assert.ok(moves.has("e1c1"));
  });

  it("mueve la torre y retira los derechos", () => {
    const after = applyUciLine(parseFen("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"), ["e1g1"]);
    assert.equal(toFen(after), "r3k2r/8/8/8/8/8/8/R4RK1 b kq - 1 1");
    const afterLong = applyUciLine(after, ["e8c8"]);
    assert.equal(toFen(afterLong), "2kr3r/8/8/8/8/8/8/R4RK1 w - - 2 2");
  });

  it("no permite enrocar en jaque, a través de una casilla atacada ni hacia ella", () => {
    assert.ok(!uciSet("r3k2r/8/8/8/4r3/8/8/R3K2R w KQkq - 0 1").has("e1g1"), "rey en jaque");
    const throughF1 = uciSet("4k3/5r2/8/8/8/8/8/R3K2R w KQ - 0 1");
    assert.ok(!throughF1.has("e1g1"), "f1 atacada por la torre de f7");
    assert.ok(throughF1.has("e1c1"));
    const intoG1 = uciSet("4k3/6r1/8/8/8/8/8/R3K2R w KQ - 0 1");
    assert.ok(!intoG1.has("e1g1"), "g1 atacada");
  });

  it("el enroque largo se permite aunque b1 esté atacada, pero no si está ocupada", () => {
    const b1Attacked = uciSet("1r2k3/8/8/8/8/8/8/R3K3 w Q - 0 1");
    assert.ok(b1Attacked.has("e1c1"));
    const b1Occupied = uciSet("4k3/8/8/8/8/8/8/RN2K3 w Q - 0 1");
    assert.ok(!b1Occupied.has("e1c1"));
  });

  it("pierde el derecho cuando le capturan la torre de la esquina", () => {
    const after = applyUciLine(parseFen("4k3/8/8/8/8/8/6b1/R3K2R b KQ - 0 1"), ["g2h1"]);
    assert.equal(after.castling.K, false);
    assert.equal(after.castling.Q, true);
  });

  it("no enroca sin derecho aunque las piezas estén en su sitio", () => {
    assert.ok(!uciSet("4k3/8/8/8/8/8/8/R3K2R w - - 0 1").has("e1g1"));
  });
});

describe("captura al paso", () => {
  it("está disponible justo después del avance doble y retira el peón capturado", () => {
    const position = applyUciLine(parseFen("4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1"), ["d7d5"]);
    assert.equal(toFen(position), "4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2");
    const move = findUciMove(position, "e5d6");
    assert.ok(move);
    assert.equal(move.flag, "al-paso");
    const after = applyMove(position, move);
    assert.equal(toFen(after), "4k3/8/3P4/8/8/8/8/4K3 b - - 0 2");
    assert.match(describeMove(position, move), /al paso/);
  });

  it("deja de estar disponible si no se hace inmediatamente", () => {
    const position = applyUciLine(parseFen("4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1"), ["d7d5", "e1e2", "e8e7"]);
    assert.equal(findUciMove(position, "e5d6"), null);
  });

  it("es ilegal si deja al propio rey en jaque horizontal", () => {
    // Al capturar al paso desaparecen los dos peones de la quinta fila y la torre da jaque.
    const position = parseFen("8/8/8/KPp4r/8/8/8/6k1 w - c6 0 1");
    assert.equal(findUciMove(position, "b5c6"), null);
  });
});

describe("promoción", () => {
  it("genera las cuatro piezas de promoción y exige indicarla en UCI", () => {
    const position = parseFen("8/P6k/8/8/8/8/8/K7 w - - 0 1");
    const promotions = legalMoves(position).filter((move) => move.from === 48);
    assert.deepEqual(promotions.map((move) => move.promotion).sort(), ["b", "n", "q", "r"]);
    assert.equal(findUciMove(position, "a7a8"), null);
    const after = applyUciLine(position, ["a7a8n"]);
    assert.deepEqual(after.board[56], { color: "w", type: "n" });
  });

  it("promociona capturando y anota en español", () => {
    const position = parseFen("1r5k/P7/8/8/8/8/8/K7 w - - 0 1");
    const move = findUciMove(position, "a7b8q");
    assert.ok(move);
    assert.equal(move.captured, "r");
    assert.equal(toSan(position, move), "axb8=D+");
  });
});

describe("jaque, mate y ahogado", () => {
  it("detecta el mate del pasillo", () => {
    const position = applyUciLine(parseFen("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1"), ["a1a8"]);
    assert.equal(gameStatus(position), "mate");
  });

  it("detecta el ahogado", () => {
    const position = parseFen("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
    assert.equal(gameStatus(position), "ahogado");
  });

  it("solo permite jugadas que resuelven el jaque", () => {
    const position = parseFen("4k3/8/8/8/8/8/3q4/4K3 w - - 0 1");
    assert.ok(isInCheck(position));
    assert.deepEqual([...uciSet(toFen(position))].sort(), ["e1d2", "e1f1"]);
  });

  it("no permite mover una pieza clavada fuera de la línea de la clavada", () => {
    const moves = uciSet("4k3/4r3/8/8/8/8/4N3/4K3 w - - 0 1");
    assert.ok(![...moves].some((uci) => uci.startsWith("e2")));
  });

  it("encuentra el mate en 1 y el mate en 2", () => {
    const mateIn1 = matingMoves(parseFen("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1"), 1).map(moveToUci);
    assert.deepEqual(mateIn1, ["a1a8"]);
    // Dos torres en escalera: Ta7 y Tb8#
    const mateIn2 = matingMoves(parseFen("7k/8/8/8/8/8/R7/1R4K1 w - - 0 1"), 2).map(moveToUci);
    assert.ok(mateIn2.length > 0);
    assert.equal(matingMoves(parseFen("7k/8/8/8/8/8/R7/1R4K1 w - - 0 1"), 1).length, 0);
  });
});

describe("notación y UCI", () => {
  it("desambigua en SAN cuando dos piezas iguales llegan a la misma casilla", () => {
    const position = parseFen("4k3/8/8/8/8/8/4K3/R6R w - - 0 1");
    const move = findUciMove(position, "a1d1");
    assert.ok(move);
    assert.equal(toSan(position, move), "Tad1");
  });

  it("rechaza UCI mal formado o ilegal", () => {
    const position = parseFen(START);
    assert.equal(findUciMove(position, "e2e5"), null);
    assert.equal(findUciMove(position, "zz"), null);
    assert.throws(() => applyUciLine(position, ["e2e4", "e2e4"]));
  });
});
