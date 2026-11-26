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
import { N_BACK_KEYS, N_BACK_LETTERS, N_BACK_TEXTS, nBackRule } from "@/content/patio/memoria/n-back";
import {
  N_BACK_SESSION,
  blockErrors,
  blockLength,
  evaluate,
  generateBlock,
  isBlockSuccess,
  isCorrect,
  paramsForLevel,
  summarize,
  timingFor,
  type NBackOutcome,
  type NBackRecord,
  type NBackTrial,
  type TimingMode,
} from "./domain";

type Phase = "instrucciones" | "practica" | "practica-fin" | "juego" | "pausa" | "fin";
type Step = "estimulo" | "espera" | "feedback";

interface Run {
  mode: "practica" | "juego";
  blocksTotal: number;
  blockIndex: number;
  trialIndex: number;
  block: NBackTrial[];
  n: number;
  step: Step;
  responded: boolean;
  reactionMs?: number;
  staircase: StaircaseState;
  records: NBackRecord[];
  feedback?: NBackOutcome;
}

interface Pause {
  errors: number;
  nextLevel: DifficultyLevel;
}

function newBlock(level: DifficultyLevel, practice: boolean): { n: number; block: NBackTrial[] } {
  const params = paramsForLevel(level);
  const spec = practice
    ? { n: params.n, length: N_BACK_SESSION.practiceLength, targets: N_BACK_SESSION.practiceTargets, lures: 0 }
    : {
        n: params.n,
        length: blockLength(params.n),
        targets: N_BACK_SESSION.targetsPerBlock,
        lures: params.luresPerBlock,
      };
  return { n: params.n, block: generateBlock(spec, N_BACK_LETTERS, Math.random) };
}

