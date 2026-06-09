import { describe, expect, it } from "vitest";
import type { Answer, Question } from "./types";
import {
  rankWeights,
  scoreAssessment,
  scoreReverseLikert,
} from "./score";

function score(
  question: Question,
  answer: Answer,
): ReturnType<typeof scoreAssessment> {
  return scoreAssessment(question.level, [answer], [question]);
}

describe("scoreAssessment", () => {
  it("gives the full option value to every composite target", () => {
    const question: Question = {
      id: "L1-ABILITY-001",
      level: "L1",
      number: 1,
      type: "single",
      prompt: "选择",
      options: [
        {
          id: "A",
          text: "复合",
          scores: [
            { key: "intelligence.linguistic", value: 2 },
            { key: "intelligence.interpersonal", value: 2 },
          ],
        },
        { id: "B", text: "空", scores: [] },
      ],
      sourceMarkdown: "source",
    };

    const result = score(question, {
      questionId: question.id,
      value: { kind: "single", optionId: "A" },
    });

    expect(result.rawScores["intelligence.linguistic"]).toBe(2);
    expect(result.rawScores["intelligence.interpersonal"]).toBe(2);
  });

  it("reverses a Likert answer before applying its score", () => {
    expect(scoreReverseLikert(5)).toBe(1);

    const question: Question = {
      id: "L4-DRIVE-001",
      level: "L4",
      number: 1,
      type: "likert",
      prompt: "反向题",
      options: [],
      likertScores: [{ key: "readiness.direction_fit", value: 1 }],
      reverse: true,
      sourceMarkdown: "source",
    };

    const result = score(question, {
      questionId: question.id,
      value: { kind: "likert", value: 5 },
    });

    expect(result.rawScores["readiness.direction_fit"]).toBe(1);
  });

  it("uses 5, 3, 1, 0 for a four-option ranking", () => {
    expect(rankWeights).toEqual([5, 3, 1, 0]);

    const question: Question = {
      id: "L1-RIASEC-001",
      level: "L1",
      number: 1,
      type: "ranking",
      prompt: "排序",
      options: ["R", "I", "A", "S"].map((id) => ({
        id,
        text: id,
        scores: [{ key: `riasec.${id}`, value: 1 }],
      })),
      sourceMarkdown: "source",
    };

    const result = score(question, {
      questionId: question.id,
      value: { kind: "ranking", optionIds: ["R", "I", "A", "S"] },
    });

    expect(result.rawScores).toMatchObject({
      "riasec.R": 5,
      "riasec.I": 3,
      "riasec.A": 1,
      "riasec.S": 0,
    });
  });

  it("adds +4 to most and -2 to least in forced choice", () => {
    const question: Question = {
      id: "L3-RIASEC-001",
      level: "L3",
      number: 1,
      type: "forcedChoice",
      prompt: "迫选",
      options: ["R", "C"].map((id) => ({
        id,
        text: id,
        scores: [{ key: `riasec.${id}`, value: 1 }],
      })),
      sourceMarkdown: "source",
    };

    const result = score(question, {
      questionId: question.id,
      value: {
        kind: "forcedChoice",
        mostOptionId: "R",
        leastOptionId: "C",
      },
    });

    expect(result.rawScores["riasec.R"]).toBe(4);
    expect(result.rawScores["riasec.C"]).toBe(-2);
  });
});
