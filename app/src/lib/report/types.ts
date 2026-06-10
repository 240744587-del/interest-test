// ============================================================
// AI 报告类型定义
// ============================================================

import type { Level } from '@/lib/questions/types';

/** AI 报告各段落 */
export interface AIReportSection {
  title: string;
  content: string;
}

/** AI 报告完整结构 */
export interface AIReport {
  /** 开篇总述（1-2 段，年龄适配语气） */
  overview: string;
  /** 兴趣类型解读 */
  interestInterpretation: string;
  /** 能力倾向解读 */
  abilityInterpretation: string;
  /** 认知风格解读 */
  cognitiveInterpretation: string;
  /** 驱动力解读 */
  driveInterpretation: string;
  /** 探索方向建议 */
  explorationSuggestions: string;
  /** 行动建议（年龄适配的下一步） */
  actionSteps: string;
  /** 给家长/教师的话（仅 L1-L3） */
  guardianNote?: string;
}

/** 报告生成状态 */
export type ReportStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'streaming'; partial: Partial<AIReport> }
  | { kind: 'done'; report: AIReport }
  | { kind: 'error'; message: string }
  | { kind: 'opted-out' };

/** API 响应 */
export interface ReportAPIResponse {
  ok: boolean;
  report?: AIReport;
  error?: string;
  fallback?: boolean; // true = 使用了本地模板降级
}

/** 层级显示信息 */
export const levelDisplayNames: Record<Level, string> = {
  L1: '小学版',
  L2: '初中版',
  L3: '高中版',
  L4: '成人版',
};

/** 层级语气描述 */
export const levelToneGuide: Record<Level, string> = {
  L1: '用简单有趣的语言，像跟小朋友聊天一样。多用比喻和例子，避免抽象术语。称呼"你"。',
  L2: '用轻松鼓励的语气，适合初中生理解。可以引入一些概念但要配合解释。称呼"你"。',
  L3: '用尊重平等的语气，适合高中生。可以使用专业概念并简要解释。称呼"你"。',
  L4: '用专业但温和的语气，适合成年人。可以使用专业术语。称呼"你"。',
};
