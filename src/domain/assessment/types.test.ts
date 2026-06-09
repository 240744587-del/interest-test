import { describe, expect, it } from "vitest";
import { questionSchema } from "./types";

const validQuestion = {
  id: "L1-ENERGY-001",
  level: "L1",
  number: 1,
  type: "single",
  prompt: "你更喜欢哪一个？",
  options: [
    {
      id: "A",
      text: "选项 A",
      scores: [{ key: "energy.social", value: 2 }],
    },
    {
      id: "B",
      text: "选项 B",
      scores: [{ key: "energy.solitude", value: 2 }],
    },
  ],
  sourceMarkdown: "source",
} as const;

describe("questionSchema", () => {
  it("accepts a valid single-choice question", () => {
    expect(questionSchema.parse(validQuestion)).toEqual(validQuestion);
  });

  it("rejects duplicate option IDs", () => {
    const duplicateOptions = {
      ...validQuestion,
      options: [validQuestion.options[0], validQuestion.options[0]],
    };

    expect(() => questionSchema.parse(duplicateOptions)).toThrow(
      "Option IDs must be unique",
    );
  });

  it("rejects an unknown score-key namespace", () => {
    const unknownScoreKey = {
      ...validQuestion,
      options: [
        {
          id: "A",
          text: "选项 A",
          scores: [{ key: "unknown.label", value: 2 }],
        },
      ],
    };

    expect(() => questionSchema.parse(unknownScoreKey)).toThrow();
  });
});
