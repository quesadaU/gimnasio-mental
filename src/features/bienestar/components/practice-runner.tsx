"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import type { ExerciseProps } from "@/components/exercise/contract";
import { useProgressStore } from "@/components/progress-store-provider";
import { Button, ErrorState, LoadingState, SessionEndScreen } from "@/components/ui";
import { isPersistenceAvailable } from "@/core/storage";
import type { SessionResult } from "@/core/types";
import { describeDuration } from "../domain/phase-timer";
import { sessionDurationMs } from "../domain/session";
import { findPractice } from "../registry";
import { Notice } from "./practice-ui";

type SaveState = "guardando" | "guardado" | "solo-memoria" | "error";

interface Finished {
  result: SessionResult;
  save: SaveState;
}

/**
 * Hoja cliente de `/bienestar/[practica]`: carga el componente de la práctica de forma diferida,
 * persiste el SessionResult con el ProgressStore y muestra la pantalla de fin.
 */
export function PracticeRunner({ slug }: { slug: string }) {
  const entry = findPractice(slug);
  const store = useProgressStore();
  const router = useRouter();
  const [loaded, setLoaded] = useState<{ attempt: number; component: ComponentType<ExerciseProps> | null; failed: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [run, setRun] = useState(0);
  const [finished, setFinished] = useState<Finished | null>(null);

  useEffect(() => {
    if (!entry) return;
    let cancelled = false;
    entry.load().then(
      (module) => {
        if (!cancelled) setLoaded({ attempt, component: module.default, failed: false });
      },
      () => {
        if (!cancelled) setLoaded({ attempt, component: null, failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [entry, attempt]);

  const persist = useCallback(
    async (result: SessionResult) => {
      setFinished({ result, save: "guardando" });
      try {
        await store.recordSession(result);
        setFinished({ result, save: isPersistenceAvailable() ? "guardado" : "solo-memoria" });
      } catch {
        setFinished({ result, save: "error" });
      }
    },
    [store],
  );

  const exit = useCallback(() => router.push("/bienestar"), [router]);

  if (!entry) {
    return <ErrorState title="Esta práctica no existe" description="Vuelve al índice de Bienestar para elegir otra." />;
  }

  if (finished) {
    const completed = finished.result.outcome === "completada";
    return (
      <div className="space-y-4">
        <SaveStatus state={finished.save} onRetry={() => void persist(finished.result)} />
        <SessionEndScreen
          title={completed ? "Práctica terminada" : "Has parado aquí"}
          summary={[
            { label: "Práctica", value: entry.definition.title },
            { label: "Tiempo", value: describeDuration(sessionDurationMs(finished.result)) },
            { label: "Estado", value: completed ? "Completada" : "Detenida antes de terminar" },
          ]}
          onRepeat={() => {
            setFinished(null);
            setRun((value) => value + 1);
          }}
          onExit={exit}
          nextHint={
            completed
              ? "Date un momento para notar cómo estás, sin juzgarlo. Puedes volver cuando quieras."
              : "Parar también está bien. Puedes volver a intentarlo cuando te apetezca, o probar otra práctica."
          }
        />
      </div>
    );
  }

  const current = loaded && loaded.attempt === attempt ? loaded : null;
  if (!current) return <LoadingState label="Cargando la práctica…" />;
  if (current.failed || !current.component) {
    return (
      <ErrorState
        title="No hemos podido cargar la práctica"
        description="Comprueba la conexión e inténtalo de nuevo."
        onRetry={() => setAttempt((value) => value + 1)}
      />
    );
  }

  const Practice = current.component;
  return (
    <Practice
      key={run}
      definition={entry.definition}
      initialLevel={1}
      onFinish={(result) => void persist(result)}
      onExit={exit}
    />
  );
}

function SaveStatus({ state, onRetry }: { state: SaveState; onRetry(): void }) {
  return (
    <div role="status">
      {state === "guardando" && <p className="text-sm text-ink-muted">Guardando en este dispositivo…</p>}
      {state === "solo-memoria" && (
        <Notice tone="aviso">
          Este navegador no permite guardar datos, así que esta sesión no aparecerá en tu progreso al recargar.
        </Notice>
      )}
      {state === "error" && (
        <Notice tone="aviso">
          <p>No hemos podido registrar la sesión en tu progreso.</p>
          <div className="mt-2">
            <Button variant="secondary" onClick={onRetry}>
              Reintentar
            </Button>
          </div>
        </Notice>
      )}
    </div>
  );
}
