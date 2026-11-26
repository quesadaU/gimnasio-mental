"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import type { ExerciseProps } from "@/components/exercise/contract";
import { Badge, Button, Card, CardBody, ProgressBar, SessionEndScreen } from "@/components/ui";
import type { SessionSummaryItem } from "@/components/ui";
import {
  createStaircase,
  nextStaircase,
  startingLevel,
  type StaircaseConfig,
  type StaircaseState,
} from "@/core/adaptive-difficulty";
import {
  SESSION_SCHEMA_VERSION,
  type DifficultyLevel,
  type SessionOutcome,
  type SessionResult,
} from "@/core/types";
import { COMMON_TEXTS, TIMING_MODE_TEXTS } from "@/content/patio/atencion/comun";
import { PAIRS_TEXTS, PAIR_SYMBOLS_PACK } from "@/content/patio/memoria/pares";
import {
  MISMATCH_VISIBLE_MS,
  PAIRS_SESSION,
  createBoard,
  flip,
  hideMismatch,
  isComplete,
  isRoundSuccess,
  paramsForLevel,
  summarize,
  type BoardState,
  type PairSymbol,
  type RoundRecord,
  type TimingMode,
} from "./domain";

type Phase = "instrucciones" | "practica" | "practica-fin" | "juego" | "pausa" | "fin";

interface Run {
  mode: "practica" | "juego";
  roundsTotal: number;
  roundIndex: number;
  board: BoardState;
  staircase: StaircaseState;
  rounds: RoundRecord[];
}

const SYMBOL_IDS = PAIR_SYMBOLS_PACK.items.map((symbol) => symbol.id);

function symbolOf(id: string): PairSymbol {
  return PAIR_SYMBOLS_PACK.items.find((symbol) => symbol.id === id) ?? PAIR_SYMBOLS_PACK.items[0];
}

function boardFor(level: DifficultyLevel, practice: boolean): BoardState {
  const pairs = practice ? PAIRS_SESSION.practicePairs : paramsForLevel(level).pairs;
  return createBoard(pairs, SYMBOL_IDS, Math.random);
}

