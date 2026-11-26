"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ExerciseProps } from "@/components/exercise/contract";
import { Badge, Button, ProgressBar, SessionEndScreen } from "@/components/ui";
import { createStaircase, nextStaircase, type StaircaseState } from "@/core/adaptive-difficulty";
import type { SessionResult } from "@/core/types";
import { buildSessionResult, formatDuration } from "../../components/session";
import {
  clueText,
  countMistakes,
  emptyAnswer,
  generateLogicPuzzle,
  type Answer,
  type LogicPuzzle,
} from "./domain/logic-puzzle.ts";

const PUZZLES_PER_SESSION = 3;
/** Comprobaciones fallidas toleradas para que el acertijo cuente como resuelto a la primera. */
const MAX_FAILED_CHECKS = 1;

interface Round {
  puzzle: LogicPuzzle;
  answer: Answer;
  failedChecks: number;
  solved: boolean;
}

function newRound(level: number): Round {
  const puzzle = generateLogicPuzzle(level);
  return { puzzle, answer: emptyAnswer(puzzle), failedChecks: 0, solved: false };
}

/** Celdas que repiten valor dentro de su categoría (cada valor se usa una sola vez). */
function duplicates(answer: Answer): Set<string> {
  const result = new Set<string>();
  answer.forEach((row, c) => {
    row.forEach((value, p) => {
      if (value !== null && row.some((other, q) => q !== p && other === value)) result.add(`${c}-${p}`);
    });
  });
  return result;
}

