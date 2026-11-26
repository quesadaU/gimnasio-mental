"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LECTURA_LOADERS } from "@/content/lectura";
import { useProgressStore } from "@/components/progress-store-provider";
import {
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
  SessionEndScreen,
} from "@/components/ui";
import type { ReviewCard, ReviewGrade } from "@/core/types";
import {
  answerCurrent,
  createReviewSession,
  currentCardId,
  isReviewFinished,
  LECTURA_DECK_ID,
  selectTodayReview,
  summarizeReview,
  textIdsForCards,
  type ReviewSessionState,
} from "../domain/review";
import { buildReviewSession } from "../domain/session";
import type { KeyIdea } from "../domain/types";

interface Loaded {
  state: ReviewSessionState;
  ideas: Readonly<Record<string, KeyIdea & { textTitle: string }>>;
  total: number;
}

type Load = { status: "cargando" } | { status: "error" } | ({ status: "listo" } & Loaded);

/** Repaso del día: recuperar de memoria las ideas clave, con calificación honesta (lo recordaba o no). */
export function ReviewSession() {
  const store = useProgressStore();
  const [load, setLoad] = useState<Load>({ status: "cargando" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const due = selectTodayReview(await store.listReviewCards(LECTURA_DECK_ID), new Date());
      const textIds = textIdsForCards(due);
      const packs = await Promise.all(
        textIds.map(async (id) => {
          const loader = LECTURA_LOADERS[id];
          return loader ? (await loader()).items[0] : undefined;
        }),
      );
      const ideas: Record<string, KeyIdea & { textTitle: string }> = {};
      for (const text of packs) {
        if (!text) continue;
        for (const idea of text.keyIdeas) {
          ideas[`${LECTURA_DECK_ID}:${text.id}/${idea.id}`] = { ...idea, textTitle: text.title };
        }
      }
      // Tarjetas cuyo texto o idea ya no existen se omiten en lugar de romper el repaso.
      const usable = due.filter((card) => ideas[card.id] !== undefined);
      return { state: createReviewSession(usable), ideas, total: usable.length };
    })().then(
      (loaded) => {
        if (!cancelled) setLoad({ status: "listo", ...loaded });
      },
      () => {
        if (!cancelled) setLoad({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [store, attempt]);

  if (load.status === "cargando") return <LoadingState label="Preparando tu repaso…" />;
  if (load.status === "error") {
    return (
      <ErrorState
        title="No se pudo preparar el repaso"
        description="Tu progreso no se ha perdido."
        onRetry={() => {
          setLoad({ status: "cargando" });
          setAttempt((n) => n + 1);
        }}
      />
    );
  }
  if (load.total === 0) {
    return (
      <EmptyState
        title="Nada que repasar hoy"
        description="Cuando leas un texto, sus ideas clave volverán aquí a partir del día siguiente."
        action={<ButtonLink href="/lectura">Ir a la biblioteca</ButtonLink>}
      />
    );
  }
  return <ReviewFlow initial={load} />;
}

function ReviewFlow({ initial }: { initial: Loaded }) {
  const store = useProgressStore();
  const router = useRouter();
  const [state, setState] = useState(initial.state);
  const [revealed, setRevealed] = useState(false);
  const [saveError, setSaveError] = useState<ReviewCard | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const startedAt = useRef<Date>(null);
  if (startedAt.current === null) startedAt.current = new Date();
  const [recorded, setRecorded] = useState(false);
  const [recordFailed, setRecordFailed] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const finished = isReviewFinished(state);
  const summary = summarizeReview(state);

  useEffect(() => {
    if (!finished || recorded || recordFailed) return;
    const now = new Date();
    store
      .recordSession(
        buildReviewSession({
          id: sessionId,
          startedAt: startedAt.current ?? now,
          endedAt: now,
          trials: summary.reviewed,
          correct: summary.remembered,
        }),
      )
      .then(
        () => setRecorded(true),
        () => setRecordFailed(true),
      );
  }, [finished, recorded, recordFailed, store, sessionId, summary.reviewed, summary.remembered]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [state.queue.length]);

  async function grade(value: ReviewGrade) {
    const step = answerCurrent(state, value, new Date());
    if (step.updatedCard) {
      try {
        await store.upsertReviewCards([step.updatedCard]);
        setSaveError(null);
      } catch {
        setSaveError(step.updatedCard);
      }
    }
    setState(step.state);
    setRevealed(false);
  }

  if (finished) {
    return (
      <SessionEndScreen
        title="Repaso terminado"
        summary={[
          { label: "Repasadas", value: summary.reviewed },
          { label: "Recordadas", value: `${summary.remembered}/${summary.reviewed}` },
        ]}
        nextHint={
          recordFailed
            ? "No se pudo guardar el resumen de la sesión, pero las tarjetas sí se reprogramaron."
            : "Las ideas que no recordaste volverán antes; las que sí, más espaciadas."
        }
        onExit={() => router.push("/lectura")}
      />
    );
  }

  const cardId = currentCardId(state);
  const idea = cardId ? initial.ideas[cardId] : undefined;
  if (!cardId || !idea) return null;
  const done = initial.total - new Set(state.queue).size;

  return (
    <Card as="section" aria-labelledby="repaso-titulo">
      <CardHeader>
        <h2 id="repaso-titulo" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-ink">
          Tarjeta {Math.min(done + 1, initial.total)} de {initial.total}
        </h2>
        <ProgressBar value={done} max={initial.total} label="Tarjetas repasadas" hideLabel />
        <p className="text-sm text-ink-muted">De: {idea.textTitle}</p>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold text-ink">{idea.prompt}</p>
          <p className="text-ink-muted">Intenta responder de memoria antes de mirar.</p>
          {saveError ? (
            <ErrorState
              title="No se pudo guardar esta tarjeta"
              description="Puedes seguir; esa tarjeta no se reprogramará."
              onRetry={() => void store.upsertReviewCards([saveError]).then(() => setSaveError(null), () => undefined)}
            />
          ) : null}
          {revealed ? (
            <>
              <div role="status" className="rounded-lg border-l-4 border-accent bg-canvas px-4 py-3 text-ink">
                <p className="text-sm font-semibold text-ink-muted">Respuesta</p>
                <p>{idea.answer}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => void grade("correcto")}>Lo recordaba</Button>
                <Button variant="secondary" onClick={() => void grade("incorrecto")}>
                  No lo recordaba
                </Button>
              </div>
            </>
          ) : (
            <div>
              <Button onClick={() => setRevealed(true)}>Mostrar respuesta</Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
