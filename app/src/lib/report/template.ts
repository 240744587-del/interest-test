// ============================================================
// 本地模板降级报告 — AI 失败时使用
// 对齐 product-spec-v2.md §7.4
// ============================================================

import type { ScoreResult, Level } from '@/lib/questions/types';
import type { AIReport } from './types';
import { levelDisplayNames } from './types';

const riasecNames: Record<string, string> = {
  R: '实际型',
  I: '探究型',
  A: '艺术型',
  S: '社会型',
  E: '企业型',
  C: '常规型',
};

const riasecDescriptions: Record<string, string> = {
  R: '动手能力强，喜欢操作工具、探索实物，享受解决实际问题的过程',
  I: '好奇心旺盛，喜欢分析研究、追根溯源，享受理解深层原理的过程',
  A: '想象力丰富，喜欢创造表达、追求美感，享受展现独特个性的过程',
  S: '善于沟通，喜欢与人交流、帮助他人，享受建立温暖关系的过程',
  E: '有领导力，喜欢组织协调、影响决策，享受推动目标实现的过程',
  C: '注重细节，喜欢有序规范、精确执行，享受把事情做到位的过程',
};

const riasecExplorations: Record<string, { minor: string; adult: string }> = {
  R: { minor: '科学实验、手工制作、编程机器人、户外探索活动', adult: '工程技术、制造研发、技术运维、环境科学等领域' },
  I: { minor: '科学竞赛、数学探究、编程学习、自然观察', adult: '科学研究、数据分析、医学、技术研发等领域' },
  A: { minor: '绘画音乐、创意写作、摄影视频、设计课程', adult: '设计创意、影视传媒、文化艺术、品牌策划等领域' },
  S: { minor: '志愿服务、同伴辅导、社团组织、团队合作项目', adult: '教育培训、咨询服务、医疗护理、人力资源等领域' },
  E: { minor: '学生会、辩论社、模拟商赛、项目策划活动', adult: '企业管理、市场营销、创业投资、商务拓展等领域' },
  C: { minor: '数据整理、计划制定、笔记方法研究、信息归类', adult: '财务审计、行政管理、项目管理、质量管控等领域' },
};

function describeJung(value: number, leftLabel: string, leftDesc: string, rightLabel: string, rightDesc: string): string {
  if (value >= 40 && value <= 60) return `在${leftLabel}和${rightLabel}之间比较平衡——你既能${leftDesc}，也能${rightDesc}，会根据情境自然切换`;
  if (value < 30) return `明显偏向${leftLabel}——你${leftDesc}，这是你自然舒适的状态`;
  if (value < 40) return `略微偏向${leftLabel}——你比较${leftDesc}，但在需要时也能${rightDesc}`;
  if (value > 70) return `明显偏向${rightLabel}——你${rightDesc}，这是你自然舒适的状态`;
  return `略微偏向${rightLabel}——你比较${rightDesc}，但在需要时也能${leftDesc}`;
}