export default function DeduccionGame({ definition, initialLevel, onFinish, onExit }: ExerciseProps) {
  const config = { range: definition.difficulty, correctToLevelUp: 2 };
  const [staircase, setStaircase] = useState<StaircaseState>(() => createStaircase(initialLevel, config));
  const [startLevel] = useState(staircase.level);
  const [round, setRound] = useState<Round>(() => newRound(staircase.level));
  const [done, setDone] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [message, setMessage] = useState("");
  const [startedAt] = useState(() => new Date().toISOString());
  const [finished, setFinished] = useState<SessionResult | null>(null);
  const tableId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);

  const { puzzle, answer } = round;
  const repeated = useMemo(() => duplicates(answer), [answer]);

  useEffect(() => {
    titleRef.current?.focus();
  }, [done]);

  const finish = useCallback(
    (outcome: "completada" | "abandonada", totals: { done: number; correct: number }, level: number) => {
      const result = buildSessionResult({
        definition,
        startedAt,
        difficultyStart: startLevel,
        difficultyEnd: level as typeof startLevel,
        trials: totals.done,
        correct: totals.correct,
        outcome,
      });
      setFinished(result);
      onFinish(result);
    },
    [definition, startedAt, startLevel, onFinish],
  );

  function setValue(category: number, person: number, raw: string) {
    if (round.solved) return;
    const next = answer.map((row) => row.slice());
    next[category][person] = raw === "" ? null : Number(raw);
    setRound({ ...round, answer: next });
    setMessage("");
  }

  function check() {
    const { wrong, missing } = countMistakes(puzzle, answer);
    if (repeated.size > 0) {
      setMessage("Hay valores repetidos dentro de una misma columna: cada valor lo tiene una sola persona.");
    } else if (wrong === 0 && missing === 0) {
      setRound({ ...round, solved: true });
      setMessage("¡Resuelto! Todas las asignaciones son correctas.");
      return;
    } else if (missing > 0 && wrong === 0) {
      setMessage(`Lo que has puesto es correcto hasta ahora, pero faltan ${missing} ${missing === 1 ? "casilla" : "casillas"}.`);
      return;
    } else {
      setMessage(
        `Hay ${wrong} ${wrong === 1 ? "casilla incorrecta" : "casillas incorrectas"}${missing ? ` y faltan ${missing}` : ""}. Revisa las pistas.`,
      );
    }
    setRound({ ...round, failedChecks: round.failedChecks + 1 });
  }

  function next() {
    const success = round.failedChecks <= MAX_FAILED_CHECKS;
    const totals = { done: done + 1, correct: correct + (success ? 1 : 0) };
    const newStaircase = nextStaircase(staircase, success, config);
    setDone(totals.done);
    setCorrect(totals.correct);
    setStaircase(newStaircase);
    setMessage("");
    if (totals.done >= PUZZLES_PER_SESSION) {
      finish("completada", totals, newStaircase.level);
      return;
    }
    setRound(newRound(newStaircase.level));
  }

  if (finished) {
    return (
      <SessionEndScreen
        title={finished.outcome === "completada" ? "Sesión de deducción terminada" : "Sesión terminada antes de tiempo"}
        summary={[
          { label: "A la primera", value: `${finished.correct} de ${finished.trials}` },
          { label: "Tiempo", value: formatDuration(finished.startedAt, finished.endedAt) },
          { label: "Nivel", value: `${finished.difficultyStart} → ${finished.difficultyEnd}` },
        ]}
        nextHint="Si te atascas, prueba a apuntar qué personas quedan descartadas para cada rasgo."
        onExit={onExit}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="info">Nivel {staircase.level}</Badge>
        <h2 ref={titleRef} tabIndex={-1} className="text-lg font-semibold text-ink">
          Acertijo {done + 1} de {PUZZLES_PER_SESSION}
        </h2>
      </div>
      <ProgressBar value={done} max={PUZZLES_PER_SESSION} label="Acertijos resueltos" hideLabel />

      <p className="text-ink-muted">
        {puzzle.people.length} personas viven en {puzzle.people.length} casas en fila, numeradas de izquierda a derecha.
        Cada rasgo lo tiene una sola persona. Usa las pistas para completar la tabla. No hay límite de tiempo.
      </p>

      <section aria-labelledby={`${tableId}-pistas`} className="rounded-lg bg-surface-2 p-4">
        <h3 id={`${tableId}-pistas`} className="mb-2 font-semibold text-ink">
          Pistas
        </h3>
        <ol className="list-decimal space-y-1 pl-5 text-ink">
          {puzzle.clues.map((clue, i) => (
            <li key={i}>{clueText(puzzle, clue)}</li>
          ))}
        </ol>
      </section>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Elige para cada persona su valor en cada categoría. Cada valor se usa una sola vez por categoría.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="p-2 text-sm text-ink-muted">
                Persona
              </th>
              {puzzle.categories.map((category) => (
                <th key={category.id} scope="col" className="p-2 text-sm text-ink-muted">
                  {category.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {puzzle.people.map((person, p) => (
              <tr key={person} className="border-t border-line">
                <th scope="row" className="p-2 font-semibold text-ink">
                  {person}
                </th>
                {puzzle.categories.map((category, c) => {
                  const value = answer[c][p];
                  const isRepeated = repeated.has(`${c}-${p}`);
                  const id = `${tableId}-${c}-${p}`;
                  return (
                    <td key={category.id} className="p-1.5">
                      <label htmlFor={id} className="sr-only">
                        {category.label} de {person}
                      </label>
                      <select
                        id={id}
                        value={value === null ? "" : String(value)}
                        disabled={round.solved}
                        aria-invalid={isRepeated}
                        onChange={(event) => setValue(c, p, event.target.value)}
                        className={
                          "min-h-11 w-full rounded-md border bg-canvas px-2 text-base text-ink " +
                          (isRepeated ? "border-danger bg-danger-soft" : "border-line-strong")
                        }
                      >
                        <option value="">—</option>
                        {category.values.map((label, v) => (
                          <option key={label} value={v}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p ref={messageRef} role="status" aria-live="polite" className="min-h-6 text-ink">
        {message}
      </p>

      <div className="flex flex-wrap gap-2">
        {round.solved ? (
          <Button onClick={next}>{done + 1 >= PUZZLES_PER_SESSION ? "Ver resultados" : "Siguiente acertijo"}</Button>
        ) : (
          <Button onClick={check}>Comprobar</Button>
        )}
        <Button variant="ghost" onClick={() => finish("abandonada", { done, correct }, staircase.level)}>
          Terminar sesión
        </Button>
      </div>
    </div>
  );
}
