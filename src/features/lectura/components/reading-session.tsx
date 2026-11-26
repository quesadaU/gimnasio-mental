"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LECTURA_LOADERS } from "@/content/lectura";
import { useProgressStore } from "@/components/progress-store-provider";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  LoadingState,
  SessionEndScreen,
} from "@/components/ui";
import { isPersistenceAvailable } from "@/core/storage";
import { summarizeQuiz } from "../domain/quiz";
import { cardsForNewIdeas, LECTURA_DECK_ID } from "../domain/review";
import { buildReadingSession } from "../domain/session";
import { QUESTION_KIND_LABELS, type ReadingText } from "../domain/types";
import { ComprehensionQuiz } from "./comprehension-quiz";
import { Reader } from "./reader";
import { SelfExplanation } from "./self-explanation";

type Phase = "leyendo" | "explicando" | "preguntas" | "ideas" | "fin";
type SaveState = "idle" | "guardando" | "error";

/**
 * Sesión de lectura profunda: leer, explicar con palabras propias, responder preguntas de memoria
 * y fijar las ideas clave (que pasan al repaso espaciado). La frase de autoexplicación no se guarda.
 */
export function ReadingSession({ textId }: { textId: string }) {
  const loader = LECTURA_LOADERS[textId];
  const [attempt, setAttempt] = useState(0);
  const [text, setText] = useState<ReadingText | null | undefined>(undefined);

  useEffect(() => {
    if (!loader) return;
    let cancelled = false;
    loader().then(
      (pack) => {
        if (!cancelled) setText(pack.items[0] ?? null);
      },
      () => {
        if (!cancelled) setText(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [loader, attempt]);

  if (!loader) {
    return <ErrorState title="Este texto no existe" description="Vuelve a la biblioteca para elegir otro." />;
  }
  if (text === undefined) return <LoadingState label="Preparando el texto…" />;
  if (text === null) {
    return (
      <ErrorState
        title="No se pudo cargar el texto"
        description="Puede deberse a la conexión. No se ha perdido nada."
        onRetry={() => {
          setText(undefined);
          setAttempt((n) => n + 1);
        }}
      />
    );
  }
  return <ReadingFlow key={text.id} text={text} />;
}

function ReadingFlow({ text }: { text: ReadingText }) {
  const store = useProgressStore();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("leyendo");
  const [sentence, setSentence] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [save, setSave] = useState<SaveState>("idle");
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const startedAt = useRef<Date>(null);
  if (startedAt.current === null) startedAt.current = new Date();

  const summary = useMemo(() => summarizeQuiz(text.questions, answers), [text.questions, answers]);

  const persist = useCallback(async () => {
    setSave("guardando");
    try {
      const now = new Date();
      const result = buildReadingSession({
        id: sessionId,
        startedAt: startedAt.current ?? now,
        endedAt: now,
        trials: summary.total,
        correct: summary.correct,
        textId: text.id,
        level: text.level,
      });
      const existing = await store.listReviewCards(LECTURA_DECK_ID);
      const fresh = cardsForNewIdeas(text.id, text.keyIdeas, existing, now);
      if (fresh.length > 0) await store.upsertReviewCards(fresh);
      await store.recordSession(result); // idempotente por id: reintentar es seguro
      setPersisted(isPersistenceAvailable());
      setSave("idle");
      setPhase("fin");
    } catch {
      setSave("error");
    }
  }, [store, sessionId, summary, text]);

  if (phase === "leyendo") {
    return <Reader text={text} onFinished={() => setPhase("explicando")} />;
  }
  if (phase === "explicando") {
    return (
      <SelfExplanation
        onDone={(value) => {
          setSentence(value);
          setPhase("preguntas");
        }}
      />
    );
  }
  if (phase === "preguntas") {
    return (
      <ComprehensionQuiz
        questions={text.questions}
        onDone={(given) => {
          setAnswers(given);
          setPhase("ideas");
        }}
      />
    );
  }
  if (phase === "ideas") {
    return (
      <KeyIdeasStep
        text={text}
        sentence={sentence}
        save={save}
        onSave={() => void persist()}
        score={`${summary.correct} de ${summary.total}`}
      />
    );
  }

  const breakdown = Object.entries(summary.byKind)
    .map(([kind, tally]) => `${QUESTION_KIND_LABELS[kind as keyof typeof QUESTION_KIND_LABELS]}: ${tally.correct}/${tally.total}`)
    .join(" · ");
  return (
    <SessionEndScreen
      title="Lectura terminada"
      summary={[
        { label: "Aciertos", value: `${summary.correct}/${summary.total}` },
        { label: "Ideas para repasar", value: text.keyIdeas.length },
      ]}
      nextHint={
        <>
          <p>
            {persisted === false
              ? "Este navegador no permite guardar datos: el repaso solo durará hasta que cierres la pestaña. "
              : "Las ideas clave volverán en tu repaso, a partir de mañana. "}
            {breakdown}
          </p>
        </>
      }
      onExit={() => router.push("/lectura")}
    />
  );
}

function KeyIdeasStep({
  text,
  sentence,
  save,
  onSave,
  score,
}: {
  text: ReadingText;
  sentence: string;
  save: SaveState;
  onSave: () => void;
  score: string;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Card as="section" aria-labelledby={titleId}>
      <CardHeader>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Paso 3 de 3</p>
        <h2 id={titleId} ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-ink">
          Ideas clave
        </h2>
        <p className="text-ink-muted">Aciertos en las preguntas: {score}.</p>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-5">
          {sentence ? (
            <div className="rounded-lg bg-surface-2 p-4">
              <p className="text-sm font-semibold text-ink-muted">Tu explicación</p>
              <p className="text-ink">{sentence}</p>
              <p className="mt-2 text-sm text-ink-muted">Compárala con las ideas de abajo. No se guarda.</p>
            </div>
          ) : null}
          <ul className="flex flex-col gap-3">
            {text.keyIdeas.map((idea) => (
              <li key={idea.id} className="rounded-lg border border-line p-4">
                <p className="font-semibold text-ink">{idea.prompt}</p>
                <p className="text-ink-muted">{idea.answer}</p>
              </li>
            ))}
          </ul>
          {save === "error" ? (
            <ErrorState
              title="No se pudo guardar la sesión"
              description="Tus resultados siguen en pantalla. Puedes reintentar."
              onRetry={onSave}
            />
          ) : null}
          <div role="status" aria-live="polite" className="text-sm text-ink-muted">
            {save === "guardando" ? "Guardando…" : null}
          </div>
          <div>
            <Button size="lg" onClick={onSave} disabled={save === "guardando"}>
              Guardar y terminar
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
