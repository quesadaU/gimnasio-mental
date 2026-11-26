"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readVersioned, writeVersioned } from "@/core/storage";
import {
  DEFAULT_READER_PREFS,
  READER_PREFS_KEY,
  READER_PREFS_VERSION,
  readerPrefsSchema,
  type ReaderPrefs,
} from "../domain/prefs";

/*
 * Preferencias del lector como almacén externo mínimo: se leen una vez de `gm:lectura:prefs`,
 * se comparten entre componentes y en el servidor se usan los valores por defecto.
 */
let cached: ReaderPrefs | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): ReaderPrefs {
  if (cached === null) {
    const result = readVersioned(READER_PREFS_KEY, readerPrefsSchema);
    cached = result.value ?? DEFAULT_READER_PREFS;
  }
  return cached;
}

function getServerSnapshot(): ReaderPrefs {
  return DEFAULT_READER_PREFS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useReaderPrefs(): [ReaderPrefs, (patch: Partial<ReaderPrefs>) => void] {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const update = useCallback((patch: Partial<ReaderPrefs>) => {
    cached = { ...getSnapshot(), ...patch };
    // Si no hay almacenamiento (modo privado, cuota) la preferencia vale para esta visita.
    writeVersioned(READER_PREFS_KEY, READER_PREFS_VERSION, cached);
    for (const listener of listeners) listener();
  }, []);
  return [prefs, update];
}
