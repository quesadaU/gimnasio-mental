/** Corrección de las preguntas de comprensión. */

import type { QuestionKind, ReadingQuestion } from "./types.ts";

export interface AnswerFeedback {
  questionId: string;
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

export function isValidOptionIndex(question: ReadingQuestion, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < question.options.length;
}

export function gradeAnswer(question: ReadingQuestion, selectedIndex: number): AnswerFeedback {
  if (!isValidOptionIndex(question, selectedIndex)) {
    throw new RangeError(`Opción fuera de rango en la pregunta ${question.id}: ${selectedIndex}`);
  }
  return {
    questionId: question.id,
    correct: selectedIndex === question.correctIndex,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
  };
}

export interface KindTally {
  total: number;
  correct: number;
}

export interface QuizSummary {
  total: number;
  answered: number;
  correct: number;
  /** Porcentaje entero 0-100 sobre el total de preguntas (las no respondidas cuentan como fallo). */
  score: number;
  byKind: Partial<Record<QuestionKind, KindTally>>;
}

/** `answers` asocia id de pregunta con el índice elegido. Ignora ids desconocidos e índices inválidos. */
export function summarizeQuiz(
  questions: readonly ReadingQuestion[],
  answers: Readonly<Record<string, number>>,
): QuizSummary {
  let answered = 0;
  let correct = 0;
  const byKind: Partial<Record<QuestionKind, KindTally>> = {};

  for (const question of questions) {
    const tally = byKind[question.kind] ?? { total: 0, correct: 0 };
    tally.total += 1;
    const selected = answers[question.id];
    if (selected !== undefined && isValidOptionIndex(question, selected)) {
      answered += 1;
      if (selected === question.correctIndex) {
        correct += 1;
        tally.correct += 1;
      }
    }
    byKind[question.kind] = tally;
  }

  const total = questions.length;
  return {
    total,
    answered,
    correct,
    score: total === 0 ? 0 : Math.round((correct / total) * 100),
    byKind,
  };
}
