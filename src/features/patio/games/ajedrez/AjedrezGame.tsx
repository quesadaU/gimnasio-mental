"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ExerciseProps } from "@/components/exercise/contract";
import { Badge, Button, ErrorState, LoadingState, ProgressBar, SessionEndScreen } from "@/components/ui";
import { createStaircase, nextStaircase, startingLevel, type StaircaseState } from "@/core/adaptive-difficulty";
import type { ContentPack, DifficultyLevel, SessionResult } from "@/core/types";
import { AJEDREZ_PACKS } from "@/content/patio/ajedrez";
import { buildSessionResult } from "../../components/session";
import { ChessBoard } from "./ChessBoard";
import {
  PIECE_NAME,
  applyMove,
  colorName,
  describeMove,
  findUciMove,
  legalMovesFrom,
  parseFen,
  parseSquare,
  toSan,
  type Color,
  type Move,
  type Position,
  type PromotionPiece,
} from "./domain/chess.ts";
import {
  THEME_HINT,
  THEME_LABEL,
  judgeMove,
  mateDepth,
  opponentReply,
  pickPuzzle,
  ratingForLevel,
  solutionMoveAt,
  type ChessPuzzle,
} from "./domain/puzzles.ts";

const PUZZLES_PER_SESSION = 6;
const OPPONENT_DELAY_MS = 600;
const PACK_ID = "tacticas-basicas";

type Status = "turno" | "rival" | "resuelto";

interface Board {
  puzzle: ChessPuzzle;
  position: Position;
  played: string[];
  status: Status;
  /** Hubo una jugada incorrecta o se pidió ver la jugada: ya no cuenta como acierto. */
  failed: boolean;
  hintUsed: boolean;
  reveal: { from: number; to: number } | null;
  lastMove: { from: number; to: number } | null;
}

interface Session {
  startedAt: string;
  startLevel: DifficultyLevel;
  staircase: StaircaseState;
  used: Set<string>;
  results: { id: string; rating: number; correct: boolean; hintUsed: boolean }[];
}

function newBoard(puzzle: ChessPuzzle): Board {
  return {
    puzzle,
    position: parseFen(puzzle.fen),
    played: [],
    status: "turno",
    failed: false,
    hintUsed: false,
    reveal: null,
    lastMove: null,
  };
}

function goalText(puzzle: ChessPuzzle, side: Color): string {
  const who = colorName(side).replace(/^./, (c) => c.toUpperCase());
  const depth = mateDepth(puzzle.theme);
  if (depth === 1) return `${who} juegan y dan mate en 1.`;
  if (depth === 2) return `${who} juegan y dan mate en 2.`;
  return `${who} juegan y ganan material.`;
}

