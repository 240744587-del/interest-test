import { describe, expect, it } from "vitest";
import type { ScoreResult } from "@/lib/questions/types";
import {
  canRequestAIReport,
  canShowDetailedCharts,
  resolveReportStatus,
  resultReducer,
} from "./result-state";

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

describe("canShowDetailedCharts", () => {
  it("hides precise charts when evidence is insufficient", () => {
    expect(
      canShowDetailedCharts({
        ...resultFixture,
        consistencyFlags: ["low-evidence"],
      }),
    ).toBe(false);
    expect(canShowDetailedCharts(resultFixture)).toBe(true);
  });
});

describe("canRequestAIReport", () => {
  it("does not offer AI interpretation for low-evidence results", () => {
    expect(
      canRequestAIReport({
        ...resultFixture,
        consistencyFlags: ["low-evidence"],
      }),
    ).toBe(false);
    expect(canRequestAIReport(resultFixture)).toBe(true);
  });
});

describe("resolveReportStatus", () => {
  it("does not label a template fallback as an AI report", () => {
    expect(
      resolveReportStatus({
        ok: true,
        report: {
          overview: "本地报告内容",
          interestInterpretation: "本地报告内容",
          abilityInterpretation: "本地报告内容",
          cognitiveInterpretation: "本地报告内容",
          driveInterpretation: "本地报告内容",
          explorationSuggestions: "本地报告内容",
          actionSteps: "本地报告内容",
        },
        fallback: true,
      }),
    ).toEqual({
      kind: "fallback",
      message: "AI 暂时不可用，当前继续显示本地基础报告",
    });
  });
});
