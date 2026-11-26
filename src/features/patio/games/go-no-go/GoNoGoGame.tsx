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
import {
  GO_NO_GO_KEYS,
  GO_NO_GO_TEXTS,
  GO_STIMULI,
  NO_GO_STIMULUS,
} from "@/content/patio/atencion/go-no-go";
import {
  GO_NO_GO_SESSION,
  evaluate,
  generateBlock,
  isBlockSuccess,
  isCorrect,
  paramsForLevel,
  summarize,
  timingFor,
  type GoNoGoOutcome,
  type GoNoGoRecord,
  type GoNoGoTrial,
  type TimingMode,
} from "./domain";

type Phase = "instrucciones" | "practica" | "practica-fin" | "juego" | "fin";

interface Run {
  mode: "practica" | "juego";
  blocksTotal: number;
  blockSize: number;
  blockIndex: number;
  trialIndex: number;
  block: GoNoGoTrial[];
  step: "isi" | "estimulo";
  staircase: StaircaseState;
  records: GoNoGoRecord[];
  lastOutcome?: GoNoGoOutcome;
}

interface Finished {
  summary: SessionSummaryItem[];
}

export default function GoNoGoGame({ definition, initialLevel, onFinish, onExit }: ExerciseProps) {
  const config: StaircaseConfig = { range: definition.difficulty, correctToLevelUp: 2 };
  const [phase, setPhase] = useState<Phase>("instrucciones");
  const [timing, setTiming] = useState<TimingMode>("estandar");
  const [startLevel, setStartLevel] = useState<DifficultyLevel>(initialLevel);
  const [run, setRun] = useState<Run | null>(null);
  const [startedAt, setStartedAt] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [finished, setFinished] = useState<Finished | null>(null);
  const shownAtRef = useRef(0);
  const pressRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();

  const untimed = timing === "sin-limite";
  const level = run ? run.staircase.level : startLevel;
  const { stimulusMs, isiMs } = timingFor(level, timing);
  const trial = run?.block[run.trialIndex];

  function begin(mode: Run["mode"]) {
    const isGame = mode === "juego";
    const staircase = createStaircase(isGame ? startLevel : GO_NO_GO_SESSION.practiceLevel, config);
    const blockSize = isGame ? GO_NO_GO_SESSION.blockSize : GO_NO_GO_SESSION.practiceTrials;
    setRun({
      mode,
      blocksTotal: isGame ? GO_NO_GO_SESSION.blocks : 1,
      blockSize,
      blockIndex: 0,
      trialIndex: 0,
      block: generateBlock(staircase.level, blockSize, GO_STIMULI, NO_GO_STIMULUS, Math.random),
      step: "isi",
      staircase,
      records: [],
    });
    if (isGame) setStartedAt(new Date().toISOString());
    setAnnouncement("");
    setPhase(mode);
  }

  function finish(current: Run, records: GoNoGoRecord[], outcome: SessionOutcome, levelEnd: DifficultyLevel) {
    const summary = summarize(records);
    const result: SessionResult = {
      id: crypto.randomUUID(),
      schemaVersion: SESSION_SCHEMA_VERSION,
      exerciseId: definition.id,
      module: "patio",
      startedAt,
      endedAt: new Date().toISOString(),
      outcome,
      difficultyStart: createStaircase(startLevel, config).level,
      difficultyEnd: levelEnd,
      trials: summary.trials,
      correct: summary.correct,
      meanReactionMs: summary.meanReactionMs,
      score: summary.score,
    };
    onFinish(result);
    return {
      summary: [
        { label: "Aciertos", value: `${summary.correct} de ${summary.trials}` },
        { label: "Frenadas correctas", value: `${summary.correctRejections} de ${summary.correctRejections + summary.commissions}` },
        { label: "Pulsaciones de más", value: String(summary.commissions) },
        { label: "Letras sin pulsar", value: String(summary.omissions) },
        {
          label: "Tiempo medio",
          value: summary.meanReactionMs === undefined ? "—" : `${summary.meanReactionMs} ms`,
        },
        { label: "Nivel final", value: String(levelEnd) },
      ],
    } satisfies Finished;
  }

  function respond(pressed: boolean) {
    if (!run || run.step !== "estimulo" || !trial) return;
    const reactionMs = pressed ? Math.round(performance.now() - shownAtRef.current) : null;
    const outcome = evaluate(trial, pressed, reactionMs);
    const record: GoNoGoRecord = {
      level: run.staircase.level,
      kind: trial.kind,
      outcome,
      reactionMs: reactionMs ?? undefined,
    };
    const records = [...run.records, record];
    setAnnouncement(isCorrect(outcome) ? "" : GO_NO_GO_TEXTS.feedback[outcome]);

    const nextTrial = run.trialIndex + 1;
    if (nextTrial < run.blockSize) {
      setRun({ ...run, records, trialIndex: nextTrial, step: "isi", lastOutcome: outcome });
      return;
    }

    // Fin de bloque: en la sesión real, la escalera decide el nivel del bloque siguiente.
    const blockRecords = records.slice(-run.blockSize);
    const staircase =
      run.mode === "juego"
        ? nextStaircase(run.staircase, isBlockSuccess(blockRecords), config)
        : run.staircase;
    const nextBlock = run.blockIndex + 1;
    if (nextBlock >= run.blocksTotal) {
      setRun(null);
      if (run.mode === "practica") {
        setPhase("practica-fin");
      } else {
        setFinished(finish(run, records, "completada", staircase.level));
        setStartLevel(startingLevel(staircase.level, config));
        setPhase("fin");
      }
      return;
    }
    setRun({
      ...run,
      records,
      staircase,
      blockIndex: nextBlock,
      trialIndex: 0,
      block: generateBlock(staircase.level, run.blockSize, GO_STIMULI, NO_GO_STIMULUS, Math.random),
      step: "isi",
      lastOutcome: outcome,
    });
  }

  function exit() {
    if (phase === "juego" && run && run.records.length > 0) {
      finish(run, run.records, "abandonada", run.staircase.level);
    }
    onExit();
  }

  const onTimer = useEffectEvent(() => {
    if (!run) return;
    if (run.step === "isi") {
      setRun({ ...run, step: "estimulo" });
    } else {
      respond(false);
    }
  });

  const onStimulusShown = useEffectEvent(() => {
    shownAtRef.current = performance.now();
  });

  const step = run?.step;
  const position = run ? run.blockIndex * run.blockSize + run.trialIndex : -1;
  useEffect(() => {
    if (step === undefined) return;
    if (step === "estimulo") onStimulusShown();
    const delay = step === "isi" ? isiMs : stimulusMs;
    if (delay === null) return;
    const timer = window.setTimeout(onTimer, delay);
    return () => window.clearTimeout(timer);
  }, [step, position, isiMs, stimulusMs]);

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    const onOtherButton =
      target instanceof HTMLElement &&
      target.closest("button, a, input") !== null &&
      !target.hasAttribute("data-respuesta");
    if (onOtherButton) return;
    if ((GO_NO_GO_KEYS.press as readonly string[]).includes(event.key)) {
      event.preventDefault();
      respond(true);
    } else if (untimed && (GO_NO_GO_KEYS.withhold as readonly string[]).includes(event.key)) {
      event.preventDefault();
      respond(false);
    }
  });

  const running = phase === "practica" || phase === "juego";
  useEffect(() => {
    if (!running) return;
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    pressRef.current?.focus();
    return () => window.removeEventListener("keydown", listener);
  }, [running]);

  if (phase === "fin" && finished) {
    return (
      <SessionEndScreen
        title={COMMON_TEXTS.endTitleDone}
        summary={finished.summary}
        nextHint={GO_NO_GO_TEXTS.nextHint}
        onRepeat={() => {
          setFinished(null);
          setPhase("instrucciones");
        }}
        onExit={onExit}
      />
    );
  }

  const done = run ? run.records.length : 0;
  const total = run ? run.blocksTotal * run.blockSize : 0;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="text-2xl font-semibold text-ink">
          {definition.title}
        </h2>
        <div className="flex items-center gap-3">
          {phase === "juego" ? (
            <Badge tone="info">
              {COMMON_TEXTS.levelLabel} {level}
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
            <p className="text-lg text-ink">{GO_NO_GO_TEXTS.intro}</p>
            <p>{GO_NO_GO_TEXTS.why}</p>
            <fieldset className="flex flex-col gap-2">
              <legend className="pb-1 font-semibold text-ink">{COMMON_TEXTS.timingLegend}</legend>
              {TIMING_MODE_TEXTS.map((mode) => (
                <label key={mode.id} className="flex min-h-11 cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="gonogo-tiempo"
                    value={mode.id}
                    checked={timing === mode.id}
                    onChange={() => setTiming(mode.id)}
                    className="mt-1.5 size-4 accent-primary"
                  />
                  <span>
                    <span className="font-semibold text-ink">{mode.label}.</span> {mode.description}
                  </span>
                </label>
              ))}
            </fieldset>
            <p>
              {untimed ? GO_NO_GO_TEXTS.untimed : null} {GO_NO_GO_TEXTS.keys}
            </p>
            <p>
              Empiezas en el nivel {startLevel}: la {NO_GO_STIMULUS} aparece en un{" "}
              {Math.round(paramsForLevel(startLevel).noGoRatio * 100)} % de las letras.{" "}
              {GO_NO_GO_TEXTS.adaptive}
            </p>
            <p className="text-sm">
              {GO_NO_GO_TEXTS.honesty} {COMMON_TEXTS.privacy}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button onClick={() => begin("practica")}>
                {COMMON_TEXTS.practice} ({GO_NO_GO_SESSION.practiceTrials} letras)
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
            value={done}
            max={total}
            label={run.mode === "practica" ? "Letras de práctica" : "Letras"}
          />
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-lg bg-ink text-canvas sm:aspect-[16/9]">
            {run.step === "estimulo" && trial ? (
              <span aria-hidden="true" className="font-mono text-8xl font-bold sm:text-9xl">
                {trial.stimulus}
              </span>
            ) : (
              <OutcomeMark outcome={run.lastOutcome} />
            )}
          </div>
          <div className={untimed ? "grid grid-cols-2 gap-3" : "grid grid-cols-1"}>
            <button
              ref={pressRef}
              type="button"
              data-respuesta=""
              aria-keyshortcuts="Space J"
              onPointerDown={(event) => {
                if (event.button === 0) respond(true);
              }}
              onClick={(event) => {
                // Clic generado por teclado o tecnología de apoyo (detail 0).
                if (event.detail === 0) respond(true);
              }}
              className="min-h-20 rounded-lg border-2 border-primary bg-primary text-xl font-semibold text-primary-ink hover:bg-primary-hover"
            >
              {GO_NO_GO_TEXTS.press}
            </button>
            {untimed ? (
              <button
                type="button"
                data-respuesta=""
                aria-keyshortcuts="F"
                onClick={() => respond(false)}
                className="min-h-20 rounded-lg border-2 border-line-strong bg-surface text-xl font-semibold text-ink hover:bg-surface-2"
              >
                {GO_NO_GO_TEXTS.withhold}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <p aria-live="assertive" className="sr-only">
        {running && run?.step === "estimulo" && trial ? `Letra ${trial.stimulus}` : ""}
      </p>
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

function OutcomeMark({ outcome }: { outcome?: GoNoGoOutcome }) {
  if (!outcome) {
    return (
      <span aria-hidden="true" className="text-4xl">
        +
      </span>
    );
  }
  const ok = isCorrect(outcome);
  return (
    <p
      aria-hidden="true"
      className={`flex items-center gap-3 rounded-md px-4 py-2 text-xl font-semibold ${
        ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
      }`}
    >
      <span className="text-2xl">{ok ? "✓" : "✗"}</span>
      {GO_NO_GO_TEXTS.feedback[outcome]}
    </p>
  );
}