export default function ParesGame({ definition, initialLevel, onFinish, onExit }: ExerciseProps) {
  const config: StaircaseConfig = { range: definition.difficulty, correctToLevelUp: 2 };
  const [phase, setPhase] = useState<Phase>("instrucciones");
  const [timing, setTiming] = useState<TimingMode>("estandar");
  const [startLevel, setStartLevel] = useState<DifficultyLevel>(initialLevel);
  const [run, setRun] = useState<Run | null>(null);
  const [startedAt, setStartedAt] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [summary, setSummary] = useState<SessionSummaryItem[] | null>(null);
  const firstCardRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();

  const mismatchMs = MISMATCH_VISIBLE_MS[timing];
  const level = run ? run.staircase.level : startLevel;
  const showingMismatch = run ? run.board.faceUp.length === 2 : false;

  function begin(mode: Run["mode"]) {
    const isGame = mode === "juego";
    const staircase = createStaircase(isGame ? startLevel : PAIRS_SESSION.practiceLevel, config);
    setRun({
      mode,
      roundsTotal: isGame ? PAIRS_SESSION.rounds : 1,
      roundIndex: 0,
      board: boardFor(staircase.level, !isGame),
      staircase,
      rounds: [],
    });
    if (isGame) setStartedAt(new Date().toISOString());
    setAnnouncement("");
    setPhase(mode);
  }

  function finish(rounds: RoundRecord[], outcome: SessionOutcome, levelEnd: DifficultyLevel) {
    const s = summarize(rounds);
    const result: SessionResult = {
      id: crypto.randomUUID(),
      schemaVersion: SESSION_SCHEMA_VERSION,
      exerciseId: definition.id,
      module: "patio",
      contentId: PAIR_SYMBOLS_PACK.id,
      startedAt,
      endedAt: new Date().toISOString(),
      outcome,
      difficultyStart: createStaircase(startLevel, config).level,
      difficultyEnd: levelEnd,
      trials: s.moves,
      correct: s.matches,
      score: s.score,
    };
    onFinish(result);
    return [
      { label: "Rondas", value: String(s.rounds) },
      { label: "Parejas encontradas", value: String(s.matches) },
      { label: "Intentos", value: String(s.moves) },
      { label: "Eficiencia", value: `${Math.round(s.efficiency * 100)} %` },
      { label: "Máximo de parejas", value: String(s.maxPairs) },
      { label: "Nivel final", value: String(levelEnd) },
    ];
  }

  function completeRound(current: Run, board: BoardState) {
    const pairs = board.cards.length / 2;
    const success = isRoundSuccess(pairs, board.mismatches);
    const record: RoundRecord = {
      level: current.staircase.level,
      pairs,
      moves: board.moves,
      mismatches: board.mismatches,
      success,
    };
    const rounds = [...current.rounds, record];
    const staircase =
      current.mode === "juego" ? nextStaircase(current.staircase, success, config) : current.staircase;
    if (current.mode === "practica") {
      setRun(null);
      setPhase("practica-fin");
    } else if (current.roundIndex + 1 >= current.roundsTotal) {
      setSummary(finish(rounds, "completada", staircase.level));
      setStartLevel(startingLevel(staircase.level, config));
      setRun(null);
      setPhase("fin");
    } else {
      setRun({ ...current, board, rounds, staircase });
      setPhase("pausa");
    }
  }

  function onCard(index: number) {
    if (!run) return;
    if (showingMismatch) {
      // En el modo sin límite, tocar una carta también sirve para seguir.
      if (mismatchMs === null) setRun({ ...run, board: hideMismatch(run.board) });
      return;
    }
    const { state, event } = flip(run.board, index);
    if (event === "ignorada") return;
    const name = symbolOf(state.cards[index].symbolId).name;
    if (event === "primera") setAnnouncement(name);
    if (event === "pareja") setAnnouncement(`${name}: pareja encontrada`);
    if (event === "fallo") {
      const other = symbolOf(state.cards[state.faceUp[0]].symbolId).name;
      setAnnouncement(`${name}. No es pareja de ${other}`);
    }
    if (event === "pareja" && isComplete(state)) {
      completeRound(run, state);
      return;
    }
    setRun({ ...run, board: state });
  }

  function nextRound() {
    if (!run) return;
    setRun({
      ...run,
      roundIndex: run.roundIndex + 1,
      board: boardFor(run.staircase.level, false),
    });
    setAnnouncement("");
    setPhase("juego");
  }

  function exit() {
    if ((phase === "juego" || phase === "pausa") && run && run.rounds.length > 0) {
      finish(run.rounds, "abandonada", run.staircase.level);
    }
    onExit();
  }

  const onHide = useEffectEvent(() => {
    if (run) setRun({ ...run, board: hideMismatch(run.board) });
  });

  useEffect(() => {
    if (!showingMismatch || mismatchMs === null) return;
    const timer = window.setTimeout(onHide, mismatchMs);
    return () => window.clearTimeout(timer);
  }, [showingMismatch, mismatchMs]);

  const running = phase === "practica" || phase === "juego";
  const roundKey = run ? `${run.mode}-${run.roundIndex}` : "";
  useEffect(() => {
    if (running) firstCardRef.current?.focus();
  }, [running, roundKey]);

  if (phase === "fin" && summary) {
    return (
      <SessionEndScreen
        title={COMMON_TEXTS.endTitleDone}
        summary={summary}
        nextHint={PAIRS_TEXTS.nextHint}
        onRepeat={() => {
          setSummary(null);
          setPhase("instrucciones");
        }}
        onExit={onExit}
      />
    );
  }

  const lastRound = run?.rounds[run.rounds.length - 1];

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="text-2xl font-semibold text-ink">
          {definition.title}
        </h2>
        <div className="flex items-center gap-3">
          {run && (phase === "juego" || phase === "pausa") ? (
            <Badge tone="info">
              {COMMON_TEXTS.levelLabel} {level} · {paramsForLevel(level).pairs} parejas
            </Badge>
          ) : null}
          {phase === "practica" ? <Badge tone="warning">Práctica</Badge> : null}
          <Button variant="ghost" size="sm" onClick={exit}>
            {COMMON_TEXTS.exit}
          </Button>
        </div>
      </div>

      {phase === "instrucciones" ? (
        <Card>
          <CardBody className="gap-4">
            <p className="text-lg text-ink">{PAIRS_TEXTS.intro}</p>
            <fieldset className="flex flex-col gap-2">
              <legend className="pb-1 font-semibold text-ink">{COMMON_TEXTS.timingLegend}</legend>
              {TIMING_MODE_TEXTS.map((mode) => (
                <label key={mode.id} className="flex min-h-11 cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="pares-tiempo"
                    value={mode.id}
                    checked={timing === mode.id}
                    onChange={() => setTiming(mode.id)}
                    className="mt-1.5 size-4 accent-primary"
                  />
                  <span>
                    <span className="font-semibold text-ink">{mode.label}.</span>{" "}
                    {mode.id === "estandar"
                      ? "Dos cartas distintas se ven algo más de un segundo."
                      : mode.id === "ampliado"
                        ? "Dos cartas distintas se ven el doble de tiempo."
                        : PAIRS_TEXTS.untimed}
                  </span>
                </label>
              ))}
            </fieldset>
            <p>{PAIRS_TEXTS.keys}</p>
            <p>
              Empiezas en el nivel {startLevel} ({paramsForLevel(startLevel).pairs} parejas). La sesión tiene{" "}
              {PAIRS_SESSION.rounds} rondas. {PAIRS_TEXTS.adaptive}
            </p>
            <p className="text-sm">
              {PAIRS_TEXTS.honesty} {COMMON_TEXTS.privacy}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button onClick={() => begin("practica")}>
                {COMMON_TEXTS.practice} ({PAIRS_SESSION.practicePairs} parejas)
              </Button>
              <Button variant="secondary" onClick={() => begin("juego")}>
                {COMMON_TEXTS.skipPractice}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {phase === "practica-fin" ? (
        <Card>
          <CardBody>
            <p className="text-xl font-semibold text-ink">{COMMON_TEXTS.practiceDoneTitle}</p>
            <p>{COMMON_TEXTS.practiceDoneBody}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => begin("juego")}>{COMMON_TEXTS.start}</Button>
              <Button variant="secondary" onClick={() => begin("practica")}>
                Repetir práctica
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {phase === "pausa" && run && lastRound ? (
        <Card>
          <CardBody>
            <p className="text-xl font-semibold text-ink">
              {PAIRS_TEXTS.roundDone} {run.roundIndex + 1} de {run.roundsTotal}
            </p>
            <p>
              {lastRound.pairs} parejas en {lastRound.moves} intentos ({lastRound.mismatches} fallos). La
              siguiente ronda tiene {paramsForLevel(run.staircase.level).pairs} parejas.
            </p>
            <div className="pt-2">
              <Button onClick={nextRound}>Siguiente ronda</Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {running && run ? (
        <div className="flex flex-col gap-4">
          <ProgressBar
            value={run.board.matchedPairs}
            max={run.board.cards.length / 2}
            label={
              run.mode === "practica"
                ? "Parejas de práctica"
                : `Ronda ${run.roundIndex + 1} de ${run.roundsTotal}: parejas`
            }
          />
          <p className="text-ink-muted">
            Intentos: <span className="tabular-nums">{run.board.moves}</span> · Fallos:{" "}
            <span className="tabular-nums">{run.board.mismatches}</span>
          </p>
          <div
            role="group"
            aria-label="Cartas"
            className={`grid gap-2 sm:gap-3 ${
              run.board.cards.length > 12 ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-4"
            }`}
          >
            {run.board.cards.map((card, index) => {
              const faceUp = card.matched || run.board.faceUp.includes(index);
              const symbol = symbolOf(card.symbolId);
              const label = card.matched
                ? `Carta ${index + 1}: ${symbol.name}, emparejada`
                : faceUp
                  ? `Carta ${index + 1}: ${symbol.name}`
                  : `Carta ${index + 1}: boca abajo`;
              return (
                <button
                  key={index}
                  ref={index === 0 ? firstCardRef : undefined}
                  type="button"
                  aria-label={label}
                  aria-disabled={card.matched}
                  onClick={() => onCard(index)}
                  className={`relative flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-lg border-2 font-semibold motion-safe:transition-colors ${
                    card.matched
                      ? "border-line bg-surface-2 text-ink-muted"
                      : faceUp
                        ? "border-primary bg-surface text-ink"
                        : "border-line-strong bg-primary text-primary-ink hover:bg-primary-hover"
                  }`}
                >
                  {faceUp ? (
                    <>
                      <span aria-hidden="true" className="text-4xl leading-none sm:text-5xl">
                        {symbol.glyph}
                      </span>
                      <span aria-hidden="true" className="text-xs sm:text-sm">
                        {symbol.name}
                      </span>
                      {card.matched ? (
                        <span aria-hidden="true" className="absolute right-1.5 top-1 text-sm">
                          ✓
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span aria-hidden="true" className="text-2xl opacity-70">
                      ?
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {showingMismatch && mismatchMs === null ? (
            <div className="flex justify-center">
              <Button onClick={() => setRun({ ...run, board: hideMismatch(run.board) })}>
                {PAIRS_TEXTS.continue}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
