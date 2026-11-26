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
  STROOP_OPTIONS,
  STROOP_PANEL_BG,
  STROOP_PANEL_INK,
  STROOP_TEXTS,
} from "@/content/patio/atencion/stroop";
import {
  STROOP_SESSION,
  evaluateResponse,
  generateTrial,
  paramsForLevel,
  responseWindow,
  summarize,
  type StroopOption,
  type StroopResponseKind,
  type StroopTrial,
  type StroopTrialRecord,
  type StroopVariant,
  type TimingMode,
} from "./domain";

type Phase = "instrucciones" | "practica" | "practica-fin" | "juego" | "fin";
type Step = "fijacion" | "estimulo" | "feedback";

interface Run {
  mode: "practica" | "juego";
  total: number;
  index: number;
  step: Step;
  trial: StroopTrial;
  staircase: StaircaseState;
  records: StroopTrialRecord[];
  lastKind?: StroopResponseKind;
}

interface Finished {
  result: SessionResult;
  summary: SessionSummaryItem[];
}

const POSITION_CLASS: Record<string, string> = {
  arriba: "left-1/2 top-4 -translate-x-1/2",
  abajo: "bottom-4 left-1/2 -translate-x-1/2",
  izquierda: "left-3 top-1/2 -translate-y-1/2",
  derecha: "right-3 top-1/2 -translate-y-1/2",
};

function optionById(options: readonly StroopOption[], id: string): StroopOption {
  return options.find((option) => option.id === id) ?? options[0];
}