export default function AjedrezGame({ definition, initialLevel, onFinish, onExit }: ExerciseProps) {
  const config = { range: definition.difficulty, correctToLevelUp: 2 };
  const [pack, setPack] = useState<ContentPack<ChessPuzzle> | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const [session, setSession] = useState<Session | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [promotion, setPromotion] = useState<{ from: number; to: number } | null>(null);
  const [message, setMessage] = useState("");
  const [finished, setFinished] = useState<SessionResult | null>(null);

  const instructionsId = useId();
  const promotionRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const startSession = useCallback(
    (items: readonly ChessPuzzle[], level: DifficultyLevel) => {
      const staircase = createStaircase(level, config);
      const first = pickPuzzle(items, staircase.level, new Set());
      if (!first) return;
      setSession({
        startedAt: new Date().toISOString(),
        startLevel: staircase.level,
        staircase,
        used: new Set([first.id]),
        results: [],
      });
      setBoard(newBoard(first));
      setSelected(null);
      setPromotion(null);
      setFinished(null);
      const side = parseFen(first.fen).turn;
      setMessage(`Puzzle 1 de ${PUZZLES_PER_SESSION}. ${goalText(first, side)}`);
    },
    // config depende solo de la definición, estable durante la sesión
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [definition.id],
  );

  useEffect(() => {
    let cancelled = false;
    AJEDREZ_PACKS[PACK_ID]().then(
      (loaded) => {
        if (cancelled) return;
        setPack(loaded);
        setLoadError(false);
        startSession(loaded.items, initialLevel);
      },
      () => {
        if (!cancelled) setLoadError(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [loadAttempt, initialLevel, startSession]);

  // Respuesta animada del rival (con una pausa breve para poder seguirla).
  useEffect(() => {
    if (!board || board.status !== "rival") return;
    const timer = window.setTimeout(() => {
      const reply = opponentReply(board.puzzle, board.position, board.played);
      if (!reply) return;
      const text = describeMove(board.position, reply);
      setBoard({
        ...board,
        position: applyMove(board.position, reply),
        played: [...board.played, `${reply.from}`].slice(0, -1).concat(uciOf(reply)),
        status: "turno",
        reveal: null,
        lastMove: { from: reply.from, to: reply.to },
      });
      setMessage(`El rival responde: ${text}. Te toca.`);
    }, OPPONENT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [board]);

  useEffect(() => {
    if (promotion) promotionRef.current?.focus();
  }, [promotion]);

  useEffect(() => {
    if (board?.status === "resuelto") nextRef.current?.focus();
  }, [board?.status]);

  const finish = useCallback(
    (current: Session, outcome: "completada" | "abandonada") => {
      const correct = current.results.filter((r) => r.correct).length;
      const result = buildSessionResult({
        definition,
        startedAt: current.startedAt,
        difficultyStart: current.startLevel,
        difficultyEnd: current.staircase.level,
        trials: current.results.length,
        correct,
        outcome,
        contentId: `patio-ajedrez-${PACK_ID}`,
      });
      setFinished(result);
      onFinish(result);
    },
    [definition, onFinish],
  );

  if (loadError) {
    return (
      <ErrorState
        title="No se pudieron cargar los puzzles"
        description="Comprueba la conexión e inténtalo de nuevo."
        onRetry={() => setLoadAttempt((n) => n + 1)}
      />
    );
  }
  if (!pack || !session || !board) return <LoadingState label="Cargando puzzles…" />;

  if (finished) {
    const hints = session.results.filter((r) => r.hintUsed).length;
    return (
      <SessionEndScreen
        title={finished.outcome === "completada" ? "Sesión de tácticas terminada" : "Sesión terminada antes de tiempo"}
        summary={[
          { label: "A la primera", value: `${finished.correct} de ${finished.trials}` },
          { label: "Nivel", value: `${finished.difficultyStart} → ${finished.difficultyEnd}` },
          { label: "Dificultad aprox.", value: `${ratingForLevel(finished.difficultyEnd)} pts` },
          { label: "Pistas usadas", value: hints },
        ]}
        nextHint="Para variar, prueba después un juego de atención o de memoria, o un sudoku."
        onRepeat={() => startSession(pack.items, startingLevel(finished.difficultyEnd, config))}
        onExit={onExit}
      />
    );
  }

  const side = parseFen(board.puzzle.fen).turn;
  const orientation: Color = side;
  const puzzleNumber = session.results.length + (board.status === "resuelto" ? 0 : 1);
  const targets = new Set(
    selected === null || board.status !== "turno" ? [] : legalMovesFrom(board.position, selected).map((m) => m.to),
  );

  const recordOutcome = (current: Board) => {
    const correct = !current.failed;
    setSession((s) =>
      s && {
        ...s,
        staircase: nextStaircase(s.staircase, correct, config),
        results: [...s.results, { id: current.puzzle.id, rating: current.puzzle.rating, correct, hintUsed: current.hintUsed }],
      },
    );
  };

  const playUci = (uci: string) => {
    const verdict = judgeMove(board.puzzle, board.position, board.played, uci);
    setSelected(null);
    setPromotion(null);
    if (verdict.kind === "ilegal") {
      setMessage("Esa jugada no es legal en esta posición.");
      return;
    }
    if (verdict.kind === "incorrecta") {
      const move = findUciMove(board.position, uci) as Move;
      setBoard({ ...board, failed: true });
      setMessage(
        `${toSan(board.position, move)} no es la solución. Vuelve a intentarlo: este puzzle ya no cuenta como acertado a la primera.`,
      );
      return;
    }
    const move = findUciMove(board.position, uci) as Move;
    const text = describeMove(board.position, move);
    const next: Board = {
      ...board,
      position: verdict.position,
      played: [...board.played, uci],
      status: verdict.finished ? "resuelto" : "rival",
      reveal: null,
      lastMove: { from: move.from, to: move.to },
    };
    setBoard(next);
    if (verdict.finished) {
      recordOutcome(next);
      setMessage(`${text}. ¡Resuelto${next.failed ? "" : " a la primera"}!`);
    } else {
      setMessage(`${text}. Bien. Espera la respuesta del rival.`);
    }
  };

  const onSquare = (square: number) => {
    if (board.status !== "turno") return;
    const piece = board.position.board[square];
    if (selected === null) {
      if (piece && piece.color === board.position.turn) {
        const count = legalMovesFrom(board.position, square).length;
        setSelected(square);
        setMessage(
          `${PIECE_NAME[piece.type]} en ${squareLabel(square)} seleccionado. ${count === 0 ? "No tiene jugadas legales." : `${count} destino${count === 1 ? "" : "s"} posible${count === 1 ? "" : "s"}.`}`,
        );
      } else {
        setMessage(`Elige primero una pieza de las ${colorName(board.position.turn)}.`);
      }
      return;
    }
    if (square === selected) {
      setSelected(null);
      setMessage("Selección cancelada.");
      return;
    }
    if (piece && piece.color === board.position.turn) {
      setSelected(null);
      onSquare(square);
      setSelected(square);
      return;
    }
    const moves = legalMovesFrom(board.position, selected).filter((m) => m.to === square);
    if (moves.length === 0) {
      setMessage(`No se puede mover de ${squareLabel(selected)} a ${squareLabel(square)}.`);
      return;
    }
    if (moves.some((m) => m.promotion)) {
      setPromotion({ from: selected, to: square });
      setMessage("Elige la pieza de promoción.");
      return;
    }
    playUci(uciOf(moves[0]));
  };

  const showHint = () => {
    setBoard({ ...board, hintUsed: true });
    setMessage(`Pista (${THEME_LABEL[board.puzzle.theme]}): ${THEME_HINT[board.puzzle.theme]}`);
  };

  const revealMove = () => {
    const uci = solutionMoveAt(board.puzzle, board.played);
    if (!uci) return;
    const from = parseSquare(uci.slice(0, 2)) as number;
    const to = parseSquare(uci.slice(2, 4)) as number;
    const move = findUciMove(board.position, uci);
    setBoard({ ...board, failed: true, reveal: { from, to } });
    setMessage(`La jugada es ${move ? toSan(board.position, move) : uci}: de ${squareLabel(from)} a ${squareLabel(to)}. Hazla en el tablero.`);
  };

  const giveUp = () => {
    const current = { ...board, failed: true, status: "resuelto" as const };
    setBoard(current);
    recordOutcome(current);
    setMessage("Puzzle saltado. Cuenta como no resuelto.");
  };

  const goNext = () => {
    if (session.results.length >= PUZZLES_PER_SESSION) {
      finish(session, "completada");
      return;
    }
    const puzzle = pickPuzzle(pack.items, session.staircase.level, session.used);
    if (!puzzle) {
      finish(session, "completada");
      return;
    }
    setSession({ ...session, used: new Set([...session.used, puzzle.id]) });
    setBoard(newBoard(puzzle));
    setSelected(null);
    const turn = parseFen(puzzle.fen).turn;
    setMessage(`Puzzle ${session.results.length + 1} de ${PUZZLES_PER_SESSION}. ${goalText(puzzle, turn)}`);
  };

  const endEarly = () => {
    if (session.results.length === 0) onExit();
    else finish(session, "abandonada");
  };

  const isLast = session.results.length >= PUZZLES_PER_SESSION;

  return (
    <section aria-label="Puzzle de ajedrez" className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <ProgressBar label="Puzzle" value={Math.min(puzzleNumber, PUZZLES_PER_SESSION)} max={PUZZLES_PER_SESSION} />
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info">Nivel {session.staircase.level}</Badge>
          <Badge>≈ {board.puzzle.rating} pts</Badge>
          {mateDepth(board.puzzle.theme) !== undefined ? <Badge>{THEME_LABEL[board.puzzle.theme]}</Badge> : null}
        </div>
        <p className="font-display text-2xl font-semibold text-ink">{goalText(board.puzzle, side)}</p>
        <p id={instructionsId} className="text-sm text-ink-muted">
          Toca una pieza y después su destino. Con teclado: Tab para entrar en el tablero, flechas para moverte,
          Intro o Espacio para seleccionar.
        </p>
      </div>

      <ChessBoard
        position={board.position}
        orientation={orientation}
        selected={selected}
        targets={targets}
        lastMove={board.lastMove}
        hint={board.reveal}
        disabled={board.status !== "turno"}
        describedBy={instructionsId}
        onSquare={onSquare}
      />

      {promotion ? (
        <div role="group" aria-label="Pieza de promoción" className="flex flex-wrap gap-2">
          {(["q", "r", "b", "n"] as PromotionPiece[]).map((piece, index) => (
            <Button
              key={piece}
              ref={index === 0 ? promotionRef : undefined}
              variant="secondary"
              onClick={() => playUci(`${squareLabel(promotion.from)}${squareLabel(promotion.to)}${piece}`)}
            >
              {PIECE_NAME[piece].replace(/^./, (c) => c.toUpperCase())}
            </Button>
          ))}
          <Button variant="ghost" onClick={() => setPromotion(null)}>
            Cancelar
          </Button>
        </div>
      ) : null}

      <p
        role="status"
        aria-live="polite"
        className="min-h-12 rounded-md border border-line bg-surface px-4 py-3 text-ink"
      >
        {message}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {board.status === "resuelto" ? (
          <Button ref={nextRef} size="lg" onClick={goNext}>
            {isLast ? "Ver resumen" : "Siguiente puzzle"}
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={showHint} disabled={board.hintUsed || board.status !== "turno"}>
              Pista
            </Button>
            <Button variant="secondary" onClick={revealMove} disabled={board.status !== "turno"}>
              Mostrar jugada
            </Button>
            <Button variant="ghost" onClick={giveUp} disabled={board.status !== "turno"}>
              Saltar puzzle
            </Button>
          </>
        )}
        <Button variant="ghost" onClick={endEarly}>
          Terminar sesión
        </Button>
      </div>
    </section>
  );
}

function uciOf(move: Move): string {
  return `${squareLabel(move.from)}${squareLabel(move.to)}${move.promotion ?? ""}`;
}

function squareLabel(square: number): string {
  return `${"abcdefgh"[square % 8]}${Math.floor(square / 8) + 1}`;
}
