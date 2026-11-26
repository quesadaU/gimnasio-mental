"use client";

import { useCallback, useEffect, useState } from "react";
import { useProgressStore } from "@/components/progress-store-provider";
import type { ProgressStore } from "@/core/types";

export type StoreData<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: T };

/**
 * Lee datos del ProgressStore en el cliente (tras hidratar) con estados de carga y error.
 * `reload` vuelve a pedir los datos, por ejemplo tras importar o borrar.
 */
export function useStoreData<T>(read: (store: ProgressStore) => Promise<T>) {
  const store = useProgressStore();
  const [state, setState] = useState<StoreData<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    read(store).then(
      (data) => {
        if (active) setState({ status: "ready", data });
      },
      () => {
        if (active) setState({ status: "error" });
      },
    );
    return () => {
      active = false;
    };
    // `read` debe ser estable (función de módulo); solo se relee al cambiar store o attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, attempt]);

  const reload = useCallback(() => {
    // Si ya hay datos se mantienen visibles mientras se refrescan (no se desmonta la UI ni el foco).
    setState((previous) => (previous.status === "ready" ? previous : { status: "loading" }));
    setAttempt((n) => n + 1);
  }, []);

  return { state, reload, store };
}
