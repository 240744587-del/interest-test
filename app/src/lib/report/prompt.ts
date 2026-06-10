// ============================================================
// AI 提示词构建 — 对齐 product-spec-v2.md §7.2-7.3
// 只接收白名单字段，不转发客户端原始对象
// ============================================================

import type { ScoreResult, Level } from '@/lib/questions/types';
import { levelToneGuide, levelDisplayNames } from './types';

/** 从 ScoreResult 中提取白名单字段，构造安全的 AI 输入 */
function buildWhitelistedInput(level: Level, summary: ScoreResult) {
  return {
    level,
    levelLabel: levelDisplayNames[level],
    // 各维度及子维度的汇总分
    dimensions: summary.dimensions.map((d) => ({
      key: d.key,
      label: d.label,
      subScores: d.subScores.map((s) => ({
        key: s.key,
        label: s.label,
        score: s.score,
      })),
    })),
    // 荣格四维光谱
    jung: {
      EI: summary.jung.EI,
      SN: summary.jung.SN,
      TF: summary.jung.TF,
      JP: summary.jung.JP,
    },
    // RIASEC 兴趣代码和高级指标
    riasec: {
      scores: summary.riasec.scores,
      code: summary.riasec.code,
      consistency: summary.riasec.consistency,
      differentiation: summary.riasec.differentiation,
      clarity: summary.riasec.clarity,
    },
    // 职业准备度（仅 L3-L4）
    readiness: summary.readiness
      ? {
          overall: summary.readiness.overall,
          subScores: summary.readiness.subScores,
        }
      : undefined,
    // 一致性标记
    consistencyFlags: summary.consistencyFlags,
    // 本地规则选出的候选领域
    candidateFields: summary.candidateFields,
  };
}

/** 构建系统提示词 */
export function buildSystemPrompt(level: Level): string {
  const tone = levelToneGuide[level];
  const isMinor = level !== 'L4';

  return `你是"向野"成长方向探索测评系统的报告解读助手。你的任务是将结构化评分数据改写成易读、有温度的个性化报告。

## 语气和风格
${tone}

## 核心原则
1. 你只是改写和解读已有的评分结果，不得自行改变分数或制造新的测评结论。
2. 必须使用概率性、发展性语言（如"你目前倾向于…""这可能意味着…""现阶段表现出…"）。
3. 说明结果反映的是本次回答的倾向，而非固定不变的特质。
4. 鼓励通过真实活动验证这些倾向。
${isMinor ? '5. 不做确定性的职业推荐，只提供探索方向。' : '5. 职业方向仅作参考，鼓励结合真实体验验证。'}
6. 明确产品不构成心理诊断、升学或职业决策意见。

## 绝对禁止
- 输出人格诊断、心理疾病或健康判断
- 推断家庭关系、经济状况、智商或学习成绩
- 宣称用户只能或必须选择某个方向
- 根据教育阶段之外的信息猜测年龄、性别或身份
- 使用 MBTI 四字母标签（我们使用连续光谱，非二元分类）

## 输出格式
请严格按照以下 JSON 格式输出，不要包含任何 JSON 以外的内容：

{
  "overview": "总述段落，概括这个人的兴趣探索画像，2-3段",
  "interestInterpretation": "基于 RIASEC 兴趣代码的解读，解释各类型含义和组合特点",
  "abilityInterpretation": "基于多元智能得分的能力倾向解读",
  "cognitiveInterpretation": "基于荣格四维光谱的认知风格解读（使用连续光谱描述，不用二元标签）",
  "driveInterpretation": "基于核心驱动力得分的内在动力解读",
  "explorationSuggestions": "基于候选领域的探索方向建议",
  "actionSteps": "具体的下一步行动建议（${isMinor ? '适合该年龄段的活动' : '适合成年人的职业探索活动'}）"${isMinor ? `,
  "guardianNote": "给家长/教师的建议，如何支持孩子的兴趣探索"` : ''}
}

每个字段内容为纯文本（可包含换行符），不要嵌套 JSON。每个字段 150-300 字。`;
}

/** 构建用户消息（包含白名单评分数据） */
export function buildUserMessage(level: Level, summary: ScoreResult): string {
  const input = buildWhitelistedInput(level, summary);
  return `请根据以下${levelDisplayNames[level]}测评的汇总评分数据，生成个性化报告解读。

评分数据：
${JSON.stringify(input, null, 2)}`;
}
