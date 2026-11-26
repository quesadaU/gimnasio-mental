"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import type { ExerciseProps } from "@/components/exercise/contract";
import { useProgressStore } from "@/components/progress-store-provider";
import { ErrorState, LoadingState } from "@/components/ui";
import { startingLevel } from "@/core/adaptive-difficulty";
import { isPersistenceAvailable } from "@/core/storage";
import type { DifficultyLevel, SessionResult } from "@/core/types";
import { PATIO_ENTRIES } from "../registry";

type SaveState = "guardando" | "guardado" | "solo-memoria" | "error";

interface LoadedGame {
  attempt: number;
  component: ComponentType<ExerciseProps> | null;
}

interface LevelState {
  initial: DifficultyLevel;
  /** El nivel no se pudo leer: se empieza por el mínimo y se avisa. */
  readFailed: boolean;
}

/**
 * Hoja cliente de `/patio/[juego]`. Lee el nivel recordado, calcula el nivel de inicio
 * (un escalón de calentamiento), carga el juego de forma diferida y persiste el resultado.
 * El juego sigue montado tras `onFinish` para no perder su pantalla de resultados aunque
 * falle el guardado.
 */
export function ExerciseRunner({ exerciseId }: { exerciseId: string }) {
  const entry = useMemo(() => PATIO_ENTRIES.find((e) => e.definition.id === exerciseId), [exerciseId]);
  const store = useProgressStore();
  const router = useRouter();

  const [level, setLevel] = useState<LevelState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [game, setGame] = useState<LoadedGame | null>(null);
  const [save, setSave] = useState<{ state: SaveState; result: SessionResult } | null>(null);

  useEffect(() => {
    if (!entry) return;
    let cancelled = false;
    const config = { range: entry.definition.difficulty, correctToLevelUp: 2 };
    store.getDifficulty(entry.definition.id).then(
      (last) => {
        if (!cancelled) setLevel({ initial: startingLevel(last, config), readFailed: false });
      },
      () => {
        if (!cancelled) setLevel({ initial: entry.definition.difficulty.min, readFailed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [entry, store]);

  useEffect(() => {
    if (!entry) return;
    let cancelled = false;
    entry.load().then(
      (module) => {
        if (!cancelled) setGame({ attempt, component: module.default });
      },
      () => {
        if (!cancelled) setGame({ attempt, component: null });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [entry, attempt]);

  const persist = useCallback(
    async (result: SessionResult) => {
      setSave({ state: "guardando", result });
      try {
        await store.recordSession(result); // idempotente por result.id: reintentar es seguro
        await store.setDifficulty(result.exerciseId, result.difficultyEnd);
        setSave({ state: isPersistenceAvailable() ? "guardado" : "solo-memoria", result });
      } catch {
        setSave({ state: "error", result });
      }
    },
    [store],
  );

  const handleFinish = useCallback((result: SessionResult) => void persist(result), [persist]);
  const handleExit = useCallback(() => router.push("/patio"), [router]);

  if (!entry) {
    return <ErrorState title="Este juego no existe" description="Vuelve al Patio para elegir otro." />;
  }

  const gameReady = game !== null && game.attempt === attempt;
  if (gameReady && game.component === null) {
    return (
      <ErrorState
        title="No se pudo cargar el juego"
        description="Puede deberse a la conexión. Tu progreso no se ha perdido."
        onRetry={() => setAttempt((n) => n + 1)}
      />
    );
  }
  if (!gameReady || level === null) {
    return <LoadingState label={`Preparando ${entry.definition.title}…`} />;
  }

  const Game = game.component as ComponentType<ExerciseProps>;
  return (
    <div className="flex flex-col gap-4">
      {level.readFailed ? (
        <p role="status" className="rounded-md bg-warning-soft px-4 py-3 text-warning">
          No se pudo leer tu nivel anterior; empiezas por el nivel {level.initial}.
        </p>
      ) : null}
      <SaveNotice save={save} onRetry={() => save && void persist(save.result)} />
      <Game
        definition={entry.definition}
        initialLevel={level.initial}
        onFinish={handleFinish}
        onExit={handleExit}
      />
    </div>
  );
}

function SaveNotice({ save, onRetry }: { save: { state: SaveState } | null; onRetry: () => void }) {
  if (save?.state === "error") {
    return (
      <ErrorState
        title="No se pudo guardar la sesión"
        description="Tus resultados siguen en pantalla. Puedes reintentar el guardado."
        onRetry={onRetry}
      />
    );
  }
  const text: Record<Exclude<SaveState, "error">, string> = {
    guardando: "Guardando la sesión…",
    guardado: "Sesión guardada en este navegador.",
    "solo-memoria":
      "Este navegador no permite guardar datos: la sesión se conservará solo hasta que cierres la pestaña.",
  };
  // La región viva existe siempre para que los lectores de pantalla anuncien los cambios.
  return (
    <div role="status" aria-live="polite">
      {save ? (
        <p
          className={
            save.state === "solo-memoria"
              ? "rounded-md bg-warning-soft px-4 py-3 text-warning"
              : "rounded-md bg-surface-2 px-4 py-3 text-sm text-ink-muted"
          }
        >
          {text[save.state]}
        </p>
      ) : null}
    </div>
  );
}
