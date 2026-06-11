import type {
  Answer,
  AnswerValue,
  Level,
  Question,
  ScoreTarget,
} from "./types";

export const rankWeights = [5, 3, 1, 0] as const;

export interface ScoreRange {
  min: number;
  max: number;
}

export interface AssessmentScore {
  level: Level;
  rawScores: Record<string, number>;
  ranges: Record<string, ScoreRange>;
  normalizedScores: Record<string, number>;
  /** 实际计分的题数（不含跳过） */
  answeredCount: number;
  /** 选择"不知道 / 没经历过"的题数 */
  skippedCount: number;
  /** 各评分维度实际获得的作答证据 */
  evidenceByDimension: Record<
    string,
    { answered: number; skipped: number }
  >;
}

type Contribution = Record<string, number>;

function questionDimensions(question: Question): string[] {
  const keys = [
    ...question.options.flatMap((option) =>
      option.scores.map((target) => target.key),
    ),
    ...(question.likertScores ?? []).map((target) => target.key),
  ];

  return [...new Set(keys.map((key) => key.split(".")[0]))];
}

export function scoreReverseLikert(value: 1 | 2 | 3 | 4 | 5) {
  return (6 - value) as 1 | 2 | 3 | 4 | 5;
}

function addTargets(
  contribution: Contribution,
  targets: ScoreTarget[],
  multiplier: number,
) {
  for (const target of targets) {
    contribution[target.key] =
      (contribution[target.key] ?? 0) + target.value * multiplier;
  }
}

function findOption(question: Question, optionId: string) {
  const option = question.options.find((candidate) => candidate.id === optionId);
  if (!option) {
    throw new Error(`${question.id}: unknown option ${optionId}`);
  }
  return option;
}

function validateKind(question: Question, answer: AnswerValue) {
  if (question.type !== answer.kind) {
    throw new Error(
      `${question.id}: expected ${question.type} answer, received ${answer.kind}`,
    );
  }
}

function scoreQuestion(question: Question, answer: AnswerValue): Contribution {
  if (answer.kind === "skip") return {};
  validateKind(question, answer);
  const contribution: Contribution = {};

  if (answer.kind === "single") {
    addTargets(contribution, findOption(question, answer.optionId).scores, 1);
    return contribution;
  }

  if (answer.kind === "likert") {
    const value = question.reverse
      ? scoreReverseLikert(answer.value)
      : answer.value;
    addTargets(contribution, question.likertScores ?? [], value);
    return contribution;
  }

  if (answer.kind === "ranking") {
    const expectedIds = question.options.map((option) => option.id);
    if (
      answer.optionIds.length !== expectedIds.length ||
      new Set(answer.optionIds).size !== expectedIds.length ||
      expectedIds.some((optionId) => !answer.optionIds.includes(optionId))
    ) {
      throw new Error(`${question.id}: ranking must contain every option once`);
    }
    if (answer.optionIds.length > rankWeights.length) {
      throw new Error(`${question.id}: ranking supports at most 4 options`);
    }

    answer.optionIds.forEach((optionId, index) => {
      addTargets(
        contribution,
        findOption(question, optionId).scores,
        rankWeights[index],
      );
    });
    return contribution;
  }

  if (!answer.leastOptionId) {
    throw new Error(`${question.id}: forced choice requires a least option`);
  }
  if (answer.mostOptionId === answer.leastOptionId) {
    throw new Error(`${question.id}: most and least options must differ`);
  }

  addTargets(
    contribution,
    findOption(question, answer.mostOptionId).scores,
    4,
  );
  addTargets(
    contribution,
    findOption(question, answer.leastOptionId).scores,
    -2,
  );
  return contribution;
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(
      (rest) => [item, ...rest],
    ),
  );
}

function possibleAnswers(question: Question): AnswerValue[] {
  if (question.type === "single") {
    return question.options.map((option) => ({
      kind: "single",
      optionId: option.id,
    }));
  }
  if (question.type === "likert") {
    return ([1, 2, 3, 4, 5] as const).map((value) => ({
      kind: "likert",
      value,
    }));
  }
  if (question.type === "ranking") {
    return permutations(question.options.map((option) => option.id)).map(
      (optionIds) => ({ kind: "ranking", optionIds }),
    );
  }

  return question.options.flatMap((mostOption) =>
    question.options
      .filter((leastOption) => leastOption.id !== mostOption.id)
      .map((leastOption) => ({
        kind: "forcedChoice" as const,
        mostOptionId: mostOption.id,
        leastOptionId: leastOption.id,
      })),
  );
}

function questionRanges(question: Question): Record<string, ScoreRange> {
  const contributions = possibleAnswers(question).map((answer) =>
    scoreQuestion(question, answer),
  );
  const keys = new Set(contributions.flatMap((item) => Object.keys(item)));
  const ranges: Record<string, ScoreRange> = {};

  for (const key of keys) {
    const values = contributions.map((item) => item[key] ?? 0);
    ranges[key] = {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  return ranges;
}

export function scoreAssessment(
  level: Level,
  answers: Answer[],
  questions: Question[],
): AssessmentScore {
  if (questions.some((question) => question.level !== level)) {
    throw new Error(`Question bank contains a question outside ${level}`);
  }
  if (answers.length !== questions.length) {
    throw new Error(
      `Expected ${questions.length} answers, received ${answers.length}`,
    );
  }

  const answersById = new Map(
    answers.map((answer) => [answer.questionId, answer]),
  );
  if (answersById.size !== answers.length) {
    throw new Error("Answer question IDs must be unique");
  }

  const rawScores: Record<string, number> = {};
  const ranges: Record<string, ScoreRange> = {};
  const evidenceByDimension: AssessmentScore["evidenceByDimension"] = {};
  let skippedCount = 0;

  for (const question of questions) {
    const answer = answersById.get(question.id);
    if (!answer) throw new Error(`Missing answer for ${question.id}`);
    const dimensions = questionDimensions(question);

    for (const dimension of dimensions) {
      const evidence = evidenceByDimension[dimension] ?? {
        answered: 0,
        skipped: 0,
      };
      if (answer.value.kind === "skip") {
        evidence.skipped += 1;
      } else {
        evidence.answered += 1;
      }
      evidenceByDimension[dimension] = evidence;
    }

    // 跳过的题不参与计分，也不计入理论区间，避免拉低正常作答题的标准化分数
    if (answer.value.kind === "skip") {
      skippedCount += 1;
      continue;
    }

    const contribution = scoreQuestion(question, answer.value);
    const localRanges = questionRanges(question);

    for (const key of new Set([
      ...Object.keys(contribution),
      ...Object.keys(localRanges),
    ])) {
      rawScores[key] = (rawScores[key] ?? 0) + (contribution[key] ?? 0);
      const currentRange = ranges[key] ?? { min: 0, max: 0 };
      ranges[key] = {
        min: currentRange.min + (localRanges[key]?.min ?? 0),
        max: currentRange.max + (localRanges[key]?.max ?? 0),
      };
    }
  }

  const normalizedScores = Object.fromEntries(
    Object.entries(ranges).map(([key, range]) => {
      if (range.max === range.min) {
        throw new Error(`${key}: theoretical score range is zero`);
      }
      const normalized =
        ((rawScores[key] - range.min) / (range.max - range.min)) * 100;
      return [key, Math.round(Math.min(100, Math.max(0, normalized)))];
    }),
  );

  return {
    level,
    rawScores,
    ranges,
    normalizedScores,
    answeredCount: questions.length - skippedCount,
    skippedCount,
    evidenceByDimension,
  };
}
