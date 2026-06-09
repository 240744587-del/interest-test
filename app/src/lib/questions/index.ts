import { questionBanks } from '@/data/questions/generated';
import { buildUiQuestionBank } from './adapter';
import type { Level, QuestionBank } from './types';

const banks: Record<Level, QuestionBank> = {
  L1: buildUiQuestionBank('L1', questionBanks.L1),
  L2: buildUiQuestionBank('L2', questionBanks.L2),
  L3: buildUiQuestionBank('L3', questionBanks.L3),
  L4: buildUiQuestionBank('L4', questionBanks.L4),
};

export function getQuestionBank(level: Level): QuestionBank {
  return banks[level];
}

export function isLevelReady(level: Level): boolean {
  return banks[level].questions.length > 0;
}

export const levelMeta: Record<Level, { label: string; desc: string; emoji: string; color: string }> = {
  L1: { label: '小学生', desc: '发现兴趣种子和能力苗头', emoji: '🌱', color: 'from-amber-400 to-orange-400' },
  L2: { label: '初中生', desc: '认识兴趣和能力倾向', emoji: '🌿', color: 'from-teal-400 to-emerald-400' },
  L3: { label: '高中生', desc: '探索专业与发展方向', emoji: '🔭', color: 'from-blue-400 to-violet-400' },
  L4: { label: '大学及以上', desc: '检视学习或职业方向', emoji: '🧭', color: 'from-indigo-500 to-blue-600' },
};
