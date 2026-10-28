"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "7kaih-progress";

type Ctx = {
  done: number[]; // id kebiasaan yang sudah diselesaikan
  ready: boolean; // true setelah progres dibaca dari perangkat
  complete: (id: number) => void;
  reset: () => void;
};

const ProgressCtx = createContext<Ctx | null>(null);

const persist = (next: number[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
};

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const complete = useCallback((id: number) => {
    setDone((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      persist(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setDone([]);
    persist([]);
  }, []);

  const value = useMemo(() => ({ done, ready, complete, reset }), [done, ready, complete, reset]);
  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error("useProgress harus dipakai di dalam ProgressProvider");
  return c;
}
