"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { ScoreResult } from "@/lib/questions/types";
import { resultReducer } from "./result-state";

interface ResultStoreValue {
  result: ScoreResult | null;
  setResult: (result: ScoreResult) => void;
  clearResult: () => void;
}

const ResultStoreContext = createContext<ResultStoreValue | null>(null);

export function ResultProvider({ children }: { children: ReactNode }) {
  const [result, dispatch] = useReducer(resultReducer, null);

  return (
    <ResultStoreContext.Provider
      value={{
        result,
        setResult: (nextResult) =>
          dispatch({ type: "set", result: nextResult }),
        clearResult: () => dispatch({ type: "clear" }),
      }}
    >
      {children}
    </ResultStoreContext.Provider>
  );
}

export function useResultStore(): ResultStoreValue {
  const store = useContext(ResultStoreContext);

  if (store === null) {
    throw new Error("useResultStore must be used within a ResultProvider");
  }

  return store;
}