export default function StroopGame({ definition, initialLevel, onFinish, onExit }: ExerciseProps) {
  const config: StaircaseConfig = { range: definition.difficulty, correctToLevelUp: 2 };
  const [phase, setPhase] = useState<Phase>("instrucciones");
  const [variant, setVariant] = useState<StroopVariant>("color");
  const [timing, setTiming] = useState<TimingMode>("estandar");
  const [startLevel, setStartLevel] = useState<DifficultyLevel>(initialLevel);
  const [run, setRun] = useState<Run | null>(null);
  const [startedAt, setStartedAt] = useState<string>("");
  const [announcement, setAnnouncement] = useState("");
  const [finished, setFinished] = useState<Finished | null>(null);
  const shownAtRef = useRef(0);
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();

  const options = STROOP_OPTIONS[variant];
  const level = run?.mode === "juego" ? run.staircase.level : STROOP_SESSION.practiceLevel;
  const windowMs = responseWindow(level, timing);

  function begin(mode: Run["mode"]) {
    const staircase = createStaircase(
      mode === "juego" ? startLevel : STROOP_SESSION.practiceLevel,
      config,
    );
    setRun({
      mode,
      total: mode === "juego" ? STROOP_SESSION.trials : STROOP_SESSION.practiceTrials,
      index: 0,
      step: "fijacion",
      trial: generateTrial(
        options.map((option) => option.id),
        staircase.level,
        Math.random,
      ),
      staircase,
      records: [],
    });
    if (mode === "juego") setStartedAt(new Date().toISOString());
    setAnnouncement("");
    setPhase(mode);
  }

  function finish(current: Run, outcome: SessionOutcome) {
    const summary = summarize(current.records);
    const result: SessionResult = {
      id: crypto.randomUUID(),
      schemaVersion: SESSION_SCHEMA_VERSION,
      exerciseId: definition.id,
      module: "patio",
      contentId: `stroop-${variant}`,
      startedAt,
      endedAt: new Date().toISOString(),
      outcome,
      difficultyStart: createStaircase(startLevel, config).level,
      difficultyEnd: current.staircase.level,
      trials: summary.trials,
      correct: summary.correct,
      meanReactionMs: summary.meanReactionMs,
      score: summary.score,
    };
    onFinish(result);
    return {
      result,
      summary: [
        { label: "Aciertos", value: `${summary.correct} de ${summary.trials}` },
        { label: "Precisión", value: `${Math.round(summary.accuracy * 100)} %` },
        {
          label: "Tiempo medio",
          value: summary.meanReactionMs === undefined ? "—" : `${summary.meanReactionMs} ms`,
        },
        {
          label: "Coste del conflicto",
          value: summary.interferenceMs === undefined ? "—" : `${summary.interferenceMs} ms`,
        },
        { label: "Nivel final", value: String(current.staircase.level) },
        { label: "Puntos", value: String(summary.score) },
      ],
    };
  }

  function respond(responseId: string | null) {
    if (!run || run.step !== "estimulo") return;
    const reactionMs = responseId === null ? null : Math.round(performance.now() - shownAtRef.current);
    const kind = evaluateResponse(run.trial, responseId, reactionMs, windowMs);
    const record: StroopTrialRecord = {
      level: run.staircase.level,
      congruent: run.trial.congruent,
      kind,
      reactionMs: reactionMs ?? undefined,
    };
    const staircase =
      run.mode === "juego" ? nextStaircase(run.staircase, kind === "acierto", config) : run.staircase;
    const answer = optionById(options, run.trial.featureId).label;
    setAnnouncement(
      kind === "acierto"
        ? COMMON_TEXTS.correct
        : `${kind === "sin-respuesta" ? COMMON_TEXTS.timeout : COMMON_TEXTS.wrong}. Era ${answer}.`,
    );
    setRun({ ...run, step: "feedback", lastKind: kind, staircase, records: [...run.records, record] });
  }

  function advance() {
    if (!run) return;
    const nextIndex = run.index + 1;
    if (nextIndex >= run.total) {
      if (run.mode === "practica") {
        setRun(null);
        setPhase("practica-fin");
      } else {
        setFinished(finish(run, "completada"));
        setStartLevel(startingLevel(run.staircase.level, config));
        setRun(null);
        setPhase("fin");
      }
      return;
    }
    setRun({
      ...run,
      index: nextIndex,
      step: "fijacion",
      lastKind: undefined,
      trial: generateTrial(
        options.map((option) => option.id),
        run.staircase.level,
        Math.random,
        run.trial,
      ),
    });
  }

  function exit() {
    if (phase === "juego" && run && run.records.length > 0) finish(run, "abandonada");
    onExit();
  }

  const onTimer = useEffectEvent(() => {
    if (!run) return;
    if (run.step === "fijacion") {
      setRun({ ...run, step: "estimulo" });
    } else if (run.step === "estimulo") {
      respond(null);
    } else {
      advance();
    }
  });

  const onStimulusShown = useEffectEvent(() => {
    shownAtRef.current = performance.now();
  });

  const step = run?.step;
  const index = run?.index;
  useEffect(() => {
    if (step === undefined) return;
    let delay: number | null;
    if (step === "fijacion") delay = STROOP_SESSION.interTrialMs;
    else if (step === "feedback") delay = STROOP_SESSION.feedbackMs;
    else {
      onStimulusShown();
      delay = windowMs;
    }
    if (delay === null) return;
    const timer = window.setTimeout(onTimer, delay);
    return () => window.clearTimeout(timer);
  }, [step, index, windowMs]);

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const option = options.find((candidate) => candidate.keys.includes(event.key));
    if (!option) return;
    event.preventDefault();
    respond(option.id);
  });

  const running = phase === "practica" || phase === "juego";
  useEffect(() => {
    if (!running) return;
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    firstOptionRef.current?.focus();
    return () => window.removeEventListener("keydown", listener);
  }, [running]);

  if (phase === "fin" && finished) {
    return (
      <SessionEndScreen
        title={COMMON_TEXTS.endTitleDone}
        summary={finished.summary}
        nextHint={STROOP_TEXTS.nextHint}
        onRepeat={() => {
          setFinished(null);
          setPhase("instrucciones");
        }}
        onExit={onExit}
      />
    );
  }

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
        <Instructions
          variant={variant}
          timing={timing}
          onVariant={setVariant}
          onTiming={setTiming}
          onPractice={() => begin("practica")}
          onStart={() => begin("juego")}
          startLevel={startLevel}
        />
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
            label={run.mode === "practica" ? "Ensayo de práctica" : "Ensayo"}
          />
          <p className="text-ink-muted">{STROOP_TEXTS.variants[variant].rule}</p>
          <Stimulus run={run} variant={variant} options={options} />
          <div
            role="group"
            aria-label="Respuestas"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {options.map((option, optionIndex) => (
              <button
                key={option.id}
                ref={optionIndex === 0 ? firstOptionRef : undefined}
                type="button"
                aria-keyshortcuts={option.keys.join(" ")}
                aria-disabled={run.step !== "estimulo"}
                onClick={() => respond(option.id)}
                className="flex min-h-16 items-center justify-center gap-3 rounded-md border border-line-strong bg-surface px-3 text-lg font-semibold text-ink hover:bg-surface-2"
              >
                {variant === "color" && option.ink ? (
                  <span
                    aria-hidden="true"
                    className="size-5 rounded-full ring-1 ring-line-strong"
                    style={{ backgroundColor: option.ink }}
                  />
                ) : null}
                <span>{option.label}</span>
                <kbd className="rounded bg-surface-2 px-1.5 text-sm text-ink-muted" aria-hidden="true">
                  {option.keyHint}
                </kbd>
              </button>
            ))}
          </div>
          <p className="text-sm text-ink-muted">
            {windowMs === null
              ? "Sin límite de tiempo: responde cuando lo tengas claro."
              : `Tienes ${(windowMs / 1000).toLocaleString("es-ES")} s por ensayo.`}
          </p>
        </div>
      ) : null}

      <p aria-live="assertive" className="sr-only">
        {running && run?.step === "estimulo" ? describeStimulus(run.trial, variant, options) : ""}
      </p>
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