export default function NBackGame({ definition, initialLevel, onFinish, onExit }: ExerciseProps) {
  const config: StaircaseConfig = { range: definition.difficulty, correctToLevelUp: 2 };
  const [phase, setPhase] = useState<Phase>("instrucciones");
  const [timing, setTiming] = useState<TimingMode>("estandar");
  const [startLevel, setStartLevel] = useState<DifficultyLevel>(initialLevel);
  const [run, setRun] = useState<Run | null>(null);
  const [pause, setPause] = useState<Pause | null>(null);
  const [startedAt, setStartedAt] = useState("");
  const [summary, setSummary] = useState<SessionSummaryItem[] | null>(null);
  const shownAtRef = useRef(0);
  const matchRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();

  const untimed = timing === "sin-limite";
  const level = run ? run.staircase.level : startLevel;
  const { trialMs, stimulusMs } = timingFor(level, timing);
  const trial = run?.block[run.trialIndex];

  function begin(mode: Run["mode"]) {
    const isGame = mode === "juego";
    const staircase = createStaircase(isGame ? startLevel : N_BACK_SESSION.practiceLevel, config);
    setRun({
      mode,
      blocksTotal: isGame ? N_BACK_SESSION.blocks : 1,
      blockIndex: 0,
      trialIndex: 0,
      ...newBlock(staircase.level, !isGame),
      step: "estimulo",
      responded: false,
      staircase,
      records: [],
    });
    if (isGame) setStartedAt(new Date().toISOString());
    setPause(null);
    setPhase(mode);
  }

  function finish(records: NBackRecord[], outcome: SessionOutcome, levelEnd: DifficultyLevel) {
    const s = summarize(records);
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
      trials: s.trials,
      correct: s.correct,
      meanReactionMs: s.meanReactionMs,
      score: s.score,
    };
    onFinish(result);
    return [
      { label: "Coincidencias detectadas", value: `${s.hits} de ${s.hits + s.misses}` },
      { label: "Falsas alarmas", value: String(s.falseAlarms) },
      { label: "Discriminación", value: `${Math.round(s.discrimination * 100)} %` },
      { label: "n máximo", value: String(s.maxN) },
      { label: "Nivel final", value: String(levelEnd) },
      { label: "Puntos", value: String(s.score) },
    ];
  }

  /** Cierra el ensayo actual con la respuesta dada y pasa al siguiente o al fin de bloque. */
  function closeTrial(current: Run, responded: boolean, reactionMs?: number) {
    const currentTrial = current.block[current.trialIndex];
    const outcome = evaluate(currentTrial, responded);
    const records = [
      ...current.records,
      { level: current.staircase.level, n: current.n, outcome, reactionMs },
    ];
    const nextIndex = current.trialIndex + 1;

    if (nextIndex < current.block.length) {
      setRun({
        ...current,
        records,
        trialIndex: nextIndex,
        step: "estimulo",
        responded: false,
        reactionMs: undefined,
        // Las omisiones solo se conocen al cerrar el ensayo: se avisan durante la letra siguiente.
        feedback: outcome === "omision" ? outcome : undefined,
      });
      return;
    }

    const blockRecords = records.slice(-current.block.length);
    const staircase =
      current.mode === "juego"
        ? nextStaircase(current.staircase, isBlockSuccess(blockRecords), config)
        : current.staircase;
    if (current.mode === "practica") {
      setRun(null);
      setPhase("practica-fin");
      return;
    }
    if (current.blockIndex + 1 >= current.blocksTotal) {
      setSummary(finish(records, "completada", staircase.level));
      setStartLevel(startingLevel(staircase.level, config));
      setRun(null);
      setPhase("fin");
      return;
    }
    setRun({ ...current, records, staircase, feedback: undefined });
    setPause({ errors: blockErrors(blockRecords), nextLevel: staircase.level });
    setPhase("pausa");
  }

  function continueAfterPause() {
    if (!run) return;
    setRun({
      ...run,
      blockIndex: run.blockIndex + 1,
      trialIndex: 0,
      ...newBlock(run.staircase.level, false),
      step: "estimulo",
      responded: false,
      reactionMs: undefined,
      feedback: undefined,
    });
    setPause(null);
    setPhase("juego");
  }

  function pressMatch() {
    if (!run || !trial) return;
    if (untimed) {
      answerUntimed(true);
      return;
    }
    if (run.responded || run.step === "feedback") return;
    const reactionMs = Math.round(performance.now() - shownAtRef.current);
    setRun({ ...run, responded: true, reactionMs, feedback: evaluate(trial, true) });
  }

  function answerUntimed(match: boolean) {
    if (!run || !trial || run.step !== "estimulo") return;
    const reactionMs = match ? Math.round(performance.now() - shownAtRef.current) : undefined;
    setRun({ ...run, responded: match, reactionMs, step: "feedback", feedback: evaluate(trial, match) });
  }

  function exit() {
    if ((phase === "juego" || phase === "pausa") && run && run.records.length > 0) {
      finish(run.records, "abandonada", run.staircase.level);
    }
    onExit();
  }

  const onTimer = useEffectEvent(() => {
    if (!run) return;
    if (run.step === "estimulo") setRun({ ...run, step: "espera" });
    else closeTrial(run, run.responded, run.reactionMs);
  });

  const onStimulusShown = useEffectEvent(() => {
    shownAtRef.current = performance.now();
  });

  const running = phase === "practica" || phase === "juego";
  const step = running ? run?.step : undefined;
  const position = run ? `${run.blockIndex}:${run.trialIndex}` : "";
  useEffect(() => {
    if (step === undefined) return;
    if (step === "estimulo") onStimulusShown();
    let delay: number | null;
    if (step === "feedback") delay = N_BACK_SESSION.untimedFeedbackMs;
    else if (trialMs === null || stimulusMs === null) delay = null;
    else delay = step === "estimulo" ? stimulusMs : trialMs - stimulusMs;
    if (delay === null) return;
    const timer = window.setTimeout(onTimer, delay);
    return () => window.clearTimeout(timer);
  }, [step, position, trialMs, stimulusMs]);

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      target.closest("button, a, input") !== null &&
      !target.hasAttribute("data-respuesta")
    ) {
      return;
    }
    if ((N_BACK_KEYS.match as readonly string[]).includes(event.key)) {
      event.preventDefault();
      pressMatch();
    } else if (untimed && (N_BACK_KEYS.noMatch as readonly string[]).includes(event.key)) {
      event.preventDefault();
      answerUntimed(false);
    }
  });

  useEffect(() => {
    if (!running) return;
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    matchRef.current?.focus();
    return () => window.removeEventListener("keydown", listener);
  }, [running]);

  if (phase === "fin" && summary) {
    return (
      <SessionEndScreen
        title={COMMON_TEXTS.endTitleDone}
        summary={summary}
        nextHint={N_BACK_TEXTS.nextHint}
        onRepeat={() => {
          setSummary(null);
          setPhase("instrucciones");
        }}
        onExit={onExit}
      />
    );
  }

  const feedbackText = run?.feedback ? N_BACK_TEXTS.feedback[run.feedback] : "";
  const feedbackOk = run?.feedback ? isCorrect(run.feedback) : true;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="text-2xl font-semibold text-ink">
          {definition.title}
        </h2>
        <div className="flex items-center gap-3">
          {run && (phase === "juego" || phase === "pausa") ? (
            <Badge tone="info">
              {COMMON_TEXTS.levelLabel} {level} · n = {run.n}
            </Badge>
          ) : null}
          {phase === "practica" ? <Badge tone="warning">Práctica · n = 1</Badge> : null}
          <Button variant="ghost" size="sm" onClick={exit}>
            {COMMON_TEXTS.exit}
          </Button>
        </div>
      </div>

      {phase === "instrucciones" ? (
        <Card>
          <CardBody className="gap-4">
            <p className="text-lg text-ink">{N_BACK_TEXTS.intro}</p>
            <p>{N_BACK_TEXTS.example}</p>
            <fieldset className="flex flex-col gap-2">
              <legend className="pb-1 font-semibold text-ink">{COMMON_TEXTS.timingLegend}</legend>
              {TIMING_MODE_TEXTS.map((mode) => (
                <label key={mode.id} className="flex min-h-11 cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="nback-tiempo"
                    value={mode.id}
                    checked={timing === mode.id}
                    onChange={() => setTiming(mode.id)}
                    className="mt-1.5 size-4 accent-primary"
                  />
                  <span>
                    <span className="font-semibold text-ink">{mode.label}.</span>{" "}
                    {mode.id === "ampliado" ? "Un 50 % más de tiempo entre letras." : mode.description}
                  </span>
                </label>
              ))}
            </fieldset>
            <p>
              {untimed ? N_BACK_TEXTS.untimed : null} {N_BACK_TEXTS.keys}
            </p>
            <p>
              Empiezas en el nivel {startLevel} (n = {paramsForLevel(startLevel).n}). La sesión tiene{" "}
              {N_BACK_SESSION.blocks} bloques con una pausa entre ellos. {N_BACK_TEXTS.adaptive}
            </p>
            <p className="text-sm">
              {N_BACK_TEXTS.honesty} {COMMON_TEXTS.privacy}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button onClick={() => begin("practica")}>
                {COMMON_TEXTS.practice} (n = 1, {N_BACK_SESSION.practiceLength} letras)
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

      {phase === "pausa" && pause && run ? (
        <Card>
          <CardBody>
            <p className="text-xl font-semibold text-ink">
              {N_BACK_TEXTS.pauseTitle} {run.blockIndex + 1} de {run.blocksTotal}
            </p>
            <p>
              Errores en este bloque: {pause.errors}. El siguiente bloque es de nivel {pause.nextLevel}{" "}
              (n = {paramsForLevel(pause.nextLevel).n}). {nBackRule(paramsForLevel(pause.nextLevel).n)}
            </p>
            <p>Descansa lo que necesites.</p>
            <div className="pt-2">
              <Button onClick={continueAfterPause}>Continuar</Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {running && run ? (
        <div className="flex flex-col gap-4">
          <ProgressBar
            value={run.trialIndex}
            max={run.block.length}
            label={
              run.mode === "practica"
                ? "Letras de práctica"
                : `Bloque ${run.blockIndex + 1} de ${run.blocksTotal}`
            }
          />
          <p className="font-semibold text-ink">{nBackRule(run.n)}</p>
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-ink text-canvas sm:aspect-[16/9]">
            {trial && (run.step === "estimulo" || run.step === "feedback") ? (
              <span aria-hidden="true" className="font-mono text-8xl font-bold sm:text-9xl">
                {trial.letter}
              </span>
            ) : (
              <span aria-hidden="true" className="text-4xl opacity-60">
                +
              </span>
            )}
          </div>
          <p
            aria-hidden="true"
            className={`flex min-h-10 items-center gap-2 text-lg font-semibold ${
              feedbackOk ? "text-success" : "text-danger"
            }`}
          >
            {feedbackText ? (
              <>
                <span>{feedbackOk ? "✓" : "✗"}</span>
                {feedbackText}
              </>
            ) : null}
          </p>
          <div className={untimed ? "grid grid-cols-2 gap-3" : "grid grid-cols-1"}>
            <button
              ref={matchRef}
              type="button"
              data-respuesta=""
              aria-keyshortcuts="Space J"
              onPointerDown={(event) => {
                if (event.button === 0) pressMatch();
              }}
              onClick={(event) => {
                if (event.detail === 0) pressMatch();
              }}
              className="min-h-20 rounded-lg border-2 border-primary bg-primary text-xl font-semibold text-primary-ink hover:bg-primary-hover"
            >
              {N_BACK_TEXTS.match}
            </button>
            {untimed ? (
              <button
                type="button"
                data-respuesta=""
                aria-keyshortcuts="F"
                onClick={() => answerUntimed(false)}
                className="min-h-20 rounded-lg border-2 border-line-strong bg-surface text-xl font-semibold text-ink hover:bg-surface-2"
              >
                {N_BACK_TEXTS.noMatch}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <p aria-live="assertive" className="sr-only">
        {running && trial && run?.step === "estimulo" ? `Letra ${trial.letter}` : ""}
      </p>
      <p aria-live="polite" role="status" className="sr-only">
        {feedbackText}
      </p>
    </section>
  );
}
