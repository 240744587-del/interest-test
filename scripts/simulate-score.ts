import { questionBanks } from "../src/data/questions/generated";
import { scoreAssessment } from "../src/domain/assessment/score";
import type { Answer, Question } from "../src/domain/assessment/types";

function answerQuestion(question: Question): Answer {
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
      leastOptionId: question.options.at(-1)?.id,
    },
  };
}

for (const [level, questions] of Object.entries(questionBanks)) {
  const answers = questions.map(answerQuestion);
  const result = scoreAssessment(
    level as keyof typeof questionBanks,
    answers,
    questions,
  );
  const normalizedValues = Object.values(result.normalizedScores);

  console.log(
    `${level}: questions=${questions.length} scoreKeys=${normalizedValues.length} range=${Math.min(...normalizedValues)}-${Math.max(...normalizedValues)}`,
  );
}
