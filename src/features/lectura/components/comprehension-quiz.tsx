"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, ProgressBar } from "@/components/ui";
import { gradeAnswer, type AnswerFeedback } from "../domain/quiz";
import { QUESTION_KIND_LABELS, type ReadingQuestion } from "../domain/types";

interface ComprehensionQuizProps {
  questions: readonly ReadingQuestion[];
  /** Respuestas elegidas por id de pregunta. */
  onDone: (answers: Record<string, number>) => void;
}

/**
 * Preguntas de comprensión, una a una y de memoria (práctica de recuperación). Cada respuesta
 * recibe una explicación, acierte o no: el objetivo es entender por qué, no sumar puntos.
 */
export function ComprehensionQuiz({ questions, onDone }: ComprehensionQuizProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const groupName = useId();

  const question = questions[index];
  const isLast = index === questions.length - 1;

  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);

  if (!question) return null;

  function check() {
    if (selected === null || !question) return;
    setFeedback(gradeAnswer(question, selected));
    setAnswers((previous) => ({ ...previous, [question.id]: selected }));
  }

  function next() {
    if (isLast) {
      onDone(answers);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    setFeedback(null);
  }

  return (
    <Card as="section" aria-labelledby={titleId}>
      <CardHeader>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Paso 2 de 3</p>
        <h2 id={titleId} ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-ink">
          Pregunta {index + 1} de {questions.length}
        </h2>
        <ProgressBar value={index + (feedback ? 1 : 0)} max={questions.length} label="Preguntas respondidas" hideLabel />
      </CardHeader>
      <CardBody>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (feedback) next();
            else check();
          }}
        >
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 flex flex-col gap-2">
              <Badge tone="info">{QUESTION_KIND_LABELS[question.kind]}</Badge>
              <span className="text-lg font-semibold text-ink">{question.prompt}</span>
            </legend>
            {question.options.map((option, optionIndex) => {
              const isCorrectOption = feedback !== null && optionIndex === feedback.correctIndex;
              const isWrongChoice = feedback !== null && optionIndex === selected && !feedback.correct;
              return (
                <label
                  key={option}
                  className={
                    "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-ink " +
                    (isCorrectOption
                      ? "border-success bg-success-soft"
                      : isWrongChoice
                        ? "border-danger bg-danger-soft"
                        : "border-line-strong bg-canvas has-[:checked]:border-primary")
                  }
                >
                  <input
                    type="radio"
                    name={groupName}
                    value={optionIndex}
                    checked={selected === optionIndex}
                    onChange={() => setSelected(optionIndex)}
                    disabled={feedback !== null}
                    className="mt-1 size-4 shrink-0 accent-primary"
                  />
                  <span className="flex-1">
                    {option}
                    {isCorrectOption ? <span className="font-semibold"> · Respuesta correcta</span> : null}
                    {isWrongChoice ? <span className="font-semibold"> · Tu respuesta</span> : null}
                  </span>
                </label>
              );
            })}
          </fieldset>

          {feedback ? (
            <div
              ref={feedbackRef}
              tabIndex={-1}
              role="status"
              className="flex flex-col gap-1 rounded-lg border-l-4 border-accent bg-canvas px-4 py-3 text-ink"
            >
              <p className="font-semibold">{feedback.correct ? "Correcto." : "No es esta."}</p>
              <p>{feedback.explanation}</p>
            </div>
          ) : null}

          <div>
            {feedback ? (
              <Button type="submit">{isLast ? "Ver las ideas clave" : "Siguiente pregunta"}</Button>
            ) : (
              <Button type="submit" disabled={selected === null}>
                Comprobar
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
