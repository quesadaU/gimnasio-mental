"use client";

import { useState } from "react";
import type { ExerciseProps } from "@/components/exercise/contract";
import { Button, Card, CardBody, CardHeader, CardTitle, EmptyState, ErrorState, LoadingState } from "@/components/ui";
import { readVersioned, writeVersioned, type ReadStatus } from "@/core/storage";
import { challengeLoaders, selfCheckLoaders } from "@/content/bienestar";
import {
  activeChallenge,
  CHALLENGES_SCHEMA_VERSION,
  CHALLENGES_STORAGE_KEY,
  challengesSchema,
  checkIn,
  emptyChallenges,
  leaveChallenge,
  reflectOnAnswers,
  startChallenge,
  suggestedChallengeIds,
  summarize,
  type ChallengesData,
  type SelfCheckReflection,
} from "../domain/digital-hygiene";
import { FREQUENCY_OPTIONS, type DigitalChallenge, type FrequencyAnswer, type SelfCheckQuestion } from "../domain/types";
import { useContentPack } from "./hooks";
import { ChoiceGroup, Notice, StickyActions, usePracticeSession } from "./practice-ui";

export default function DigitalHygienePractice(props: ExerciseProps) {
  const questions = useContentPack(selfCheckLoaders["autoobservacion-digital"]);
  const challenges = useContentPack(challengeLoaders["micro-retos-digitales"]);
  if (questions.state.status === "cargando" || challenges.state.status === "cargando") {
    return <LoadingState label="Cargando la autoobservación…" />;
  }
  if (questions.state.status === "error" || challenges.state.status === "error") {
    return (
      <ErrorState
        title="No hemos podido cargar esta práctica"
        description="Inténtalo de nuevo."
        onRetry={() => {
          questions.retry();
          challenges.retry();
        }}
      />
    );
  }
  return <HygieneRun {...props} questions={questions.state.pack.items} challenges={challenges.state.pack.items} />;
}

interface StoredChallenges {
  status: ReadStatus;
  data: ChallengesData;
}

function loadChallenges(): StoredChallenges {
  const result = readVersioned(CHALLENGES_STORAGE_KEY, challengesSchema);
  return { status: result.status, data: result.value ?? emptyChallenges() };
}

interface HygieneRunProps extends ExerciseProps {
  questions: readonly SelfCheckQuestion[];
  challenges: readonly DigitalChallenge[];
}

