"use client";

import { useEffect, useState } from "react";
import { useProgressStore } from "@/components/progress-store-provider";
import { Badge } from "@/components/ui";
import type { DifficultyLevel } from "@/core/types";

type LevelRead =
  | { status: "cargando" }
  | { status: "listo"; level: DifficultyLevel | undefined }
  | { status: "error" };

/** Nivel recordado de un juego. Hoja cliente: lee el ProgressStore después de hidratar. */
export function RememberedLevel({ exerciseId, max }: { exerciseId: string; max: number }) {
  const store = useProgressStore();
  const [read, setRead] = useState<LevelRead>({ status: "cargando" });

  useEffect(() => {
    let cancelled = false;
    store.getDifficulty(exerciseId).then(
      (level) => {
        if (!cancelled) setRead({ status: "listo", level });
      },
      () => {
        if (!cancelled) setRead({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [store, exerciseId]);

  if (read.status === "cargando") {
    return (
      <span className="text-sm text-ink-muted" aria-busy="true">
        Leyendo tu nivel…
      </span>
    );
  }
  if (read.status === "error") return <span className="text-sm text-ink-muted">Nivel no disponible</span>;
  if (read.level === undefined) return <span className="text-sm text-ink-muted">Aún sin sesiones</span>;
  return (
    <Badge tone="info">
      Nivel recordado: {read.level} de {max}
    </Badge>
  );
}
