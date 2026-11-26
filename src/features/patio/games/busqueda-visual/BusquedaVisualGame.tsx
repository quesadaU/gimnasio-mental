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
import { SEARCH_KEYS, SEARCH_TEXTS } from "@/content/patio/atencion/busqueda-visual";
import {
  SEARCH_GRID,
  SEARCH_SESSION,
  evaluate,
  generateDisplay,
  paramsForLevel,
  responseWindow,
  summarize,
  type SearchAnswer,
  type SearchDisplay,
  type SearchOutcome,
  type SearchRecord,
  type TimingMode,
} from "./domain";

type Phase = "instrucciones" | "practica" | "practica-fin" | "juego" | "fin";
type Step = "fijacion" | "estimulo" | "feedback";

interface Run {
  mode: "practica" | "juego";
  total: number;
  index: number;
  step: Step;
  display: SearchDisplay;
  staircase: StaircaseState;
  records: SearchRecord[];
  lastOutcome?: SearchOutcome;
}

export default function BusquedaVisualGame({
  definition,
  initialLevel,
  onFinish,
  onExit,
}: ExerciseProps) {
  const config: StaircaseConfig = { range: definition.difficulty, correctToLevelUp: 2 };
  const [phase, setPhase] = useState<Phase>("instrucciones");
  const [timing, setTiming] = useState<TimingMode>("estandar");
  const [startLevel, setStartLevel] = useState<DifficultyLevel>(initialLevel);
  const [run, setRun] = useState<Run | null>(null);
  const [startedAt, setStartedAt] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [summary, setSummary] = useState<SessionSummaryItem[] | null>(null);
  const shownAtRef = useRef(0);
  const presentRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();

  const level = run ? run.staircase.level : startLevel;
  const windowMs = responseWindow(level, timing);

  function begin(mode: Run["mode"]) {
    const isGame = mode === "juego";
    const staircase = createStaircase(isGame ? startLevel : SEARCH_SESSION.practiceLevel, config);
    setRun({
      mode,
      total: isGame ? SEARCH_SESSION.trials : SEARCH_SESSION.practiceTrials,
      index: 0,
      step: "fijacion",
      display: generateDisplay(staircase.level, Math.random),
      staircase,
      records: [],
    });
    if (isGame) setStartedAt(new Date().toISOString());
    setAnnouncement("");
    setPhase(mode);
  }

  function finish(records: SearchRecord[], outcome: SessionOutcome, levelEnd: DifficultyLevel) {
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
    const ms = (value?: number) => (value === undefined ? "—" : `${value} ms`);
    return [
      { label: "Aciertos", value: `${s.correct} de ${s.trials}` },
      { label: "Precisión", value: `${Math.round(s.accuracy * 100)} %` },
      { label: "Tiempo con T", value: ms(s.meanPresentMs) },
      { label: "Tiempo sin T", value: ms(s.meanAbsentMs) },
      { label: "Máximo de letras", value: String(s.maxSetSize) },
      { label: "Nivel final", value: String(levelEnd) },
    ];
  }

  function respond(answer: SearchAnswer | null) {
    if (!run || run.step !== "estimulo") return;
    const reactionMs = answer === null ? undefined : Math.round(performance.now() - shownAtRef.current);
    const outcome = evaluate(run.display, answer);
    const record: SearchRecord = {
      level: run.staircase.level,
      setSize: run.display.items.length,
      targetPresent: run.display.targetPresent,
      outcome,
      reactionMs,
    };
    const staircase =
      run.mode === "juego" ? nextStaircase(run.staircase, outcome === "acierto", config) : run.staircase;
    const truth = run.display.targetPresent ? "había una T" : "no había T";
    setAnnouncement(
      outcome === "acierto"
        ? `${SEARCH_TEXTS.feedback.acierto}: ${truth}`
        : `${SEARCH_TEXTS.feedback[outcome]}: ${truth}`,
    );
    setRun({ ...run, step: "feedback", staircase, lastOutcome: outcome, records: [...run.records, record] });
  }

  function advance() {
    if (!run) return;
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
      step: "fijacion",
      lastOutcome: undefined,
      display: generateDisplay(run.staircase.level, Math.random),
    });
  }

  function exit() {
    if (phase === "juego" && run && run.records.length > 0) {
      finish(run.records, "abandonada", run.staircase.level);
    }
    onExit();
  }

  const onTimer = useEffectEvent(() => {
    if (!run) return;
    if (run.step === "fijacion") setRun({ ...run, step: "estimulo" });
    else if (run.step === "estimulo") respond(null);
    else advance();
  });

  const onStimulusShown = useEffectEvent(() => {
    shownAtRef.current = performance.now();
  });

  const step = run?.step;
  const index = run?.index;
  useEffect(() => {
    if (step === undefined) return;
    let delay: number | null;
    if (step === "fijacion") delay = SEARCH_SESSION.fixationMs;
    else if (step === "feedback") delay = SEARCH_SESSION.feedbackMs;
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
    if ((SEARCH_KEYS.present as readonly string[]).includes(event.key)) {
      event.preventDefault();
      respond("presente");
    } else if ((SEARCH_KEYS.absent as readonly string[]).includes(event.key)) {
      event.preventDefault();
      respond("ausente");
    }
  });

  const running = phase === "practica" || phase === "juego";
  useEffect(() => {
    if (!running) return;
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    presentRef.current?.focus();
    return () => window.removeEventListener("keydown", listener);
  }, [running]);

  if (phase === "fin" && summary) {
    return (
      <SessionEndScreen
        title={COMMON_TEXTS.endTitleDone}
        summary={summary}
        nextHint={SEARCH_TEXTS.nextHint}
        onRepeat={() => {
          setSummary(null);
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
        <Card>
          <CardBody className="gap-4">
            <p className="text-lg text-ink">{SEARCH_TEXTS.intro}</p>
            <p>{SEARCH_TEXTS.levels}</p>
            <fieldset className="flex flex-col gap-2">
              <legend className="pb-1 font-semibold text-ink">{COMMON_TEXTS.timingLegend}</legend>
              {TIMING_MODE_TEXTS.map((mode) => (
                <label key={mode.id} className="flex min-h-11 cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="busqueda-tiempo"
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
            <p>{SEARCH_TEXTS.keys}</p>
            <p>
              Empiezas en el nivel {startLevel} ({paramsForLevel(startLevel).setSize} letras).{" "}
              {SEARCH_TEXTS.adaptive}
            </p>
            <p className="text-sm">
              {SEARCH_TEXTS.honesty} {SEARCH_TEXTS.screenReader} {COMMON_TEXTS.privacy}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button onClick={() => begin("practica")}>
                {COMMON_TEXTS.practice} ({SEARCH_SESSION.practiceTrials} pantallas)
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
            label={run.mode === "practica" ? "Pantallas de práctica" : "Pantallas"}
          />
          <SearchField run={run} />
          <div role="group" aria-label="Respuestas" className="grid grid-cols-2 gap-3">
            <button
              ref={presentRef}
              type="button"
              aria-keyshortcuts="S ArrowLeft"
              aria-disabled={run.step !== "estimulo"}
              onClick={() => respond("presente")}
              className="flex min-h-16 items-center justify-center gap-2 rounded-lg border-2 border-primary bg-primary px-3 text-lg font-semibold text-primary-ink hover:bg-primary-hover"
            >
              {SEARCH_TEXTS.present}
              <kbd aria-hidden="true" className="text-sm opacity-80">
                S
              </kbd>
            </button>
            <button
              type="button"
              aria-keyshortcuts="N ArrowRight"
              aria-disabled={run.step !== "estimulo"}
              onClick={() => respond("ausente")}
              className="flex min-h-16 items-center justify-center gap-2 rounded-lg border-2 border-line-strong bg-surface px-3 text-lg font-semibold text-ink hover:bg-surface-2"
            >
              {SEARCH_TEXTS.absent}
              <kbd aria-hidden="true" className="text-sm text-ink-muted">
                N
              </kbd>
            </button>
          </div>
          <p className="text-sm text-ink-muted">
            {windowMs === null
              ? "Sin límite de tiempo: responde cuando lo tengas claro."
              : `Tienes ${(windowMs / 1000).toLocaleString("es-ES")} s por pantalla.`}
          </p>
        </div>
      ) : null}

      <p aria-live="assertive" className="sr-only">
        {running && run?.step === "estimulo" ? `Pantalla con ${run.display.items.length} letras` : ""}
      </p>
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

function SearchField({ run }: { run: Run }) {
  const { columns, rows } = SEARCH_GRID;
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-line bg-surface"
      style={{ aspectRatio: `${columns} / ${rows}` }}
    >
      {run.step === "fijacion" ? (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-4xl text-ink">
          +
        </span>
      ) : null}
      {run.step === "estimulo"
        ? run.display.items.map((item) => {
            const column = item.cell % columns;
            const row = Math.floor(item.cell / columns);
            return (
              <span
                key={item.cell}
                aria-hidden="true"
                className="absolute flex items-center justify-center font-sans text-3xl font-bold leading-none text-ink sm:text-5xl"
                style={{
                  left: `${((column + 0.5 + item.jitterX) / columns) * 100}%`,
                  top: `${((row + 0.5 + item.jitterY) / rows) * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                }}
              >
                {item.glyph}
              </span>
            );
          })
        : null}
      {run.step === "feedback" && run.lastOutcome ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p
            aria-hidden="true"
            className={`flex items-center gap-3 rounded-md px-4 py-2 text-xl font-semibold ${
              run.lastOutcome === "acierto" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
            }`}
          >
            <span className="text-2xl">{run.lastOutcome === "acierto" ? "✓" : "✗"}</span>
            {SEARCH_TEXTS.feedback[run.lastOutcome]}: {run.display.targetPresent ? "había una T" : "no había T"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
