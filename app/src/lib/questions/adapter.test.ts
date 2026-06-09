import { describe, expect, it } from 'vitest';
import { questionBanks } from '../../data/questions/generated';
import type { Question as DomainQuestion } from '../../domain/assessment/types';
import { adaptQuestion, buildUiQuestionBank } from './adapter';

const expectedCounts = { L1: 32, L2: 46, L3: 53, L4: 59 } as const;
const estimatedMinutes = { L1: 10, L2: 15, L3: 20, L4: 25 } as const;

function makeQuestion(
  overrides: Partial<DomainQuestion> & Pick<DomainQuestion, 'id' | 'type'>,
): DomainQuestion {
  const { id, type, ...rest } = overrides;

  return {
    id,
    level: 'L1',
    number: 1,
    type,
    prompt: '测试题目',
    options: [
      { id: 'A', text: '选项 A', scores: [] },
      { id: 'B', text: '选项 B', scores: [] },
    ],
    sourceMarkdown: '测试来源',
    ...rest,
  };
}

describe('adaptQuestion', () => {
  it.each([
    ['L1-ENERGY-001', 'energy'],
    ['L1-ABILITY-001', 'intelligence'],
    ['L1-RIASEC-001', 'riasec'],
    ['L1-DRIVE-001', 'drive'],
    ['L1-JUNG-001', 'cognitive'],
    ['L1-READY-001', 'readiness'],
  ] as const)('maps %s to the %s dimension', (id, dimension) => {
    expect(adaptQuestion(makeQuestion({ id, type: 'single' })).dimension).toBe(
      dimension,
    );
  });

  it.each([
    ['single', 2, 'binary'],
    ['single', 4, 'scenario'],
    ['likert', 2, 'likert'],
    ['ranking', 4, 'ranking'],
    ['forcedChoice', 4, 'forcedChoice'],
  ] as const)(
    'maps %s with %i options to %s',
    (type, optionCount, expectedType) => {
      const options = Array.from({ length: optionCount }, (_, index) => ({
        id: String.fromCharCode(65 + index),
        text: `选项 ${index + 1}`,
        scores: [],
      }));
      const question = makeQuestion({
        id: 'L1-ENERGY-001',
        type,
        options,
      });

      expect(adaptQuestion(question).type).toBe(expectedType);
    },
  );

  it('copies display fields without domain scoring data', () => {
    const question = makeQuestion({
      id: 'L1-JUNG-001',
      type: 'likert',
      prompt: '我喜欢先观察再行动',
      reverse: true,
      options: [
        {
          id: 'A',
          text: '同意',
          scores: [{ key: 'jung.I', value: 2 }],
        },
        {
          id: 'B',
          text: '不同意',
          scores: [{ key: 'jung.E', value: 2 }],
        },
      ],
    });

    expect(adaptQuestion(question)).toMatchObject({
      id: question.id,
      level: question.level,
      text: question.prompt,
      reversed: true,
      options: [
        { id: 'A', text: '同意', scores: [] },
        { id: 'B', text: '不同意', scores: [] },
      ],
    });
    expect(adaptQuestion(question).likertStatement).toBeUndefined();
  });

  it('does not set a likert statement for non-likert questions', () => {
    const question = makeQuestion({
      id: 'L1-ENERGY-001',
      type: 'single',
    });

    expect(adaptQuestion(question).likertStatement).toBeUndefined();
  });
});

describe('buildUiQuestionBank', () => {
  it.each(Object.entries(expectedCounts))(
    'builds %s with the approved question count and order',
    (level, count) => {
      const typedLevel = level as keyof typeof questionBanks;
      const bank = buildUiQuestionBank(
        typedLevel,
        questionBanks[typedLevel],
      );

      expect(bank.questions).toHaveLength(count);
      expect(bank.questions.map((question) => question.id)).toEqual(
        questionBanks[typedLevel].map((question) => question.id),
      );
      expect(bank.estimatedMinutes).toBe(estimatedMinutes[typedLevel]);
    },
  );
});
