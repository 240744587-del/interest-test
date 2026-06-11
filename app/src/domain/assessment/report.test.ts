import { describe, expect, it } from "vitest";
import { questionBanks } from "../../data/questions/generated";
import type { ScoreResult } from "../../lib/questions/types";
import { scoreAssessment, type AssessmentScore } from "./score";
import type { Answer, Question } from "./types";
import { buildScoreResult } from "./report";

function answerFor(question: Question): Answer {
  if (question.type === "single") {
    return {
      questionId: question.id,
      value: { kind: "single", optionId: question.options[0].id },
    };
  }
  if (question.type === "likert") {
    return {
      questionId: question.id,
      value: { kind: "likert", value: 3 },
    };
  }
  if (question.type === "ranking") {
    return {
      questionId: question.id,
      value: {
        kind: "ranking",
        optionIds: question.options.map((option) => option.id),
      },
    };
  }
  return {
    questionId: question.id,
    value: {
      kind: "forcedChoice",
      mostOptionId: question.options[0].id,
      leastOptionId: question.options[1].id,
    },
  };
}

function expectBounded(values: number[]) {
  expect(values.every((value) => value >= 0 && value <= 100)).toBe(true);
}

describe("buildScoreResult", () => {
  it.each(["L1", "L2", "L3", "L4"] as const)(
    "builds a bounded report from the generated %s bank",
    (level) => {
      const questions = questionBanks[level];
      const score = scoreAssessment(
        level,
        questions.map(answerFor),
        questions,
      );
      const report = buildScoreResult(score);

      expect(report.level).toBe(level);
      expect(report.riasec.code).toMatch(/^[RIASEC]{3}$/);
      expectBounded(Object.values(report.riasec.scores));
      expectBounded(Object.values(report.jung));
      expectBounded(
        report.dimensions.flatMap((dimension) =>
          dimension.subScores.map((subScore) => subScore.score),
        ),
      );
      expect(report.jung.EI).toBe(50);

      if (level === "L1") {
        expect(report.readiness).toBeUndefined();
      } else {
        expect(report.readiness).toBeDefined();
        expectBounded([report.readiness!.overall]);
        expectBounded(Object.values(report.readiness!.subScores));
        expect(
          Object.keys(report.readiness?.subScores ?? {}).every((key) =>
            key.startsWith("readiness."),
          ),
        ).toBe(true);
      }
    },
  );

  it("groups and sorts normalized scores into the existing view model", () => {
    const score: AssessmentScore = {
      level: "L2",
      rawScores: {},
      ranges: {},
      normalizedScores: {
        "energy.low": 20,
        "energy.high": 80,
        "intelligence.logical": 70,
        "riasec.A": 90,
        "riasec.C": 90,
        "riasec.E": 80,
        "riasec.I": 70,
        "riasec.R": 60,
        "riasec.S": 50,
        "drive.creation": 65,
        "jung.S": 20,
        "jung.N": 80,
        "jung.T": 75,
        "jung.F": 25,
        "readiness.self_awareness": 40,
        "readiness.career_information": 60,
      },
      answeredCount: 46,
      skippedCount: 0,
      evidenceByDimension: {
        energy: { answered: 2, skipped: 0 },
        intelligence: { answered: 1, skipped: 0 },
        riasec: { answered: 6, skipped: 0 },
        drive: { answered: 1, skipped: 0 },
        jung: { answered: 4, skipped: 0 },
        readiness: { answered: 2, skipped: 0 },
      },
    };

    const report: ScoreResult = buildScoreResult(score);
    const dimensions = Object.fromEntries(
      report.dimensions.map((dimension) => [dimension.key, dimension]),
    );

    expect(Object.keys(dimensions)).toEqual([
      "energy",
      "intelligence",
      "riasec",
      "drive",
      "cognitive",
      "readiness",
    ]);
    expect(dimensions.energy.subScores).toEqual([
      { key: "energy.high", label: "energy.high", score: 80 },
      { key: "energy.low", label: "energy.low", score: 20 },
    ]);
    expect(
      dimensions.riasec.subScores.map(({ key, score }) => ({ key, score })),
    ).toEqual([
      { key: "riasec.A", score: 90 },
      { key: "riasec.C", score: 90 },
      { key: "riasec.E", score: 80 },
      { key: "riasec.I", score: 70 },
      { key: "riasec.R", score: 60 },
      { key: "riasec.S", score: 50 },
    ]);

    expect(report.riasec).toEqual({
      scores: { R: 60, I: 70, A: 90, S: 50, E: 80, C: 90 },
      code: "ACE",
      consistency: "low",
      differentiation: "high",
      clarity: "medium",
    });
    expect(report.jung).toEqual({ EI: 50, SN: 80, TF: 25, JP: 50 });
    expect(report.readiness).toEqual({
      overall: 50,
      subScores: {
        "readiness.self_awareness": 40,
        "readiness.career_information": 60,
      },
    });
    expect(report.candidateFields).toEqual([
      "平面设计",
      "编辑出版",
      "博物馆管理",
    ]);
    expect(report.consistencyFlags).toEqual([]);
  });

  it("does not count diagnostic readiness signals as positive readiness", () => {
    const report = buildScoreResult({
      level: "L3",
      rawScores: {},
      ranges: {},
      normalizedScores: {
        "readiness.decision_support_needed": 100,
        "readiness.direction_mismatch": 100,
        "readiness.undifferentiated": 100,
        "readiness.self_awareness": 60,
      },
      answeredCount: 53,
      skippedCount: 0,
      evidenceByDimension: {
        readiness: { answered: 4, skipped: 0 },
      },
    });

    expect(report.readiness?.overall).toBe(60);
  });

  it("marks a report low-evidence when an entire measured dimension is skipped", () => {
    const report = buildScoreResult({
      level: "L1",
      rawScores: {},
      ranges: {},
      normalizedScores: {
        "energy.social": 80,
        "intelligence.logical": 70,
      },
      answeredCount: 24,
      skippedCount: 8,
      evidenceByDimension: {
        riasec: { answered: 0, skipped: 8 },
        energy: { answered: 6, skipped: 0 },
        intelligence: { answered: 8, skipped: 0 },
      },
    });

    expect(report.consistencyFlags).toContain("low-evidence");
    expect(report.riasec.code).toBe("");
    expect(report.candidateFields).toEqual([]);
  });
});
