import type {
  Level as DomainLevel,
  Question as DomainQuestion,
} from '../../domain/assessment/types';
import type {
  DimensionKey,
  Question,
  QuestionBank,
  QuestionType,
} from './types';

const estimatedMinutes: Record<DomainLevel, number> = {
  L1: 10,
  L2: 15,
  L3: 20,
  L4: 25,
};

const dimensions: Record<string, DimensionKey> = {
  ENERGY: 'energy',
  ABILITY: 'intelligence',
  RIASEC: 'riasec',
  DRIVE: 'drive',
  JUNG: 'cognitive',
  READY: 'readiness',
};

function getDimension(question: DomainQuestion): DimensionKey {
  const dimension = dimensions[question.id.split('-')[1]];

  if (!dimension) {
    throw new Error(`Unsupported question dimension: ${question.id}`);
  }

  return dimension;
}

function getQuestionType(question: DomainQuestion): QuestionType {
  if (question.type === 'single') {
    return question.options.length === 2 ? 'binary' : 'scenario';
  }

  return question.type;
}

export function adaptQuestion(question: DomainQuestion): Question {
  return {
    id: question.id,
    type: getQuestionType(question),
    level: question.level,
    dimension: getDimension(question),
    text: question.prompt,
    options: question.options.map(({ id, text }) => ({
      id,
      text,
      scores: [],
    })),
    reversed: question.reverse,
  };
}

export function buildUiQuestionBank(
  level: DomainLevel,
  questions: DomainQuestion[],
): QuestionBank {
  return {
    level,
    questions: questions.map(adaptQuestion),
    estimatedMinutes: estimatedMinutes[level],
  };
}
