import { describe, expect, it } from "vitest";
import type { ScoreResult } from "@/lib/questions/types";
import { resultReducer } from "./result-state";

const resultFixture = {
  level: "L1",
  dimensions: [],
  jung: {
    EI: 50,
    SN: 50,
    TF: 50,
    JP: 50,
  },
  riasec: {
    scores: {
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    },
    code: "",
    consistency: "medium",
    differentiation: "low",
    clarity: "low",
  },
  consistencyFlags: [],
  candidateFields: [],
} satisfies ScoreResult;

describe("resultReducer", () => {
  it("sets a score result without retaining answers", () => {
    const state = resultReducer(null, {
      type: "set",
      result: resultFixture,
    });

    expect(state).toBe(resultFixture);
    expect(Object.hasOwn(resultFixture, "answers")).toBe(false);
    expect(Object.hasOwn(state!, "answers")).toBe(false);
  });

  it("clears the current result", () => {
    expect(resultReducer(resultFixture, { type: "clear" })).toBeNull();
  });
});
