"use client";

import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { ExerciseProps } from "@/components/exercise/contract";
import { Badge, Button, SessionEndScreen } from "@/components/ui";
import { clampDifficulty } from "@/core/adaptive-difficulty";
import type { SessionResult } from "@/core/types";
import { buildSessionResult, formatDuration } from "../../components/session";
import {
  PEERS,
  TECHNIQUE_LABEL,
  colOf,
  digitsOf,
  findConflicts,
  generateSudoku,
  isSolved,
  levelConfig,
  rowOf,
  wrongCells,
} from "./domain/sudoku.ts";

/** Errores revelados con «Comprobar» por encima de los cuales la partida ya no cuenta como acierto. */
const MAX_ERRORS_FOR_SUCCESS = 2;
const MANY_ERRORS = 6;

function cellLabel(index: number, value: number, given: boolean, notes: number, conflict: boolean): string {
  const position = `Fila ${rowOf(index) + 1}, columna ${colOf(index) + 1}`;
  const state = value
    ? `${value}${given ? ", dada" : ""}${conflict ? ", repetida en su fila, columna o caja" : ""}`
    : notes
      ? `vacía, notas: ${digitsOf(notes).join(", ")}`
      : "vacía";
  return `${position}, ${state}`;
}

export default function SudokuGame({ definition, initialLevel, onFinish, onExit }: ExerciseProps) {
  const level = clampDifficulty(initialLevel, definition.difficulty);
  const [puzzle] = useState(() => generateSudoku(level));
  const [startedAt] = useState(() => new Date().toISOString());
  const [grid, setGrid] = useState<number[]>(() => puzzle.puzzle.slice());
  const [notes, setNotes] = useState<number[]>(() => new Array(81).fill(0));
  const [selected, setSelected] = useState(0);
  const [notesMode, setNotesMode] = useState(false);
  const [wrong, setWrong] = useState<ReadonlySet<number>>(new Set());
  const [revealedErrors, setRevealedErrors] = useState<ReadonlySet<number>>(new Set());
  const [message, setMessage] = useState("");
  const [finished, setFinished] = useState<SessionResult | null>(null);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const instructionsId = useId();

  const conflicts = useMemo(() => findConflicts(grid), [grid]);
  const given = useMemo(() => puzzle.puzzle.map((v) => v !== 0), [puzzle]);
  const remaining = grid.filter((v) => v === 0).length;
  const techniques = puzzle.techniques.map((t) => TECHNIQUE_LABEL[t]).join(", ");

  const finish = useCallback(
    (outcome: "completada" | "abandonada", solved: boolean) => {
      const errors = revealedErrors.size;
      const success = solved && errors <= MAX_ERRORS_FOR_SUCCESS;
      const endLevel = clampDifficulty(
        success ? level + 1 : errors >= MANY_ERRORS || !solved ? level - 1 : level,
        definition.difficulty,
      );
      const result = buildSessionResult({
        definition,
        startedAt,
        difficultyStart: level,
        difficultyEnd: outcome === "completada" ? endLevel : level,
        trials: 1,
        correct: success ? 1 : 0,
        outcome,
        score: solved ? Math.max(0, 100 - errors * 10) : 0,
      });
      setFinished(result);
      onFinish(result);
    },
    [definition, level, revealedErrors, startedAt, onFinish],
  );

  function focusCell(index: number) {
    setSelected(index);
    cellRefs.current[index]?.focus();
  }

  function enter(digit: number, index = selected) {
    if (given[index]) {
      setMessage("Esa casilla es una pista y no se puede cambiar.");
      return;
    }
    setMessage("");
    if (digit !== 0 && notesMode && grid[index] === 0) {
      const next = notes.slice();
      next[index] ^= 1 << digit;
      setNotes(next);
      return;
    }
    const nextGrid = grid.slice();
    nextGrid[index] = digit === grid[index] ? 0 : digit;
    setGrid(nextGrid);
    setWrong((previous) => {
      if (!previous.has(index)) return previous;
      const copy = new Set(previous);
      copy.delete(index);
      return copy;
    });
    if (digit !== 0 && nextGrid[index] !== 0) {
      // Al fijar una cifra se retiran de las notas de sus casillas relacionadas.
      const cleaned = notes.slice();
      cleaned[index] = 0;
      for (const peer of PEERS[index]) cleaned[peer] &= ~(1 << digit);
      setNotes(cleaned);
    }
    if (isSolved(nextGrid)) finish("completada", true);
  }

  function check() {
    const bad = wrongCells(grid, puzzle.solution);
    setWrong(new Set(bad));
    if (bad.length === 0) {
      setMessage(remaining === 0 ? "" : "Hasta ahora no hay ningún error. Sigue.");
    } else {
      setRevealedErrors((previous) => new Set([...previous, ...bad]));
      setMessage(
        `Hay ${bad.length} ${bad.length === 1 ? "casilla incorrecta" : "casillas incorrectas"}, marcadas en rojo.`,
      );
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const row = rowOf(index);
    const col = colOf(index);
    const moves: Record<string, number> = {
      ArrowUp: row > 0 ? index - 9 : index,
      ArrowDown: row < 8 ? index + 9 : index,
      ArrowLeft: col > 0 ? index - 1 : index,
      ArrowRight: col < 8 ? index + 1 : index,
    };
    if (event.key in moves) {
      event.preventDefault();
      focusCell(moves[event.key]);
    } else if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      enter(Number(event.key), index);
    } else if (["Backspace", "Delete", "0"].includes(event.key)) {
      event.preventDefault();
      if (!given[index] && grid[index] !== 0) enter(grid[index], index);
      else if (!given[index] && notes[index]) {
        const next = notes.slice();
        next[index] = 0;
        setNotes(next);
      }
    } else if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      setNotesMode((value) => !value);
    }
  }

  if (finished) {
    const solved = isSolved(grid);
    return (
      <SessionEndScreen
        title={solved ? "Sudoku resuelto" : "Sesión terminada antes de tiempo"}
        summary={[
          { label: "Tiempo", value: formatDuration(finished.startedAt, finished.endedAt) },
          { label: "Errores revelados", value: revealedErrors.size },
          { label: "Nivel", value: `${finished.difficultyStart} → ${finished.difficultyEnd}` },
        ]}
        nextHint={techniques ? `Técnicas de este sudoku: ${techniques}.` : undefined}
        onExit={onExit}
      />
    );
  }

  const selectedPeers = new Set<number>(PEERS[selected]);
  const selectedValue = grid[selected];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="info">Nivel {level}</Badge>
        <Badge>{levelConfig(level).clues} pistas objetivo</Badge>
        <span role="status" aria-live="polite" className="text-sm text-ink-muted">
          {remaining} {remaining === 1 ? "casilla vacía" : "casillas vacías"}
        </span>
      </div>

      <p id={instructionsId} className="text-sm text-ink-muted">
        Rellena cada fila, columna y caja de 3×3 con las cifras del 1 al 9 sin repetir. Muévete con las flechas,
        escribe una cifra para ponerla y la tecla N para alternar las notas. No hay límite de tiempo.
      </p>

      <div
        role="grid"
        aria-label="Tablero de sudoku"
        aria-describedby={instructionsId}
        className="mx-auto grid aspect-square w-full max-w-md grid-cols-9 border-2 border-line-strong bg-surface"
      >
        {Array.from({ length: 9 }, (_, row) => (
          <div role="row" key={row} className="contents">
        {grid.slice(row * 9, row * 9 + 9).map((value, col) => {
          const index = row * 9 + col;
          const isGiven = given[index];
          const isConflict = conflicts.has(index);
          const isWrong = wrong.has(index);
          const isSelected = index === selected;
          const sameDigit = value !== 0 && value === selectedValue && !isSelected;
          const tone = isSelected
            ? "bg-accent text-canvas"
            : isWrong
              ? "bg-danger-soft"
              : isConflict
                ? "bg-warning-soft"
                : sameDigit
                  ? "bg-info-soft"
                  : selectedPeers.has(index)
                    ? "bg-surface-2"
                    : "bg-surface";
          return (
            <button
              key={index}
              ref={(element) => {
                cellRefs.current[index] = element;
              }}
              type="button"
              role="gridcell"
              aria-label={cellLabel(index, value, isGiven, notes[index], isConflict)}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(index)}
              onFocus={() => setSelected(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={
                "relative flex items-center justify-center border-line text-xl focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] sm:text-2xl " +
                tone +
                " " +
                (colOf(index) % 3 === 2 && colOf(index) !== 8 ? "border-r-2 border-r-line-strong " : "border-r ") +
                (rowOf(index) % 3 === 2 && rowOf(index) !== 8 ? "border-b-2 border-b-line-strong " : "border-b ") +
                (isGiven ? "font-bold " : "font-medium ") +
                (isSelected ? "" : isGiven ? "text-ink" : "text-primary")
              }
            >
              {value !== 0 ? (
                value
              ) : notes[index] ? (
                <span aria-hidden="true" className="grid h-full w-full grid-cols-3 p-px text-[0.625rem] leading-none sm:text-xs">
                  {Array.from({ length: 9 }, (_, i) => (
                    <span key={i} className="flex items-center justify-center">
                      {notes[index] & (1 << (i + 1)) ? i + 1 : ""}
                    </span>
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
          </div>
        ))}
      </div>

      <div className="mx-auto grid w-full max-w-md grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((digit) => (
          <Button key={digit} type="button" variant="secondary" onClick={() => enter(digit)} aria-label={`Poner ${digit}`}>
            {digit}
          </Button>
        ))}
        <Button type="button" variant="ghost" onClick={() => enter(grid[selected] || 0)} aria-label="Borrar casilla">
          ⌫
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-wrap gap-2">
        <Button
          type="button"
          variant={notesMode ? "primary" : "secondary"}
          aria-pressed={notesMode}
          onClick={() => setNotesMode((value) => !value)}
        >
          Notas: {notesMode ? "activadas" : "desactivadas"}
        </Button>
        <Button type="button" variant="secondary" onClick={check}>
          Comprobar
        </Button>
        <Button type="button" variant="ghost" onClick={() => finish("abandonada", false)}>
          Terminar sesión
        </Button>
      </div>

      <p role="status" aria-live="polite" className="mx-auto min-h-6 w-full max-w-md text-ink">
        {message}
      </p>
    </div>
  );
}