/** 生成本地模板报告 */
export function generateTemplateReport(level: Level, summary: ScoreResult): AIReport {
  const label = levelDisplayNames[level];
  const isMinor = level !== 'L4';
  const code = summary.riasec.code;
  const topTypes = code.split('').slice(0, 3);

  // ---- 总述 ----
  const intelligenceDim = summary.dimensions.find((d) => d.key === 'intelligence');
  const topIntel = intelligenceDim
    ? [...intelligenceDim.subScores].sort((a, b) => b.score - a.score).slice(0, 2)
    : [];
  const driveDim = summary.dimensions.find((d) => d.key === 'drive');
  const topDrives = driveDim
    ? [...driveDim.subScores].sort((a, b) => b.score - a.score).slice(0, 2)
    : [];

  const overview = `根据你本次${label}测评的回答，你呈现出一个多元而有趣的探索画像。\n\n你的兴趣倾向以「${topTypes.map((t) => riasecNames[t]).join(' + ')}」为主导——这说明你目前${topTypes.slice(0, 2).map((t) => riasecDescriptions[t]?.split('，')[0]).join('，同时也')}。${topIntel.length > 0 ? `在能力方面，你的${topIntel.map((s) => s.label).join('和')}表现突出。` : ''}${topDrives.length > 0 ? `而驱动你前进的核心力量来自于${topDrives.map((s) => s.label).join('和')}。` : ''}\n\n需要强调的是，这些结果反映的是你当前的倾向偏好，而非固定不变的标签。随着你的成长和体验积累，这些倾向会自然地发展和演变。`;

  // ---- RIASEC 兴趣解读 ----
  const interestInterpretation = topTypes
    .map((t, i) => {
      const name = riasecNames[t];
      const desc = riasecDescriptions[t];
      const score = summary.riasec.scores[t as keyof typeof summary.riasec.scores];
      const rank = i === 0 ? '最突出的' : i === 1 ? '第二突出的' : '第三位的';
      return `你${rank}兴趣类型是「${name}」（${score}分）：${desc}。`;
    })
    .join('\n\n') +
    `\n\n三个类型组合成你的兴趣代码「${code}」。` +
    (summary.riasec.differentiation === 'high'
      ? '你的兴趣指向比较集中和明确，这有助于聚焦探索方向。'
      : summary.riasec.differentiation === 'low'
        ? '你对多个领域都保持着兴趣，这意味着你有广泛的探索空间——可以通过实际体验来逐步发现最让自己投入的方向。'
        : '你的兴趣分布比较均衡，主导方向已经显现，同时也对其他领域保持开放。');

  // ---- 多元智能 ----
  const allIntel = intelligenceDim
    ? [...intelligenceDim.subScores].sort((a, b) => b.score - a.score)
    : [];
  const abilityInterpretation = allIntel.length > 0
    ? `在能力倾向方面：\n\n` +
      allIntel.slice(0, 3).map((s, i) => {
        const prefix = i === 0 ? '最突出的是' : i === 1 ? '其次是' : '第三是';
        return `${prefix}「${s.label}」（${s.score}分）`;
      }).join('；') + '。' +
      `\n\n这些得分反映的是你目前在不同类型活动中展现的自然倾向。加德纳多元智能理论认为，每个人都拥有所有这些能力，只是组合方式不同。你的优势领域恰恰是那些你做起来更自然、更容易进入状态的方向。`
    : '能力倾向数据暂不充分，建议通过多样化的活动体验来探索自己的能力特点。';

  // ---- 荣格认知风格 ----
  const cognitiveInterpretation = [
    describeJung(summary.jung.EI, '内倾', '独处思考时获得能量', '外倾', '与人互动时获得能量'),
    describeJung(summary.jung.SN, '感觉', '关注具体事实和当下细节', '直觉', '关注未来可能性和整体图景'),
    describeJung(summary.jung.TF, '思维', '倾向用逻辑和分析来做决策', '情感', '倾向用价值观和感受来做决策'),
    describeJung(summary.jung.JP, '判断', '喜欢计划明确、有条理地推进', '知觉', '喜欢保持灵活、随机应变'),
  ].map((desc, i) => `${['能量来源', '信息获取', '决策方式', '生活态度'][i]}：${desc}`).join('。\n\n') +
    '。\n\n这四个维度构成了你独特的认知风格组合。请注意，它们是连续的光谱而非非此即彼的分类——大多数人在不同情境下会自然切换。';

  // ---- 驱动力 ----
  const allDrives = driveDim
    ? [...driveDim.subScores].sort((a, b) => b.score - a.score)
    : [];
  const driveInterpretation = allDrives.length > 0
    ? `你内在最核心的驱动力是：\n\n${allDrives.slice(0, 3).map((s) => `「${s.label}」（${s.score}分）`).join('、')}。\n\n这意味着当一项活动能满足这些内在需求时，你更容易感到充实和有动力。反之，如果长期处于与核心驱动力不匹配的环境中，可能会感到不够投入。了解自己的驱动力，有助于你在做选择时多一个参考维度。`
    : '核心驱动力数据暂不充分。';

  // ---- 探索方向 ----
  const fieldsByType = topTypes
    .map((t) => {
      const exp = riasecExplorations[t];
      return exp ? (isMinor ? exp.minor : exp.adult) : '';
    })
    .filter(Boolean);

  const explorationSuggestions = summary.candidateFields.length > 0
    ? `综合你的兴趣类型、能力倾向和核心驱动力，以下方向值得你关注：\n\n${summary.candidateFields.join('、')}。\n\n${isMinor ? '此外，与你兴趣类型相关的活动包括：' + fieldsByType.join('；') + '。' : '这些方向与你当前的特质组合匹配度较高，但请记住它们是探索的起点而非终点。'}\n\n建议通过实际体验来验证——纸上的分析永远替代不了亲身感受。`
    : `根据你的兴趣类型「${code}」，可以关注这些方向：${fieldsByType.join('；')}。\n\n在实际探索中逐步发现最契合自己的领域。`;

  // ---- 行动建议 ----
  const actionSteps = isMinor
    ? `接下来你可以这样做：\n\n1. 选一个你最好奇的推荐方向，找一个相关的课外活动或体验机会试试看\n2. 留意日常生活中让你特别投入、忘记时间的活动——这些"心流"时刻往往是重要线索\n3. 和信任的家人、老师聊聊你的发现，听听他们观察到的你的特点\n4. 不要急于"确定方向"，在这个阶段，广泛尝试比早早锁定更有价值\n5. 过几个月可以重新测评一次，看看自己的变化`
    : `接下来你可以这样做：\n\n1. 针对感兴趣的方向做信息调研——了解真实的行业现状和发展路径\n2. 寻找实习、项目合作或志愿者机会，在实践中验证兴趣\n3. 主动约相关领域的从业者聊一聊，获取第一手体验信息\n4. 参加行业活动、工作坊或在线社群，建立初步认知\n5. 定期反思：在哪些活动中你感到充实和投入？这些感受是持续校准方向的最好指南针`;

  // ---- 家长/教师建议 ----
  const guardianNote = isMinor
    ? `致家长/老师：\n\n这份报告反映的是孩子当前的兴趣和能力倾向，是「此刻的快照」而非「定论」。建议您：\n\n1. 以好奇和开放的态度与孩子讨论报告内容，重点是"你觉得准吗？为什么？"\n2. 支持孩子尝试与兴趣方向相关的活动，但不必强制或催促\n3. 关注孩子自然投入和快乐的时刻，这比任何测评都更真实\n4. 避免把结果当作升学或分班的依据——这不是它的用途\n\n本报告不构成任何心理诊断或专业评估意见。如有相关需求，请咨询专业人士。`
    : undefined;

  return {
    overview,
    interestInterpretation,
    abilityInterpretation,
    cognitiveInterpretation,
    driveInterpretation,
    explorationSuggestions,
    actionSteps,
    guardianNote,
  };
}