function describeStimulus(trial: StroopTrial, variant: StroopVariant, options: readonly StroopOption[]) {
  const word = optionById(options, trial.wordId).label;
  const feature = optionById(options, trial.featureId).label.toLowerCase();
  return variant === "color"
    ? `Palabra ${word}, escrita en tinta ${feature}`
    : `Palabra ${word}, situada ${feature}`;
}

function Stimulus({
  run,
  variant,
  options,
}: {
  run: Run;
  variant: StroopVariant;
  options: readonly StroopOption[];
}) {
  const word = optionById(options, run.trial.wordId);
  const feature = optionById(options, run.trial.featureId);

  return (
    <div
      className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg sm:aspect-[16/9]"
      style={{ backgroundColor: STROOP_PANEL_BG, color: STROOP_PANEL_INK }}
    >
      {run.step === "fijacion" ? (
        <span aria-hidden="true" className="text-4xl">
          +
        </span>
      ) : null}
      {run.step === "estimulo" ? (
        <>
          {variant === "color" ? (
            <span
              aria-hidden="true"
              className="text-5xl font-bold uppercase tracking-wide sm:text-7xl"
              style={{ color: feature.ink }}
            >
              {word.label}
            </span>
          ) : (
            <>
              <span aria-hidden="true" className="text-3xl opacity-60">
                +
              </span>
              <span
                aria-hidden="true"
                className={`absolute text-2xl font-bold uppercase tracking-wide sm:text-4xl ${POSITION_CLASS[feature.id] ?? ""}`}
              >
                {word.label}
              </span>
            </>
          )}
        </>
      ) : null}
      {run.step === "feedback" && run.lastKind ? (
        <FeedbackMark kind={run.lastKind} answer={feature.label} />
      ) : null}
    </div>
  );
}

function FeedbackMark({ kind, answer }: { kind: StroopResponseKind; answer: string }) {
  const ok = kind === "acierto";
  const text = ok
    ? COMMON_TEXTS.correct
    : kind === "sin-respuesta"
      ? `${COMMON_TEXTS.timeout}: era ${answer}`
      : `${COMMON_TEXTS.wrong}: era ${answer}`;
  return (
    <p
      aria-hidden="true"
      className={`flex items-center gap-3 rounded-md px-4 py-2 text-2xl font-semibold ${
        ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
      }`}
    >
      <span className="text-3xl">{ok ? "✓" : "✗"}</span>
      {text}
    </p>
  );
}

function Instructions({
  variant,
  timing,
  startLevel,
  onVariant,
  onTiming,
  onPractice,
  onStart,
}: {
  variant: StroopVariant;
  timing: TimingMode;
  startLevel: DifficultyLevel;
  onVariant(value: StroopVariant): void;
  onTiming(value: TimingMode): void;
  onPractice(): void;
  onStart(): void;
}) {
  const params = paramsForLevel(startLevel);
  return (
    <Card>
      <CardBody className="gap-4">
        <p className="text-lg text-ink">{STROOP_TEXTS.intro}</p>
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1 font-semibold text-ink">Variante</legend>
          {(Object.keys(STROOP_TEXTS.variants) as StroopVariant[]).map((id) => (
            <label key={id} className="flex min-h-11 cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="stroop-variante"
                value={id}
                checked={variant === id}
                onChange={() => onVariant(id)}
                className="mt-1.5 size-4 accent-primary"
              />
              <span>
                <span className="font-semibold text-ink">{STROOP_TEXTS.variants[id].label}.</span>{" "}
                {STROOP_TEXTS.variants[id].rule} {STROOP_TEXTS.variants[id].example}
              </span>
            </label>
          ))}
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1 font-semibold text-ink">{COMMON_TEXTS.timingLegend}</legend>
          {TIMING_MODE_TEXTS.map((mode) => (
            <label key={mode.id} className="flex min-h-11 cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="stroop-tiempo"
                value={mode.id}
                checked={timing === mode.id}
                onChange={() => onTiming(mode.id)}
                className="mt-1.5 size-4 accent-primary"
              />
              <span>
                <span className="font-semibold text-ink">{mode.label}.</span> {mode.description}
              </span>
            </label>
          ))}
        </fieldset>
        <p>
          Responde con los botones o con el teclado ({variant === "color" ? "teclas 1 a 4" : "flechas o 1 a 4"}).
          Empiezas en el nivel {startLevel}: {Math.round(params.incongruentRatio * 100)} % de ensayos en
          conflicto. {STROOP_TEXTS.adaptive}
        </p>
        <p className="text-sm">
          {STROOP_TEXTS.honesty} {COMMON_TEXTS.privacy}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button onClick={onPractice}>
            {COMMON_TEXTS.practice} ({STROOP_SESSION.practiceTrials} ensayos)
          </Button>
          <Button variant="secondary" onClick={onStart}>
            {COMMON_TEXTS.skipPractice}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