function HygieneRun({ definition, onFinish, onExit, questions, challenges }: HygieneRunProps) {
  const [answers, setAnswers] = useState<Record<string, FrequencyAnswer>>({});
  const [reflections, setReflections] = useState<SelfCheckReflection[] | null>(null);
  const [stored, setStored] = useState<StoredChallenges>(() => loadChallenges());
  const [message, setMessage] = useState<string | null>(null);
  const [didSomething, setDidSomething] = useState(false);
  const { begin, finish } = usePracticeSession(definition, onFinish);

  const canPersist = stored.status !== "no-disponible" && stored.status !== "invalido" && stored.status !== "version-futura";
  const answeredCount = Object.keys(answers).length;
  const suggested = new Set(reflections ? suggestedChallengeIds(reflections) : []);
  const now = new Date();
  const activeItems = stored.data.items.filter((item) => item.status === "activo");
  const doneItems = stored.data.items.filter((item) => item.status === "terminado").slice(0, 5);

  function persist(next: ChallengesData, success: string) {
    begin();
    if (!canPersist || !writeVersioned(CHALLENGES_STORAGE_KEY, CHALLENGES_SCHEMA_VERSION, next)) {
      setMessage("No se ha podido guardar el reto en este navegador.");
      return;
    }
    setStored({ status: "ok", data: next });
    setDidSomething(true);
    setMessage(success);
  }

  function showReflections() {
    begin();
    setReflections(reflectOnAnswers(questions, answers));
    setDidSomething(true);
  }

  function leave() {
    if (didSomething) finish(true, "autoobservacion-digital");
    else if (answeredCount > 0) finish(false, "autoobservacion-digital");
    else onExit();
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="autoobservacion" className="space-y-5">
        <h2 id="autoobservacion" className="text-xl font-semibold sm:text-2xl">
          Autoobservación
        </h2>
        <p className="leading-relaxed">
          Unas preguntas para mirar tus hábitos con curiosidad, no para ponerte nota. No hay resultado ni etiqueta, y tus
          respuestas no se guardan.
        </p>
        {questions.map((question) => (
          <ChoiceGroup
            key={question.id}
            legend={question.statement}
            name={question.id}
            value={answers[question.id]}
            onChange={(value) => {
              begin();
              setAnswers((current) => ({ ...current, [question.id]: value }));
            }}
            options={FREQUENCY_OPTIONS.map((option) => ({ value: option.id, label: option.label }))}
          />
        ))}
        <Button onClick={showReflections} disabled={answeredCount === 0}>
          Ver reflexiones
        </Button>

        <div aria-live="polite">
          {reflections &&
            (reflections.length === 0 ? (
              <Notice>
                Por lo que cuentas, ahora mismo ninguno de estos hábitos te pesa demasiado. Si quieres, puedes probar
                igualmente alguno de los retos de abajo.
              </Notice>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Algunas ideas para lo que marcas como frecuente</h3>
                <ul className="space-y-3">
                  {reflections.map((reflection) => (
                    <li key={reflection.questionId}>
                      <Notice>{reflection.reflection}</Notice>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </section>

      <section aria-labelledby="retos" className="space-y-5">
        <h2 id="retos" className="text-xl font-semibold sm:text-2xl">
          Micro-retos
        </h2>
        <p className="leading-relaxed">
          Pequeños experimentos de un día o una semana. Cada día que lo pruebes cuenta; si un día no sale, no pasa nada, y
          puedes dejar el reto cuando quieras. El seguimiento se guarda solo en este dispositivo.
        </p>
        {!canPersist && (
          <Notice tone="aviso">
            {stored.status === "no-disponible"
              ? "Este navegador no permite guardar datos, así que no podremos seguir tus retos. Puedes leerlos y probarlos igualmente."
              : "Hay datos de retos que no podemos leer o que son de una versión más nueva. No los modificamos."}
          </Notice>
        )}
        <p role="status" className="min-h-6 text-sm">
          {message}
        </p>

        {activeItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">En curso</h3>
            <ul className="grid gap-4 sm:grid-cols-2">
              {activeItems.map((item) => {
                const challenge = challenges.find((c) => c.id === item.challengeId);
                if (!challenge) return null;
                const summary = summarize(item, now);
                return (
                  <li key={`${item.challengeId}-${item.startedAt}`}>
                    <Card>
                      <CardHeader>
                        <CardTitle>{challenge.title}</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <p className="text-sm text-ink-muted">
                          {summary.periodOver
                            ? `El periodo del reto ya pasó. Marcaste ${summary.daysMarked} de ${summary.durationDays} días: cada uno cuenta.`
                            : `Día ${Math.min(summary.dayNumber, summary.durationDays)} de ${summary.durationDays} · ${summary.daysMarked} ${summary.daysMarked === 1 ? "día marcado" : "días marcados"}`}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {!summary.markedToday && !summary.periodOver && (
                            <Button onClick={() => persist(checkIn(stored.data, item.challengeId, new Date()), "Día marcado. Bien hecho.")}>
                              Hoy lo he hecho
                            </Button>
                          )}
                          {summary.markedToday && <p className="text-sm font-medium">Hoy ya está marcado.</p>}
                          <Button
                            variant="ghost"
                            onClick={() =>
                              persist(leaveChallenge(stored.data, item.challengeId, new Date()), "Reto dejado. Puedes retomarlo cuando quieras.")
                            }
                          >
                            {summary.periodOver ? "Cerrar reto" : "Dejar el reto"}
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <h3 className="text-lg font-semibold">Elige uno si te apetece</h3>
        <ul className="grid gap-4 sm:grid-cols-2">
          {[...challenges]
            .sort((a, b) => Number(suggested.has(b.id)) - Number(suggested.has(a.id)))
            .map((challenge) => {
              const active = activeChallenge(stored.data, challenge.id);
              return (
                <li key={challenge.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{challenge.title}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm font-medium text-ink-muted">
                        {challenge.durationDays === 1 ? "24 horas" : "7 días"}
                        {suggested.has(challenge.id) && " · encaja con lo que has marcado"}
                      </p>
                      <p className="mt-2 leading-relaxed">{challenge.description}</p>
                      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                        {challenge.steps.map((stepText) => (
                          <li key={stepText}>{stepText}</li>
                        ))}
                      </ol>
                      <div className="mt-4">
                        {active ? (
                          <p className="text-sm font-medium">En curso.</p>
                        ) : (
                          <Button
                            variant="secondary"
                            disabled={!canPersist}
                            onClick={() => persist(startChallenge(stored.data, challenge, new Date()), `Reto «${challenge.title}» empezado.`)}
                          >
                            Empezar este reto
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
        </ul>

        {doneItems.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold">Terminados recientemente</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {doneItems.map((item) => (
                <li key={`${item.challengeId}-${item.startedAt}`}>
                  {challenges.find((c) => c.id === item.challengeId)?.title ?? item.challengeId}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          activeItems.length === 0 && (
            <EmptyState title="Aún no has empezado ningún reto" description="Cuando empieces uno, verás aquí su seguimiento." />
          )
        )}
      </section>

      <StickyActions label="Terminar la práctica">
        <Button onClick={leave}>{didSomething ? "Terminar" : "Salir"}</Button>
      </StickyActions>
    </div>
  );
}
