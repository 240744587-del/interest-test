// ============================================================
// 端到端计分回归测试
// 覆盖真实链路：generated 题库 → scoreAssessment → buildScoreResult
// 防止"题库有分数但计分输出全 0"这类断链再次发生
// ============================================================

import { describe, expect, it } from "vitest";
import { questionBanks } from "../../data/questions/generated";
import { buildUiQuestionBank } from "../../lib/questions/adapter";
import { levels, type Level } from "./types";
import type { Answer, Question } from "./types";
import { scoreAssessment } from "./score";
import { buildScoreResult } from "./report";

/** 模拟一份完整作答：single 选首项、likert 选 4、forcedChoice 选首尾 */
function answerAll(questions: Question[]): Answer[] {
  return questions.map((question) => {
    if (question.type === "likert") {
      return {
        questionId: question.id,
        value: { kind: "likert" as const, value: 4 as const },
      };
    }
    if (question.type === "forcedChoice") {
      return {
        questionId: question.id,
        value: {
          kind: "forcedChoice" as const,
          mostOptionId: question.options[0].id,
          leastOptionId: question.options[question.options.length - 1].id,
        },
      };
    }
    if (question.type === "ranking") {
      return {
        questionId: question.id,
        value: {
          kind: "ranking" as const,
          optionIds: question.options.map((option) => option.id),
        },
      };
    }
    return {
      questionId: question.id,
      value: { kind: "single" as const, optionId: question.options[0].id },
    };
  });
}

describe("scoring pipeline end-to-end", () => {
  it.each(levels)("%s: full answers produce non-zero scores", (level) => {
    const questions = questionBanks[level as Level];
    expect(questions.length).toBeGreaterThan(0);

    const result = buildScoreResult(
      scoreAssessment(level as Level, answerAll(questions), questions),
    );

    // 子维度必须存在且不全为 0
    const subScores = result.dimensions.flatMap((d) =>
      d.subScores.map((s) => s.score),
    );
    expect(subScores.length).toBeGreaterThan(0);
    expect(subScores.some((score) => score > 0)).toBe(true);

    // RIASEC 六维不能全 0，代码必须是 3 个字母
    const riasecValues = Object.values(result.riasec.scores);
    expect(riasecValues.some((score) => score > 0)).toBe(true);
    expect(result.riasec.code).toMatch(/^[RIASEC]{3}$/);
  });

  it.each(levels)("%s: different answers produce different results", (level) => {
    const questions = questionBanks[level as Level];

    const answersA = answerAll(questions);
    // 反向作答：single 选末项、likert 选 2
    const answersB: Answer[] = questions.map((question) => {
      if (question.type === "likert") {
        return {
          questionId: question.id,
          value: { kind: "likert" as const, value: 2 as const },
        };
      }
      if (question.type === "forcedChoice") {
        return {
          questionId: question.id,
          value: {
            kind: "forcedChoice" as const,
            mostOptionId: question.options[question.options.length - 1].id,
            leastOptionId: question.options[0].id,
          },
        };
      }
      if (question.type === "ranking") {
        return {
          questionId: question.id,
          value: {
            kind: "ranking" as const,
            optionIds: [...question.options.map((option) => option.id)].reverse(),
          },
        };
      }
      return {
        questionId: question.id,
        value: {
          kind: "single" as const,
          optionId: question.options[question.options.length - 1].id,
        },
      };
    });

    const resultA = buildScoreResult(
      scoreAssessment(level as Level, answersA, questions),
    );
    const resultB = buildScoreResult(
      scoreAssessment(level as Level, answersB, questions),
    );

    expect(JSON.stringify(resultA.riasec.scores)).not.toBe(
      JSON.stringify(resultB.riasec.scores),
    );
  });

  it.each(levels)("%s: skipped questions do not distort scores", (level) => {
    const questions = questionBanks[level as Level];
    const fullAnswers = answerAll(questions);

    // 跳过 1/4 的题（低于低证据阈值 1/3）
    const skipEvery4 = fullAnswers.map((answer, index) =>
      index % 4 === 0
        ? { questionId: answer.questionId, value: { kind: "skip" as const } }
        : answer,
    );

    const score = scoreAssessment(level as Level, skipEvery4, questions);
    expect(score.skippedCount).toBe(
      skipEvery4.filter((a) => a.value.kind === "skip").length,
    );
    expect(score.answeredCount + score.skippedCount).toBe(questions.length);

    const result = buildScoreResult(score);
    expect(result.consistencyFlags).not.toContain("low-evidence");
    // 已作答部分仍产生有效分数
    const subScores = result.dimensions.flatMap((d) =>
      d.subScores.map((s) => s.score),
    );
    expect(subScores.some((s) => s > 0)).toBe(true);
  });

  it.each(levels)("%s: heavy skipping triggers low-evidence protection", (level) => {
    const questions = questionBanks[level as Level];
    // 跳过一半的题（高于 1/3 阈值）
    const halfSkipped = answerAll(questions).map((answer, index) =>
      index % 2 === 0
        ? { questionId: answer.questionId, value: { kind: "skip" as const } }
        : answer,
    );

    const result = buildScoreResult(
      scoreAssessment(level as Level, halfSkipped, questions),
    );
    expect(result.consistencyFlags).toContain("low-evidence");
  });

  it("question bank contains no ranking questions (UI does not support them)", () => {
    for (const level of levels) {
      const rankingQuestions = questionBanks[level as Level].filter(
        (question) => question.type === "ranking",
      );
      expect(rankingQuestions).toEqual([]);
    }
  });

  it.each(levels)("%s: UI bank only exposes renderable question types", (level) => {
    const renderable = new Set(["binary", "scenario", "likert", "forcedChoice"]);
    const uiBank = buildUiQuestionBank(
      level as Level,
      questionBanks[level as Level],
    );
    for (const question of uiBank.questions) {
      expect(renderable.has(question.type), `${question.id} has unsupported type ${question.type}`).toBe(true);
    }
  });
});
