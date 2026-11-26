"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ExerciseProps } from "@/components/exercise/contract";
import { Button, Card, CardBody, ErrorState, LoadingState, ProgressBar } from "@/components/ui";
import { meditationLoaders } from "@/content/bienestar";
import { formatClock, scheduleSteps, stepIndexAt } from "../domain/phase-timer";
import type { MeditationScript } from "../domain/types";
import { useContentPack, useSpeakOnChange, useSpeechSupported, useStopwatch } from "./hooks";
import { ChoiceGroup, StickyActions, usePracticeSession } from "./practice-ui";

const PACK_ID = "meditaciones-basicas";
const DURATIONS_MIN = ["3", "5", "10"] as const;
type Pace = "temporizador" | "a-mi-ritmo";

export function BreathAwarenessPractice(props: ExerciseProps) {
  return <MeditationPractice {...props} scriptId="atencion-respiracion" />;
}

export function BodyScanPractice(props: ExerciseProps) {
  return <MeditationPractice {...props} scriptId="escaneo-corporal" />;
}

function MeditationPractice({ scriptId, ...props }: ExerciseProps & { scriptId: string }) {
  const { state, retry } = useContentPack(meditationLoaders[PACK_ID]);
  if (state.status === "cargando") return <LoadingState label="Cargando el guion…" />;
  if (state.status === "error") {
    return (
      <ErrorState
        title="No hemos podido cargar el guion"
        description="Comprueba la conexión e inténtalo de nuevo."
        onRetry={retry}
      />
    );
  }
  const script = state.pack.items.find((item) => item.id === scriptId);
  if (!script) return <ErrorState title="Este guion no está disponible" />;
  return <MeditationRun {...props} script={script} />;
}

function MeditationRun({ definition, onFinish, script }: ExerciseProps & { script: MeditationScript }) {
  const speechSupported = useSpeechSupported();
  const voiceId = useId();
  const [minutes, setMinutes] = useState<(typeof DURATIONS_MIN)[number]>("5");
  const [pace, setPace] = useState<Pace>("temporizador");
  const [voice, setVoice] = useState(false);
  const [started, setStarted] = useState(false);
  const [manualStep, setManualStep] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const { begin, finish } = usePracticeSession(definition, onFinish);
  const { elapsedMs, running, start, pause } = useStopwatch(250);

  // El cierre forma parte de la secuencia para que la sesión termine con él.
  const steps = useMemo(() => [...script.steps.map((step) => step.text), script.closing], [script]);
  const totalMs = Number(minutes) * 60_000;
  const slots = useMemo(
    () => scheduleSteps([...script.steps, { weight: 1 }], totalMs),
    [script.steps, totalMs],
  );

  const timedIndex = stepIndexAt(slots, elapsedMs);
  const timedDone = started && pace === "temporizador" && timedIndex === null;
  const currentIndex = pace === "temporizador" ? (timedIndex ?? steps.length - 1) : manualStep;
  const currentText = started ? steps[currentIndex] : null;

  useSpeakOnChange(currentText, voice && (running || pace === "a-mi-ritmo"));

  useEffect(() => {
    if (timedDone) {
      pause();
      finish(true, script.id);
    }
  }, [timedDone, pause, finish, script.id]);

  function handleStart() {
    begin();
    setStarted(true);
    if (pace === "temporizador") start();
    // En móvil la cabecera empuja el guion bajo el pliegue: se lleva a la vista al empezar.
    window.requestAnimationFrame(() => stageRef.current?.scrollIntoView({ block: "start" }));
  }

  function handleStop() {
    pause();
    finish(false, script.id);
  }

  if (!started) {
    return (
      <div className="space-y-6">
        <p className="text-lg leading-relaxed">{script.intro}</p>
        <ChoiceGroup<Pace>
          legend="Cómo quieres avanzar"
          name="ritmo"
          layout="columna"
          value={pace}
          onChange={setPace}
          options={[
            { value: "temporizador", label: "Con temporizador", description: "Los pasos cambian solos y suavemente." },
            { value: "a-mi-ritmo", label: "A mi ritmo", description: "Pasas tú de un paso a otro, sin límite de tiempo." },
          ]}
        />
        {pace === "temporizador" && (
          <ChoiceGroup<(typeof DURATIONS_MIN)[number]>
            legend="Duración"
            name="duracion"
            value={minutes}
            onChange={setMinutes}
            options={DURATIONS_MIN.map((m) => ({ value: m, label: `${m} minutos` }))}
          />
        )}
        {speechSupported && (
          <div className="flex items-start gap-3">
            <input
              id={voiceId}
              type="checkbox"
              checked={voice}
              onChange={(event) => setVoice(event.target.checked)}
              className="mt-1 size-5 accent-primary"
            />
            <label htmlFor={voiceId}>
              Leer los pasos en voz alta con la voz del navegador
              <span className="block text-sm text-ink-muted">Opcional y desactivado por defecto. La voz depende de tu navegador y sistema.</span>
            </label>
          </div>
        )}
        <Button onClick={handleStart}>Empezar</Button>
      </div>
    );
  }

  const isLastManual = manualStep >= steps.length - 1;

  return (
    <div ref={stageRef} className="scroll-mt-20 space-y-6">
      <Card>
        <CardBody>
          <p className="text-sm text-ink-muted">
            Paso {currentIndex + 1} de {steps.length}
          </p>
          <p aria-live="polite" className="mt-3 min-h-32 text-xl leading-relaxed sm:text-2xl">
            {steps[currentIndex]}
          </p>
          {pace === "temporizador" && (
            <div className="mt-6 space-y-2">
              <ProgressBar value={Math.min(elapsedMs, totalMs)} max={totalMs} label="Tiempo de la práctica" />
              <p className="text-sm text-ink-muted">
                Quedan <span className="tabular-nums">{formatClock(totalMs - elapsedMs)}</span>
                {!running && " · en pausa"}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      <StickyActions label="Controles de la meditación">
        {pace === "temporizador" ? (
          <Button variant="secondary" onClick={running ? pause : start}>
            {running ? "Pausar" : "Reanudar"}
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setManualStep((s) => Math.max(0, s - 1))} disabled={manualStep === 0}>
              Anterior
            </Button>
            {isLastManual ? (
              <Button onClick={() => finish(true, script.id)}>Terminar</Button>
            ) : (
              <Button onClick={() => setManualStep((s) => Math.min(steps.length - 1, s + 1))}>Siguiente</Button>
            )}
          </>
        )}
        <Button variant="secondary" onClick={handleStop}>
          Detener
        </Button>
      </StickyActions>
    </div>
  );
}
