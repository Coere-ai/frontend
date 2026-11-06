"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Which row of scenes may play. Both rows of What Coere solves can be in
 * view on a tall screen, and only one thing should move, so the rows share
 * one turn: a row in view asks for it, and a row that has played a scene
 * hands it to the other row when that one is waiting. With both rows in
 * view, each problem is then followed by its answer.
 */
type Turns = {
  holder: string | null;
  want: (row: string, wants: boolean) => void;
  done: (row: string) => void;
};

const TurnsContext = createContext<Turns | null>(null);

export function SolvesTurns({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ holder: string | null; waiting: string[] }>({ holder: null, waiting: [] });

  const want = useCallback((row: string, wants: boolean) => {
    setState((s) => {
      const waiting = wants ? (s.waiting.includes(row) ? s.waiting : [...s.waiting, row]) : s.waiting.filter((r) => r !== row);
      const holder = s.holder && waiting.includes(s.holder) ? s.holder : (waiting[0] ?? null);
      return holder === s.holder && waiting === s.waiting ? s : { holder, waiting };
    });
  }, []);

  const done = useCallback((row: string) => {
    setState((s) => {
      if (s.holder !== row) return s;
      const other = s.waiting.find((r) => r !== row);
      return other ? { holder: other, waiting: [...s.waiting.filter((r) => r !== row), row] } : s;
    });
  }, []);

  const value = useMemo(() => ({ holder: state.holder, want, done }), [state.holder, want, done]);
  return <TurnsContext.Provider value={value}>{children}</TurnsContext.Provider>;
}

/**
 * Whether this row holds the turn, and a way to hand it on. A row outside
 * the provider always holds it.
 */
export function useTurn(row: string, wants: boolean): { holding: boolean; done: () => void } {
  const turns = useContext(TurnsContext);
  const want = turns?.want;
  const finish = turns?.done;
  useEffect(() => {
    if (!want) return;
    want(row, wants);
    return () => want(row, false);
  }, [want, row, wants]);
  const done = useCallback(() => finish?.(row), [finish, row]);
  return { holding: turns ? turns.holder === row : true, done };
}
