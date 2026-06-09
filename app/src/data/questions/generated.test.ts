import { describe, expect, it } from "vitest";
import { questionSchema } from "../../domain/assessment/types";
import { questionBanks } from "./generated";

const expectedCounts = { L1: 32, L2: 46, L3: 53, L4: 59 } as const;

describe("generated question banks", () => {
  it("contains the approved number of questions at each level", () => {
    for (const [level, count] of Object.entries(expectedCounts)) {
      expect(questionBanks[level as keyof typeof questionBanks]).toHaveLength(
        count,
      );
    }
  });

  it("contains 190 globally unique IDs", () => {
    const ids = Object.values(questionBanks)
      .flat()
      .map((question) => question.id);

    expect(ids).toHaveLength(190);
    expect(new Set(ids).size).toBe(190);
  });

  it("matches the runtime question contract", () => {
    for (const question of Object.values(questionBanks).flat()) {
      expect(() => questionSchema.parse(question)).not.toThrow();
    }
  });

  it("has unique option IDs within each question", () => {
    for (const question of Object.values(questionBanks).flat()) {
      const optionIds = question.options.map((option) => option.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
    }
  });

  it("contains complete scoring data for every question", () => {
    for (const question of Object.values(questionBanks).flat()) {
      if (question.type === "likert") {
        expect(question.likertScores?.length, question.id).toBeGreaterThan(0);
      } else {
        expect(question.options.length, question.id).toBeGreaterThanOrEqual(2);
      }

      if (question.type === "ranking") {
        expect(question.options, question.id).toHaveLength(4);
      }

      const targetCount =
        (question.likertScores?.length ?? 0) +
        question.options.reduce(
          (count, option) => count + option.scores.length,
          0,
        );
      expect(targetCount, question.id).toBeGreaterThan(0);
    }
  });
});
