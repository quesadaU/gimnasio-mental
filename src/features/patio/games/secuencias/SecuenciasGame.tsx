"use client";

import { useEffect, useEffectEvent, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
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
import { COMMON_TEXTS } from "@/content/patio/atencion/comun";
import {
  PRESENTATION_TEXTS,
  SPAN_TEXTS,
  SPAN_VARIANT_TEXTS,
} from "@/content/patio/memoria/secuencias";
import {
  DIGIT_POOL,
  PRESENTATION_TIMING,
  SPAN_SESSION,
  SPATIAL_GRID_SIZE,
  checkAnswer,
  expectedAnswer,
  generateSequence,
  paramsForLevel,
  summarize,
  type AnswerCheck,
  type PresentationMode,
  type SpanRecord,
  type SpanVariant,
} from "./domain";

type Phase = "instrucciones" | "practica" | "practica-fin" | "juego" | "fin";
type Step = "preparado" | "presentando" | "respuesta" | "feedback";

interface Run {
  mode: "practica" | "juego";
  total: number;
  index: number;
  step: Step;
  sequence: number[];
  presentIndex: number;
  presentOn: boolean;
  answer: number[];
  staircase: StaircaseState;
  records: SpanRecord[];
  lastCheck?: AnswerCheck;
}

function cellLabel(cell: number): string {
  const row = Math.floor(cell / SPATIAL_GRID_SIZE) + 1;
  const column = (cell % SPATIAL_GRID_SIZE) + 1;
  return `Fila ${row}, columna ${column}`;
}

export default function SecuenciasGame({ definition, initialLevel, onFinish, onExit }: ExerciseProps) {
  const config: StaircaseConfig = { range: definition.difficulty, correctToLevelUp: 2 };
  const [phase, setPhase] = useState<Phase>("instrucciones");
  const [variant, setVariant] = useState<SpanVariant>("digitos-directo");
  const [presentation, setPresentation] = useState<PresentationMode>("estandar");
  const [startLevel, setStartLevel] = useState<DifficultyLevel>(initialLevel);
  const [run, setRun] = useState<Run | null>(null);
  const [startedAt, setStartedAt] = useState("");
  const [summary, setSummary] = useState<SessionSummaryItem[] | null>(null);
  const [activeCell, setActiveCell] = useState(0);
  const firstInputRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const headingId = useId();

  const spatial = variant === "espacial";
  const expected = run ? expectedAnswer(variant, run.sequence) : [];

  function newRun(mode: Run["mode"]): Run {
    const isGame = mode === "juego";
    const staircase = createStaircase(isGame ? startLevel : SPAN_SESSION.practiceLevel, config);
    return {
      mode,
      total: isGame ? SPAN_SESSION.trials : SPAN_SESSION.practiceTrials,
      index: 0,
      step: "preparado",
      sequence: generateSequence(variant, staircase.level, Math.random),
      presentIndex: 0,
      presentOn: false,
      answer: [],
      staircase,
      records: [],
    };
  }

  function begin(mode: Run["mode"]) {
    setRun(newRun(mode));
    if (mode === "juego") setStartedAt(new Date().toISOString());
    setPhase(mode);
  }

  function finish(records: SpanRecord[], outcome: SessionOutcome, levelEnd: DifficultyLevel) {
    const s = summarize(records);
    const result: SessionResult = {
      id: crypto.randomUUID(),
      schemaVersion: SESSION_SCHEMA_VERSION,
      exerciseId: definition.id,
      module: "patio",
      contentId: `secuencias-${variant}`,
      startedAt,
      endedAt: new Date().toISOString(),
      outcome,
      difficultyStart: createStaircase(startLevel, config).level,
      difficultyEnd: levelEnd,
      trials: s.trials,
      correct: s.correct,
      score: s.score,
    };
    onFinish(result);
    return [
      { label: "Secuencias correctas", value: `${s.correct} de ${s.trials}` },
      { label: "Más larga recordada", value: s.longestSpan === 0 ? "—" : `${s.longestSpan} elementos` },
      { label: "Variante", value: SPAN_VARIANT_TEXTS[variant].label },
      { label: "Nivel final", value: String(levelEnd) },
      { label: "Puntos", value: String(s.score) },
    ];
  }

  function addItem(value: number) {
    if (!run || run.step !== "respuesta" || run.answer.length >= run.sequence.length) return;
    if (spatial && run.answer.includes(value)) return;
    setRun({ ...run, answer: [...run.answer, value] });
  }

  function eraseLast() {
    if (!run || run.step !== "respuesta") return;
    setRun({ ...run, answer: run.answer.slice(0, -1) });
  }

  function submit() {
    if (!run || run.step !== "respuesta" || run.answer.length !== run.sequence.length) return;
    const check = checkAnswer(expected, run.answer);
    const record: SpanRecord = {
      level: run.staircase.level,
      length: run.sequence.length,
      correct: check.correct,
    };
    const staircase =
      run.mode === "juego" ? nextStaircase(run.staircase, check.correct, config) : run.staircase;
    setRun({ ...run, step: "feedback", lastCheck: check, staircase, records: [...run.records, record] });
  }

  function next() {
    if (!run || run.step !== "feedback") return;
    const nextIndex = run.index + 1;
    if (nextIndex >= run.total) {
      setRun(null);
      if (run.mode === "practica") {
        setPhase("practica-fin");
      } else {
        setSummary(finish(run.records, "completada", run.staircase.level));
        setStartLevel(startingLevel(run.staircase.level, config));
        setPhase("fin");
      }
      return;
    }
    setRun({
      ...run,
      index: nextIndex,
      step: "preparado",
      sequence: generateSequence(variant, run.staircase.level, Math.random),
      presentIndex: 0,
      presentOn: false,
      answer: [],
      lastCheck: undefined,
    });
  }

  function exit() {
    if (phase === "juego" && run && run.records.length > 0) {
      finish(run.records, "abandonada", run.staircase.level);
    }
    onExit();
  }

  const timingValues = PRESENTATION_TIMING[presentation];
  const onTimer = useEffectEvent(() => {
    if (!run) return;
    if (run.step === "preparado") {
      setRun({ ...run, step: "presentando", presentIndex: 0, presentOn: true });
    } else if (run.step === "presentando") {
      if (run.presentOn) {
        setRun({ ...run, presentOn: false });
      } else if (run.presentIndex + 1 < run.sequence.length) {
        setRun({ ...run, presentIndex: run.presentIndex + 1, presentOn: true });
      } else {
        setRun({ ...run, step: "respuesta" });
      }
    }
  });

  const step = run?.step;
  const presentIndex = run?.presentIndex;
  const presentOn = run?.presentOn;
  const trialIndex = run?.index;
  useEffect(() => {
    if (step !== "preparado" && step !== "presentando") return;
    const delay =
      step === "preparado"
        ? SPAN_SESSION.readyMs
        : presentOn
          ? timingValues.itemMs
          : timingValues.gapMs;
    const timer = window.setTimeout(onTimer, delay);
    return () => window.clearTimeout(timer);
  }, [step, presentIndex, presentOn, trialIndex, timingValues.itemMs, timingValues.gapMs]);

  // Foco: al empezar a responder, al primer control de respuesta; en el feedback, a "Siguiente".
  useEffect(() => {
    if (step === "respuesta") {
      if (spatial) cellRefs.current[0]?.focus();
      else firstInputRef.current?.focus();
    } else if (step === "feedback") {
      nextRef.current?.focus();
    }
  }, [step, trialIndex, spatial]);

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || !run || run.step !== "respuesta") return;
    if (!spatial && /^[1-9]$/.test(event.key)) {
      event.preventDefault();
      addItem(Number(event.key));
    } else if (event.key === "Backspace") {
      event.preventDefault();
      eraseLast();
    } else if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      submit();
    }
  });

  const running = phase === "practica" || phase === "juego";
  useEffect(() => {
    if (!running) return;
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [running]);

  function onGridKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: SPATIAL_GRID_SIZE,
      ArrowUp: -SPATIAL_GRID_SIZE,
    };
    const delta = moves[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const total = SPATIAL_GRID_SIZE * SPATIAL_GRID_SIZE;
    const target = Math.min(total - 1, Math.max(0, activeCell + delta));
    setActiveCell(target);
    cellRefs.current[target]?.focus();
  }

  if (phase === "fin" && summary) {
    return (
      <SessionEndScreen
        title={COMMON_TEXTS.endTitleDone}
        summary={summary}
        nextHint={SPAN_TEXTS.nextHint}
        onRepeat={() => {
          setSummary(null);
          setPhase("instrucciones");
        }}
        onExit={onExit}
      />
    );
  }

  const presentedItem =
    run && run.step === "presentando" && run.presentOn ? run.sequence[run.presentIndex] : undefined;
  const liveText =
    presentedItem === undefined ? "" : spatial ? cellLabel(presentedItem) : String(presentedItem);
  const level = run ? run.staircase.level : startLevel;
  const feedbackText = !run || run.step !== "feedback" || !run.lastCheck
    ? ""
    : run.lastCheck.correct
      ? COMMON_TEXTS.correct
      : spatial
        ? `${COMMON_TEXTS.wrong}: los números de la rejilla muestran el orden correcto. Acertaste ${run.lastCheck.positionsCorrect} de ${expected.length} posiciones.`
        : `${COMMON_TEXTS.wrong}: era ${expected.join(" ")}. Acertaste ${run.lastCheck.positionsCorrect} de ${expected.length} posiciones.`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="text-2xl font-semibold text-ink">
          {definition.title}
        </h2>
        <div className="flex items-center gap-3">
          {phase === "juego" ? (
            <Badge tone="info">
              {COMMON_TEXTS.levelLabel} {level} · {paramsForLevel(level).length} elementos
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
            <p className="text-lg text-ink">{SPAN_TEXTS.intro}</p>
            <fieldset className="flex flex-col gap-2">
              <legend className="pb-1 font-semibold text-ink">Variante</legend>
              {(Object.keys(SPAN_VARIANT_TEXTS) as SpanVariant[]).map((id) => (
                <label key={id} className="flex min-h-11 cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="span-variante"
                    value={id}
                    checked={variant === id}
                    onChange={() => setVariant(id)}
                    className="mt-1.5 size-4 accent-primary"
                  />
                  <span>
                    <span className="font-semibold text-ink">{SPAN_VARIANT_TEXTS[id].label}.</span>{" "}
                    {SPAN_VARIANT_TEXTS[id].rule}
                  </span>
                </label>
              ))}
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="pb-1 font-semibold text-ink">Velocidad de presentación</legend>
              {(Object.keys(PRESENTATION_TEXTS) as PresentationMode[]).map((id) => (
                <label key={id} className="flex min-h-11 cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="span-velocidad"
                    value={id}
                    checked={presentation === id}
                    onChange={() => setPresentation(id)}
                    className="mt-1.5 size-4 accent-primary"
                  />
                  <span>
                    <span className="font-semibold text-ink">{PRESENTATION_TEXTS[id].label}.</span>{" "}
                    {PRESENTATION_TEXTS[id].description}
                  </span>
                </label>
              ))}
            </fieldset>
            <p>
              {SPAN_TEXTS.untimed} {spatial ? SPAN_TEXTS.keysSpatial : SPAN_TEXTS.keysDigits}
            </p>
            <p>
              Empiezas en el nivel {startLevel}: secuencias de {paramsForLevel(startLevel).length}{" "}
              elementos. {SPAN_TEXTS.adaptive}
            </p>
            <p className="text-sm">
              {SPAN_TEXTS.honesty} {COMMON_TEXTS.privacy}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button onClick={() => begin("practica")}>
                {COMMON_TEXTS.practice} ({SPAN_SESSION.practiceTrials} secuencias)
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

      {running && run ? (
        <div className="flex flex-col gap-4">
          <ProgressBar
            value={run.index + (run.step === "feedback" ? 1 : 0)}
            max={run.total}
            label={run.mode === "practica" ? "Secuencias de práctica" : "Secuencias"}
          />
          <p className="font-semibold text-ink">
            {run.step === "preparado" || run.step === "presentando"
              ? SPAN_TEXTS.ready
              : `${SPAN_TEXTS.yourTurn}: ${SPAN_VARIANT_TEXTS[variant].prompt}`}
          </p>

          {spatial ? (
            <div
              role="group"
              aria-label="Rejilla de casillas"
              onKeyDown={onGridKeyDown}
              className="mx-auto grid w-full max-w-sm gap-2"
              style={{ gridTemplateColumns: `repeat(${SPATIAL_GRID_SIZE}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: SPATIAL_GRID_SIZE * SPATIAL_GRID_SIZE }, (_, cell) => {
                const lit = presentedItem === cell;
                const order = run.answer.indexOf(cell);
                const expectedOrder = run.step === "feedback" ? expected.indexOf(cell) : -1;
                return (
                  <button
                    key={cell}
                    ref={(element) => {
                      cellRefs.current[cell] = element;
                    }}
                    type="button"
                    tabIndex={cell === activeCell ? 0 : -1}
                    aria-disabled={run.step !== "respuesta"}
                    aria-pressed={order >= 0}
                    aria-label={`${cellLabel(cell)}${order >= 0 ? `, marcada ${order + 1}ª` : ""}${
                      expectedOrder >= 0 ? `, orden correcto ${expectedOrder + 1}ª` : ""
                    }`}
                    onFocus={() => setActiveCell(cell)}
                    onClick={() => addItem(cell)}
                    className={`flex aspect-square items-center justify-center rounded-md border-2 text-xl font-bold ${
                      lit
                        ? "border-ink bg-ink text-canvas"
                        : order >= 0
                          ? "border-primary bg-surface-2 text-ink"
                          : "border-line-strong bg-surface text-ink"
                    }`}
                  >
                    <span aria-hidden="true">
                      {lit ? "●" : run.step === "feedback" && expectedOrder >= 0 ? expectedOrder + 1 : order >= 0 ? order + 1 : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className="flex min-h-40 items-center justify-center rounded-lg bg-ink text-canvas">
                <span aria-hidden="true" className="font-mono text-8xl font-bold">
                  {presentedItem ?? ""}
                </span>
              </div>
              {run.step === "respuesta" || run.step === "feedback" ? (
                <p
                  className="flex flex-wrap justify-center gap-2 font-mono text-3xl"
                  aria-label={`Tu respuesta: ${run.answer.join(" ") || "vacía"}, ${run.answer.length} de ${run.sequence.length}`}
                >
                  {run.sequence.map((_, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className="flex h-12 w-10 items-center justify-center border-b-4 border-line-strong"
                    >
                      {run.answer[i] ?? ""}
                    </span>
                  ))}
                </p>
              ) : null}
              {run.step === "respuesta" ? (
                <div role="group" aria-label="Teclado numérico" className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
                  {DIGIT_POOL.map((digit, i) => (
                    <button
                      key={digit}
                      ref={i === 0 ? firstInputRef : undefined}
                      type="button"
                      onClick={() => addItem(digit)}
                      className="min-h-14 rounded-md border border-line-strong bg-surface text-2xl font-semibold text-ink hover:bg-surface-2"
                    >
                      {digit}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}

          {run.step === "respuesta" ? (
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="secondary" onClick={eraseLast} disabled={run.answer.length === 0}>
                {SPAN_TEXTS.erase}
              </Button>
              <Button onClick={submit} disabled={run.answer.length !== run.sequence.length}>
                {SPAN_TEXTS.check} ({run.answer.length}/{run.sequence.length})
              </Button>
            </div>
          ) : null}

          {run.step === "feedback" && run.lastCheck ? (
            <div className="flex flex-col items-center gap-3">
              <p
                aria-hidden="true"
                className={`flex items-center gap-2 text-xl font-semibold ${
                  run.lastCheck.correct ? "text-success" : "text-danger"
                }`}
              >
                <span aria-hidden="true">{run.lastCheck.correct ? "✓" : "✗"}</span>
                {feedbackText}
              </p>
              <Button ref={nextRef} onClick={next}>
                {SPAN_TEXTS.next}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <p aria-live="assertive" className="sr-only">
        {liveText}
      </p>
      <p aria-live="polite" role="status" className="sr-only">
        {feedbackText}
      </p>
    </section>
  );
}
