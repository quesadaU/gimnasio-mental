"use client";

import { readVersioned, removeKey, writeVersioned, type ReadStatus } from "@/core/storage";
import {
  emptyJournal,
  JOURNAL_SCHEMA_VERSION,
  JOURNAL_STORAGE_KEY,
  journalSchema,
  type JournalData,
} from "../domain/journal";

export interface LoadedJournal {
  status: ReadStatus;
  data: JournalData;
}

/** Lee el diario de `gm:bienestar:diario`. Solo en cliente; nada sale del dispositivo. */
export function loadJournal(): LoadedJournal {
  const result = readVersioned(JOURNAL_STORAGE_KEY, journalSchema);
  if (result.status === "migrado" && result.value) {
    writeVersioned(JOURNAL_STORAGE_KEY, JOURNAL_SCHEMA_VERSION, result.value);
  }
  return { status: result.status, data: result.value ?? emptyJournal() };
}

export function saveJournal(data: JournalData): boolean {
  return writeVersioned(JOURNAL_STORAGE_KEY, JOURNAL_SCHEMA_VERSION, data);
}

export function deleteJournal(): boolean {
  return removeKey(JOURNAL_STORAGE_KEY);
}

/** Descarga un archivo de texto generado en el propio navegador (sin red). */
export function downloadTextFile(fileName: string, content: string, mime = "application/json"): boolean {
  try {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
  } catch {
    return false;
  }
}
