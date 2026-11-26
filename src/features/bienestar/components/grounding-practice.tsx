"use client";

import { useState } from "react";
import type { ExerciseProps } from "@/components/exercise/contract";
import { Button, Card, CardBody, ErrorState, LoadingState, ProgressBar } from "@/components/ui";
import { groundingLoaders } from "@/content/bienestar";
import type { GroundingStep } from "../domain/types";
import { useContentPack } from "./hooks";
import { StickyActions, usePracticeSession } from "./practice-ui";

const PACK_ID = "pausa-5-4-3-2-1";

export default function GroundingPractice(props: ExerciseProps) {
  const { state, retry } = useContentPack(groundingLoaders[PACK_ID]);
  if (state.status === "cargando") return <LoadingState label="Preparando la pausa…" />;
  if (state.status === "error") {
    return <ErrorState title="No hemos podido cargar la pausa" description="Inténtalo de nuevo." onRetry={retry} />;
  }
  return <GroundingRun {...props} steps={state.pack.items} />;
}

function GroundingRun({ definition, onFinish, steps }: ExerciseProps & { steps: readonly GroundingStep[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const { begin, finish } = usePracticeSession(definition, onFinish);

  if (index === null) {
    return (
      <div className="space-y-6">
        <p className="text-lg leading-relaxed">
          Una pausa corta para volver al aquí y ahora a través de los sentidos. Ve a tu ritmo: el minuto es orientativo,
          no hay prisa. Si algún sentido no te sirve, cámbialo por otro o sáltalo.
        </p>
        <Button
          onClick={() => {
            begin();
            setIndex(0);
          }}
        >
          Empezar
        </Button>
      </div>
    );
  }

  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <div className="space-y-6">
      <ProgressBar value={index + 1} max={steps.length} label={`Paso ${index + 1} de ${steps.length}`} />
      <Card>
        <CardBody>
          <div aria-live="polite">
            <p className="text-5xl font-semibold font-display text-accent tabular-nums" aria-hidden="true">
              {step.count}
            </p>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
              <span className="sr-only">{step.count} </span>
              {step.sense}
            </h2>
            <p className="mt-3 text-lg leading-relaxed">{step.prompt}</p>
          </div>
        </CardBody>
      </Card>
      <StickyActions label="Controles de la pausa">
        {isLast ? (
          <Button onClick={() => finish(true, PACK_ID)}>Terminar</Button>
        ) : (
          <Button onClick={() => setIndex(index + 1)}>Siguiente</Button>
        )}
        <Button variant="secondary" onClick={() => finish(false, PACK_ID)}>
          Detener
        </Button>
      </StickyActions>
    </div>
  );
}
