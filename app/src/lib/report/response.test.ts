import { describe, expect, it } from "vitest";
import type { ScoreResult } from "@/lib/questions/types";
import { parseAIReport, shouldForceTemplateReport } from "./response";

const validReport = {
  overview: "这是足够长的综合画像内容，用于验证报告结构。",
  interestInterpretation: "这是足够长的兴趣解读内容，用于验证报告结构。",
  abilityInterpretation: "这是足够长的能力解读内容，用于验证报告结构。",
  cognitiveInterpretation: "这是足够长的认知解读内容，用于验证报告结构。",
  driveInterpretation: "这是足够长的驱动力解读内容，用于验证报告结构。",
  explorationSuggestions: "这是足够长的探索建议内容，用于验证报告结构。",
  actionSteps: "这是足够长的行动建议内容，用于验证报告结构。",
};

const summary = {
  level: "L2",
  dimensions: [],
  jung: { EI: 50, SN: 50, TF: 50, JP: 50 },
  riasec: {
    scores: { R: 10, I: 20, A: 30, S: 40, E: 50, C: 60 },
    code: "CES",
    consistency: "medium",
    differentiation: "medium",
    clarity: "medium",
  },
  consistencyFlags: [],
  candidateFields: [],
} satisfies ScoreResult;

describe("parseAIReport", () => {
  it("accepts a strict bounded report", () => {
    expect(parseAIReport(JSON.stringify(validReport), "L4")).toEqual(validReport);
  });

  it("rejects unexpected fields and oversized sections", () => {
    expect(() =>
      parseAIReport(JSON.stringify({ ...validReport, unexpected: "value" }), "L4"),
    ).toThrow("AI 返回结构无效");
    expect(() =>
      parseAIReport(
        JSON.stringify({ ...validReport, overview: "x".repeat(2001) }),
        "L4",
      ),
    ).toThrow("AI 返回结构无效");
  });

  it("requires a guardian note for minor reports", () => {
    expect(() => parseAIReport(JSON.stringify(validReport), "L2")).toThrow(
      "AI 返回结构无效",
    );
  });
});

describe("shouldForceTemplateReport", () => {
  it("forces the local template for low-evidence results", () => {
    expect(
      shouldForceTemplateReport({
        ...summary,
        consistencyFlags: ["low-evidence"],
      }),
    ).toBe(true);
    expect(shouldForceTemplateReport(summary)).toBe(false);
  });
});
