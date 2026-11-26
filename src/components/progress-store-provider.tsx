"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createLocalProgressStore } from "@/core/storage";
import type { ProgressStore } from "@/core/types";

const ProgressStoreContext = createContext<ProgressStore | null>(null);

export function ProgressStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<ProgressStore>(() => createLocalProgressStore());
  return <ProgressStoreContext.Provider value={store}>{children}</ProgressStoreContext.Provider>;
}

export function useProgressStore(): ProgressStore {
  const store = useContext(ProgressStoreContext);
  if (!store) throw new Error("useProgressStore requiere <ProgressStoreProvider>");
  return store;
}
