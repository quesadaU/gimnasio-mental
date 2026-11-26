"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ExerciseProps } from "@/components/exercise/contract";
import { Badge, Button, ProgressBar, SessionEndScreen } from "@/components/ui";
import { createStaircase, nextStaircase, type StaircaseState } from "@/core/adaptive-difficulty";
import type { SessionResult } from "@/core/types";
import { buildSessionResult, formatDuration } from "../../components/session";
import {
  COUNTS,
  FILLS,
  SHAPES,
  describeFigure,
  explainRules,
  generateMatrix,
  type Figure,
  type MatrixPuzzle,
} from "./domain/matrices.ts";

const PUZZLES_PER_SESSION = 12;

type Point = readonly [number, number];
const POSITIONS: Record<number, readonly Point[]> = {
  1: [[50, 50]],
  2: [[30, 50], [70, 50]],
  3: [[50, 27], [28, 72], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
};
const RADIUS: Record<number, readonly [number, number, number]> = {
  1: [14, 22, 32],
  2: [10, 15, 19],
  3: [8, 11, 14],
  4: [7, 10, 14],
};

function polygon(sides: number, cx: number, cy: number, r: number, rotation: number): string {
  return Array.from({ length: sides }, (_, i) => {
    const angle = rotation + (i * 2 * Math.PI) / sides;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
}

/** Una figura como SVG decorativo: el significado lo da la etiqueta de la casilla. */
function FigureSvg({ figure, hatchId }: { figure: Figure; hatchId: string }) {
  const count = COUNTS[figure.cantidad];
  const radius = RADIUS[count][figure.tamano];
  const shape = SHAPES[figure.forma];
  const fill = FILLS[figure.relleno];
  const paint = fill === "solido" ? "currentColor" : fill === "rayado" ? `url(#${hatchId})` : "none";
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full text-ink">
      {POSITIONS[count].map(([cx, cy], i) => {
        const common = { fill: paint, stroke: "currentColor", strokeWidth: 3 };
        switch (shape) {
          case "circulo":
            return <circle key={i} cx={cx} cy={cy} r={radius} {...common} />;
          case "cuadrado":
            return <rect key={i} x={cx - radius * 0.9} y={cy - radius * 0.9} width={radius * 1.8} height={radius * 1.8} {...common} />;
          case "triangulo":
            return <polygon key={i} points={polygon(3, cx, cy + radius * 0.15, radius * 1.1, -Math.PI / 2)} {...common} />;
          case "rombo":
            return <polygon key={i} points={polygon(4, cx, cy, radius * 1.15, -Math.PI / 2)} {...common} />;
          default:
            return <polygon key={i} points={polygon(6, cx, cy, radius * 1.05, 0)} {...common} />;
        }
      })}
    </svg>
  );
}

interface Round {
  puzzle: MatrixPuzzle;
  picked: number | null;
  checked: boolean;
}

interface Tally {
  correct: number;
  done: number;
}

export default function PatronesGame({ definition, initialLevel, onFinish, onExit }: ExerciseProps) {
  const config = { range: definition.difficulty, correctToLevelUp: 2 };
  const [staircase, setStaircase] = useState<StaircaseState>(() => createStaircase(initialLevel, config));
  const [startLevel] = useState(staircase.level);
  const [round, setRound] = useState<Round>(() => ({
    puzzle: generateMatrix(staircase.level),
    picked: null,
    checked: false,
  }));
  const [tally, setTally] = useState<Tally>({ correct: 0, done: 0 });
  const [startedAt] = useState(() => new Date().toISOString());
  const [finished, setFinished] = useState<SessionResult | null>(null);
  const hatchId = useId().replace(/:/g, "");
  const feedbackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { puzzle } = round;
  const isCorrect = round.picked === puzzle.answerIndex;

  useEffect(() => {
    if (round.checked) feedbackRef.current?.focus();
  }, [round.checked]);

  useEffect(() => {
    titleRef.current?.focus();
  }, [tally.done]);

  const finish = useCallback(
    (outcome: "completada" | "abandonada", finalTally: Tally, level: number) => {
      const result = buildSessionResult({
        definition,
        startedAt,
        difficultyStart: startLevel,
        difficultyEnd: level as typeof startLevel,
        trials: finalTally.done,
        correct: finalTally.correct,
        outcome,
      });
      setFinished(result);
      onFinish(result);
    },
    [definition, startedAt, startLevel, onFinish],
  );

  function check() {
    if (round.picked === null || round.checked) return;
    setRound({ ...round, checked: true });
  }

  function next() {
    const correct = round.picked === puzzle.answerIndex;
    const newTally = { correct: tally.correct + (correct ? 1 : 0), done: tally.done + 1 };
    const newStaircase = nextStaircase(staircase, correct, config);
    setTally(newTally);
    setStaircase(newStaircase);
    if (newTally.done >= PUZZLES_PER_SESSION) {
      finish("completada", newTally, newStaircase.level);
      return;
    }
    setRound({ puzzle: generateMatrix(newStaircase.level), picked: null, checked: false });
  }

  if (finished) {
    return (
      <SessionEndScreen
        title={finished.outcome === "completada" ? "Sesión de patrones terminada" : "Sesión terminada antes de tiempo"}
        summary={[
          { label: "Aciertos", value: `${finished.correct} de ${finished.trials}` },
          { label: "Tiempo", value: formatDuration(finished.startedAt, finished.endedAt) },
          { label: "Nivel", value: `${finished.difficultyStart} → ${finished.difficultyEnd}` },
        ]}
        nextHint="Cuando falles, repasa la explicación de las reglas: es lo que más se aprende."
        onExit={onExit}
      />
    );
  }

  const options = puzzle.options;
  return (
    <div className="flex flex-col gap-5">
      <svg width="0" height="0" aria-hidden="true" className="absolute text-ink">
        <defs>
          <pattern id={hatchId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="3" />
          </pattern>
        </defs>
      </svg>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="info">Nivel {staircase.level}</Badge>
        <h2 ref={titleRef} tabIndex={-1} className="text-lg font-semibold text-ink">
          Matriz {tally.done + 1} de {PUZZLES_PER_SESSION}
        </h2>
      </div>
      <ProgressBar value={tally.done} max={PUZZLES_PER_SESSION} label="Matrices resueltas" hideLabel />

      <p className="text-ink-muted">
        Cada fila sigue las mismas reglas. Descubre cuáles y elige la figura que completa la última fila. No hay límite de
        tiempo.
      </p>

      <ul aria-label="Matriz 3 por 3" className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
        {puzzle.cells.slice(0, 8).map((figure, i) => (
          <li
            key={i}
            aria-label={`Fila ${Math.floor(i / 3) + 1}, columna ${(i % 3) + 1}: ${describeFigure(figure)}`}
            className="aspect-square rounded-md border border-line bg-surface p-1"
          >
            <FigureSvg figure={figure} hatchId={hatchId} />
          </li>
        ))}
        <li
          aria-label="Fila 3, columna 3: la figura que falta"
          className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-accent bg-surface-2 text-3xl font-semibold text-accent"
        >
          {round.picked !== null ? <FigureSvg figure={options[round.picked]} hatchId={hatchId} /> : "?"}
        </li>
      </ul>

      <fieldset>
        <legend className="mb-2 font-semibold text-ink">Elige la figura que falta</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {options.map((figure, i) => {
            const isPicked = round.picked === i;
            const isAnswer = round.checked && i === puzzle.answerIndex;
            const isWrongPick = round.checked && isPicked && !isCorrect;
            return (
              <label
                key={i}
                className={
                  "flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 bg-surface p-1 focus-within:outline-3 " +
                  (isAnswer
                    ? "border-success bg-success-soft"
                    : isWrongPick
                      ? "border-danger bg-danger-soft"
                      : isPicked
                        ? "border-primary"
                        : "border-line")
                }
              >
                <input
                  type="radio"
                  name={hatchId}
                  checked={isPicked}
                  disabled={round.checked}
                  onChange={() => setRound({ ...round, picked: i })}
                  className="sr-only"
                  aria-label={`Opción ${i + 1}: ${describeFigure(figure)}`}
                />
                <span className="aspect-square w-full max-w-24">
                  <FigureSvg figure={figure} hatchId={hatchId} />
                </span>
                <span className="text-sm text-ink-muted" aria-hidden="true">
                  {i + 1}
                  {isAnswer ? " · correcta" : isWrongPick ? " · tu elección" : ""}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {round.checked ? (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="status"
          className={
            "flex flex-col gap-2 rounded-lg border-l-4 bg-canvas px-4 py-3 text-ink " +
            (isCorrect ? "border-success" : "border-danger")
          }
        >
          <p className="font-semibold">
            {isCorrect ? "Correcto." : `No es esa. La correcta es la opción ${puzzle.answerIndex + 1}: ${describeFigure(options[puzzle.answerIndex])}.`}
          </p>
          <ul className="list-disc pl-5 text-ink-muted">
            {explainRules(puzzle.rules).map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {round.checked ? (
          <Button onClick={next}>{tally.done + 1 >= PUZZLES_PER_SESSION ? "Ver resultados" : "Siguiente matriz"}</Button>
        ) : (
          <Button onClick={check} disabled={round.picked === null}>
            Responder
          </Button>
        )}
        <Button variant="ghost" onClick={() => finish("abandonada", tally, staircase.level)}>
          Terminar sesión
        </Button>
      </div>
    </div>
  );
}
