"use client";

import { useEffect, useRef, useState } from "react";
import type { ExerciseProps } from "@/components/exercise/contract";
import { Button, Card, CardBody } from "@/components/ui";
import {
  BREATH_PHASE_LABEL,
  BREATHING_DURATIONS_MIN,
  BREATHING_PATTERNS,
  cycleSeconds,
  type BreathingPattern,
  type BreathPhaseKind,
} from "../domain/breathing";
import { formatClock, phaseAt, wholeCycles } from "../domain/phase-timer";
import { usePrefersReducedMotion, useStopwatch } from "./hooks";
import { ChoiceGroup, Notice, StickyActions, usePracticeSession, useScrollIntoViewOnMount } from "./practice-ui";

type Display = "visual" | "texto";

const SCALE: Readonly<Record<BreathPhaseKind, number>> = { inhala: 1, reten: 1, exhala: 0.55, pausa: 0.55 };

export default function BreathingPractice({ definition, onFinish }: ExerciseProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [patternId, setPatternId] = useState(BREATHING_PATTERNS[0].id);
  const [minutes, setMinutes] = useState(String(BREATHING_DURATIONS_MIN[1]));
  const [displayChoice, setDisplayChoice] = useState<Display | undefined>(undefined);
  const [started, setStarted] = useState(false);
  const stopwatch = useStopwatch(100);
  const { pause, start, elapsedMs } = stopwatch;
  const session = usePracticeSession(definition, onFinish);

  const pattern = BREATHING_PATTERNS.find((p) => p.id === patternId) ?? BREATHING_PATTERNS[0];
  // Si el sistema pide menos movimiento, la versión textual es la predeterminada.
  const display: Display = displayChoice ?? (reducedMotion ? "texto" : "visual");
  const cycles = wholeCycles(pattern.phases, Number(minutes) * 60_000);
  const totalMs = cycles * cycleSeconds(pattern) * 1000;
  const done = started && elapsedMs >= totalMs;
  const { begin, finish } = session;

  useEffect(() => {
    if (done) {
      pause();
      finish(true, pattern.id);
    }
  }, [done, pause, finish, pattern.id]);

  function handleStart() {
    begin();
    setStarted(true);
    start();
  }

  function handleStop() {
    pause();
    finish(false, pattern.id);
  }

  if (!started) {
    return (
      <div className="space-y-6">
        <Notice>
          Respira por la nariz si te resulta cómodo, sin forzar. Si en algún momento te mareas o te notas incómodo,
          detén la práctica y vuelve a respirar a tu ritmo normal.
        </Notice>
        <ChoiceGroup
          legend="Ritmo"
          name="patron"
          layout="columna"
          value={patternId}
          onChange={setPatternId}
          options={BREATHING_PATTERNS.map((p) => ({ value: p.id, label: p.name, description: p.summary }))}
        />
        <ChoiceGroup
          legend="Duración"
          name="duracion"
          value={minutes}
          onChange={setMinutes}
          options={BREATHING_DURATIONS_MIN.map((m) => ({ value: String(m), label: `${m} minutos` }))}
        />
        <ChoiceGroup<Display>
          legend="Guía"
          name="guia"
          value={display}
          onChange={setDisplayChoice}
          options={[
            { value: "visual", label: "Círculo animado", description: "Crece al inhalar y se encoge al exhalar." },
            { value: "texto", label: "Solo texto", description: "Sin animación, con cuenta atrás de cada fase." },
          ]}
        />
        <p className="text-sm text-ink-muted">Sin sonido. Puedes detenerla en cualquier momento.</p>
        <Button onClick={handleStart}>Empezar</Button>
      </div>
    );
  }

  return (
    <BreathingSession
      pattern={pattern}
      display={display}
      elapsedMs={Math.min(elapsedMs, totalMs)}
      totalMs={totalMs}
      onStop={handleStop}
    />
  );
}

interface BreathingSessionProps {
  pattern: BreathingPattern;
  display: Display;
  elapsedMs: number;
  totalMs: number;
  onStop(): void;
}

function BreathingSession({ pattern, display, elapsedMs, totalMs, onStop }: BreathingSessionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollIntoViewOnMount(containerRef);
  const [primed, setPrimed] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPrimed(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const position = phaseAt(pattern.phases, elapsedMs);
  const label = BREATH_PHASE_LABEL[position.phase.kind];
  const secondsLeft = Math.max(1, Math.ceil(position.phaseRemainingMs / 1000));

  return (
    <div ref={containerRef} className="scroll-mt-20 space-y-6">
      <Card>
        <CardBody>
          <div className="flex flex-col items-center gap-6 py-4 sm:py-6">
            {display === "visual" && (
              <div aria-hidden="true" className="relative grid size-44 place-items-center sm:size-64">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40" />
                <div
                  className="size-full rounded-full bg-primary/80 ease-in-out motion-safe:transition-transform"
                  style={{
                    // Primer fotograma pequeño para que la primera inhalación también se anime.
                    transform: `scale(${primed ? SCALE[position.phase.kind] : SCALE.exhala})`,
                    transitionDuration: `${position.phase.seconds}s`,
                  }}
                />
              </div>
            )}
            <p className="text-center">
              <span aria-live="polite" className="block text-3xl font-semibold sm:text-4xl">
                {label}
              </span>
              <span className="mt-2 block text-xl tabular-nums text-ink-muted" aria-hidden={display === "visual"}>
                {secondsLeft}
              </span>
            </p>
            <p className="text-sm text-ink-muted">
              Ciclo {position.cycleIndex + 1} · quedan <span className="tabular-nums">{formatClock(totalMs - elapsedMs)}</span>
            </p>
          </div>
        </CardBody>
      </Card>
      <StickyActions label="Controles de la respiración">
        <Button variant="secondary" onClick={onStop}>
          Detener
        </Button>
      </StickyActions>
    </div>
  );
}
